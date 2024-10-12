// ./routes/router_tienda.js
import express from "express";
import Productos from "../model/productos.js";
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

export default router