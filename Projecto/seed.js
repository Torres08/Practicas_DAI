// seed.js
// > npm run seed

import { MongoClient } from 'mongodb'

console.log('🏁 seed.js ----------------->')

// del archivo .env
const USER_DB = process.env.USER_DB
const PASS = process.env.PASS

const url = `mongodb://${USER_DB}:${PASS}@localhost:27017`
const client = new MongoClient(url);

// Database Name
const dbName = 'myProject';

// función asíncrona
async function Inserta_datos_en_colección(colección, url) {

    // coleccion = productos, nombres
    // url 

    try {
        // 0. enseñar todos los datos
        const datos = await fetch(url).then(res => res.json())
        //console.log(datos)

        // 1. Productos de más de 100 $

        /*
            Seleccionamos primero la coleccion productos con un if
            filter productos caros
            foreach para iterarlos y enseñarlos (productos = title + price)
        */

        if (colección === 'productos') {

            console.log(`*******\nColeccion: ${colección}\n`)

            const productosCaros = datos.filter(producto => producto.price > 100);

            console.log("---")
            console.log(`1. Productos de más de 100 $\n`);

            // iteracion 
            productosCaros.forEach(producto => {
                console.log(`- ${producto.title}: $${producto.price}`);
            });


            // 2. Productos que contengan 'winter' en la descripción, ordenados por precio
            // filter + sort
            // lo hago en la misma coleccion que productos 


            console.log("\n---")
            console.log(`2.Productos que contengan 'winter' en la descripción, ordenados por precio (mayor a menor esta vez)\n`);

            const productosWinter = datos
                .filter(producto => producto.description.toLowerCase().includes('winter'))
                .sort((a, b) => a.price - b.price);

            productosWinter.forEach(producto => {
                console.log(`- ${producto.title}: $${producto.price}`);
            });

            // 3. Productos de joyería ordenados por rating
            // filter + sort

            console.log("\n---")
            console.log(`3. Productos de joyería ordenados por rating\n`);

            const productoJewelery = datos
                .filter(producto => producto.category == 'jewelery')
                .sort((a, b) => b.rating.rate - a.rating.rate)  // mayor a menor
                ;

            productoJewelery.forEach(producto => {
                console.log(`- ${producto.title}: ${producto.rating.rate} \n ${producto.category}`);
            });

            // 4. Reseñas totales (count en rating)
            // reduce () suma en acumulacion
            console.log("\n---")
            console.log(`4. Reseñas totales (count en rating)\n`);

            // recorro cada producto en datos (datos = productos y usuarios) donde 
            // sumo a total el count
            /*
            const reseñasTotales = datos.reduce((total, producto) => {
                return total + (producto.rating.count);
            }, 0);
            */

            let reseñasTotales = 0;

            /*
            for (const producto of datos) {
                reseñasTotales += producto.rating.count; // Sumar cada 'rating.count'
            }
            */

            datos.forEach(producto => {
                reseñasTotales += producto.rating.count; // Sumar cada 'rating.count'
            });


            console.log(`Reseñas totales: ${reseñasTotales}`)



            // 4. Puntuación media por categoría de producto
            // tengo categoria y rating, ordenar segun categoria y sumar su rate, luego dividirlo por el total de productos de cada categoria 

            // 4.1. dividir los producto en categoria
            // 4.2  coger rate sumarlos + / suma 
            console.log("\n---")
            console.log(`5. Reseñas totales (count en rating)\n`);


            //  Agrupar productos por categoría
            const productosCategoria = {}
            datos.forEach(producto => {
                const categoria = producto.category

                // inicializar si esta vacio
                if (!productosCategoria[categoria]) {
                    productosCategoria[categoria] = [];
                }

                // agregamos el producto a su categoria
                productosCategoria[categoria].push(producto);


            });


            for (const categoria in productosCategoria) {
                console.log(`Categoría: ${categoria} \nProductos: ${productosCategoria[categoria].length}`);

                let rateTotalCategoria = 0;
                const productos = productosCategoria[categoria];

                /*
                for (let i = 0; i < productos.length; i++) {
                    rateTotalCategoria += productos[i].rating.rate; 
                }
                */

                // i = productos[i]
                /*
                for (let i of productos){
                    rateTotalCategoria += i.rating.rate; 
                }
                */

                // i = productos[i]
                productos.forEach(i =>
                    rateTotalCategoria += i.rating.rate
                )

                // Calcular la media, manejando la división por cero
                const media = rateTotalCategoria / productos.length;

                // ${media.toFixed(2)} to fixed 2 para enseñar 2 decimales 
                console.log(`Media de ${categoria}: ${media.toFixed(2)}\n`);
            }



        } else {

            // 6. Usuarios sin digitos en el password
            // como antes he seleccionado con un if coleccion = producto, el resto por descarte son usuarios 

            /*
                /\d/ se usa para verificar si hay dígitos en el password. test() devuelve true si encuentra al menos un dígito. ! para los contrario 
            */
            
            console.log(`*******\nColeccion: ${colección}\n`)


            const usuariosSinDigitos = datos.filter(usuario => !/\d/.test(usuario.password));

            // Mostrar resultados
            console.log("Usuarios sin dígitos en el password:");
            usuariosSinDigitos.forEach(usuario => {
                console.log(`Username: ${usuario.username} , Password: ${usuario.password}`);
            });
            console.log(`\n`)


        }

        return `${datos.length} datos traidos para ${colección}\n---\n`


    } catch (err) {
        console.error('Error en Inserta_datos_en_colección:', err);
        throw err;
    }

}

// Inserción consecutiva
Inserta_datos_en_colección('productos', 'https://fakestoreapi.com/products')
    .then((r) => console.log(`Todo bien: ${r}`))                                 // OK

    .then(() => Inserta_datos_en_colección('usuarios', 'https://fakestoreapi.com/users'))
    .then((r) => console.log(`Todo bien: ${r}`))                                // OK

    .catch((err) => console.error('Algo mal: ', err.errorResponse))             // error


console.log('Lo primero que pasa\n')