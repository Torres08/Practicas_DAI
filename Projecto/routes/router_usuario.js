import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Usuario from "../model/usuarios.js"; // Asegúrate de importar el modelo Usuario correctamente

const router = express.Router();

/*
Para implementar la autenticación con JSON Web Tokens (JWT) y cookies en tu aplicación, sigue estos pasos:

npm install jsonwebtoken cookie-parser

Añade el middleware cookie-parser a tu aplicación:


*/

router.get('/register', (req, res) => {
  res.render('register.html');
});

router.get('/login', (req, res) => {
  res.render('login.html');
});

router.post('/register', async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  // Validar los datos del usuario
  if (!email || !password || !confirmPassword) {
    return res.status(400).send('Todos los campos son obligatorios');
  }

  if (password !== confirmPassword) {
    return res.status(400).send('Las contraseñas no coinciden');
  }

  // Verificar si el usuario ya existe
  const usuarioExistente = await Usuario.findOne({ email });
  if (usuarioExistente) {
    return res.status(400).send('El usuario ya existe');
  }

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear un nuevo usuario
  const nuevoUsuario = new Usuario({
    email,
    password: hashedPassword,
  });

  // Guardar el usuario en la base de datos
  await nuevoUsuario.save();

  // Mostrar por consola que el usuario ha sido creado
  console.log(`Nuevo usuario creado: ${email}`);

  res.redirect('/login');
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("Datos del formulario: " + email + " " + password);

  try {
    // Buscar el usuario en la base de datos
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).send('Usuario no encontrado');
    }

    // Comparar la contraseña
    console.log("Comparando contraseñas: " + password + " " + usuario.password);

    const isMatch = await bcrypt.compare(password, usuario.password);

    // Verificar si la contraseña no está hasheada
    const isMatch2 = password === usuario.password;

    if (!isMatch && !isMatch2) {
      return res.status(400).send('Contraseña incorrecta');
    }

    // Generar el token JWT
    const token = jwt.sign({ usuario: usuario.email }, process.env.SECRET_KEY);

    // Enviar el token en una cookie
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // en producción, solo con https
    });

    res.redirect('/bienvenida');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
});

router.get('/bienvenida', async (req, res) => {
  // Verificar si el usuario está autenticado
  if (!req.isAuthenticated) {
    return res.status(401).send('No has iniciado sesión');
  }

  console.log("hola" + req.isAuthenticated);
  // Obtener el usuario de la sesión
  const email = req.username;

  const usuario = await Usuario.findOne({ email });

  console.log("Username: " + usuario + " " + usuario.name);
  res.render('bienvenida.html', { usuario });
});

router.get('/logout', (req, res) => {
  res.clearCookie("access_token");
  res.redirect('/login');
});

export default router;