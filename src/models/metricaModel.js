var database = require("../database/config");
var mysql = require("mysql2");

function listarMetricas(idEmpresa) {
    var instrucaoSql = `SELECT 
        idMetrica,
        nome,
        medida,
        min,
        max
    FROM metricaComponente
    WHERE fkEmpresa = ${idEmpresa}
    ORDER BY idMetrica DESC`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function criarMetrica(idEmpresa, nome, medida, min, max, unidade) {
    // Escapa as strings para evitar SQL injection
    var nomeEscapado = mysql.escape(nome);
    var medidaEscapada = mysql.escape(medida);
    
    var instrucaoSql = `INSERT INTO metricaComponente (fkEmpresa, nome, medida, min, max)
    VALUES (${idEmpresa}, ${nomeEscapado}, ${medidaEscapada}, ${min}, ${max})`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function atualizarMetrica(idMetrica, nome, medida, min, max, unidade) {
    // Escapa as strings e números para evitar SQL injection
    var nomeEscapado = mysql.escape(nome);
    var medidaEscapada = mysql.escape(medida);
    var idMetricaEscapado = mysql.escape(idMetrica);
    
    var instrucaoSql = `UPDATE metricaComponente
    SET nome = ${nomeEscapado}, medida = ${medidaEscapada}, min = ${min}, max = ${max}
    WHERE idMetrica = ${idMetricaEscapado}`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function deletarMetrica(idMetrica) {
    var idMetricaEscapado = mysql.escape(idMetrica);
    var instrucaoSql = `DELETE FROM metricaComponente
    WHERE idMetrica = ${idMetricaEscapado}`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function obterMetricaPorId(idMetrica) {
    var idMetricaEscapado = mysql.escape(idMetrica);
    var instrucaoSql = `SELECT 
        idMetrica,
        nome,
        medida,
        min,
        max
    FROM metricaComponente
    WHERE idMetrica = ${idMetricaEscapado}`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    listarMetricas,
    criarMetrica,
    atualizarMetrica,
    deletarMetrica,
    obterMetricaPorId
}
