var redeModel = require("../models/redeModel");

function tempoReal(req, res) {
    const idMaquina = req.params.idMaquina;

    redeModel.tempoRealRede(idMaquina)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado[0]);
            } else {
                res.status(204).send([]);
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar tempo real de rede: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function historico(req, res) {
    const idMaquina = req.params.idMaquina;

    redeModel.historicoRede(idMaquina)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send([]);
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar histórico de rede: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    tempoReal,
    historico
};