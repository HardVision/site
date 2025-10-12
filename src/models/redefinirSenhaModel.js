/*retorna se o e-mail está registrado.*/
var database = require("../database/config");

function verificarEmail(email) {
    console.log("Verificando e-mail no banco:", email);
    var instrucaoSql = `
        SELECT email 
        FROM usuario
        WHERE email = '${email}';
    `;
    return database.executar(instrucaoSql);
}

// Suas outras funções aqui (autenticar, cadastrar, verifyCargo)...

module.exports = {
    verificarEmail
};

/*var database = require("../database/config");

// Função para verificar se o email está cadastrado
function verificarEmail(email) {
    console.log("Model: verificarEmail:", email);

    var instrucaoSql = `
        SELECT email FROM usuario WHERE email = '${email}';
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Aqui você pode criar outras funções relacionadas à redefinição, tipo salvar token, validar token, etc.

module.exports = {
    verificarEmail,
};
*/