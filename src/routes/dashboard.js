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

// uptime
router.get("/tempo-real/:idMaquina", function (req, res) {
    dashboardController.tempoReal(req, res);
});


//CPU por nucleo

router.get("/cpu/nucleos/:idMaquina", function (req, res) {
    dashboardController.cpuPorNucleo(req, res);
});
//

// DISCO 
if (dashboardController.disco) {
    router.get("/disco/:id", dashboardController.disco);
}

router.get("/alertas-linha/:idEmpresa", function (req, res) {
  dashboardController.alertasLinha(req, res);
});

router.get("/alertas-barra/:idEmpresa", function (req, res) {
  dashboardController.alertasBarra(req, res);
});

router.get("/alertas-card/:idEmpresa", function (req, res) {
  dashboardController.alertasCard(req, res);
});

router.get("/select-maquina/:idEmpresa", function (req, res) {
  dashboardController.selectMaquina(req, res);
});

router.get("/ram-tempo-real/:id", function (req, res) {
    dashboardController.dadosRamTempoReal(req, res);
});

router.get("/kpis-maquina/:id", function (req, res) {
  dashboardController.kpisMaquina(req, res);
});


module.exports = router;
