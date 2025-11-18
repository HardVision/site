var redeModel = require("../models/redeModel");

function tempoReal(req, res) {
    const idMaquina = req.params.idMaquina;

    redeModel.tempoRealRede(idMaquina)
        .then((resultado) => {
            if (resultado.length > 0) {
                res.status(200).json(resultado[0]);
            } else {
                res.status(204).send([]);
            }
        })
        .catch((erro) => {
            console.error("Erro no tempo real de rede:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function historico(req, res) {
    const idMaquina = req.params.idMaquina;

    redeModel.historicoRede(idMaquina)
        .then((resultado) => {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send([]);
            }
        })
        .catch((erro) => {
            console.error("Erro no histórico de rede:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    tempoReal,
    historico
};
