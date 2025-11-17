var database = require("../database/config");

/*
 GERAR RELATÓRIO — MANTIDO SEM ALTERAÇÕES
*/
function gerarRelatorio(idEmpresa) {

    var instrucaoSql = `/* Relatório unificado de capturas (hardware + rede) por empresa */
SELECT
  m.idMaquina,
  m.macAddress,
  m.localizacao,

  so.tipo AS sistemaOperacional,
  so.versao AS versaoSO,
  so.distribuicao AS distribuicaoSO,

  'hardware' AS tipoCaptura,
  c.idComponente,
  c.tipo AS tipoComponente,
  c.modelo AS modeloComponente,
  mc.idMetrica AS idMetricaHardware,
  mc.nome AS metricaHardware,
  mc.medida AS unidade,
  l.valor AS valorCaptura,
  l.descricao AS descricaoCaptura,
  l.dtHora AS dataHoraCaptura,
  ac.estado AS estadoAlerta,
  ac.dtHora AS dataHoraAlerta,

  NULL AS idComponenteRede,
  NULL AS nomeComponenteRede,
  NULL AS interfaceRede,
  NULL AS idMetricaRede,
  NULL AS metricaRede,
  NULL AS unidadeRede,
  NULL AS ipv4,
  NULL AS velocidadeMbps,
  NULL AS mbEnviados,
  NULL AS mbRecebidos,
  NULL AS pacotesEnviados,
  NULL AS pacotesRecebidos

FROM maquina m
LEFT JOIN sistemaOperacional so ON m.fkSistema = so.idSistema
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

  'rede' AS tipoCaptura,
  NULL AS idComponente,
  NULL AS tipoComponente,
  NULL AS modeloComponente,
  NULL AS idMetricaHardware,
  NULL AS metricaHardware,
  mr.medida AS unidade,
  lr.velocidadeMbps AS valorCaptura,
  NULL AS descricaoCaptura,
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
LEFT JOIN logMonitoramentoRede lr ON lr.fkMaquina = m.idMaquina
LEFT JOIN componenteRede cr ON lr.fkComponenteRede = cr.idComponenteRede
LEFT JOIN metricaRede mr ON lr.fkMetricaRede = mr.idMetricaRede
LEFT JOIN alertaRede ar ON lr.fkAlertaRede = ar.idAlertaRede

WHERE m.fkEmpresa = ${idEmpresa}

ORDER BY idMaquina, dataHoraCaptura DESC;
`;

    console.log("Executando relatório SQL");
    return database.executar(instrucaoSql);
}


/*
 SÉRIE TEMPORAL DE UMA MÉTRICA (CPU, RAM, DISCO)
*/
function serieComponente(idMaquina, nomeMetrica, minutos) {
    console.log("dashboardModel.serieComponente():", idMaquina, nomeMetrica, minutos);

    var instrucaoSql = `
        SELECT 
            DATE_FORMAT(lm.dtHora, '%H:%i:%s') AS momento,
            lm.valor
        FROM logMonitoramento lm
        JOIN metricaComponente mc 
            ON lm.fkMetrica = mc.idMetrica
        WHERE 
            lm.fkMaquina = ${idMaquina}
            AND mc.nome = '${nomeMetrica}'
            AND lm.dtHora >= (NOW() - INTERVAL ${minutos} MINUTE)
        ORDER BY lm.dtHora;
    `;

    return database.executar(instrucaoSql);
}


/*
 ÚLTIMO VALOR DE CPU / RAM / DISCO
*/
function ultimoComponente(idMaquina, nomeMetrica) {
    console.log("dashboardModel.ultimoComponente():", idMaquina, nomeMetrica);

    var instrucaoSql = `
        SELECT 
            lm.valor,
            lm.dtHora
        FROM logMonitoramento lm
        JOIN metricaComponente mc ON lm.fkMetrica = mc.idMetrica
        WHERE 
            lm.fkMaquina = ${idMaquina}
            AND mc.nome = '${nomeMetrica}'
        ORDER BY lm.dtHora DESC
        LIMIT 1;
    `;

    return database.executar(instrucaoSql);
}


