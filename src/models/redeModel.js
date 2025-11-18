var dashboardModel = require("../models/dashboardModel");

// NÃO TEM MAIS SQL AQUI.
// Só reaproveita o que já existe no dashboardModel.

function tempoRealRede(idMaquina) {
    // usa a mesma query de tempo real usada pela dashboard geral
    return dashboardModel.buscarTempoReal(idMaquina);
}

function historicoRede(idMaquina) {
    // usa o histórico unificado de rede
    return dashboardModel.historicoRede(idMaquina);
}

module.exports = {
    tempoRealRede,
    historicoRede
};
