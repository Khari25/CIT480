document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     LOGIN PAGE
  =============================== */
  const loginForm = document.getElementById("login-form");
  const messageEl = document.getElementById("message");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      try {
        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.success && data.redirect) {
          window.location.href = data.redirect;
        } else {
          messageEl.textContent = data.error || "Login failed!";
        }

      } catch (err) {
        console.error(err);
        messageEl.textContent = "Server error during login!";
      }
    });
  }

  /* ===============================
     PROFILE PAGE
  =============================== */
  const displayName = document.getElementById("display-name");

  if (displayName) {

    fetch("/me")
      .then(res => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then(user => {

        displayName.textContent = user.username;
        document.getElementById("username").textContent = user.username;

        document.getElementById("created-at").textContent =
          new Date(user.created_at).toLocaleDateString();

        if (user.avatar_url) {
          document.getElementById("profile-avatar").src = user.avatar_url;

          document.querySelectorAll(".avatar-option").forEach(option => {
            if (option.src.endsWith(user.avatar_url)) {
              option.classList.add("selected");
            }
          });
        }

      })
      .catch(() => window.location.href = "/");

    const startBtn = document.getElementById("start-matching");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        window.location.href = "/pages/index.html";
      });
    }

    document.querySelectorAll(".avatar-option").forEach(option => {
      option.addEventListener("click", async () => {

        const src = option.src.replace(window.location.origin, "");

        document.getElementById("profile-avatar").src = src;

        document.querySelectorAll(".avatar-option")
          .forEach(a => a.classList.remove("selected"));

        option.classList.add("selected");

        await fetch("/update-avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar_url: src })
        });

      });
    });
  }

  /* ===============================
     INDEX PAGE - HEADER USER INFO
  =============================== */

  const userAvatar = document.getElementById("user-avatar");
  const userName = document.getElementById("user-name");

  if (userAvatar && userName) {

    fetch("/me")
      .then(res => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then(user => {
        userAvatar.src = user.avatar_url || "/avatars/avatar1.png";
        userName.textContent = user.username;
      })
      .catch(() => window.location.href = "/");

  }

  /* ===============================
     SAFE MOVIE CARD BUILDER
  =============================== */

  function createMovieCard(data) {

    const card = document.createElement("div");
    card.className = "movie-compare";

    const title = document.createElement("h2");
    title.textContent = data.title;

    const year = document.createElement("p");
    year.textContent = `Year: ${data.year}`;

    const imdb = document.createElement("p");
    imdb.textContent = `IMDb: ${data.imdbRating}`;

    const box = document.createElement("p");
    box.innerHTML = "<strong>Box Office:</strong> ";
    box.appendChild(document.createTextNode(data.boxOffice || "N/A"));

    const img = document.createElement("img");
    img.src = data.poster;
    img.alt = data.title;

    const details = document.createElement("div");
    details.className = "movie-details";

    const genre = document.createElement("p");
    genre.textContent = `Genre: ${data.genre}`;

    const director = document.createElement("p");
    director.textContent = `Director: ${data.director}`;

    const actors = document.createElement("p");
    actors.textContent = `Actors: ${data.actor}`;

    const plot = document.createElement("p");
    plot.textContent = `Plot: ${data.plot}`;

    details.append(genre, director, actors, plot);

    card.append(title, year, imdb, box, img, details);

    return card;
  }

  /* ===============================
     INDEX PAGE - COMPARE MOVIES
  =============================== */

  const compareBtn = document.getElementById("compare-btn");
  const resultsDiv = document.getElementById("results");

  if (compareBtn && resultsDiv) {

    compareBtn.addEventListener("click", async () => {

      const movie1 = document.getElementById("movie1").value.trim();
      const movie2 = document.getElementById("movie2").value.trim();

      if (!movie1 || !movie2) {
        alert("Please enter both movies!");
        return;
      }

      try {

        const [res1, res2] = await Promise.all([
          fetch(`/movie/${encodeURIComponent(movie1)}`),
          fetch(`/movie/${encodeURIComponent(movie2)}`)
        ]);

        const [data1, data2] = await Promise.all([
          res1.json(),
          res2.json()
        ]);

        if (data1.error || data2.error) {
          resultsDiv.textContent = "One or both movies not found.";
          return;
        }

        resultsDiv.innerHTML = "";

        resultsDiv.appendChild(createMovieCard(data1));
        resultsDiv.appendChild(createMovieCard(data2));

      } catch (err) {
        console.error(err);
        resultsDiv.textContent = "Error fetching movies. Try again!";
      }

    });

  }

  /* ===============================
     GLOBAL LOGOUT BUTTON
  =============================== */

  const logoutBtn = document.getElementById("logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetch("/logout", { method: "POST" });
      window.location.href = "/";
    });
  }

});
