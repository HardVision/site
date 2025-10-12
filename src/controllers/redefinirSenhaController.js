/*verificar se o e-mail existe no banco e retornar uma resposta simulando que o link foi enviado. */
var usuarioModel = require("../models/usuarioModel");

function redefinirSenha(req, res) {
    var email = req.body.emailServer;

    if (email == undefined || email.trim() === "") {
        res.status(400).send("O email está indefinido ou vazio.");
        return;
    }

    usuarioModel.verificarEmail(email)
        .then((resultado) => {
            if (resultado.length > 0) {
                // Aqui, no real, enviaria email de reset
                res.status(200).send("Se o e-mail estiver cadastrado, você receberá um link de redefinição.");
            } else {
                // Para segurança, retorne a mesma mensagem para não expor usuários cadastrados
                res.status(200).send("Se o e-mail estiver cadastrado, você receberá um link de redefinição.");
            }
        })
        .catch((erro) => {
            console.log(erro);
            res.status(500).send("Erro interno no servidor.");
        });
}

module.exports = {
   
    redefinirSenha
};
