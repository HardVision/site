var express = require("express");
var router = express.Router();

var visaoGeral = require("../controllers/visaoGeral.js");


router.get(`/buscar/:fkEmpresa/:filtro`, function (req, res) {
    visaoGeral.buscarInfo(req, res);
})

router.post("/cadastrar", function (req, res) {
    visaoGeral.cadastrar(req, res);
})

router.get(`/uptime/:fkEmpresa`, function (req, res) {
    visaoGeral.buscarUptime(req, res);
})

router.delete("/deletar/:idBotaoEscolhido", function (req, res) {
    visaoGeral.deletar(req, res);
})

module.exports = router;