/*
 KPIs 
*/
function kpisMaquina(idMaquina) {
    console.log("dashboardModel.kpisMaquina():", idMaquina);

    var instrucaoSql = `
        SELECT
            MAX(CASE WHEN mc.nome = 'Uso de CPU'     THEN lm.valor END) AS cpuAtual,
            MAX(CASE WHEN mc.nome = 'Uso de Memória' THEN lm.valor END) AS ramAtual,
            MAX(CASE WHEN mc.nome = 'Uso de Disco'   THEN lm.valor END) AS discoAtual,

            AVG(CASE WHEN mc.nome = 'Uso de CPU'     THEN lm.valor END) AS cpuMedia,
            AVG(CASE WHEN mc.nome = 'Uso de Memória' THEN lm.valor END) AS ramMedia,
            AVG(CASE WHEN mc.nome = 'Uso de Disco'   THEN lm.valor END) AS discoMedia
        FROM logMonitoramento lm
        JOIN metricaComponente mc ON lm.fkMetrica = mc.idMetrica
        WHERE 
            lm.fkMaquina = ${idMaquina}
            AND lm.dtHora >= (NOW() - INTERVAL 10 MINUTE);
    `;

    return database.executar(instrucaoSql);
}


/*
 DISCO 
*/
function ultimoDisco(idMaquina) {
    console.log("dashboardModel.ultimoDisco():", idMaquina);

    const sql = `
        SELECT lm.valor, lm.dtHora
        FROM logMonitoramento lm
        JOIN metricaComponente mc ON lm.fkMetrica = mc.idMetrica
        WHERE lm.fkMaquina = ${idMaquina}
          AND mc.nome = 'Uso de Disco'
        ORDER BY lm.dtHora DESC
        LIMIT 1;
    `;

    return database.executar(sql);
}


/*
 REDE — Throughput / Enviados / Recebido
*/
function buscarTempoReal(idMaquina) {
    console.log("dashboardModel.buscarTempoReal():", idMaquina);

    const sql = `
        SELECT
            DATE_FORMAT(lmr.dtHora, '%H:%i:%s') AS momento,
            lmr.throughput AS velocidadeMbps,
            lmr.mbEnviados,
            lmr.mbRecebidos,
            lmr.pacotesEnviados,
            lmr.pacotesRecebidos
        FROM logMonitoramentoRede lmr
        WHERE lmr.fkMaquina = ${idMaquina}
        ORDER BY lmr.dtHora DESC
        LIMIT 1;
    `;

    return database.executar(sql);
}

/*
 HISTÓRICO DO DISCO
*/
function historicoDisco(idMaquina) {
    console.log("dashboardModel.historicoDisco():", idMaquina);

    const sql = `
        SELECT lm.valor
        FROM logMonitoramento lm
        JOIN metricaComponente mc ON lm.fkMetrica = mc.idMetrica
        WHERE lm.fkMaquina = ${idMaquina}
          AND mc.nome = 'Uso de Disco'
        ORDER BY lm.dtHora DESC
        LIMIT 12;
    `;

    return database.executar(sql);
}


/*
 CPU POR NÚCLEO 
*/
function cpuPorNucleo(idMaquina) {
    console.log("dashboardModel.cpuPorNucleo():", idMaquina);

    const sql = `
        SELECT lm.valor
        FROM logMonitoramento lm
        JOIN metricaComponente mc ON lm.fkMetrica = mc.idMetrica
        WHERE lm.fkMaquina = ${idMaquina}
          AND mc.nome = 'Uso de CPU'
        ORDER BY lm.dtHora DESC
        LIMIT 12;
    `;

    return database.executar(sql);
}



module.exports = {
    gerarRelatorio,
    serieComponente,
    ultimoComponente,
    kpisMaquina,
    ultimoDisco,
    buscarTempoReal,
    historicoDisco,
    cpuPorNucleo
};

