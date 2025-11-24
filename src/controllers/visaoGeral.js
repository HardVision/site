var visaoGeral = require("../models/visaoGeral.js");

function buscarInfo(req, res) {
    var fkEmpresa = req.params.fkEmpresa;
    
    visaoGeral.buscarInfo(fkEmpresa)
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
    buscarInfo
}