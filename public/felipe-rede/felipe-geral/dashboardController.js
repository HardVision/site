var dashboardModel = require("../models/dashboardModel");
var redeModel      = require("../models/redeModel");

/*
   Endpoint de tempo real usado pela dashboard geral:
   GET /dashboard/tempo-real/:idMaquina

   Resposta JSON:
   {
     cpu: number | null,
     ram: number | null,
     disco: number | null,
     redeEnvio: number | null,
     redeReceb: number | null,
     nucleos: number[]
   }
*/
function tempoReal(req, res) {
    var idMaquina = req.params.idMaquina;

    if (!idMaquina) {
        return res.status(400).json("idMaquina é obrigatório");
    }

    Promise.all([
        dashboardModel.ultimoComponente(idMaquina, "Uso de CPU"),
        dashboardModel.ultimoComponente(idMaquina, "Uso de Memória"),
        dashboardModel.ultimoComponente(idMaquina, "Uso de Disco"),
        redeModel.buscarTempoReal(idMaquina)
    ])
        .then(([cpuRows, ramRows, discoRows, redeRows]) => {
            const cpu   = cpuRows   && cpuRows[0]   ? cpuRows[0].valor   : null;
            const ram   = ramRows   && ramRows[0]   ? ramRows[0].valor   : null;
            const disco = discoRows && discoRows[0] ? discoRows[0].valor : null;

            let redeEnvio = null;
            let redeReceb = null;

            if (redeRows && redeRows[0]) {
                const r = redeRows[0];
                const total = r.velocidadeMbps || 0;

                // Por enquanto dividimos o throughput total em 50/50
                // só pra alimentar os 2 gráficos (Envio/Recebimento).
                // Quando quiser, dá pra refinar usando lógica dos bytes enviados/recebidos.
                redeEnvio = total / 2;
                redeReceb = total / 2;
            }

            // Placeholder: 8 núcleos com o mesmo valor de CPU
            const nucleos = cpu != null ? Array(8).fill(cpu) : [];

            res.status(200).json({
                cpu,
                ram,
                disco,
                redeEnvio,
                redeReceb,
                nucleos
            });
        })
        .catch(erro => {
            console.log("Erro em tempoReal:", erro.sqlMessage || erro);
            res.status(500).json(erro.sqlMessage || "Erro ao buscar dados em tempo real");
        });
}

/*
   KPIs básicos (caso ainda queira usar /dashboard/kpis/:idMaquina)
*/
function kpis(req, res) {
    var idMaquina = req.params.idMaquina;

    dashboardModel.kpisMaquina(idMaquina)
        .then(resultado => {
            if (resultado.length > 0) {
                res.status(200).json(resultado[0]);
            } else {
                res.status(204).send();
            }
        })
        .catch(erro => {
            console.log("Erro ao buscar KPIs:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

/*
   Série temporal de CPU / RAM / DISCO:
   GET /dashboard/serie/:idMaquina/:nomeMetrica?minutos=20
*/
function serie(req, res) {
    var idMaquina   = req.params.idMaquina;
    var nomeMetrica = req.params.nomeMetrica;
    var minutos     = Number(req.query.minutos) || 20;

    dashboardModel.serieComponente(idMaquina, nomeMetrica, minutos)
        .then(resultado => {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send();
            }
        })
        .catch(erro => {
            console.log("Erro ao buscar série:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    tempoReal,
    kpis,
    serie
};
