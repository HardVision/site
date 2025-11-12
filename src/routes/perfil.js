var express = require("express");
var router = express.Router();

var usuarioController = require("../controllers/perfilController");

//Recebendo os dados do html e direcionando para a função cadastrar de usuarioController.js
router.get("/buscarInfo/:id", function (req, res) {
    usuarioController.buscarInfo(req, res);
})

router.put("/atualizar/:id", function (req, res) {
    usuarioController.atualizar(req, res);
})

module.exports = router;