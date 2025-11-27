var express = require("express");
var router = express.Router();

var metricaController = require("../controllers/metricaController");

// Endpoint de teste
router.get("/teste", function (req, res) {
    res.status(200).json({ mensagem: "Rota de métricas funcionando!" });
});

router.get("/listar/:idEmpresa", function (req, res) {
    metricaController.listarMetricas(req, res);
});

router.post("/criar", function (req, res) {
    console.log("POST /metricas/criar recebido");
    console.log("Body:", req.body);
    metricaController.criarMetrica(req, res);
});

router.put("/atualizar/:idMetrica", function (req, res) {
    metricaController.atualizarMetrica(req, res);
});

router.delete("/deletar/:idMetrica", function (req, res) {
    metricaController.deletarMetrica(req, res);
});

router.get("/obter/:idMetrica", function (req, res) {
    metricaController.obterMetricaPorId(req, res);
});

module.exports = router;
