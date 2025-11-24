var database = require("../database/config");

function buscarInfo(fkEmpresa) {
    console.log("ACESSEI O USUARIO MODEL \n\n function entrar():", fkEmpresa);
    var instrucaoSql = `
        SELECT
        i.idIncidente AS Id,
        u.nome AS Nome,
        i.titulo AS Titulo,
        i.descricao AS Descricao,
        i.dtIncidente AS DtIncidente
        FROM incidente AS i
        JOIN usuario AS u
        ON u.idFuncionario = i.fkFuncionario
        WHERE i.fkEmpresa = ${fkEmpresa};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarInfo
};