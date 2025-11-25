  var express = require("express");
  var router = express.Router();

  var dashboardController = require("../controllers/dashboardController");

  // RELATÓRIO
  router.get("/gerar-relatorio/:idMaquina", dashboardController.gerarRelatorio);

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
  router.get("/cpu/kpis/:idMaquina", dashboardController.kpisCpu);

  router.get("/cpu/nucleos/:idMaquina", function (req, res) {
      dashboardController.cpuPorNucleo(req, res);
  });
  router.get("/cpu/uso/:idMaquina", dashboardController.cpuUso);

  // CPU uso total
  //router.get("/cpu/uso/:idMaquina", dashboardController.cpuUso);

  // CPU frequência
  /*router.get("/cpu/frequencia/:idMaquina", dashboardController.cpuFrequencia);
  */
  // CPU por nucleo (AGORA COM adaptarId)
  /*router.get("/cpu/nucleos/:idMaquina", adaptarId, function (req, res) {
      dashboardController.cpuPorNucleo(req, res);
  });*/

  //

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

router.get("/alertas-kpi/:idEmpresa", function (req, res) {
  dashboardController.alertasKpi(req, res);
});

router.get("/alertas-markov/:idEmpresa", function (req, res) {
  dashboardController.alertasMarkov(req, res);
});

router.get("/alertas-prob/:idEmpresa", function (req, res) {
  dashboardController.alertasProb(req, res);
});

router.get("/select-maquina/:idEmpresa", function (req, res) {
  dashboardController.selectMaquina(req, res);
});

  router.get("/ram-tempo-real/:id", function (req, res) {
      dashboardController.dadosRamTempoReal(req, res);
  });

router.get('/kpi-ram-media/:id', function (req, res) {
  dashboardController.kpiRamMedia7dias(req, res);
});

router.get('/kpi-top-app/:id', function (req, res) {
  dashboardController.kpiTopAppHoje(req, res);
});

router.get("/cpu/processos/:idMaquina", dashboardController.listarProcessos);



  module.exports = router;
