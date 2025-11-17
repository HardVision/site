var express = require("express");
var router = express.Router();

var redeController = require("../controllers/redeController");

router.get("/ultimas/:idMaquina", function (req, res) {
    redeController.buscarUltimas(req, res);
});

router.get("/tempo-real/:idMaquina", function (req, res) {
    redeController.buscarTempoReal(req, res);
});

router.get("/kpis/:idMaquina", function (req, res) {
    redeController.buscarKpis(req, res);
});

router.get("/alertas-agrupados/:idMaquina", function (req, res) {
    redeController.buscarAlertasAgrupados(req, res);
});

router.get("/alertas/:idMaquina", function (req, res) {
    redeController.listarAlertas(req, res);
});

module.exports = router;
