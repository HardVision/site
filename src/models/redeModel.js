var database = require("../database/config");

function tempoRealRede(idMaquina) {
    const sql = `
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
    return database.executar(sql);
}

function historicoRede(idMaquina) {
    const sql = `
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
        LIMIT 60;
    `;

    return database.executar(sql);
}

module.exports = {
    tempoRealRede,
    historicoRede
};
