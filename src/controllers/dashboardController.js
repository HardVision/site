var dashboardModel = require("../models/dashboardModel");
var analytics = require("../services/analytics")

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

function cpuUso(req, res) {
    const idMaquina = req.params.idMaquina;

    dashboardModel.buscarCpu(idMaquina)                         //pega o uso atual da CPU.
        .then(resultado => res.status(200).json(resultado))
        .catch(erro => {
            console.log("Erro ao buscar CPU uso total:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}
async function kpisCpu(req, res) {
  const idMaquina = req.params.idMaquina;

  try {
    const uso = await dashboardModel.buscarUsoAtual(idMaquina);
    const nucleos80 = await dashboardModel.buscarNucleosAcima80(idMaquina);
    const processos = await dashboardModel.buscarProcessosAtivos(idMaquina);

    res.json({
      uso_atual: uso[0]?.usoCpu || 0,
      nucleos_acima_80: nucleos80[0]?.qtd || 0,
      processos_ativos: processos[0]?.qtd || 0
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json(erro);
  }
}




// GERAR RELATÓRIO 
function gerarRelatorio(req, res) {
    const idMaquina = req.params.idMaquina;
    console.log("Cheguei no controller gerarRelatorio()", idMaquina);

    dashboardModel.gerarRelatorio(idMaquina)
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
    const idMaquina = req.params.idMaquina;

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

function alertasKpi(req, res) {
    var idEmpresa = req.params.idEmpresa;
    var idMaquina = req.query.maquina || null;
    console.log("Cheguei no controller alertasKpi()", idEmpresa, idMaquina)

    dashboardModel.alertasKpi(idEmpresa, idMaquina)
        .then(function (resultado) {
            if (resultado.length > 0) {
                let resultadoAnalitycs = analytics.alertasKpi(resultado)
                console.log("Resultados do alertasKpi()", resultadoAnalitycs)
                res.status(200).json(resultadoAnalitycs);
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

function alertasMarkov(req, res) {
    var idEmpresa = req.params.idEmpresa;
    var idMaquina = req.query.maquina || null;
    console.log("Cheguei no controller alertasMarkov()", idEmpresa, idMaquina)

    dashboardModel.alertasKpi(idEmpresa, idMaquina)
        .then(function (resultado) {
            if (resultado.length > 0) {
                let resultadoAnalitycs = analytics.alertasMarkov(resultado)
                console.log("Resultados do alertasMarkov()", resultadoAnalitycs)
                res.status(200).json(resultadoAnalitycs);
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

function alertasProb(req, res) {
    var idEmpresa = req.params.idEmpresa;
    var idMaquina = req.query.maquina || null;
    console.log("Cheguei no controller alertasProb()", idEmpresa, idMaquina)

    dashboardModel.alertasKpi(idEmpresa, idMaquina)
        .then(function (resultado) {
            if (resultado.length > 0) {
                let resultadoAnalitycs = analytics.alertasProb(resultado)
                console.log("Resultados do alertasProb()", resultadoAnalitycs)
                res.status(200).json(resultadoAnalitycs);
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
    const idMaquina = req.params.idMaquina || req.params.id;

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

async function kpiRamMedia7dias(req, res) {
    const idMaquina = req.params.id || req.params.idMaquina;
    try {
        const resultado = await dashboardModel.mediaRam7dias(idMaquina);
        if (resultado.length > 0) {
            res.status(200).json(resultado[0]);
        } else {
            res.status(204).send();
        }
    } catch (erro) {
        console.log("Erro ao buscar KPI média RAM 7 dias:", erro);
        res.status(500).json({ erro: erro.sqlMessage || erro.message });
    }
}

async function kpiTopAppHoje(req, res) {
    const idMaquina = req.params.id || req.params.idMaquina;
    try {
        const resultado = await dashboardModel.topAppHoje(idMaquina);
        if (resultado.length > 0) {
            res.status(200).json(resultado[0]);
        } else {
            res.status(204).send();
        }
    } catch (erro) {
        console.log("Erro ao buscar top app hoje:", erro);
        res.status(500).json({ erro: erro.sqlMessage || erro.message });
    }
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
    alertasKpi,
    alertasProb,
    alertasMarkov,
    selectMaquina,
    dadosRamTempoReal,
    cpuUso,
    cpuPorNucleo,      
    kpisCpu,   
    kpiRamMedia7dias,
    kpiTopAppHoje
};