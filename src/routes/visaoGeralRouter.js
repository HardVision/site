var express = require("express");
var router = express.Router();

var visaoGeral = require("../controllers/visaoGeral.js");

//Recebendo os dados do html e direcionando para a função cadastrar de visaoGeral.js
router.get("/buscar/:fkEmpresa", function (req, res) {
    visaoGeral.buscarInfo(req, res);
})

module.exports = router;