/*verificar se o e-mail existe no banco e retornar uma resposta simulando que o link foi enviado. */
var redefinirSenhaModel = require("../models/redefinirSenhaModel");
function redefinirSenha(req, res) {
    const email = req.body.emailServer;

    // Validação do e-mail
    if (!email || email.trim() === "") {
        return res.status(400).send("O e-mail está indefinido ou vazio.");
    }

    // Verifica se o e-mail existe no banco (simulação)
    redefinirSenhaModel.verificarEmail(email)
        .then(() => {
            // Sempre retorna a mesma mensagem, independentemente do resultado
            res.status(200).send("Se o e-mail estiver cadastrado, você receberá um link de redefinição.");
        })
        .catch((erro) => {
            console.error("Erro ao verificar e-mail:", erro);
            res.status(500).send("Erro interno no servidor.");
        });
}


//  — Atualizar a senha no bancoooooooooooooo
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