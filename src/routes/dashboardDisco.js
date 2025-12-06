var express = require("express");
var router = express.Router();
var dashboardDiscoController = require("../controllers/dashboardDiscoController");

// Rota para listar máquinas no dropdown
router.get("/maquinas/:idEmpresa", dashboardDiscoController.listarMaquinas);

// KPI (Cards e Gráfico Pizza)
router.get("/kpi/:idMaquina", dashboardDiscoController.kpiDisco);

// Histórico (Gráfico Linha)
router.get("/historico/:idMaquina", dashboardDiscoController.historicoDisco);

// Processos (Gráfico Barra)
router.get("/processos/:idMaquina", dashboardDiscoController.processosDisco);

module.exports = router;