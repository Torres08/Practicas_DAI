// tienda.js 
import express from "express";
import nunjucks from "nunjucks";
import connectDB from "./model/db.js";
import path from "path"; // Importa path para trabajar con rutas
import { fileURLToPath } from "url"; // Importa fileURLToPath
import session from "express-session"
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';



// Calcular __dirname a partir de import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();
const IN = process.env.IN || 'development';


// Configuración de Nunjucks
nunjucks.configure('views', {
    autoescape: true,
    noCache: IN === 'development',
    watch: IN === 'development',
    express: app
});

app.set('view engine', 'html');

// Middleware para archivos estáticos
app.use(express.static('public')); // Para archivos en la carpeta public
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules'))); // Para archivos en node_modules

// express asi puede interpretar los datos enviados a traves de un formulario HTML con POST
app.use(express.urlencoded({ extended: true }));

app.use(session({
	secret: 'my-secret',      // a secret string used to sign the session ID cookie
	resave: false,            // don't save session if unmodified
	saveUninitialized: false  // don't create session until something stored
}))

// Middleware para manejar cookies
app.use(cookieParser());

// Middleware de autenticación
const autenticacion = (req, res, next) => {
  const token = req.cookies.access_token;
  if (token) {
    try {
      const data = jwt.verify(token, process.env.SECRET_KEY);
      req.username = data.usuario; // username en el request
      req.isAuthenticated = true;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      req.isAuthenticated = false;
    }
  } else {
    req.isAuthenticated = false;
  }
  next();
};
app.use(autenticacion);


// Middleware para pasar isAuthenticated a todas las plantillas
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated;
  next();
});



// Ruta de prueba
app.get("/hola", (req, res) => {
    res.send('Hola desde el servidor');
});

// Rutas de la tienda
import TiendaRouter from "./routes/router_tienda.js";

import UsuarioRouter from "./routes/router_usuario.js"

app.use("/", TiendaRouter);

app.use("/", UsuarioRouter);

// Middleware para gestión de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

// Inicio del servidor
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});



