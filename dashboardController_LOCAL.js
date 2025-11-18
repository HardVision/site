var dashboardModel = require("../models/dashboardModel");
var redeModel = require("../models/redeModel");


function cpuPorNucleo(req, res) {
    const idMaquina = req.params.id;
    dashboardModel.cpuPorNucleo(idMaquina)
        .then(resultado => {
            res.status(200).json(resultado);
        })
        .catch(erro => {
            console.log("Erro CPU por núcleo:", erro);
            res.status(500).json(erro.sqlMessage);
        });
}




// GERAR RELATÓRIO 
function gerarRelatorio(req, res) {
    const idEmpresa = req.params.idEmpresa;
    console.log("Cheguei no controller", idEmpresa);

    dashboardModel.gerarRelatorio(idEmpresa)
        .then((resultado) => {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).json([]);
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar os aquarios: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}


// TEMPO REAL — CPU, RAM, DISCO, DISCO HISTÓRICO, NÚCLEOS, REDE
async function tempoReal(req, res) {
    const idMaquina = req.params.id;

    try {
        // ========== CPU ==========
        const cpu = await dashboardModel.ultimoComponente(idMaquina, "Uso de CPU");
        const cpuValor = cpu[0]?.valor || 0;

        // ========== RAM ==========
        const ram = await dashboardModel.ultimoComponente(idMaquina, "Uso de Memória");
        const ramValor = ram[0]?.valor || 0;

        // ========== DISCO ==========
        const disco = await dashboardModel.ultimoComponente(idMaquina, "Uso de Disco");
        const discoValor = disco[0]?.valor || 0;

        // ========== HISTÓRICO DE DISCO ==========
        const historico = await dashboardModel.historicoDisco(idMaquina);
        const discoHistorico = [];

        for (let i = 0; i < historico.length; i++) {
            discoHistorico.push(historico[i].valor);
        }

        // ========== CPU POR NÚCLEO ==========
        const nucleos = await dashboardModel.cpuPorNucleo(idMaquina);
        const listaNucleos = [];

        for (let i = 0; i < nucleos.length; i++) {
            listaNucleos.push(nucleos[i].valor);
        }

        // garantir 8 posições
        while (listaNucleos.length < 8) {
            listaNucleos.push(0);
        }


        // ========== REDE (envio / recebimento) ==========
        const rede = await redeModel.buscarTempoReal(idMaquina);

        let envio = 0;
        let recebimento = 0;

        if (rede && rede.length > 0) {
            envio = rede[0]?.mbEnviados || 0;
            recebimento = rede[0]?.mbRecebidos || 0;
        }

        // ==========================
        // OBJETO FINAL PARA O FRONT
        // ==========================
        const retorno = {
            cpu: cpuValor,
            ram: ramValor,
            disco: discoValor,
            discoHistorico: discoHistorico,
            nucleos: listaNucleos,
            envio: envio,
            recebimento: recebimento
        };

        res.json(retorno);

    } catch (erro) {
        console.log("Erro em tempoReal:", erro);
        res.status(500).json({ erro: "Falha ao obter dados da máquina" });
    }
}


// KPIs 
function kpis(req, res) {
    var idMaquina = req.params.id;

    dashboardModel.kpis(idMaquina)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        })
        .catch(function (erro) {
            console.log("Erro ao buscar KPIs:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}


// SÉRIE TEMPORAL 
function serie(req, res) {
    var idMaquina = req.params.id;

    dashboardModel.serie(idMaquina)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        })
        .catch(function (erro) {
            console.log("Erro série temporal:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function alertasLinha(req, res) {
    var idEmpresa = req.params.idEmpresa;
    console.log("Cheguei no controller alertasLinha()", idEmpresa)

    dashboardModel.alertasLinha(idEmpresa)
        .then(function (resultado) {
            if (resultado.length > 0) {
                console.log(resultado)
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        })
        .catch(function (erro) {
            console.log("Erro série temporal:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function alertasBarra(req, res) {
    var idEmpresa = req.params.idEmpresa;
    console.log("Cheguei no controller alertasBarra()", idEmpresa)

    dashboardModel.alertasBarra(idEmpresa)
        .then(function (resultado) {
            if (resultado.length > 0) {
                console.log(resultado)
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        })
        .catch(function (erro) {
            console.log("Erro série temporal:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function alertasCard(req, res) {
    var idEmpresa = req.params.idEmpresa;
    console.log("Cheguei no controller alertasCard()", idEmpresa)

    dashboardModel.alertasCard(idEmpresa)
        .then(function (resultado) {
            if (resultado.length > 0) {
                console.log(resultado)
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        })
        .catch(function (erro) {
            console.log("Erro série temporal:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    gerarRelatorio,
    tempoReal,
    kpis,
    serie,
    alertasLinha,
    alertasBarra,
    alertasCard,
    cpuPorNucleo
};
