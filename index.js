require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const { initializeApp, cert } = require("firebase-admin/app");

const app = express();
const PORT = process.env.PORT || 3000;

// Cargar las credenciales de Firebase
const serviceAccount = require(
    path.resolve(process.env.FIREBASE_CREDENTIALS)
);

// Inicializar Firebase ANTES de cargar las rutas
initializeApp({
    credential: cert(serviceAccount)
});

// Cargar las rutas después de inicializar Firebase
const authRoutes = require("./routes/authRoutes");

// Configurar EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use("/", authRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
    console.log("Firebase conectado correctamente");
});