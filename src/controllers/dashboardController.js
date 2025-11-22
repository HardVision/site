var dashboardModel = require("../models/dashboardModel");

function cpuPorNucleo(req, res) {
    const idMaquina = req.params.idMaquina;
    
    dashboardModel.cpuPorNucleo(idMaquina)
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar CPU por núcleo: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}




// GERAR RELATÓRIO 
function gerarRelatorio(req, res) {
    const idEmpresa = req.params.idEmpresa;
    console.log("Cheguei no controller", idEmpresa);

    dashboardModel.gerarRelatorio(idEmpresa)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).json([]);
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar os dados: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}


// TEMPO REAL — CPU, RAM, DISCO, DISCO HISTÓRICO, NÚCLEOS, REDE
async function tempoReal(req, res) {
    const idMaquina = req.params.id;

    dashboardModel.ultimoComponente(idMaquina, "Uso de CPU")
        .then(function (cpu) {
            const cpuValor = cpu[0]?.valor || 0;
            return { cpuValor };
        })
        .then(function (dados) {
            return dashboardModel.ultimoComponente(idMaquina, "Uso de Memória")
                .then(function (ram) {
                    dados.ramValor = ram[0]?.valor || 0;
                    return dados;
                });
        })
        .then(function (dados) {
            return dashboardModel.ultimoComponente(idMaquina, "Uso de Disco")
                .then(function (disco) {
                    dados.discoValor = disco[0]?.valor || 0;
                    return dados;
                });
        })
        .then(function (dados) {
            return dashboardModel.historicoDisco(idMaquina)
                .then(function (hist) {
                    dados.discoHistorico = hist.map(r => r.valor);
                    return dados;
                });
        })
        .then(function (dados) {
            return dashboardModel.cpuPorNucleo(idMaquina)
                .then(function (nucleosDB) {
                    const nucleos = nucleosDB.map(n => n.valor);
                    while (nucleos.length < 8) nucleos.push(0);
                    dados.nucleos = nucleos;
                    return dados;
                });
        })
        .then(function (dados) {
            return dashboardModel.buscarTempoReal(idMaquina)
                .then(function (rede) {
                    dados.velocidade = 0;
                    dados.envio = 0;
                    dados.recebimento = 0;
                    dados.pacotesEnv = 0;
                    dados.pacotesRec = 0;

                    if (rede.length > 0) {
                        dados.velocidade = rede[0].velocidadeMbps || 0;
                        dados.envio = rede[0].mbEnviados || 0;
                        dados.recebimento = rede[0].mbRecebidos || 0;
                        dados.pacotesEnv = rede[0].pacotesEnviados || 0;
                        dados.pacotesRec = rede[0].pacotesRecebidos || 0;
                    }
                    return dados;
                });
        })
        .then(function (dados) {
            return dashboardModel.buscarUptime(idMaquina)
                .then(function (uptimeDB) {
                    dados.uptime = uptimeDB[0]?.uptime || 0;
                    return dados;
                });
        })
        .then(function (dados) {
            const retorno = {
                cpu: dados.cpuValor,
                ram: dados.ramValor,
                disco: dados.discoValor,
                discoHistorico: dados.discoHistorico,
                nucleos: dados.nucleos,
                uptime: dados.uptime,
                velocidadeMbps: dados.velocidade,
                envio: dados.envio,
                recebimento: dados.recebimento,
                pacotesEnv: dados.pacotesEnv,
                pacotesRec: dados.pacotesRec,
            };
            res.json(retorno);
        })
        .catch(function (erro) {
            console.log("ERRO tempoReal():", erro);
            res.status(500).json({ erro: "Falha interna" });
        });
}

function kpis(req, res) {
    var idMaquina = req.params.id;

    dashboardModel.kpisMaquina(idMaquina)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar KPIs: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function kpisMaquina(req, res) {
    var idMaquina = req.params.id;

    dashboardModel.kpisMaquina(idMaquina)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar KPIs da máquina: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function serie(req, res) {
    var idMaquina = req.params.id;

    dashboardModel.serieComponente(idMaquina)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar série temporal: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function alertasLinha(req, res) {
    var idEmpresa = req.params.idEmpresa;
    var idMaquina = req.query.maquina || null;
    console.log("Cheguei no controller alertasLinha()", idMaquina)

    dashboardModel.alertasLinha(idEmpresa, idMaquina)
        .then(function (resultado) {
            if (resultado.length > 0) {
                console.log(resultado)
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar alertas: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function alertasBarra(req, res) {
    var idEmpresa = req.params.idEmpresa;
    var idMaquina = req.query.maquina || null;
    console.log("Cheguei no controller alertasBarra()", idEmpresa, idMaquina)

    dashboardModel.alertasBarra(idEmpresa, idMaquina)
        .then(function (resultado) {
            if (resultado.length > 0) {
                console.log(resultado)
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar alertas: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function alertasCard(req, res) {
    var idEmpresa = req.params.idEmpresa;
    var idMaquina = req.query.maquina || null;
    console.log("Cheguei no controller alertasCard()", idEmpresa, idMaquina)

    dashboardModel.alertasCard(idEmpresa, idMaquina)
        .then(function (resultado) {
            if (resultado.length > 0) {
                console.log(resultado)
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar alertas: ", erro.sqlMessage);
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
            console.log(erro);
            console.log("Houve um erro ao buscar máquinas: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function dadosRamTempoReal(req, res) {
    const idMaquina = req.params.idMaquina;

    dashboardModel.ultimoComponente(idMaquina, "Uso de Memória")
        .then(function (dados) {
            if (dados.length > 0) {
                res.json({
                    valor: dados[0].valor,
                    momento: dados[0].dtHora
                });
            } else {
                res.json({ valor: 0, momento: "" });
            }
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar dados de RAM: ", erro.sqlMessage);
            res.status(500).json({ erro: "Erro interno no servidor" });
        });
}

module.exports = {
    gerarRelatorio,
    tempoReal,
    kpis,
    kpisMaquina,
    serie,
    alertasLinha,
    alertasBarra,
    alertasCard,
    selectMaquina,
    dadosRamTempoReal,
    cpuPorNucleo   //       
};