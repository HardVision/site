var database = require("../database/config");

function gerarRelatorio(idMaquina) {
    console.log("ACESSEI O DASHBOARD MODEL \n\n function gerarRelatorio():", idMaquina);
    var instrucaoSql = `
SELECT
    'hardware' AS tipo,
    lm.dtHora AS dataHora,
    mc.nome AS metrica,
    mc.medida AS unidade,
    lm.valor AS valor,
    c.tipo AS tipoComponente,
    c.modelo AS modelo,
    NULL AS interfaceRede,
    NULL AS ipv4,
    NULL AS velocidadeMbps,
    NULL AS mbEnviados,
    NULL AS mbRecebidos,
    NULL AS pacotesEnviados,
    NULL AS pacotesRecebidos
FROM logMonitoramento lm
JOIN metricaComponente mc  ON lm.fkMetrica = mc.idMetrica
LEFT JOIN componente c     ON lm.fkComponente = c.idComponente
WHERE lm.fkMaquina = ${idMaquina}

UNION ALL

SELECT
    'rede' AS tipo,
    lr.dtHora AS dataHora,
    mr.nome AS metrica,
    mr.medida AS unidade,
    lr.velocidadeMbps AS valor,
    NULL AS tipoComponente,
    cr.nome AS modelo,
    cr.interfaceRede,
    lr.ipv4,
    lr.velocidadeMbps,
    lr.mbEnviados,
    lr.mbRecebidos,
    lr.pacotesEnviados,
    lr.pacotesRecebidos
FROM logMonitoramentoRede lr
JOIN metricaRede mr       ON lr.fkMetricaRede = mr.idMetricaRede
LEFT JOIN componenteRede cr ON lr.fkComponenteRede = cr.idComponenteRede
WHERE lr.fkMaquina = ${idMaquina}

ORDER BY dataHora DESC;

`;

    console.log("Executando relatório SQL");
    return database.executar(instrucaoSql);
}

