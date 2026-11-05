const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// Registro
router.get("/register", authController.mostrarRegistro);
router.post("/register", authController.registrar);

// Inicio de sesión
router.get("/login", authController.mostrarLogin);
router.post("/login", authController.login);

// Página principal y cierre de sesión
router.get("/home", authController.home);
router.get("/logout", authController.logout);

module.exports = router;