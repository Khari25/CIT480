document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     LOGIN PAGE
  ================================ */
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
  ================================ */
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

    document.getElementById("start-matching")
      .addEventListener("click", () => {
        window.location.href = "/pages/index.html";
      });

    document.getElementById("logout-btn")
      .addEventListener("click", async () => {
        await fetch("/logout", { method: "POST" });
        window.location.href = "/";
      });

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
  ================================ */
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
     INDEX PAGE - COMPARE MOVIES
  ================================ */
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
          resultsDiv.innerHTML =
            `<p style="color:red;">One or both movies not found.</p>`;
          return;
        }

        resultsDiv.innerHTML = `
          <div class="movie-compare">
            <h2>${data1.title}</h2>
            <p>Year: ${data1.year}</p>
            <p>IMDb: ${data1.imdbRating}</p>
            <p><strong>Box Office:</strong> ${data1.boxOffice || "N/A"}</p>
            <img src="${data1.poster}" alt="${data1.title}" />
            <div class="movie-details">
              <p><strong>Genre:</strong> ${data1.genre}</p>
              <p><strong>Director:</strong> ${data1.director}</p>
              <p><strong>Actors:</strong> ${data1.actor}</p>
              <p><strong>Plot:</strong> ${data1.plot}</p>
            </div>
          </div>

          <div class="movie-compare">
            <h2>${data2.title}</h2>
            <p>Year: ${data2.year}</p>
            <p>IMDb: ${data2.imdbRating}</p>
            <p><strong>Box Office:</strong> ${data2.boxOffice || "N/A"}</p>
            <img src="${data2.poster}" alt="${data2.title}" />
            <div class="movie-details">
              <p><strong>Genre:</strong> ${data2.genre}</p>
              <p><strong>Director:</strong> ${data2.director}</p>
              <p><strong>Actors:</strong> ${data2.actor}</p>
              <p><strong>Plot:</strong> ${data2.plot}</p>
            </div>
          </div>
        `;

      } catch (err) {
        console.error(err);
        resultsDiv.innerHTML =
          `<p style="color:red;">Error fetching movies. Try again!</p>`;
      }
    });
  }

  /* ===============================
     LOGOUT BUTTON (GLOBAL)
  ================================ */
  const logoutBtn = document.getElementById("logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetch("/logout", { method: "POST" });
      window.location.href = "/";
    });
  }

});

