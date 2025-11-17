var redeModel = require("../../../../../../../zz/src/models/redeModel");

/*
   GET /rede/ultimas/:idMaquina?limite=20
*/
function buscarUltimas(req, res) {
    var idMaquina = req.params.idMaquina;
    var limite    = Number(req.query.limite) || 20;

    redeModel.buscarUltimas(idMaquina, limite)
        .then(resultado => {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send();
            }
        })
        .catch(erro => {
            console.log("Erro em buscarUltimas:", erro.sqlMessage || erro);
            res.status(500).json(erro.sqlMessage || "Erro ao buscar últimas leituras de rede");
        });
}

/*
   GET /rede/tempo-real/:idMaquina
*/
function buscarTempoReal(req, res) {
    var idMaquina = req.params.idMaquina;

    redeModel.buscarTempoReal(idMaquina)
        .then(resultado => {
            if (resultado.length > 0) {
                const r = resultado[0];

                // Já devolvo num formato amigável para o dashboardRede.js
                res.status(200).json({
                    momento:       r.momento,
                    velocidade:    r.velocidadeMbps,
                    enviado:       r.mbEnviados,
                    recebido:      r.mbRecebidos,
                    pacotesEnv:    r.pacotesEnviados,
                    pacotesRec:    r.pacotesRecebidos
                });
            } else {
                res.status(204).send();
            }
        })
        .catch(erro => {
            console.log("Erro em buscarTempoReal:", erro.sqlMessage || erro);
            res.status(500).json(erro.sqlMessage || "Erro ao buscar leitura de rede em tempo real");
        });
}

/*
   GET /rede/kpis/:idMaquina
*/
function buscarKpis(req, res) {
    var idMaquina = req.params.idMaquina;

    redeModel.buscarKpis(idMaquina)
        .then(resultado => {
            if (resultado.length > 0) {
                res.status(200).json(resultado[0]);
            } else {
                res.status(204).send();
            }
        })
        .catch(erro => {
            console.log("Erro em buscarKpis:", erro.sqlMessage || erro);
            res.status(500).json(erro.sqlMessage || "Erro ao buscar KPIs de rede");
        });
}

/*
   GET /rede/alertas-agrupados/:idMaquina
*/
function buscarAlertasAgrupados(req, res) {
    var idMaquina = req.params.idMaquina;

    redeModel.buscarAlertasAgrupados(idMaquina)
        .then(resultado => {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send();
            }
        })
        .catch(erro => {
            console.log("Erro em buscarAlertasAgrupados:", erro.sqlMessage || erro);
            res.status(500).json(erro.sqlMessage || "Erro ao buscar alertas agrupados de rede");
        });
}

/*
   GET /rede/alertas/:idMaquina?limite=20
*/
function listarAlertas(req, res) {
    var idMaquina = req.params.idMaquina;
    var limite    = Number(req.query.limite) || 20;

    redeModel.listarAlertas(idMaquina, limite)
        .then(resultado => {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send();
            }
        })
        .catch(erro => {
            console.log("Erro em listarAlertas:", erro.sqlMessage || erro);
            res.status(500).json(erro.sqlMessage || "Erro ao listar alertas de rede");
        });
}

module.exports = {
    buscarUltimas,
    buscarTempoReal,
    buscarKpis,
    buscarAlertasAgrupados,
    listarAlertas
};
