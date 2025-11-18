var express = require("express");
var router = express.Router();

var redeController = require("../controllers/redeController");

// ROTAS OFICIAIS DE TEMPO REAL
router.get("/tempo-real/:idMaquina", redeController.tempoReal);
router.get("/historico/:idMaquina", redeController.historico);

module.exports = router;
