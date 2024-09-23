// node ./hola_mundo.js
console.log('Hola mundo');

//fetch('https://fakestoreapi.com/products')
//    .then(response => response.json())
//    .then(data => console.log(data))

// async function fetchData() {
//     return 'x'
//}

fetch('https://fakestoreapi.com/users')
    .then((res) => res.json()).then((data) => console.log(data))

    .catch((error) => console.log('Error :c :', error))

