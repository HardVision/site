let dadosPorMaquina = {};

async function receberDisco(req, res) {
    try {
        const dados = req.body;

        if (!dados.macAddress) {
            return res.status(400).json({
                msg: "macAddress é obrigatório"
            });
        }

        dadosPorMaquina[dados.macAddress] = {
            ...dados
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
    const mac = req.params.mac;

    if (!dadosPorMaquina[mac]) {
        return res.status(404).json({
            msg: "Nenhum dado recebido ainda"
        });
    }

    return res.status(200).json(dadosPorMaquina[mac]);
}

module.exports = {
    receberDisco,  
    obterDisco
};