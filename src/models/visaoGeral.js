var database = require("../database/config");

function buscarInfo(fkEmpresa, corpoQuery) {
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
        WHERE i.fkEmpresa = ${fkEmpresa} AND ${corpoQuery}
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrar(idFuncionario, fkEmpresa, titulo, descricao) {
    var instrucaoSql = `
        INSERT INTO incidente (fkFuncionario, fkEmpresa, titulo, descricao, dtIncidente) VALUES
        (${idFuncionario}, ${fkEmpresa}, '${titulo}', '${descricao}', NOW());
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarUptime(fkEmpresa) {
    var instrucaoSql = `
        SELECT
        COUNT(*) AS Qtd
        FROM incidente AS i
        WHERE i.fkEmpresa = ${fkEmpresa};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function deletar(id) {
    var instrucaoSql = `
        DELETE FROM incidente WHERE idIncidente = ${id};
    `;

    console.log(instrucaoSql)
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function atualizar(id, titulo, descricao) {
    console.log("PASSOU")
    var instrucaoSql = `
        UPDATE incidente SET titulo = '${titulo}', descricao = '${descricao}', dtIncidente = NOW() WHERE idIncidente = ${id};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarInfo,
    cadastrar,
    buscarUptime,
    deletar,
    atualizar
};