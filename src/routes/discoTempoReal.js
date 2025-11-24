var express = require("express");
var router = express.Router();
var discoTempoRealController = require("../controllers/discoTempoRealController");

router.post("/disco", function(req, res) {
    discoTempoRealController.receberDisco(req, res);
})

router.get("/tempo-real/:mac", function(req, res) {
    discoTempoRealController.obterDisco(req, res);
})

module.exports = router;