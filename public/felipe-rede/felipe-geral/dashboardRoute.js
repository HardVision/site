var express = require("express");
var router = express.Router();

var controller = require("../controllers/dashboardController");

// tempo real usado pela dashboard geral
router.get("/tempo-real/:idMaquina", function (req, res) {
    controller.tempoReal(req, res);
});

// KPIs 
router.get("/kpis/:idMaquina", function (req, res) {
    controller.kpis(req, res);
});

// série temporal de componente
router.get("/serie/:idMaquina/:nomeMetrica", function (req, res) {
    controller.serie(req, res);
});

module.exports = router;
