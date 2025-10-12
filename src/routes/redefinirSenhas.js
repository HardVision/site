var express = require("express");
var router = express.Router();

var redefinirSenhaController = require("../controllers/redefinirSenhaController");

router.post("/redefinirSenha", function(req, res) {
    redefinirSenhaController.redefinirSenha(req, res);
});

module.exports = router;
