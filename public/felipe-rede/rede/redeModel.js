var database = require("../database/config");

/*
   Últimas N leituras de rede para a máquina.
*/
function buscarUltimas(idMaquina, limite) {
    console.log("redeModel.buscarUltimas():", idMaquina, limite);

    var instrucaoSql = `
        SELECT 
            DATE_FORMAT(lmr.dtHora, '%H:%i:%s') AS momento,
            lmr.velocidadeMbps,
            lmr.mbEnviados,
            lmr.mbRecebidos,
            lmr.pacotesEnviados,
            lmr.pacotesRecebidos
        FROM logMonitoramentoRede lmr
        WHERE lmr.fkMaquina = ${idMaquina}
        ORDER BY lmr.dtHora DESC
        LIMIT ${limite};
    `;

    console.log("Executando SQL buscarUltimas:\n", instrucaoSql);
    return database.executar(instrucaoSql);
}

/*
   Última leitura de rede para a máquina (tempo real).
*/
function buscarTempoReal(idMaquina) {
    console.log("redeModel.buscarTempoReal():", idMaquina);

    var instrucaoSql = `
        SELECT 
            DATE_FORMAT(lmr.dtHora, '%H:%i:%s') AS momento,
            lmr.velocidadeMbps,
            lmr.mbEnviados,
            lmr.mbRecebidos,
            lmr.pacotesEnviados,
            lmr.pacotesRecebidos
        FROM logMonitoramentoRede lmr
        WHERE lmr.fkMaquina = ${idMaquina}
        ORDER BY lmr.dtHora DESC
        LIMIT 1;
    `;

    console.log("Executando SQL buscarTempoReal:\n", instrucaoSql);
    return database.executar(instrucaoSql);
}

/*
   KPIs de rede (janela de 10 minutos).
*/
function buscarKpis(idMaquina) {
    console.log("redeModel.buscarKpis():", idMaquina);

    var instrucaoSql = `
        SELECT 
            MAX(lmr.velocidadeMbps) AS velocidadeMax,
            AVG(lmr.velocidadeMbps) AS velocidadeMedia,
            SUM(lmr.mbEnviados)     AS totalMbEnviados,
            SUM(lmr.mbRecebidos)    AS totalMbRecebidos
        FROM logMonitoramentoRede lmr
        WHERE 
            lmr.fkMaquina = ${idMaquina}
            AND lmr.dtHora >= (NOW() - INTERVAL 10 MINUTE);
    `;

    console.log("Executando SQL buscarKpis:\n", instrucaoSql);
    return database.executar(instrucaoSql);
}

/*
   Alertas agrupados por estado (Normal / Atenção / Crítico)
   nas últimas 24h.
*/
function buscarAlertasAgrupados(idMaquina) {
    console.log("redeModel.buscarAlertasAgrupados():", idMaquina);

    var instrucaoSql = `
        SELECT 
            ar.estado,
            COUNT(*) AS quantidade
        FROM alertaRede ar
        JOIN logMonitoramentoRede lmr 
            ON lmr.fkAlertaRede = ar.idAlertaRede
        WHERE 
            lmr.fkMaquina = ${idMaquina}
            AND lmr.dtHora >= (NOW() - INTERVAL 24 HOUR)
        GROUP BY ar.estado;
    `;

    console.log("Executando SQL buscarAlertasAgrupados:\n", instrucaoSql);
    return database.executar(instrucaoSql);
}

/*
   Lista de alertas recentes de rede para a máquina.
*/
function listarAlertas(idMaquina, limite) {
    console.log("redeModel.listarAlertas():", idMaquina, limite);

    var instrucaoSql = `
        SELECT 
            DATE_FORMAT(lmr.dtHora,'%d/%m %H:%i:%s') AS dataHora,
            ar.estado,
            mr.nome AS metrica,
            lmr.velocidadeMbps,
            lmr.mbEnviados,
            lmr.mbRecebidos
        FROM logMonitoramentoRede lmr
        JOIN alertaRede ar    ON lmr.fkAlertaRede  = ar.idAlertaRede
        JOIN metricaRede mr   ON lmr.fkMetricaRede = mr.idMetricaRede
        WHERE lmr.fkMaquina = ${idMaquina}
        ORDER BY lmr.dtHora DESC
        LIMIT ${limite};
    `;

    console.log("Executando SQL listarAlertas:\n", instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarUltimas,
    buscarTempoReal,
    buscarKpis,
    buscarAlertasAgrupados,
    listarAlertas
};
