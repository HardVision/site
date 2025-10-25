var database = require("../database/config");

function buscarPorId(id) {
  var instrucaoSql = `SELECT * FROM empresa WHERE id = '${id}'`;

  return database.executar(instrucaoSql);
}

function listar() {
  var instrucaoSql = `SELECT idEmpresa, razaoSocial, nomeFantasia, cnpj, cep, rua, numero, token FROM empresa join endereco on idEndereco = fkEndereco`;

  return database.executar(instrucaoSql);
}

function buscarPorCnpj(cnpj) {
  var instrucaoSql = `SELECT * FROM empresa WHERE cnpj = '${cnpj}'`;

  return database.executar(instrucaoSql);
}

async function cadastrar(
  razaoSocial,
  nomeFantasia,
  cnpj,
  token,
  cep,
  uf,
  cidade,
  logradouro,
  numero,
  rua,
  complemento
) {
  const instrucaoSql = `
    INSERT INTO endereco
      (cep, uf, cidade, logradouro, rua, numero, complemento)
    VALUES 
      ('${cep}', '${uf}', '${cidade}', '${logradouro}' ,'${rua}','${numero}', '${complemento}');
  `;

  const resultado1 = await database.executar(instrucaoSql)
  const lastId = resultado1.insertId


  const instrucaoSql2 = ` INSERT INTO empresa
      (fkEndereco, razaoSocial, nomeFantasia, cnpj, token)
    VALUES 
      (${lastId},'${razaoSocial}', '${nomeFantasia}', '${cnpj}', '${token}');`

  console.log("Executando SQL:\n", instrucaoSql);
  return database.executar(instrucaoSql2);
}

module.exports = { buscarPorCnpj, buscarPorId, cadastrar, listar };
