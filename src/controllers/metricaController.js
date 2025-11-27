var metricaModel = require("../models/metricaModel");

function listarMetricas(req, res) {
    var idEmpresa = req.params.idEmpresa;

    console.log(`Recuperando todas as métricas da empresa ${idEmpresa}`);

    metricaModel.listarMetricas(idEmpresa).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhuma métrica encontrada!");
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar as métricas.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

function criarMetrica(req, res) {
    var idEmpresa = req.body.idEmpresa;
    var nome = req.body.nome;
    var medida = req.body.medida;
    var min = req.body.min;
    var max = req.body.max;
    var unidade = req.body.unidade || '-';

    console.log(`Criando nova métrica para a empresa ${idEmpresa}`);
    console.log("Dados recebidos:", { idEmpresa, nome, medida, min, max, unidade });

    if (!idEmpresa || !nome || !medida || min === undefined || max === undefined) {
        console.log("Validação falhou - campos obrigatórios");
        return res.status(400).json({ erro: "Todos os campos obrigatórios devem ser preenchidos" });
    }

    metricaModel.criarMetrica(idEmpresa, nome, medida, min, max, unidade).then(function (resultado) {
        console.log("Métrica criada com sucesso:", resultado);
        res.status(201).json({ sucesso: true, resultado: resultado });
    }).catch(function (erro) {
        console.log("ERRO ao criar métrica:", erro);
        console.log("SQL Message:", erro.sqlMessage);
        res.status(500).json({ erro: erro.sqlMessage || erro.message || "Erro desconhecido ao criar métrica" });
    });
}

function atualizarMetrica(req, res) {
    var idMetrica = req.params.idMetrica;
    var nome = req.body.nome;
    var medida = req.body.medida;
    var min = req.body.min;
    var max = req.body.max;
    var unidade = req.body.unidade || '-';

    console.log(`Atualizando métrica ${idMetrica}`);

    if (!nome || !medida || min === undefined || max === undefined) {
        return res.status(400).json({ erro: "Todos os campos obrigatórios devem ser preenchidos" });
    }

    metricaModel.atualizarMetrica(idMetrica, nome, medida, min, max, unidade).then(function (resultado) {
        console.log("Métrica atualizada com sucesso");
        res.status(200).json({ sucesso: true, resultado: resultado });
    }).catch(function (erro) {
        console.log("ERRO ao atualizar métrica:", erro);
        res.status(500).json({ erro: erro.sqlMessage || erro.message || "Erro desconhecido ao atualizar métrica" });
    });
}

function deletarMetrica(req, res) {
    var idMetrica = req.params.idMetrica;

    console.log(`Deletando métrica ${idMetrica}`);

    metricaModel.deletarMetrica(idMetrica).then(function (resultado) {
        console.log("Métrica deletada com sucesso");
        res.status(200).json({ sucesso: true, mensagem: "Métrica deletada com sucesso" });
    }).catch(function (erro) {
        console.log("ERRO ao deletar métrica:", erro);
        res.status(500).json({ erro: erro.sqlMessage || erro.message || "Erro desconhecido ao deletar métrica" });
    });
}

function obterMetricaPorId(req, res) {
    var idMetrica = req.params.idMetrica;

    console.log(`Recuperando métrica ${idMetrica}`);

    metricaModel.obterMetricaPorId(idMetrica).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado[0]);
        } else {
            res.status(204).send("Métrica não encontrada!");
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar a métrica.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

module.exports = {
    listarMetricas,
    criarMetrica,
    atualizarMetrica,
    deletarMetrica,
    obterMetricaPorId
}
