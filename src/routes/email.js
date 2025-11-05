var express = require("express");
var router = express.Router();
var emailController = require("../controllers/emailController");


router.post("/enviar", function (req, res) {
    emailController.enviar(req, res);
});

module.exports = router;