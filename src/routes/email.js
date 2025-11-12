var express = require("express");
var router = express.Router();
var emailController = require("../controllers/emailController");


router.post("/enviar", function (req, res) {
    emailController.enviar(req, res);
});

router.post("/enviar-token", function (req, res) {
    emailController.enviarToken(req, res);
});

router.put("/atualizar-token", function (req, res) {
    emailController.enviarToken(req, res);
});

router.get("/verificar-token/:token", function (req, res){
    emailController.verificarToken(req, res)
});

module.exports = router;