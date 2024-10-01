
// seed.js

/*
    Copia de seguridad con mongoDB
    mongodump --host localhost --port 27017 --username root --password example --authenticationDatabase admin --out ~/Documents/Github/Practicas_DAI/Projecto/dump
*/

import { MongoClient } from 'mongodb'

import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';
  
console.log( '🏁 seed.js ----------------->')

// del archivo .env
const USER_DB = process.env.USER_DB
const PASS    = process.env.PASS
  
const url    = `mongodb://${USER_DB}:${PASS}@localhost:27017`
const client = new MongoClient(url);
  
// Nombre de la Base de Datos a Crear
const dbName = 'myProject';
  
// Crear carpeta para guardar imágenes
const imageDir = './images';
await fs.ensureDir(imageDir);

/**
 * Obtiene una colección de la base de datos.
 * @param {string} colección - El nombre de la colección a obtener. Productos o Usuarios
 * @returns {Promise<Collection>} - La colección de la base de datos.
 */
async function obtenerColección(colección) {
    const database = client.db(dbName);
    return database.collection(colección);
}


/**
 * Función para descargar imágenes y guardarlas en una carpeta local.
 * @param {string} url - La URL de la imagen a descargar.
 * @param {string} nombreArchivo - El nombre del archivo en el que se guardará la imagen.
 * @returns {Promise<void>} - Una promesa que se resuelve cuando la imagen se ha descargado y guardado.
 */
async function descargarImagen(url, nombreArchivo) {
    const res = await fetch(url);
    const dest = fs.createWriteStream(path.join(imageDir, nombreArchivo));
    res.body.pipe(dest);

    return new Promise((resolve, reject) => {
        res.body.on('end', resolve);
        res.body.on('error', reject);
    });
}

/**
 * Inserta datos en una colección desde una URL.
 * @param {string} colección - El nombre de la colección en la que se insertarán los datos.
 * @param {string} url - La URL desde la cual se obtendrán los datos.
 * @returns {Promise<string>} - Un mensaje indicando el resultado de la operación.
 */
async function Inserta_datos_en_colección(colección, url) {
    try {

        // Conectamos a la base de datos y obtenemos la colección
        const coleccion = await obtenerColección(colección);

        // Comprobamos si coleccion ya tiene datos, por si ya lo hemos insertado no volver a insertarlo
        const count = await coleccion.countDocuments();
        if (count > 0) {
            return `No se insertaron datos en ${colección}, ya existen ${count} documentos.`;
        }

        // Caso en que no tiene datos la colección
        // obtenemos los datos de la URL (fakestoreAPI) con un Fetch
        const datos = await fetch(url).then(res => res.json());

        // Añadimos opciones para la operación de inserción
        const options = { ordered: true };

        // Caso en que queramos descargar las imagenes si la coleccion es producto
        if (colección === 'productos') {
            for (const producto of datos) {
                const nombreImagen = `${producto.id}.jpg`;
                await descargarImagen(producto.image, nombreImagen);
                console.log(`Imagen descargada: ${nombreImagen}`);
            }
        }

        // Insertamos los datos en la colección con un insertMany
        const result = await coleccion.insertMany(datos, options);

        // Hacemos un return para verlo en la terminal
        return `${result.insertedCount} documents were inserted`;

    } catch (err) {
        // Append additional context to the error
        err.errorResponse = `Error en fetch ${colección}: ${err.message}`;
        throw err;  // Propagate the error upwards
    }
}



/**
 * 1. Muestra los productos de más del precio especificado.
 * @param {number} precio - El precio mínimo de los productos a mostrar.
 */
async function mostrarProductosCaros(precio) {
    const coleccion = await obtenerColección('productos');
    // $gt: precio = mayor que el precio 
    const productosCaros = await coleccion.find({ price: { $gt: precio } }).toArray();
    
    console.log(`\n1. Productos de más de ${precio} $\n`);
    productosCaros.forEach(producto => {
        console.log(`- ${producto.title}: $${producto.price}`);
    });
}

/**
 * 2. Muestra los productos que contengan 'winter' en la descripción, ordenados por precio
 */
async function mostrarProductosWinter() {
    const coleccion = await obtenerColección('productos');
    const productosWinter = await coleccion.find({ description: { $regex: /winter/i } })
        .sort({ price: -1 }).toArray();
    
    console.log(`\n2. Productos que contengan 'winter' en la descripción, ordenados por precio\n`);
    productosWinter.forEach(producto => {
        console.log(`- ${producto.title}: $${producto.price}`);
    });
}

/**
 * 3. Mostramos los productos de joyeria ordenados por rating
 */
async function mostrarProductosJoyería() {
    const coleccion = await obtenerColección('productos');
    const productoJewelery = await coleccion.find({ category: 'jewelery' })
        .sort({ 'rating.rate': -1 }).toArray();
    
    console.log(`\n3. Productos de joyería ordenados por rating\n`);
    productoJewelery.forEach(producto => {
        console.log(`- ${producto.title}: ${producto.rating.rate} \n ${producto.category}`);
    });
}

/**
 * 4. Mostrar reseñas totales, segun el conunt en rating 
 */
async function mostrarReseñasTotales() {
    const coleccion = await obtenerColección('productos');
    const totalReseñas = await coleccion.aggregate([
        { $group: { _id: null, total: { $sum: '$rating.count' } } }
    ]).toArray();
    
    console.log(`\n4. Reseñas totales (count en rating)\n`);
    console.log(`Total de reseñas: ${totalReseñas[0].total}`);
}


/**
 * 5. Muestra la puntuacion media por categoria de producto
 */
async function mostrarPuntuacionMediaPorCategoria() {
    const coleccion = await obtenerColección('productos');
    const puntuacionMedia = await coleccion.aggregate([
        { $group: { _id: '$category', media: { $avg: '$rating.rate' } } }
    ]).toArray();
    
    console.log(`\n5. Puntuación media por categoría de producto\n`);
    puntuacionMedia.forEach(categoria => {
        console.log(`- ${categoria._id}: ${categoria.media.toFixed(2)}`);
    });
}

/**
 * 6. Mostramos usuarios sin digitos en su contraseña
 */
async function mostrarUsuariosSinDigitos() {
    const coleccion = await obtenerColección('usuarios');
    // Expresion regular muestra digitos 0-9, /\d/
    const usuariosSinDigitos = await coleccion.find({ password: { $not: /\d/ } }).toArray();
    
    console.log(`\n6. Usuarios sin digitos en su contraseña\n`);
    usuariosSinDigitos.forEach(usuario => {
        console.log(`- ${usuario.username}`);
    });
}

async function run() {
    try {
        // Conectamos a la base de datos MongoDB
        await client.connect(); 

        await Inserta_datos_en_colección('productos', 'https://fakestoreapi.com/products')
            .then((r) => console.log(`Todo bien: ${r}`)) // OK
            .then(() => Inserta_datos_en_colección('usuarios', 'https://fakestoreapi.com/users'))
            .then((r) => console.log(`Todo bien: ${r}`)) // OK
            .catch((err) => console.error('Algo mal: ', err.errorResponse)); // error

        // Ejercicio de consulta     
        await mostrarProductosCaros(100);
        await mostrarProductosWinter();
        await mostrarProductosJoyería();
        await mostrarReseñasTotales();
        await mostrarPuntuacionMediaPorCategoria();
        await mostrarUsuariosSinDigitos();

    } catch (err) {
        console.error('Algo mal: ', err.errorResponse); // Log errors
    } finally {
        // Cerramos la conexión a la base de datos
        await client.close(); 
    }
}

run();

console.log('Lo primero que pasa')