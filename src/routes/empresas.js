var express = require("express");
var router = express.Router();

var empresaController = require("../controllers/empresaController");

router.post("/cadastrar", function (req, res) {
    empresaController.cadastrar(req, res);
})

router.get("/buscar", function (req, res) {
    empresaController.buscarPorCnpj(req, res);
});

router.get("/buscar/:id", function (req, res) {
  empresaController.buscarPorId(req, res);
});

router.get("/listar", function (req, res) {
  empresaController.listar(req, res);
});

router.delete("/deletar/:idEmpresa", function (req, res) {
    empresaController.deletar(req, res);
});

router.get("/pesquisar/:nome", function (req, res) {
    empresaController.pesquisarNome(req, res);
});

router.put("/editar/:idEmpresa", function (req, res) {
    empresaController.editar(req, res);
});


module.exports = router;