var perfilModel = require("../models/perfilModel");

function buscarInfo(req, res) {
    const id = req.params.id;
    
    perfilModel.buscarInfo(id)
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


function atualizar(req, res) {
    const id = req.params.id;
    const nome = req.body.nomeServer;
    const email = req.body.emailServer;
    const telefone = req.body.telefoneServer;
    const cpf = req.body.cpfServer;
    
    perfilModel.atualizar(id, nome, email, telefone, cpf)
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
    atualizar
}