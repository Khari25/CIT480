# Movie Comparison App

A full-stack web application that allows users to compare two movies side by side.
The app fetches real-time movie data from the OMDb API and stores movie details in a MySQL database.
It features a React frontend for a dynamic user interface and a Node.js + Express backend to handle API requests and database operations.


# Team Members

| Name             | Role                 | Task                                                        |
| ---------------- | -------------------- | ----------------------------------------------------------- |
| Tyra Haynes      | Documentation Lead   | Created README and build instructions                       |
| Darius Young     | Frontend Developer   | Developed login and registration pages                      |
| Robert Sivertsen | UI/UX Designer       | Enhanced CSS and added user-friendly features               |
| Khari Martin     | Backend Developer    | Set up Express backend and stored OMDb API key in `.env`    |
| Dylan Farias     | Integration Engineer | Connected frontend with backend and optimized interactivity |


# Tech Stack

- Frontend: React (hosted on GitHub Pages)
- Backend: Node.js + Express
- Database: MySQL
- API: OMDb API (https://www.omdbapi.com/)
- IDE: Visual Studio

# Development Environment

 - Visual Studio is used for development, debugging, and testing.
- MySQL is connected to Visual Studio for backend data management.
 - OMDb API key is securely stored in a .env file.


# Installation Instructions

# 1. Clone the repository

bash
git clone https://github.com/Khari25/CIT480.git
cd CIT480

# 2. Install dependencies

bash
npm install


# 3. Set up environment variables

Create a .env file in the root folder and add:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=movie_compare_db
OMDB_API_KEY=your_omdb_api_key

# 4. Run the backend server

bash
npm start

# 5. Run the React frontend

bash
cd frontend
npm start



# How It Works

1. User enters movie titles in the search input fields.
2. React frontend sends a request to the Express backend API.
3. Backend fetches movie data from the OMDb API and returns it to the frontend.
4. Movies are displayed side by side with posters, year, plot, and other details.
5. Movie data is saved in MySQL for future comparisons.


# Project Structure

CIT480/
├── backend/           # Express backend
├── frontend/          # React frontend
├── .env               # Environment variables (OMDb API key, DB credentials)
├── package.json       # Backend dependencies
└── README.md          # Project documentation



# Acknowledgments

 [OMDb API](https://www.omdbapi.com/)
 Node.js
 React
 MySQL
 Visual Studio
