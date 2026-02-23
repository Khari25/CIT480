require("dotenv").config();
const express = require("express");
const axios = require("axios");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const session = require("express-session");
const path = require("path");

const app = express();

/* ===============================
   MIDDLEWARE
=============================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "moviematch-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true if HTTPS
}));

app.use(express.static(path.join(__dirname, "public")));

/* ===============================
   DATABASE CONNECTION
=============================== */
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Lucinda99!",
  database: "moviesdb",
  waitForConnections: true,
  connectionLimit: 10
}).promise();

console.log("✅ MySQL connected");

/* ===============================
   AUTH MIDDLEWARE
=============================== */
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/");
  }
  next();
}

/* ===============================
   ROUTES
=============================== */
// Serve login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Protected profile page
app.get("/pages/profile.html", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/profile.html"));
});

// Protected index page
app.get("/pages/index.html", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/index.html"));
});

/* ===============================
   REGISTER
=============================== */
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }
  try {
    const [existing] = await db.query(
      "SELECT user_id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );
    if (existing.length > 0) return res.status(400).json({ error: "Username or email exists" });

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (username, email, password_hash, avatar_url) VALUES (?, ?, ?, ?)",
      [username, email, hashed, "/avatars/avatar1.png"]
    );

    res.json({ success: true, redirect: "/" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

/* ===============================
   LOGIN
=============================== */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (rows.length === 0) return res.status(400).json({ error: "Invalid credentials" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    req.session.user = { id: user.user_id };
    res.json({ success: true, redirect: "/pages/profile.html" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ===============================
   GET LOGGED-IN USER
=============================== */
app.get("/me", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not logged in" });
  try {
    const [rows] = await db.query(
      "SELECT user_id, username, email, created_at, avatar_url FROM users WHERE user_id = ?",
      [req.session.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

/* ===============================
   UPDATE AVATAR
=============================== */
app.post("/update-avatar", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not logged in" });
  const { avatar_url } = req.body;
  try {
    await db.query(
      "UPDATE users SET avatar_url = ? WHERE user_id = ?",
      [avatar_url, req.session.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Avatar update failed" });
  }
});

/* ===============================
   LOGOUT
=============================== */
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

/* ===============================
   MOVIE ROUTE
=============================== */
app.get("/movie/:title", async (req, res) => {
  const title = req.params.title;
  const apiKey = process.env.OMDB_API_KEY;
  try {
    const response = await axios.get(
      `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`
    );
    const data = response.data;
    if (data.Response === "False") return res.status(404).json({ error: data.Error });
    res.json({
      title: data.Title,
      year: data.Year,
      imdbRating: data.imdbRating,
      boxOffice: data.BoxOffice,
      poster: data.Poster,
      genre: data.Genre,
      director: data.Director,
      actor: data.Actors,
      plot: data.Plot
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Movie fetch failed" });
  }
});

/* ===============================
   START SERVER
=============================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

