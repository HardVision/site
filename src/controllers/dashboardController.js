var dashboardModel = require("../models/dashboardModel");


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
        // ===== CPU =====
        const cpu = await dashboardModel.ultimoComponente(idMaquina, "Uso de CPU");
        const cpuValor = cpu[0]?.valor || 0;

        // ===== RAM =====
        const ram = await dashboardModel.ultimoComponente(idMaquina, "Uso de Memória");
        const ramValor = ram[0]?.valor || 0;

        // ===== DISCO =====
        const disco = await dashboardModel.ultimoComponente(idMaquina, "Uso de Disco");
        const discoValor = disco[0]?.valor || 0;

        // ===== DISCO HISTÓRICO =====
        const hist = await dashboardModel.historicoDisco(idMaquina);
        const discoHistorico = hist.map(r => r.valor);

        // ===== CPU POR NÚCLEO =====
        const nucleosDB = await dashboardModel.cpuPorNucleo(idMaquina);
        const nucleos = nucleosDB.map(n => n.valor);
        while (nucleos.length < 8) nucleos.push(0);

        // ===== REDE =====
        const rede = await dashboardModel.buscarTempoReal(idMaquina);


        let velocidade = 0;
        let envio = 0;
        let recebimento = 0;
        let pacotesEnv = 0;
        let pacotesRec = 0;

        if (rede.length > 0) {
            velocidade = rede[0].velocidadeMbps || 0;
            envio = rede[0].mbEnviados || 0;
            recebimento = rede[0].mbRecebidos || 0;
            pacotesEnv = rede[0].pacotesEnviados || 0;
            pacotesRec = rede[0].pacotesRecebidos || 0;
        }

        // ===== OBJETO FINAL PADRÃO =====
        const retorno = {
            cpu: cpuValor,
            ram: ramValor,
            disco: discoValor,
            discoHistorico: discoHistorico,
            nucleos: nucleos,

            velocidadeMbps: velocidade,
            envio,
            recebimento,
            pacotesEnv,
            pacotesRec
        };

        res.json(retorno);

    } catch (erro) {
        console.log("ERRO tempoReal():", erro);
        res.status(500).json({ erro: "Falha interna" });
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

function selectMaquina(req, res) {
    var idEmpresa = req.params.idEmpresa;
    console.log("Cheguei no controller selectMaquina()", idEmpresa)

    dashboardModel.selectMaquina(idEmpresa)
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


async function dadosRamTempoReal(req, res) {
    const idMaquina = req.params.id;

    try {
        const dados = await dashboardModel.ultimoComponente(idMaquina, "Uso de Memória");

        if (dados.length > 0) {
            res.json({
                valor: dados[0].valor,
                momento: dados[0].dtHora
            });
        } else {
            res.json({ valor: 0, momento: "" });
        }

    } catch (erro) {
        console.log("Erro ao buscar dados de RAM:", erro);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
}



module.exports = {
    gerarRelatorio,
    tempoReal,
    kpis,
    serie,
    alertasLinha,
    alertasBarra,
    alertasCard,
    selectMaquina,
    dadosRamTempoReal
};
