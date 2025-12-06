var dashboardDiscoModel = require("../models/dashboardDiscoModel");

function listarMaquinas(req, res) {
    var idEmpresa = req.params.idEmpresa;

    dashboardDiscoModel.buscarMaquinas(idEmpresa)
        .then((resultado) => {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).json([]);
            }
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function kpiDisco(req, res) {
    const idMaquina = req.params.idMaquina;

    dashboardDiscoModel.buscarKpiDisco(idMaquina)
        .then(function (resultado) {
            if (resultado.length > 0) {
                const dados = resultado[0];
                
                // Conversão de capacidade (Ex: '1TB' -> 1024)
                let capacidadeTotalGB = 0;
                const capString = dados.capacidade.toUpperCase();
                
                if (capString.includes("TB")) {
                    capacidadeTotalGB = parseFloat(capString) * 1024;
                } else if (capString.includes("GB")) {
                    capacidadeTotalGB = parseFloat(capString);
                } else {
                    capacidadeTotalGB = 500; // Fallback
                }

                const usoPercent = dados.usoPercentual; 
                const usadoGB = (capacidadeTotalGB * (usoPercent / 100));
                const livreGB = capacidadeTotalGB - usadoGB;

                res.json({
                    porcentagem: usoPercent,
                    usado: usadoGB.toFixed(1),
                    livre: livreGB.toFixed(1),
                    total: capacidadeTotalGB
                });
            } else {
                res.status(204).send("Nenhum dado encontrado");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function historicoDisco(req, res) {
    const idMaquina = req.params.idMaquina;
    dashboardDiscoModel.buscarHistoricoDisco(idMaquina)
        .then((resultado) => {
            // Inverte array para gráfico timeline (antigo -> novo)
            res.json(resultado.reverse());
        })
        .catch((erro) => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function processosDisco(req, res) {
    const idMaquina = req.params.idMaquina;
    dashboardDiscoModel.buscarProcessosDisco(idMaquina)
        .then((resultado) => {
            res.json(resultado);
        })
        .catch((erro) => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    listarMaquinas,
    kpiDisco,
    historicoDisco,
    processosDisco
};