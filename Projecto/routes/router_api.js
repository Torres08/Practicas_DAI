// para el logging npm install winston

/// ./routes/router_api.js
import express from "express";
import Productos from "../model/productos.js";
import logger from "../model/logger.js";

const router = express.Router();

// GET /api/ratings - lista con los ratings de todos los productos
router.get('/api/ratings', async (req, res) => {
  const { desde = 0, hasta = 4 } = req.query;
  
  const skip = parseInt(desde);
  const limit = parseInt(hasta) - parseInt(desde) + 1;

  try {
    const productos = await Productos.find({}, 'id rating')
      .skip(skip)
      .limit(limit);
    res.json(productos);
  } catch (err) {
    logger.error('Error al obtener los ratings:', err); // logger
    res.status(500).send({ error: 'Error al obtener los ratings' });
  }
});

// GET /api/ratings/:id - rating del producto con id
router.get('/api/ratings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const producto = await Productos.findOne({ id: id }, 'id rating');
    if (!producto) {
      return res.status(404).send({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (err) {
    logger.error('Error al obtener el rating del producto:', err); // logger
    res.status(500).send({ error: 'Error al obtener el rating del producto' });
  }
});

// PUT /api/ratings/:id - modificar rating del producto con id
router.put('/api/ratings/:id', async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;
  try {
    const producto = await Productos.findOneAndUpdate({ id: id }, { rating }, { new: true, runValidators: true });
    if (!producto) {
      return res.status(404).send({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (err) {
    logger.error('Error al modificar el rating del producto:', err); // logger
    res.status(500).send({ error: 'Error al modificar el rating del producto' });
  }
});

export default router;