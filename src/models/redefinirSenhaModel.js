var database = require("../database/config");

function verificarEmail(email) {
    console.log("Verificando e-mail no banco:", email);
    var instrucaoSql = `SELECT email FROM usuario WHERE email = ?;`;

    return database.executar(instrucaoSql, [email])
        .then(resultado => {
            console.log("Retorno do DB:", resultado);
            return Array.isArray(resultado) ? resultado : [];
        });
}

function atualizarSenha(novaSenha, email) {
    console.log(`Atualizando senha para o e-mail: ${email}`);
    const instrucaoSql = `
        UPDATE usuario
        SET senha = ?
        WHERE email = ?;
    `;
    return database.executar(instrucaoSql, [novaSenha, email]);
}


module.exports = {
    verificarEmail,
    atualizarSenha
};
