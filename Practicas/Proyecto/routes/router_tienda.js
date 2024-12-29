// ./routes/router_tienda.js
import express from "express";
import Productos from "../model/productos.js";
import Usuario from "../model/usuarios.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const router = express.Router();

// crear una funcion para dividir productos entre moda hombre, mujer, joyeria, etc
// men's clothing, jewelery
// category	"women's clothing

const obtenerProductosPorCategoria = async (categoria) => {
  try {
    const productos = await Productos.find({ category: categoria });
    return productos;
  } catch (err) {
    throw new Error('Error al obtener productos por categoría ');
  }
};


const mapearCategoria = (categoriaUrl) => {
  const categorias = {
    "mens_clothing": "men's clothing",
    "womens_clothing": "women's clothing",
    "jewelery": "jewelery",

  };
  return categorias[categoriaUrl] || categoriaUrl;
};



router.get('/', async (req, res) => {
  const categorias = ["men's clothing", "jewelery", "women's clothing"];
  try {
    const productosHombres = await obtenerProductosPorCategoria("men's clothing");
    const productosJoyeria = await obtenerProductosPorCategoria("jewelery");
    const productosMujeres = await obtenerProductosPorCategoria("women's clothing");

    res.render('home.html',{ productosHombres, productosJoyeria, productosMujeres});
  } catch (err) {
    res.status(500).send({ err })
  }
});

router.get('/base', async (req, res) => {
  try {
    const productos = await Productos.find({})   // todos los productos
    res.render('base.html', { productos })    // ../views/portada.html, 
  } catch (err) {                                // se le pasa { productos:productos }
    res.status(500).send({ err })
  }
})


// mostrar/:categoria 

router.get('/mostrar/:categoria', async (req, res) => {
  const categoriaUrl = req.params.categoria; // women's clothing, mens clothing, jewelery
  try {
    const categoria = mapearCategoria(categoriaUrl);

    const productos = await obtenerProductosPorCategoria(categoria);

   // console.log("Productos de la categoría:", productos);
    res.render('categoria.html', { productos, categoria });
  } catch (err) {
    res.status(500).send({ err });
  }
});


// ... más rutas aquí
// archivo de ruta correspondiente 
router.post('/buscar', async (req, res) => {
  try {
    const busqueda = req.body.query; // Obtener la frase de búsqueda desde request.body

    // Verificar que el término de búsqueda no esté vacío
    if (!busqueda) {
      return res.status(400).send({ err: "El término de búsqueda no puede estar vacío" });
    }

    // Filtrar productos que contengan la frase de búsqueda en el título o descripción
    const productosFiltrados = await Productos.find({
      $or: [
        { title: { $regex: busqueda, $options: 'i' } },   // Si los campos están en inglés
        { description: { $regex: busqueda, $options: 'i' } }
      ]
    });

    // Renderizar la plantilla con los productos encontrados
    res.render('busqueda.html', { productos: productosFiltrados });

  } catch (err) {
    console.error("Error en la búsqueda:", err);  // Log del error en la consola del servidor
    res.status(500).send({ err: err.message || "Error desconocido" });  // Enviar un mensaje de error más claro
  }
});


router.get('/carrito', (req, res) => {
  // Obtén los productos del carrito desde la sesión
  const productos = req.session.cart || []; // Asegúrate de que el carrito esté inicializado

  // Calcular el precio total de todos los productos en el carrito
  const precioTotal = req.session.precioTotal || 0;

  res.render('carrito.html', { productos, precioTotal });
});

// agregar


const obtenerProductoPorId = async (ID) => {
  try {
    // Validar que el ID no sea nulo o indefinido
    if (!ID) {
      throw new Error('El ID no puede estar vacío');
    }

    // Buscar el producto por un campo específico (si no es el _id)
    const producto = await Productos.findOne({ id: ID }); // Cambia a findOne si no es _id
    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    return producto;
  } catch (err) {
    throw new Error('Error al obtener producto por ID: ' + err.message);
  }
};


// Ruta para obtener el detalle del producto
router.get('/producto/:id', async (req, res) => {
  const productoId = req.params.id;
  console.log('Buscando producto con ID:', productoId); // Log para verificar el ID

  try {
    const producto = await obtenerProductoPorId(productoId);

    const token = req.cookies.access_token;
    let usuario = null;
    if (token) {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      usuario = await Usuario.findOne({ email: decoded.usuario });
    }

    res.render('detalle.html', { producto, usuario });
  } catch (error) {
    console.error(error); // Log del error
    res.status(404).send(error.message); // Responde con el mensaje de error
  }
});


// Ruta para editar el producto
router.post('/producto/:id/editar/', async (req, res) => {
  
  const productoId = req.params.id; 
  //const _id = req.params._id; // lo uso luego para el redireccionamiento a la página del producto
  // findone

  console.log('ID del producto:', productoId);

  try {
    const _id = await Productos.findOne({id: productoId});
    //console.log('_ID del producto:', _id);
    const { title, price } = req.body;
    const producto = await Productos.findByIdAndUpdate(_id, { title, price }, { new: true, runValidators: true });
    if (!producto) {
      return res.status(404).send('Producto no encontrado');
    }
    //res.redirect('/');
    res.redirect(`/producto/${productoId}`);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error en el servidor');
  }
});



router.post('/carrito/agregar', async (req, res) => {
  const productoId = req.body.productoId;

  try {
    // Obtiene el producto por ID
    const producto = await obtenerProductoPorId(productoId); // Asegúrate de que esta función esté implementada correctamente

    // Inicializa el carrito si no existe
    if (!req.session.cart) {
      req.session.cart = [];
    }

    // Añade el producto al carrito
    req.session.cart.push(producto);
    //console.log('Producto agregado al carrito:', producto.title);
    //console.log('Precio:', producto.price);

    req.session.precioTotal = req.session.cart.reduce((total, producto) => total + producto.price, 0);
    //console.log('Precio total:', req.session.precioTotal);

    // Redirige a la página del carrito
    res.redirect('/carrito');
  } catch (error) {
    console.error(error); // Log del error
    res.status(500).send('Error al agregar el producto al carrito'); // Responde con un mensaje de error
  }
});


router.get('/carrito/eliminar/:id', async (req, res) => {
  const productoId = req.params.id;

  try {
    // Obtiene el producto por ID
    const producto = await obtenerProductoPorId(productoId); // Asegúrate de que esta función esté implementada correctamente

    // Elimina el producto del carrito
    req.session.cart = req.session.cart.filter(p => p.id !== producto.id);
    req.session.precioTotal = req.session.cart.reduce((total, producto) => total + producto.price, 0);
    //console.log('Producto eliminado del carrito:', producto.title);
    //console.log('Precio total:', req.session.precioTotal);

    //console.log(req.session.cart.length);
    // Verifica si el carrito está vacío
    if (req.session.cart.length === 0) {
      // Redirige a la página de inicio si el carrito está vacío
      return res.redirect('/');
    } else {
      res.redirect('/carrito');

    }

  } catch (error) {
    console.error(error); // Log del error
    res.status(500).send('Error al eliminar el producto del carrito'); // Responde con un mensaje de error
  }
});

// tener el req.session.cart en la plantilla 
router.get('/comprobar-carrito', (req, res) => {
  console.log('Carrito:', req.session.cart);
  const carritoVacio = !req.session.cart || req.session.cart.length === 0;
  res.json({ carritoVacio });
});





export default router