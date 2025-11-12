var database = require("../database/config");

async function enviarToken(token, data, email) {
    console.log("ACESSEI O AVISO  MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function listar()" + email);
    var instrucaoSql = `
            SELECT idFuncionario FROM usuario where email = "${email}" LIMIT 1;
        `;
    const idUsuario = await database.executar(instrucaoSql)
    console.log(idUsuario[0].idFuncionario);

    var instrucaoSql2 = `INSERT INTO redefinicaoSenha (fkUsuario, token, expiracao) values (${idUsuario[0].idFuncionario},
        "${token}", "${data}")
        `

    console.log("Executando a instrução SQL: \n" + instrucaoSql2);
    return database.executar(instrucaoSql2);
}

async function atualizarToken(token, data, email) {
    console.log("ACESSEI O AVISO  MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function listar()");
    var instrucaoSql = `
            SELECT 
                a.id AS idAviso,
                a.titulo,
                a.descricao,
                a.fk_usuario,
                u.id AS idUsuario,
                u.nome,
                u.email,
                u.senha
            FROM aviso a
                INNER JOIN usuario u
                    ON a.fk_usuario = u.id;
        `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


async function verificarToken(token) {
  console.log("🔍 Token recebido:", token);
  if (!token) return null;

  const sql = `
    SELECT idRedefSenha, utilizacao, expiracao
    FROM redefinicaoSenha
    WHERE token = "${token}"
    ORDER BY idRedefSenha DESC
    LIMIT 1;
  `;

  try {
    const rows = await database.executar(sql);

    if (!rows || rows.length === 0) {
      console.log("⚠️ Nenhum registro encontrado para o token:", token);
      return null;
    }

    const row = rows[0];
    console.log("✅ Registro encontrado:", row);

    return row;
  } catch (err) {
    console.error("❌ Erro ao executar a query:", err);
    throw err;
  }
}




module.exports = {
    enviarToken,
    atualizarToken,
    verificarToken
};
