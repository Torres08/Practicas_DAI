let count = 0;


/*
  Optimista: Actualizo visualmente antes de hacer el fetch

  Media segun el count y la puntuacion anterior + la puntuacion nueva 

  en mi rating, a la hora de actualizarlo, en vez de poner el nuevo rating quiero 
  hacer la media teniendo en cuenta el numero de votos (count) 
  y el rating anterior que se encuentra dentro de la base de datos

*/

document.addEventListener('DOMContentLoaded', () => {
  console.log('Iniciando fetch ...');
  const ele_stars = document.getElementsByClassName('stars');  // cojo las estrellas

  for (const ele of ele_stars) {
    const ide = ele.dataset._id;   // _id esta en el dataset

    // estado de carga
    ele.innerHTML = '<i class="bi bi-hourglass-split" style="color: gold;"></i> Cargando...';

    // hacer el fetch, y con lo que devuelva formar el html y ponerlo:
    fetch(`/api/ratings/${ide}`)
      .then(response => response.json())
      .then(data => {
        console.log(`Rating obtenido para el producto ${ide}:`, data);
        const rating = data.rating.rate;
        count = data.rating.count || 0; // Obtener el count del rating, si es null, 0
        const stars = Math.round(rating);
        let html_nuevo_con_las_estrellas = '';

        for (let i = 0; i < 5; i++) {
          if (i < stars) {
            html_nuevo_con_las_estrellas += `<i class="bi bi-star-fill" style="color: gold;" data-_id="${ide}" data-star="${i + 1}"></i>`;
          } else {
            html_nuevo_con_las_estrellas += `<i class="bi bi-star" style="color: gold;" data-_id="${ide}" data-star="${i + 1}"></i>`;
          }
        }

        // Crear contenedor para las estrellas y votos
        const starsContainer = document.createElement('div');
        starsContainer.classList.add('stars-container');
        starsContainer.innerHTML = html_nuevo_con_las_estrellas;

        const votosElement = document.createElement('span');
        votosElement.classList.add('votos');
        votosElement.innerHTML = `Votos: ${count}`;

        // Limpiar el contenedor principal y añadir los nuevos elementos
        ele.innerHTML = '';
        ele.appendChild(starsContainer);
        ele.appendChild(votosElement);

        // Añadir manejadores de eventos a las estrellas
        for (const ele_hijo of starsContainer.children) {
          ele_hijo.addEventListener('click', Vota);
        }
      })
      .catch(error => {
        console.error('Error al obtener el rating:', error);
        ele.innerHTML = 'Error al cargar el rating';
      });
  }
});

function Vota(evt) {
  const ide = evt.target.dataset._id;      // producto (en atributos del dataset)
  const pun = parseInt(evt.target.dataset.star);     // estrella no (en atributos del dataset)

  console.log(`Votando para el producto ${ide} con ${pun} estrellas`);


  fetch(`/api/ratings/${ide}`)
    .then(response => response.json())
    .then(data => {

      // Calcula la nueva media 
      const currentRating = data.rating.rate;
      const currentCount = data.rating.count;

      if (isNaN(currentRating)) {
        console.error('Rating actual no es un número válido:', ele.dataset.rating);
        return;
      }
      if (isNaN(pun)) {
        console.error('Puntuación no es un número válido:', evt.target.dataset.star);
        return;
      }

      const newCount = currentCount + 1;
      const newRating = (currentRating * currentCount + pun) / newCount;

      const ele = evt.target.parentElement;
      const estrellas = Array.from(ele.children);
      const roundedRating = Math.round(newRating); // Redondear hacia el entero más cercano
      

      estrellas.forEach((estrella, index) => {
        if (index < roundedRating) {
          estrella.classList.remove('bi-star');
          estrella.classList.add('bi-star-fill');
        } else {
          estrella.classList.remove('bi-star-fill');
          estrella.classList.add('bi-star');
        }
      });

      // Incrementar la variable count

      ele.dataset.rating = newRating.toFixed(2); // 2 decimales
      count = newCount;

      console.log(`Número de votos actualizados: ${count}`);
      console.log(`Rating actualizado: ${newRating}`);

      // Actualizar el conteo de votos en el HTML
      let votosElement = evt.target.closest('.stars').querySelector('.votos');

      if (votosElement) {
        votosElement.textContent = `Votos: ${newCount}`;
      } else {
        console.error('Elemento votos no encontrado');
      }


      // Hacer el fetch para cambiar la BD y renovar el elemento de votación con lo que devuelva
      fetch(`/api/ratings/${ide}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating: { rate: newRating, count: count } })
      })
        .then(response => response.json())
        .then(data => {
          console.log(`Rating actualizado para el producto ${ide}:`, data);
          const rating = data.rating.rate;
          const stars = Math.round(rating);
          let html_nuevo_con_las_estrellas = '';

          for (let i = 0; i < 5; i++) {
            if (i < stars) {
              html_nuevo_con_las_estrellas += `<i class="bi bi-star-fill" style="color: gold;" data-_id="${ide}" data-star="${i + 1}"></i>`;
            } else {
              html_nuevo_con_las_estrellas += `<i class="bi bi-star" style="color: gold;" data-_id="${ide}" data-star="${i + 1}"></i>`;
            }
          }

           // Actualizar el conteo de votos en el HTML después de recibir la respuesta del servidor
           let votosElement = evt.target.closest('.stars').querySelector('.votos');
           if (votosElement) {
              votosElement.textContent = `Votos: ${data.rating.count}`;
            } else {
              console.error('Elemento votos no encontrado');
            }
              

        })
        .catch(error => {
          console.error('Error al actualizar el rating:', error);

          // Revertir la actualización optimística en caso de error
          estrellas.forEach((estrella, index) => {
            if (index < pun) {
              estrella.classList.remove('bi-star-fill');
              estrella.classList.add('bi-star');
            } else {
              estrella.classList.remove('bi-star');
              estrella.classList.add('bi-star-fill');
            }
          });


        })
        .catch(error => {
          console.error('Error al obtener el rating actual:', error);
        });

    });
}