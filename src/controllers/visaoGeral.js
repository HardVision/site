var visaoGeral = require("../models/visaoGeral.js");

function aplicarFiltro(filtro) {
    var corpoQuery = "";

    if(filtro == "24h") {
        corpoQuery = "dtIncidente >= NOW() - INTERVAL 24 HOUR;"
    } else if(filtro == "7d") {
        corpoQuery = "dtIncidente BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE();"
    } else {
        corpoQuery = "dtIncidente BETWEEN DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND CURDATE();"
    }
    return corpoQuery;
}

function buscarInfo(req, res) {
    var fkEmpresa = req.params.fkEmpresa;
    var filtro = req.params.filtro;

    filtro = aplicarFiltro(filtro);
    
    visaoGeral.buscarInfo(fkEmpresa, filtro)
        .then(
            function (resultado) {
                res.json(resultado);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log(
                    "\nHouve um erro ao realizar o cadastro! Erro: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            }
        );
    
}

function cadastrar(req, res) {
    var idFuncionario = req.body.idFuncionarioServer;
    var fkEmpresa = req.body.fkEmpresaServer;
    var titulo = req.body.tituloServer;
    var descricao = req.body.descricaoServer;

    visaoGeral.cadastrar(idFuncionario, fkEmpresa, titulo, descricao)
        .then(
            function (resultado) {
                res.json(resultado);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log(
                    "\nHouve um erro ao realizar o cadastro! Erro: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            }
        );
}

function buscarUptime(req, res) {
    var fkEmpresa = req.params.fkEmpresa;

    visaoGeral.buscarUptime(fkEmpresa)
        .then(
            function (resultado) {
                res.json(resultado);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log(
                    "\nHouve um erro ao realizar o cadastro! Erro: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            }
        );
}

function deletar(req, res) {
    var id = req.params.idBotaoEscolhido;

    visaoGeral.deletar(id)
        .then(
            function (resultado) {
                res.json(resultado);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log(
                    "\nHouve um erro ao realizar o cadastro! Erro: ",
                    erro.sqlMessage
                );
                res.status(500).json(erro.sqlMessage);
            }
        );
}

module.exports = {
    buscarInfo,
    cadastrar,
    buscarUptime,
    deletar
}