var empresaModel = require("../models/empresaModel");

function buscarPorCnpj(req, res) {
  var cnpj = req.query.cnpj;

  empresaModel.buscarPorCnpj(cnpj).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function listar(req, res) {
  empresaModel.listar().then((resultado) => {
    res.status(200).json(resultado);
  });
}

function buscarPorId(req, res) {
  var id = req.params.id;

  empresaModel.buscarPorId(id).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function cadastrar(req, res) {
  const cep = req.body.cepServer;
  const uf = req.body.ufServer;
  const cidade = req.body.cidadeServer;
  const logradouro = req.body.logradouroServer;
  const rua = req.body.ruaServer;
  const numero = req.body.numeroServer;
  const complemento = req.body.complementoServer;
  const token = req.body.tokenServer;
  const cnpj = req.body.cnpjServer;
  const razaoSocial = req.body.razaoSocialServer;
  const nomeFantasia = req.body.nomeFantasiaServer;

  // Validação básica no backend (extra de segurança)
  if (
    !cep || !uf || !cidade || !logradouro || !numero || !complemento || !token || !cnpj ||
    !razaoSocial || !nomeFantasia || !rua
  ) {
    return res.status(400).json({ mensagem: "Preencha todos os campos obrigatórios." });
  }

  empresaModel.buscarPorCnpj(cnpj)
    .then((resultado) => {
      if (resultado.length > 0) {
        res.status(401).json({ mensagem: `A empresa com o CNPJ ${cnpj} já existe.` });
      } else {
        empresaModel.cadastrar(
          razaoSocial,
          nomeFantasia,
          cnpj,
          token,
          cep,
          uf,
          cidade,
          logradouro,
          rua,
          numero,
          complemento
        )
          .then((resultado) => {
            res.status(201).json(resultado);
          })
          .catch((erro) => {
            console.error("Erro ao cadastrar empresa:", erro);
            res.status(500).json({ mensagem: "Erro no servidor ao cadastrar empresa." });
          });
      }
    })
    .catch((erro) => {
      console.error("Erro ao buscar empresa:", erro);
      res.status(500).json({ mensagem: "Erro no servidor ao verificar CNPJ." });
    });
}


module.exports = {
  buscarPorCnpj,
  buscarPorId,
  cadastrar,
  listar,
};
