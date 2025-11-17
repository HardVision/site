var database = require("../database/config");

function autenticar(email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n\n function entrar():", email, senha);
    var instrucaoSql = `
        SELECT email, idFuncionario, permissao, idEmpresa
        FROM usuario join tipo on fkTipo = idTipo join empresa on idEmpresa = fkEmpresa
        WHERE email = '${email}' AND senha = '${senha}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

async function cadastrar(nome, email, cpf, tel, senha, fkEmpresa) {
    console.log("ACESSEI O USUARIO MODEL \n\n function cadastrar():", nome, email, cpf, tel, senha, fkEmpresa);

    const resultado = await verifyCargo(fkEmpresa);
    const contagem = resultado[0].contagem;

    console.log("Na função cadastrar, contagem =", contagem);

    const permissao = contagem === 0 ? 1 : 2;

    var instrucaoSql = `
        INSERT INTO usuario (fkEmpresa, fkTipo, nome, email, senha, cpf, telefone) 
        VALUES (${fkEmpresa}, ${permissao}, '${nome}', '${email}', '${senha}', '${cpf}', '${tel}');
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);

    const execInstrucao = await database.executar(instrucaoSql);

    return execInstrucao;
}

async function verifyCargo(fkEmpresa) {
    console.log("Verificação de cargo");

    var instrucaoSql = `
        SELECT COUNT(fkEmpresa) AS contagem 
        FROM usuario 
        WHERE fkEmpresa = ${fkEmpresa};
    `;

    const sqlReturn = await database.executar(instrucaoSql);
    console.log("Resultado da verificação:", sqlReturn);
    return sqlReturn;
}


module.exports = {
    autenticar,
    cadastrar,
    verifyCargo
};
