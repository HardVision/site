var express = require("express");
var router = express.Router();

var dashboardController = require("../controllers/dashboardController");

// RELATÓRIO
router.get("/gerar-relatorio/:idEmpresa", dashboardController.gerarRelatorio);

// HOME
if (dashboardController.buscar) {
    router.get("/", dashboardController.buscar);
} else {
    router.get("/", (req, res) => res.json({ msg: "Dashboard OK" }));
}

// TEMPO REAL 
router.get("/tempo-real/:id", dashboardController.tempoReal);

// DISCO 
if (dashboardController.disco) {
    router.get("/disco/:id", dashboardController.disco);
}

module.exports = router;
