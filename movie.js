async function compareMovies() {
  const movie1 = document.getElementById('movie1').value;
  const movie2 = document.getElementById('movie2').value;

  if (!movie1 || !movie2) {
    alert('Please enter both movie titles');
    return;
  }

  const [res1, res2] = await Promise.all([
    fetch(`/movie/${encodeURIComponent(movie1)}`),
    fetch(`/movie/${encodeURIComponent(movie2)}`)
  ]);

  const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
  displayComparison(data1, data2);
}

function displayComparison(m1, m2) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = `
    <div class="movie-compare">
      <h2>${m1.title}</h2>
      <p>Year: ${m1.year}</p>
      <p>IMDb: ${m1.imdbRating}</p>
      <img src="${m1.poster}" width="150" />
      <div class="movie-details">
        <p><strong>Genre:</strong> ${m1.genre}</p>
        <p><strong>Director:</strong> ${m1.director}</p>
        <p><strong>Plot:</strong> ${m1.plot}</p>
      </div>
    </div>
    <div class="movie-compare">
      <h2>${m2.title}</h2>
      <p>Year: ${m2.year}</p>
      <p>IMDb: ${m2.imdbRating}</p>
      <img src="${m2.poster}" width="150" />
      <div class="movie-details">
        <p><strong>Genre:</strong> ${m2.genre}</p>
        <p><strong>Director:</strong> ${m2.director}</p>
        <p><strong>Plot:</strong> ${m2.plot}</p>
      </div>
    </div>
  `;
}
