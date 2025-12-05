require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// MySQL promise-based connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Lucinda99!',
  database: 'moviesdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

console.log('✅ MySQL pool created');

// Serve login.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Fetch movie from OMDb and save to MySQL
app.get('/movie/:title', async (req, res) => {
  const title = req.params.title;
  const apiKey = process.env.OMDB_API_KEY;

  try {
    const response = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`);
    const movie = response.data;

    if (movie.Response === 'False') {
      return res.status(404).json({ error: 'Movie not found' });
    }

    await db.query(
      'INSERT INTO movies (title, year, imdb_rating) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE imdb_rating = VALUES(imdb_rating)',
      [movie.Title, movie.Year, movie.imdbRating]
    );

    res.json({
      title: movie.Title,
      year: movie.Year,
      poster: movie.Poster,
      imdbRating: movie.imdbRating,
      plot: movie.Plot,
      genre: movie.Genre,
      director: movie.Director,
      actors: movie.Actor
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// REGISTER USER
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if username or email exists
    const [existing] = await db.query(
      "SELECT user_id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await db.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    // SUCCESS: redirect to login page
    res.json({ success: true, message: "User registered successfully!", redirect: '/' });

  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// LOGIN USER
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const user = rows[0];

    // Compare hashed password
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // SUCCESSFUL LOGIN: redirect to main index page
    res.json({
      success: true,
      message: "Login successful!",
      user_id: user.user_id,
      redirect: '/pages/index.html'
    });

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
