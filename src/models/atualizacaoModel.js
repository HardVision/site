/*var database = require("../database/config");

function verificarEmail(email) {
    console.log("Verificando e-mail no banco:", email);
    var instrucaoSql = `
        SELECT email 
        FROM usuario
        WHERE email = '${email}';
    `;
    return database.executar(instrucaoSql);
}

function atualizarSenha(novaSenha, email) {
    console.log(`Atualizando senha para o e-mail: ${email}`);
    const instrucaoSql = `
        UPDATE usuario
        SET senha = '${novaSenha}'
        WHERE email = '${email}';
    `;
    return database.executar(instrucaoSql);
}

module.exports = {
    verificarEmail,
    atualizarSenha
};
*/