var database = require("../database/config");

function gerarRelatorio(idEmpresa) {

  var instrucaoSql = `/* Relatório unificado de capturas (hardware + rede) por empresa */
SELECT
  m.idMaquina,
  m.macAddress,
  m.localizacao,

  so.tipo AS sistemaOperacional,
  so.versao AS versaoSO,
  so.distribuicao AS distribuicaoSO,

  -- campos padronizados de componente/métrica (podem ficar nulos dependendo do tipo)
  'hardware' AS tipoCaptura,
  c.idComponente,
  c.tipo AS tipoComponente,
  c.modelo AS modeloComponente,
  mc.idMetrica AS idMetricaHardware,
  mc.nome AS metricaHardware,
  mc.medida AS unidade,
  l.valor AS valorCaptura,         -- <-- VALOR REAL DA CAPTURA (hardware)
  l.descricao AS descricaoCaptura,
  l.dtHora AS dataHoraCaptura,
  ac.estado AS estadoAlerta,
  ac.dtHora AS dataHoraAlerta,

  NULL    AS idComponenteRede,
  NULL    AS nomeComponenteRede,
  NULL    AS interfaceRede,

  NULL    AS idMetricaRede,
  NULL    AS metricaRede,
  NULL    AS unidadeRede,

  NULL    AS ipv4,
  NULL    AS velocidadeMbps,
  NULL    AS mbEnviados,
  NULL    AS mbRecebidos,
  NULL    AS pacotesEnviados,
  NULL    AS pacotesRecebidos

FROM maquina m
LEFT JOIN sistemaOperacional so ON m.fkSistema = so.idSistema

-- LOGS DE HARDWARE (valor em l.valor)
LEFT JOIN logMonitoramento l ON l.fkMaquina = m.idMaquina
LEFT JOIN componente c ON l.fkComponente = c.idComponente
LEFT JOIN metricaComponente mc ON l.fkMetrica = mc.idMetrica
LEFT JOIN alertaComponente ac ON l.fkAlerta = ac.idAlerta

WHERE m.fkEmpresa = ${idEmpresa}


UNION ALL


SELECT
  m.idMaquina,
  m.macAddress,
  m.localizacao,

  so.tipo AS sistemaOperacional,
  so.versao AS versaoSO,
  so.distribuicao AS distribuicaoSO,

  -- campos padronizados para REDE
  'rede' AS tipoCaptura,
  NULL    AS idComponente,
  NULL    AS tipoComponente,
  NULL    AS modeloComponente,
  NULL    AS idMetricaHardware,
  NULL    AS metricaHardware,
  mr.medida AS unidade,            -- unidade da métrica de rede (ex: Mbps)
  lr.velocidadeMbps AS valorCaptura, -- <-- VALOR REAL DA CAPTURA (rede) principal
  NULL    AS descricaoCaptura,
  lr.dtHora AS dataHoraCaptura,
  ar.estado AS estadoAlerta,
  ar.dtHora AS dataHoraAlerta,

  cr.idComponenteRede,
  cr.nome AS nomeComponenteRede,
  cr.interfaceRede,

  mr.idMetricaRede AS idMetricaRede,
  mr.nome AS metricaRede,
  mr.medida AS unidadeRede,

  lr.ipv4,
  lr.velocidadeMbps,
  lr.mbEnviados,
  lr.mbRecebidos,
  lr.pacotesEnviados,
  lr.pacotesRecebidos

FROM maquina m
LEFT JOIN sistemaOperacional so ON m.fkSistema = so.idSistema

-- LOGS DE REDE (valores em lr.velocidadeMbps, lr.mbEnviados, etc.)
LEFT JOIN logMonitoramentoRede lr ON lr.fkMaquina = m.idMaquina
LEFT JOIN componenteRede cr ON lr.fkComponenteRede = cr.idComponenteRede
LEFT JOIN metricaRede mr ON lr.fkMetricaRede = mr.idMetricaRede
LEFT JOIN alertaRede ar ON lr.fkAlertaRede = ar.idAlertaRede

WHERE m.fkEmpresa = ${idEmpresa}


ORDER BY idMaquina, dataHoraCaptura DESC;
`;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}




module.exports = {
  gerarRelatorio
}
