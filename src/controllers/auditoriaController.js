const model = require("../models/auditoriaModel");

async function buscarKPIs(req, res) {
    try {
        const totalUsuariosResult = await model.totalUsuarios();
        const totalUsuarios = totalUsuariosResult && totalUsuariosResult[0] ? totalUsuariosResult[0].total : 0;

        const tentativasResult = await model.tentativasLoginUltimas24h();
        const tentativasLogin = tentativasResult && tentativasResult[0] ? tentativasResult[0].total : 0;

        const falhasResult = await model.falhasLoginUltimas24h();
        const falhasLogin = falhasResult && falhasResult[0] ? falhasResult[0].total : 0;

        const tipos = await model.totalPorTipo();
        const mapTipos = {};
        if (Array.isArray(tipos)) {
            tipos.forEach(t => { 
                const chave = t.tipo || t.tipoAcao;
                mapTipos[chave] = t.total || 0; 
            });
        }

        res.json({
            totalUsuarios,
            tentativasLogin,
            falhasLogin,
            totalAuditorias: tentativasLogin + falhasLogin,
            porTipo: mapTipos
        });
    } catch (err) {
        res.status(500).json({ 
            error: "Erro ao buscar KPIs", 
            detalhes: err.message
        });
    }
}

async function buscarPorTipo(req, res) {
    try {
        const dados = await model.totalPorTipo();
        res.json(dados);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar por tipo" });
    }
}

async function buscarPorDia(req, res) {
    try {
        const days = req.query.days ? parseInt(req.query.days) : 30;
        const dados = await model.acoesPorDia(days);
        res.json(dados);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar por dia" });
    }
}

async function buscarPorHoraHoje(req, res) {
    try {
        const dados = await model.acoesPorHoraHoje();
        res.json(dados);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar por hora (hoje)" });
    }
}

async function buscarUltimas(req, res) {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const dados = await model.ultimasAcoes(limit);
        res.json(dados);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar últimas ações" });
    }
}

async function debugLogins(req, res) {
    try {
        const [tentativasResult] = await model.tentativasLoginUltimas24h();
        const [falhasResult] = await model.falhasLoginUltimas24h();
        const ultimasAcoes = await model.ultimasAcoes(20);
        
        const acoesLogin = ultimasAcoes.filter(a => 
            a.tipoAcao && (
                a.tipoAcao.includes('login') || 
                a.tipoAcao.includes('Login')
            )
        );

        res.json({
            tentativas24h: tentativasResult ? tentativasResult.total : 0,
            falhas24h: falhasResult ? falhasResult.total : 0,
            ultimasAcoesLogin: acoesLogin,
            todasUltimasAcoes: ultimasAcoes,
            mensagem: "Use este endpoint para debugar os dados de login"
        });
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar debug de logins", detalhes: err.message });
    }
}

module.exports = {
    buscarKPIs,
    buscarPorTipo,
    buscarPorDia,
    buscarPorHoraHoje,
    buscarUltimas,
    debugLogins
};
