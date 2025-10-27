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

function deletar(req, res) {
  var idEmpresa = req.params.idEmpresa;
  console.log(idEmpresa)

  empresaModel.deletar(idEmpresa)
    .then(
      function (resultado) {
        res.json(resultado);
      }
    )
    .catch(
      function (erro) {
        console.log(erro);
        console.log("Houve um erro ao deletar a empresa: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
      }
    );
}

function editar(req, res) {
  var valor = req.body.valorServer;
  var campo = req.body.campoServer;
  var tabela = req.body.tabelaServer;
  var idEmpresa = req.params.idEmpresa;

  empresaModel.editar(valor, idEmpresa, campo, tabela)
    .then(
      function (resultado) {
        res.json(resultado);
      }
    )
    .catch(
      function (erro) {
        console.log(erro);
        console.log("Houve um erro ao realizar o post: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
      }
    );

}

function pesquisarNome(req, res) {
    var nome = req.params.nome;

    empresaModel.pesquisarNome(nome)
        .then(
            function (resultado) {
                if (resultado.length > 0) {
                    res.status(200).json(resultado);
                } else {
                    res.status(204).send("Nenhum resultado encontrado!");
                }
            }
        ).catch(
            function (erro) {
                console.log(erro);
                console.log("Houve um erro ao buscar os avisos: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            }
        );
}


module.exports = {
  buscarPorCnpj,
  buscarPorId,
  cadastrar,
  listar,
  deletar,
  editar,
  pesquisarNome
};
