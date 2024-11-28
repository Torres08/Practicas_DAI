// public/js/ratings.js
// se ejecuta cuando la página está completamente cargada
document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando fetch ...');
    const ele_stars = document.getElementsByClassName('stars');  // todos los elementos de la clase 'stars' que haya en la página
    
    for (const ele of ele_stars) {
      const ide = ele.dataset._id;   // _id esta en los atributos del dataset
      
      // hacer el fetch, y con lo que devuelva formar el html y ponerlo:
      fetch(`/api/ratings/${ide}`)
        .then(response => response.json())
        .then(data => {
          const rating = data.rating.rate;
          const stars = Math.round(rating);
          let html_nuevo_con_las_estrellas = '';
  
          for (let i = 0; i < 5; i++) {
            if (i < stars) {
              html_nuevo_con_las_estrellas += '<i class="bi bi-star-fill" style="color: gold;"></i>';
            } else {
              html_nuevo_con_las_estrellas += '<i class="bi bi-star" style="color: gold;"></i>';
            }
          }
  
          ele.innerHTML = html_nuevo_con_las_estrellas;
        })
        .catch(error => {
          console.error('Error al obtener el rating:', error);
          ele.innerHTML = 'Error al cargar el rating';
        });
    }
  });