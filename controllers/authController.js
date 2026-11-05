
const { getAuth } = require("firebase-admin/auth");

const auth = getAuth();

// Duración de la sesión: 5 días
const DURACION_SESION = 5 * 24 * 60 * 60 * 1000;

// Configuración de la cookie
const opcionesCookie = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: DURACION_SESION,
    path: "/"
};

// Crear sesión segura de Firebase
async function crearSesion(res, idToken) {
    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: DURACION_SESION
    });

    res.cookie("session", sessionCookie, opcionesCookie);
}

// Mostrar formulario de registro
exports.mostrarRegistro = (req, res) => {
    res.render("register", { error: null });
};

// Registrar usuario
exports.registrar = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render("register", {
                error: "Todos los campos son obligatorios"
            });
        }

        if (password.length < 6) {
            return res.render("register", {
                error: "La contraseña debe tener al menos 6 caracteres"
            });
        }

        // Registrar usuario en Firebase Authentication
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.FIREBASE_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password,
                    returnSecureToken: true
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "Error al registrar");
        }

        // Crear sesión segura
        await crearSesion(res, data.idToken);

        res.redirect("/home");

    } catch (error) {
        console.error(error);

        res.render("register", {
            error: "No se pudo registrar el usuario: " + error.message
        });
    }
};

// Mostrar formulario de inicio de sesión
exports.mostrarLogin = (req, res) => {
    res.render("login", { error: null });
};

// Iniciar sesión
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password,
                    returnSecureToken: true
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "Error al iniciar sesión");
        }

        // Crear sesión segura
        await crearSesion(res, data.idToken);

        res.redirect("/home");

    } catch (error) {
        console.error(error);

        res.render("login", {
            error: "Correo o contraseña incorrectos"
        });
    }
};

// Mostrar página principal
exports.home = async (req, res) => {
    try {
        const sessionCookie = req.cookies.session;

        if (!sessionCookie) {
            return res.redirect("/login");
        }

        // Verificar la sesión con Firebase
        const decodedClaims = await auth.verifySessionCookie(
            sessionCookie,
            true
        );

        const user = await auth.getUser(decodedClaims.uid);

        res.render("home", {
            email: user.email,
            uid: user.uid
        });

    } catch (error) {
        res.clearCookie("session", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        res.redirect("/login");
    }
};

// Cerrar sesión
exports.logout = (req, res) => {
    res.clearCookie("session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    });

    res.redirect("/login");
};
