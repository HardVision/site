var dashboardModel = require("../models/dashboardModel");

function gerarRelatorio(req, res) {
    const idEmpresa = req.params.idEmpresa;
    console.log("Cheguei no controller", idEmpresa)

  dashboardModel.gerarRelatorio(idEmpresa).then((resultado) => {
    if (resultado.length > 0) {
      res.status(200).json(resultado);
    } else {
      res.status(204).json([]);
    }
  }).catch(function (erro) {
    console.log(erro);
    console.log("Houve um erro ao buscar os aquarios: ", erro.sqlMessage);
    res.status(500).json(erro.sqlMessage);
  });
}


module.exports = {
  gerarRelatorio
}