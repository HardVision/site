var database = require("../../../../zz/src/database/config");

/*
   Série temporal de uma métrica de componente (CPU, RAM, DISCO)
   últimos N minutos para uma máquina.
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

    console.log("Executando SQL serieComponente:\n", instrucaoSql);
    return database.executar(instrucaoSql);
}

/*
   Último valor de uma métrica (CPU, RAM, DISCO) para a máquina.
*/
function ultimoComponente(idMaquina, nomeMetrica) {
    console.log("dashboardModel.ultimoComponente():", idMaquina, nomeMetrica);

    var instrucaoSql = `
        SELECT 
            lm.valor,
            lm.dtHora
        FROM logMonitoramento lm
        JOIN metricaComponente mc 
            ON lm.fkMetrica = mc.idMetrica
        WHERE 
            lm.fkMaquina = ${idMaquina}
            AND mc.nome = '${nomeMetrica}'
        ORDER BY lm.dtHora DESC
        LIMIT 1;
    `;

    console.log("Executando SQL ultimoComponente:\n", instrucaoSql);
    return database.executar(instrucaoSql);
}

/*
   KPIs básicos da máquina para CPU, RAM e DISCO
   (média nos últimos 10 minutos).
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
        JOIN metricaComponente mc
            ON lm.fkMetrica = mc.idMetrica
        WHERE 
            lm.fkMaquina = ${idMaquina}
            AND lm.dtHora >= (NOW() - INTERVAL 10 MINUTE);
    `;

    console.log("Executando SQL kpisMaquina:\n", instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    serieComponente,
    ultimoComponente,
    kpisMaquina
};
