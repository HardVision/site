var express = require("express");
var router = express.Router();

var dashboardController = require("../controllers/dashboardController");

router.get("/gerar-relatorio", function (req, res) {
  dashboardController.gerarRelatotorio(req, res);
});

module.exports = router;