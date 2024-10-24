// ./routes/router_tienda.js
import express from "express";
import Productos from "../model/productos.js";
import mongoose from "mongoose";

const router = express.Router();

// crear una funcion para dividir productos entre moda hombre, mujer, joyeria, etc
// men's clothing, jewelery
// category	"women's clothing

const obtenerProductosPorCategoria = async (categoria) => {
  try {
    const productos = await Productos.find({ category: categoria });
    return productos;
  } catch (err) {
    throw new Error('Error al obtener productos por categoría');
  }
};





router.get('/', async (req, res) => {
  try {

    const productosHombres = await obtenerProductosPorCategoria("men's clothing");
    const productosJoyeria = await obtenerProductosPorCategoria("jewelery");
    const productosMujeres = await obtenerProductosPorCategoria("women's clothing");

    // Puedes combinar los productos si es necesario
    //const productos = [...productos, ...productosHombres, ...productosJoyeria, ...productosMujeres];

    res.render('home.html', { productosHombres, productosJoyeria, productosMujeres })    // ../views/portada.html, 
  } catch (err) {                                // se le pasa { productos:productos }
    res.status(500).send({ err })
  }
})

router.get('/base', async (req, res) => {
  try {
    const productos = await Productos.find({})   // todos los productos
    res.render('base.html', { productos })    // ../views/portada.html, 
  } catch (err) {                                // se le pasa { productos:productos }
    res.status(500).send({ err })
  }
})


// mostrar/:categoria 
/*
router.get('/mostrar/:cat', async (req, res) => {
  const cat = req.params.cat
  try {
    const productosHombres = await obtenerProductosPorCategoria("men's clothing");
    res.render('mens_clothing.html', { productosHombres });
  } catch (err) {
    res.status(500).send({ err });
  }
});

generalizarlo todo en una plantilla 
*/

router.get('/mens_clothing', async (req, res) => {
  try {
    const productosHombres = await obtenerProductosPorCategoria("men's clothing");
    res.render('mens_clothing.html', { productosHombres });
  } catch (err) {
    res.status(500).send({ err });
  }
});

router.get('/womens_clothing', async (req, res) => {
  try {
    const productosMujeres = await obtenerProductosPorCategoria("women's clothing");
    res.render('womens_clothing.html', { productosMujeres });
  } catch (err) {
    res.status(500).send({ err });
  }
});

router.get('/jewelery', async (req, res) => {
  try {
    const productosJoyeria = await obtenerProductosPorCategoria("jewelery");
    res.render('jewelery.html', { productosJoyeria });
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
  //console.log('Buscando producto con ID:', productoId); // Log para verificar el ID

  try {
    const producto = await obtenerProductoPorId(productoId);
    res.render('detalle.html', { producto });
  } catch (error) {
    console.error(error); // Log del error
    res.status(404).send(error.message); // Responde con el mensaje de error
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
  //console.log('Carrito:', req.session.cart);
  const carritoVacio= !req.session.cart || req.session.cart.length === 0;
  res.json({ carritoVacio });
});

export default router