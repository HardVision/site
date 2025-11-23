var dashboardModel = require("../models/dashboardModel");

function tempoRealRede(idMaquina) {
    console.log("ACESSEI O REDE MODEL \n\n function tempoRealRede():", idMaquina);
    return dashboardModel.buscarTempoReal(idMaquina);
}

function historicoRede(idMaquina) {
    console.log("ACESSEI O REDE MODEL \n\n function historicoRede():", idMaquina);
    return dashboardModel.historicoRede(idMaquina);
}

module.exports = {
    tempoRealRede,
    historicoRede
};