var database = require("../database/config");

function buscarInfo(id) {
    console.log("ACESSEI O USUARIO MODEL \n\n function entrar():", id);
    var instrucaoSql = `
        SELECT
        u.nome AS 'nome',
        u.email AS 'email',
        u.telefone AS 'telefone',
        u.cpf AS 'cpf',
        e.razaoSocial AS 'razaoSocial',
        t.permissao AS 'permissao'
        FROM usuario AS u
        JOIN empresa AS e
        ON u.fkEmpresa = e.idEmpresa
        JOIN tipo AS t
        ON u.fkTipo = t.idTipo
        WHERE u.idFuncionario = ${id};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function atualizar(id, nome, email, telefone, cpf) {
    console.log("ACESSEI O USUARIO MODEL \n\n function entrar():", id);
    var instrucaoSql = `
        UPDATE usuario SET
        nome = '${nome}',
        email = '${email}',
        telefone = '${telefone}',
        cpf = '${cpf}'
        WHERE idFuncionario = ${id};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarInfo,
    atualizar
};
