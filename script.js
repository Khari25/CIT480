const compareBtn = document.getElementById("compare-btn");
const resultsDiv = document.getElementById("results");

compareBtn.addEventListener("click", async () => {
  const movie1 = document.getElementById("movie1").value.trim();
  const movie2 = document.getElementById("movie2").value.trim();

  if (!movie1 || !movie2) {
    alert("Please enter both movie titles!");
    return;
  }

  try {
    // Fetch both movies in parallel
    const [res1, res2] = await Promise.all([
      fetch(`/movie/${encodeURIComponent(movie1)}`),
      fetch(`/movie/${encodeURIComponent(movie2)}`)
    ]);

    const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

    if (data1.error || data2.error) {
      resultsDiv.innerHTML = `<p style="color:red;">One or both movies not found.</p>`;
      return;
    }

    // Display side by side
    resultsDiv.innerHTML = `
      <div class="movie-compare">
        <h2>${data1.title}</h2>
        <p>Year: ${data1.year}</p>
        <p>IMDb: ${data1.imdbRating}</p>
        <img src="${data1.poster}" alt="${data1.title}" />
        <div class="movie-details">
          <p><strong>Genre:</strong> ${data1.genre}</p>
          <p><strong>Director:</strong> ${data1.director}</p>
          <p><strong>Plot:</strong> ${data1.plot}</p>
        </div>
      </div>

      <div class="movie-compare">
        <h2>${data2.title}</h2>
        <p>Year: ${data2.year}</p>
        <p>IMDb: ${data2.imdbRating}</p>
        <img src="${data2.poster}" alt="${data2.title}" />
        <div class="movie-details">
          <p><strong>Genre:</strong> ${data2.genre}</p>
          <p><strong>Director:</strong> ${data2.director}</p>
          <p><strong>Plot:</strong> ${data2.plot}</p>
        </div>
      </div>
    `;
  } catch (err) {
    resultsDiv.innerHTML = `<p style="color:red;">Error fetching movies. Try again!</p>`;
    console.error(err);
  }
});
