var database = require("../database/config");

function buscarMaquinas(idEmpresa) {
    var instrucaoSql = `SELECT idMaquina, macAddress FROM maquina WHERE fkEmpresa = ${idEmpresa}`;
    return database.executar(instrucaoSql);
}

function buscarKpiDisco(idMaquina) {
    // Busca o valor mais recente do log de disco e a capacidade total do componente
    var instrucaoSql = `
        SELECT 
            lm.valor AS usoPercentual,
            c.capacidade,
            lm.dtHora
        FROM logMonitoramento lm
        JOIN componente c ON lm.fkComponente = c.idComponente
        JOIN metricaComponente mc ON lm.fkMetrica = mc.idMetrica
        WHERE lm.fkMaquina = ${idMaquina}
          AND mc.nome = 'Uso de Disco'
        ORDER BY lm.dtHora DESC
        LIMIT 1;
    `;
    return database.executar(instrucaoSql);
}

function buscarHistoricoDisco(idMaquina) {
    // Busca os últimos 20 registros para o gráfico de linha
    var instrucaoSql = `
        SELECT 
            DATE_FORMAT(lm.dtHora, '%H:%i:%s') AS momento,
            lm.valor
        FROM logMonitoramento lm
        JOIN metricaComponente mc ON lm.fkMetrica = mc.idMetrica
        WHERE lm.fkMaquina = ${idMaquina}
          AND mc.nome = 'Uso de Disco'
        ORDER BY lm.dtHora DESC
        LIMIT 20;
    `;
    return database.executar(instrucaoSql);
}

function buscarProcessosDisco(idMaquina) {
    // Soma discoLido + discoRecebido para ver atividade total dos processos
    var instrucaoSql = `
        SELECT 
            nome,
            (discoLido + discoRecebido) AS usoDisco
        FROM processo
        WHERE fkMaquina = ${idMaquina}
        ORDER BY usoDisco DESC
        LIMIT 5;
    `;
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarMaquinas,
    buscarKpiDisco,
    buscarHistoricoDisco,
    buscarProcessosDisco
};