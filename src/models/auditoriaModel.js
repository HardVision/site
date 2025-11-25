const database = require("../database/config");

function totalAuditorias() {
    const sql = `SELECT COUNT(*) AS total FROM auditoria;`;
    return database.executar(sql);
}

function totalPorTipo() {
    const sql = `
        SELECT 
            tipoAcao AS tipo,
            COUNT(*) AS total
        FROM auditoria
        GROUP BY tipoAcao
        ORDER BY total DESC;
    `;
    return database.executar(sql);
}

function acoesPorDia(limitDays = 30) {
    const sql = `
        SELECT 
            DATE(dtHora) AS data,
            COUNT(*) AS total
        FROM auditoria
        WHERE dtHora >= DATE_SUB(CURRENT_DATE(), INTERVAL ${parseInt(limitDays)} DAY)
        GROUP BY DATE(dtHora)
        ORDER BY data;
    `;

    return database.executar(sql);
}

function acoesPorHoraHoje() {
    const sql = `
        SELECT 
            HOUR(dtHora) AS hora,
            COUNT(*) AS total
        FROM auditoria
        WHERE DATE(dtHora) = CURRENT_DATE()
        GROUP BY HOUR(dtHora)
        ORDER BY hora;
    `;

    return database.executar(sql);
}

function ultimasAcoes(limit = 10) {
    const sql = `
        SELECT 
            tipoAcao,
            descricao,
            dtHora
        FROM auditoria
        ORDER BY dtHora DESC
        LIMIT ${parseInt(limit)};
    `;

    return database.executar(sql);
}

function contagensPorEmpresa(fkEmpresa) {
    let sql = `
        SELECT 
            fkEmpresa,
            tipoAcao AS tipo,
            COUNT(*) AS total
        FROM auditoria
    `;

    if (fkEmpresa) {
        sql += ` WHERE fkEmpresa = ${parseInt(fkEmpresa)} `;
    }

    sql += ` GROUP BY fkEmpresa, tipoAcao;`;

    return database.executar(sql);
}

function totalUsuarios() {
    const sql = `SELECT COUNT(*) AS total FROM usuario;`;
    return database.executar(sql);
}

function tentativasLoginUltimas24h() {
    const sql = `
        SELECT COUNT(*) AS total
        FROM auditoria
        WHERE tipoAcao IN ('login_sucesso', 'tentativa_login', 'login')
        AND dtHora >= DATE_SUB(NOW(), INTERVAL 24 HOUR);
    `;
    return database.executar(sql);
}

function falhasLoginUltimas24h() {
    const sql = `
        SELECT COUNT(*) AS total
        FROM auditoria
        WHERE tipoAcao IN ('login_falha', 'falha_login', 'erro_login')
        AND dtHora >= DATE_SUB(NOW(), INTERVAL 24 HOUR);
    `;
    return database.executar(sql);
}

function registrarLogin(fkFuncionario, fkEmpresa, email, sucesso = true) {
    const tipoAcao = sucesso ? 'login_sucesso' : 'login_falha';
    const descricao = sucesso 
        ? `Login realizado com sucesso para o usuário ${email}`
        : `Tentativa de login falhou para o email ${email}`;
    
    const descricaoEscapada = descricao.replace(/'/g, "''");
    const fkFunc = fkFuncionario ? parseInt(fkFuncionario) : 'NULL';
    const fkEmp = fkEmpresa ? parseInt(fkEmpresa) : 'NULL';
    
    const sql = `
        INSERT INTO auditoria (fkFuncionario, fkEmpresa, tipoAcao, descricao)
        VALUES (${fkFunc}, ${fkEmp}, '${tipoAcao}', '${descricaoEscapada}');
    `;
    
    return database.executar(sql);
}

module.exports = {
    totalAuditorias,
    totalPorTipo,
    acoesPorDia,
    acoesPorHoraHoje,
    ultimasAcoes,
    contagensPorEmpresa,
    totalUsuarios,
    tentativasLoginUltimas24h,
    falhasLoginUltimas24h,
    registrarLogin
};
