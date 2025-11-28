var express = require("express");
var router = express.Router();
var discoTempoRealController = require("../controllers/dashboardDiscoController");

router.post("/", function(req, res) {
    discoTempoRealController.receberDisco(req, res);
});

router.get("/tempo-real/:mac", function(req, res) {
    discoTempoRealController.obterDisco(req, res);
});

router.get("/maquinas/:fkEmpresa", function(req, res) {
    discoTempoRealController.buscarMaquinas(req, res);
})

module.exports = router;