function serieComponente(idMaquina, nomeMetrica, minutos) {
    console.log("ACESSEI O DASHBOARD MODEL \n\n function serieComponente():", idMaquina, nomeMetrica, minutos);

    var instrucaoSql = `
        SELECT 
            DATE_FORMAT(lm.dtHora, '%H:%i:%s') AS momento,
            lm.valor
        FROM logMonitoramento lm
        JOIN metricaComponente mc 
            ON lm.fkMetrica = mc.idMetrica
        WHERE 
            lm.fkMaquina = ${idMaquina}
            AND mc.nome = '${nomeMetrica}'
            AND lm.dtHora >= (NOW() - INTERVAL ${minutos} MINUTE)
        ORDER BY lm.dtHora;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function ultimoComponente(idMaquina, nomeMetrica) {
    console.log("ACESSEI O DASHBOARD MODEL \n\n function ultimoComponente():", idMaquina, nomeMetrica);

    var instrucaoSql = `
        SELECT 
            lm.valor,
            lm.dtHora
        FROM logMonitoramento lm
        JOIN metricaComponente mc ON lm.fkMetrica = mc.idMetrica
        WHERE 
            lm.fkMaquina = ${idMaquina}
            AND mc.nome = '${nomeMetrica}'
        ORDER BY lm.dtHora DESC
        LIMIT 1;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function kpisMaquina(idMaquina) {
    console.log("ACESSEI O DASHBOARD MODEL \n\n function kpisMaquina():", idMaquina);

    var instrucaoSql = `
        SELECT
            MAX(CASE WHEN mc.nome = 'Uso de CPU'     THEN lm.valor END) AS cpuAtual,
            MAX(CASE WHEN mc.nome = 'Uso de Memória' THEN lm.valor END) AS ramAtual,
            MAX(CASE WHEN mc.nome = 'Uso de Disco'   THEN lm.valor END) AS discoAtual,
            AVG(CASE WHEN mc.nome = 'Uso de CPU'     THEN lm.valor END) AS cpuMedia,
            AVG(CASE WHEN mc.nome = 'Uso de Memória' THEN lm.valor END) AS ramMedia,
            AVG(CASE WHEN mc.nome = 'Uso de Disco'   THEN lm.valor END) AS discoMedia
        FROM logMonitoramento lm
        JOIN metricaComponente mc ON lm.fkMetrica = mc.idMetrica
        WHERE 
            lm.fkMaquina = ${idMaquina}
            AND lm.dtHora >= (NOW() - INTERVAL 10 MINUTE);
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function ultimoDisco(idMaquina) {
    console.log("ACESSEI O DASHBOARD MODEL \n\n function ultimoDisco():", idMaquina);

    var instrucaoSql = `
        SELECT lm.valor, lm.dtHora
        FROM logMonitoramento lm
        JOIN metricaComponente mc ON lm.fkMetrica = mc.idMetrica
        WHERE lm.fkMaquina = ${idMaquina}
          AND mc.nome = 'Uso de Disco'
        ORDER BY lm.dtHora DESC
        LIMIT 1;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarTempoReal(idMaquina) {
    console.log("ACESSEI O DASHBOARD MODEL \n\n function buscarTempoReal():", idMaquina);

    var instrucaoSql = `
        SELECT 
            velocidadeMbps,
            mbEnviados,
            mbRecebidos,
            pacotesEnviados,
            pacotesRecebidos,
            dtHora
        FROM logMonitoramentoRede
        WHERE fkMaquina = ${idMaquina}
        ORDER BY dtHora DESC
        LIMIT 2;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function historicoRede(idMaquina) {
    console.log("ACESSEI O DASHBOARD MODEL \n\n function historicoRede():", idMaquina);

    var instrucaoSql = `
        SELECT
            DATE_FORMAT(lmr.dtHora, '%H:%i:%s') AS momento,
            COALESCE(lmr.velocidadeMbps, (lmr.mbEnviados + lmr.mbRecebidos)) AS velocidadeMbps,
            lmr.mbEnviados,
            lmr.mbRecebidos,
            lmr.pacotesEnviados,
            lmr.pacotesRecebidos
        FROM logMonitoramentoRede lmr
        WHERE lmr.fkMaquina = ${idMaquina}
        ORDER BY lmr.dtHora DESC
        LIMIT 60;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function historicoDisco(idMaquina) {
    console.log("ACESSEI O DASHBOARD MODEL \n\n function historicoDisco():", idMaquina);

    var instrucaoSql = `
        SELECT lm.valor
        FROM logMonitoramento lm
        JOIN metricaComponente mc ON lm.fkMetrica = mc.idMetrica
        WHERE lm.fkMaquina = ${idMaquina}
          AND mc.nome = 'Uso de Disco'
        ORDER BY lm.dtHora DESC
        LIMIT 12;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


/*
 CPU POR NÚCLEO 
*/

async function cpuPorNucleo(idMaquina) {
    console.log("dashboardModel.cpuPorNucleo():", idMaquina);

    const sql = `
        SELECT 
            c.tipo AS nucleo,
            lm.valor
        FROM logMonitoramento lm
        JOIN componente c ON lm.fkComponente = c.idComponente
        WHERE lm.fkMaquina = ${idMaquina}
          AND c.tipo LIKE 'CPU Núcleo%'
        ORDER BY lm.dtHora DESC;
    `;

    console.log("Executando a instrução SQL: \n" + sql);
    
    const resultados = await database.executar(sql);

    const nucleos = [];
    for (let i = 1; i <= 8; i++) {
        const nucleo = resultados.find(r => r.nucleo === `CPU Núcleo ${i}`);
        nucleos.push({ nucleo: `CPU Núcleo ${i}`, valor: nucleo ? nucleo.valor : 0 });
    }

    return nucleos;
}



function alertasLinha(idEmpresa, idMaquina = null) {
    console.log("Cheguei no model alertasLinha()", idEmpresa, idMaquina);

    let filtroMaquinaComp = "";
    let filtroMaquinaRede = "";

    if (idMaquina !== null) {
        filtroMaquinaComp = ` AND lm.fkMaquina = ${idMaquina} `;
        filtroMaquinaRede = ` AND lmr.fkMaquina = ${idMaquina} `;
    }

    const instrucaoSql = `
        SELECT 
            dia_mes,
            estado,
            SUM(qtd_alertas) AS total_alertas
        FROM (
            SELECT
                DATE_FORMAT(ac.dtHora, '%m/%d') AS dia_mes,
                ac.estado AS estado,
                COUNT(*) AS qtd_alertas
            FROM alertaComponente ac
            JOIN logMonitoramento lm 
                ON lm.fkAlerta = ac.idAlerta
            JOIN metricaComponente mc 
                ON ac.fkMetrica = mc.idMetrica
            WHERE mc.fkEmpresa = ${idEmpresa}
            ${filtroMaquinaComp}
            GROUP BY dia_mes, estado

            UNION ALL

            SELECT
                DATE_FORMAT(ar.dtHora, '%m/%d') AS dia_mes,
                ar.estado AS estado,
                COUNT(*) AS qtd_alertas
            FROM alertaRede ar
            JOIN logMonitoramentoRede lmr 
                ON lmr.fkAlertaRede = ar.idAlertaRede
            JOIN metricaRede mr 
                ON ar.fkMetricaRede = mr.idMetricaRede
            WHERE mr.fkEmpresa = ${idEmpresa}
            ${filtroMaquinaRede}
            GROUP BY dia_mes, estado
        ) AS unidos
        GROUP BY dia_mes, estado
        ORDER BY dia_mes ASC, FIELD(estado, 'Crítico', 'Preocupante');
    `;

    return database.executar(instrucaoSql);
}

function alertasBarra(idEmpresa, idMaquina = null) {
    console.log("Cheguei no model alertasBarra()", idEmpresa, idMaquina);

    let filtroMaquinaComp = "";
    let filtroMaquinaRede = "";

    if (idMaquina !== null) {
        filtroMaquinaComp = ` AND lm.fkMaquina = ${idMaquina} `;
        filtroMaquinaRede = ` AND lmr.fkMaquina = ${idMaquina} `;
    }

    const instrucaoSql = `
        SELECT 
            tipoComponente,
            SUM(totalAlertas) AS totalAlertas
        FROM (
            SELECT 
                c.tipo AS tipoComponente,
                COUNT(ac.idAlerta) AS totalAlertas
            FROM alertaComponente ac
            JOIN logMonitoramento lm
                ON lm.fkAlerta = ac.idAlerta
            JOIN metricaComponente mc 
                ON ac.fkMetrica = mc.idMetrica
            JOIN componente c 
                ON c.fkMetrica = mc.idMetrica
            WHERE mc.fkEmpresa = ${idEmpresa}
            ${filtroMaquinaComp}
            GROUP BY c.tipo

            UNION ALL

            SELECT 
                'Rede' AS tipoComponente,
                COUNT(ar.idAlertaRede) AS totalAlertas
            FROM alertaRede ar
            JOIN logMonitoramentoRede lmr
                ON lmr.fkAlertaRede = ar.idAlertaRede
            JOIN metricaRede mr 
                ON ar.fkMetricaRede = mr.idMetricaRede
            WHERE mr.fkEmpresa = ${idEmpresa}
            ${filtroMaquinaRede}
        ) AS tudo
        GROUP BY tipoComponente
        ORDER BY totalAlertas DESC;
    `;

    return database.executar(instrucaoSql);
}

function alertasCard(idEmpresa, idMaquina = null) {
    console.log("Cheguei no model alertasCard()", idEmpresa, idMaquina);

    let filtroMaquinaComp = "";
    let filtroMaquinaRede = "";

    if (idMaquina !== null) {
        filtroMaquinaComp = ` AND lm.fkMaquina = ${idMaquina} `;
        filtroMaquinaRede = ` AND lmr.fkMaquina = ${idMaquina} `;
    }

    const instrucaoSql = `
        SELECT 
            tipoComponente,
            estado,
            descricao,
            dtHora,
            idMaquina,
            macAddress,
            valorReferencia
        FROM (
            SELECT 
                c.tipo AS tipoComponente,
                ac.estado,
                lm.descricao,
                DATE_FORMAT(ac.dtHora, '%d/%m/%Y %H:%i:%s') AS dtHora,
                m.idMaquina,
                m.macAddress,
                CASE 
                    WHEN ac.estado = 'Preocupante' THEN mc.min
                    WHEN ac.estado = 'Crítico'      THEN mc.max
                    ELSE NULL
                END AS valorReferencia
            FROM alertaComponente ac
            JOIN logMonitoramento lm 
                ON lm.fkAlerta = ac.idAlerta
            JOIN componente c 
                ON c.idComponente = lm.fkComponente
            JOIN metricaComponente mc 
                ON mc.idMetrica = c.fkMetrica
            JOIN maquina m 
                ON m.idMaquina = lm.fkMaquina
            WHERE mc.fkEmpresa = ${idEmpresa}
            ${filtroMaquinaComp}

            UNION ALL

            SELECT
                'Rede' AS tipoComponente,
                ar.estado,
                lmr.descricao,
                DATE_FORMAT(ar.dtHora, '%d/%m/%Y %H:%i:%s') AS dtHora,
                m2.idMaquina,
                m2.macAddress,
                CASE 
                    WHEN ar.estado = 'Preocupante' THEN mr.min
                    WHEN ar.estado = 'Crítico'      THEN mr.max
                    ELSE NULL
                END AS valorReferencia
            FROM alertaRede ar
            JOIN logMonitoramentoRede lmr 
                ON lmr.fkAlertaRede = ar.idAlertaRede
            JOIN metricaRede mr 
                ON mr.idMetricaRede = ar.fkMetricaRede
            JOIN maquina m2 
                ON m2.idMaquina = lmr.fkMaquina
            WHERE mr.fkEmpresa = ${idEmpresa}
            ${filtroMaquinaRede}
        ) AS todos
        ORDER BY STR_TO_DATE(dtHora, '%d/%m/%Y %H:%i:%s') DESC;
    `;

    return database.executar(instrucaoSql);
}

function alertasKpi(idEmpresa, idMaquina = null) {
    console.log("Cheguei no model alertasKpi()", idEmpresa, idMaquina);

    let filtroMaquinaComp = "";
    let filtroMaquinaRede = "";

    if (idMaquina !== null) {
        filtroMaquinaComp = ` AND lm.fkMaquina = ${idMaquina} `;
        filtroMaquinaRede = ` AND lmr.fkMaquina = ${idMaquina} `;
    }

    const instrucaoSql = `
        SELECT 
            tipoComponente,
            estado,
            descricao,
            dtHora,
            idMaquina,
            macAddress,
            valorReferencia
        FROM (
            SELECT 
                c.tipo AS tipoComponente,
                ac.estado,
                lm.descricao,
                DATE_FORMAT(ac.dtHora, '%d/%m/%Y %H:%i:%s') AS dtHora,
                m.idMaquina,
                m.macAddress,
                CASE 
                    WHEN ac.estado = 'Preocupante' THEN mc.min
                    WHEN ac.estado = 'Crítico'      THEN mc.max
                    ELSE NULL
                END AS valorReferencia
            FROM alertaComponente ac
            JOIN logMonitoramento lm 
                ON lm.fkAlerta = ac.idAlerta
            JOIN componente c 
                ON c.idComponente = lm.fkComponente
            JOIN metricaComponente mc 
                ON mc.idMetrica = c.fkMetrica
            JOIN maquina m 
                ON m.idMaquina = lm.fkMaquina
            WHERE mc.fkEmpresa = ${idEmpresa}
            AND ac.dtHora >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ${filtroMaquinaComp}

            UNION ALL

            SELECT
                'Rede' AS tipoComponente,
                ar.estado,
                lmr.descricao,
                DATE_FORMAT(ar.dtHora, '%d/%m/%Y %H:%i:%s') AS dtHora,
                m2.idMaquina,
                m2.macAddress,
                CASE 
                    WHEN ar.estado = 'Preocupante' THEN mr.min
                    WHEN ar.estado = 'Crítico'      THEN mr.max
                    ELSE NULL
                END AS valorReferencia
            FROM alertaRede ar
            JOIN logMonitoramentoRede lmr 
                ON lmr.fkAlertaRede = ar.idAlertaRede
            JOIN metricaRede mr 
                ON mr.idMetricaRede = ar.fkMetricaRede
            JOIN maquina m2 
                ON m2.idMaquina = lmr.fkMaquina
            WHERE mr.fkEmpresa = ${idEmpresa}
            AND ar.dtHora >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ${filtroMaquinaRede}
        ) AS todos
        ORDER BY STR_TO_DATE(dtHora, '%d/%m/%Y %H:%i:%s') DESC;
    `;

    return database.executar(instrucaoSql);
}


function selectMaquina(idEmpresa) {
    console.log("Cheguei no model selectMaquina()");

    const instrucaoSql = `SELECT idMaquina, macAddress FROM maquina where fkEmpresa = ${idEmpresa}`;

    return database.executar(instrucaoSql);
}

function buscarUptime(idMaquina) {
    console.log("ACESSEI O DASHBOARD MODEL \n\n function buscarUptime():", idMaquina);

    var instrucaoSql = `
        SELECT uptime
        FROM maquina
        WHERE idMaquina = ${idMaquina}
        LIMIT 1;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarCpu(idMaquina) {
    console.log("ACESSEI O DASHBOARD MODEL \n\n function buscarCpu():", idMaquina);

    var instrucaoSql = `
        SELECT 
            lm.valor AS usoCpu,
            lm.dtHora
        FROM logMonitoramento lm
        JOIN metricaComponente mc 
            ON lm.fkMetrica = mc.idMetrica
        WHERE 
            lm.fkMaquina = ${idMaquina}
            AND mc.nome = 'Uso de CPU'
        ORDER BY lm.dtHora DESC
        LIMIT 1;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarCpuTempos(idMaquina) {
    console.log("ACESSEI O DASHBOARD MODEL \n\n function buscarCpuTempos():", idMaquina);

    var instrucaoSql = `
        SELECT 
            DATE_FORMAT(lm.dtHora, '%H:%i:%s') AS momento,
            lm.valor AS usoCpu
        FROM logMonitoramento lm
        JOIN metricaComponente mc 
            ON lm.fkMetrica = mc.idMetrica
        WHERE 
            lm.fkMaquina = ${idMaquina}
            AND mc.nome = 'Uso de CPU'
        ORDER BY lm.dtHora DESC
        LIMIT 120;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarNucleos(idMaquina) {
    console.log("ACESSEI O DASHBOARD MODEL \n\n function buscarNucleos():", idMaquina);

    var instrucaoSql = `
        SELECT 
            c.idComponente,
            c.tipo AS nucleo,
            lm.valor AS uso,
            lm.dtHora
        FROM logMonitoramento lm
        JOIN componente c 
            ON lm.fkComponente = c.idComponente
        JOIN metricaComponente mc 
            ON lm.fkMetrica = mc.idMetrica
        WHERE 
            lm.fkMaquina = ${idMaquina}
            AND c.tipo LIKE 'CPU Núcleo%'
        ORDER BY lm.dtHora DESC
        LIMIT 200;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


async function mediaRam7dias(idMaquina) {
    console.log("dashboardModel.mediaRam7dias():", idMaquina);

    const sqlMedia = `
        SELECT AVG(lm.valor) AS mediaPercent
        FROM logMonitoramento lm
        JOIN metricaComponente mc ON lm.fkMetrica = mc.idMetrica
        WHERE lm.fkMaquina = ${idMaquina}
          AND mc.nome = 'Uso de Memória'
          AND lm.dtHora >= (NOW() - INTERVAL 7 DAY);
    `;

    const resultados = await database.executar(sqlMedia);
    const mediaPercent = resultados[0]?.mediaPercent || 0;

   
    const sqlCap = `
        SELECT capacidade
        FROM componente
        WHERE tipo LIKE 'RAM%'
        LIMIT 1;
    `;

    const capRes = await database.executar(sqlCap);
    const capacidadeTxt = capRes[0]?.capacidade || '0GB';
    const match = ('' + capacidadeTxt).match(/\d+(\.\d+)?/);
    const capacidadeGb = match ? parseFloat(match[0]) : 0;

    const mediaGB = (capacidadeGb * (mediaPercent / 100));

    return [{ mediaPercent: Number(mediaPercent), mediaGB: Number(mediaGB.toFixed(1)), capacidadeGb }];
}

async function topAppHoje(idMaquina) {
    console.log("dashboardModel.topAppHoje():", idMaquina);

    const sql = `
        SELECT nome, usoRam
        FROM processo
        WHERE fkMaquina = ${idMaquina}
        ORDER BY usoRam DESC
        LIMIT 1;
    `;

    const resultados = await database.executar(sql);
    if (resultados.length === 0) return [];

    const linha = resultados[0];
    const usoMb = Number(linha.usoRam) || 0;
    const usoGb = usoMb / 1024;

    return [{ nome: linha.nome, usoMb: usoMb, usoGb: Number(usoGb.toFixed(1)) }];
}

module.exports = {
    gerarRelatorio,
    serieComponente,
    ultimoComponente,
    kpisMaquina,
    ultimoDisco,
    buscarTempoReal,
    historicoRede,   
    historicoDisco,
    cpuPorNucleo,//
    alertasLinha,
    alertasBarra,
    alertasCard,
    alertasKpi,
    selectMaquina,
    buscarUptime,
    buscarCpu,
    buscarCpuTempos,
    buscarNucleos,
    mediaRam7dias,
    topAppHoje
};
 