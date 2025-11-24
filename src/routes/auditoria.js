const express = require("express");
const router = express.Router();
const controller = require("../controllers/auditoriaController");

router.get("/kpis", controller.buscarKPIs);
router.get("/tipo", controller.buscarPorTipo);
router.get("/dia", controller.buscarPorDia);
router.get("/hora/hoje", controller.buscarPorHoraHoje);
router.get("/ultimas", controller.buscarUltimas);
router.get("/debug/logins", controller.debugLogins);

module.exports = router;
