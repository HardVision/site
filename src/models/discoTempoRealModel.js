var database = require("../database/config");

function buscarMaquinas(fkEmpresa) {
    var instrucaoSql = `SELECT LOWER(macAddress) as macAddress FROM maquina
                            JOIN empresa ON fkEmpresa = idEmpresa
                            WHERE fkEmpresa = ${fkEmpresa};`;

    return database.executar(instrucaoSql);
}

module.exports = {
    buscarMaquinas
}