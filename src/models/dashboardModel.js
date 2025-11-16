var database = require("../database/config");

function gerarRelatorio() {

  var instrucaoSql = `SELECT * FROM aquario a WHERE fk_empresa = ${empresaId}`;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}




module.exports = {
  gerarRelatorio
}
