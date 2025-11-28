var discoTempoRealModel = require("../models/dashboardDiscoModel");
let dadosPorMaquina = {};

async function receberDisco(req, res) {
    try {
        const dados = req.body;
        if (!dados.macAddress) {
            return res.status(400).json({
                msg: "macAddress é obrigatório"
            });
        }
        const macAddressLower = dados.macAddress.toLowerCase();
        dadosPorMaquina[macAddressLower] = {
            ...dados,
            macAddress: macAddressLower
        };
        console.log("Dados recebidos do python");
        console.log(dados);
        return res.status(200).json({
            msg: "Dados Recebidos com sucesso"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            msg: "Erro ao receber dados"
        });
    }
}

async function obterDisco(req, res) {
    const mac = req.params.mac.toLowerCase();
    console.log('Buscando dados para MAC:', mac);
    console.log('MACs disponíveis:', Object.keys(dadosPorMaquina));
    if (!dadosPorMaquina[mac]) {
        return res.status(404).json({
            msg: "Nenhum dado recebido ainda"
        });
    }
    return res.status(200).json(dadosPorMaquina[mac]);
}

function buscarMaquinas(req, res) {
    const fkEmpresa = req.params.fkEmpresa;
    discoTempoRealModel.buscarMaquinas(fkEmpresa)
        .then(
            function (maquinas) {
                console.log(`Resultado: ${JSON.stringify(maquinas)}`);
                res.status(200).json(maquinas);
            }
        ).catch(
            function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            }
        )
}

module.exports = {
    receberDisco,  
    obterDisco,
    buscarMaquinas
};