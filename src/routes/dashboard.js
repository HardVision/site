var express = require("express");
var router = express.Router();

var dashboardController = require("../controllers/dashboardController");

router.get("/gerar-relatorio/:idEmpresa", function (req, res) {
  dashboardController.gerarRelatorio(req, res);
});

module.exports = router;