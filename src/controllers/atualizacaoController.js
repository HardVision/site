/*verificar se o e-mail existe no banco e retornar uma resposta simulando que o link foi enviado. */
/*var redefinirSenhaModel = require("../models/redefinirSenhaModel");

function redefinirSenha(req, res) {
    var email = req.body.emailServer;

    if (email == undefined || email.trim() === "") {
        res.status(400).send("O email está indefinido ou vazio.");
        return;
    }

    redefinirSenhaModel.verificarEmail(email)
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

// ETAPA 2 — Atualizar a senha no banco
function atualizarSenha(req, res) {
    const novaSenha = req.body.novaSenhaServer;
    const email = req.body.emailServer;

    if (!novaSenha || !email) {
        res.status(400).send("Nova senha ou e-mail não informados.");
        return;
    }

    redefinirSenhaModel.atualizarSenha(novaSenha, email)
        .then(() => {
            res.status(200).send("Senha atualizada com sucesso.");
        })
        .catch((erro) => {
            console.error("Erro ao atualizar senha:", erro);
            res.status(500).send("Erro ao atualizar senha.");
        });
}


module.exports = {
    redefinirSenha,
    atualizarSenha
};
*/