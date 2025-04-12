const { Pool } = require("pg");

// Create a new pool instance to connect to the database
const pool = new Pool({
  user: process.env.DB_USER, // Replace with your PostgreSQL username
  host: process.env.DB_HOST, // Replace with your host (usually 'localhost')
  database: process.env.DB_NAME, // Replace with your PostgreSQL database name
  password: process.env.DB_PASS, // Replace with your PostgreSQL password
  port: 5432, // PostgreSQL port (default is 5432)
});

// Function to create the houses table
const createTables = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS house_points (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        points INTEGER DEFAULT 0
    );
  `;

  try {
    await pool.query(query);
    console.log("Table 'house_points' is ready.");
  } catch (err) {
    console.error("Error creating table:", err);
  }
};

// Call the createTables function
createTables();

// Export the query function to interact with the database
module.exports = {
  query: (text, params) => pool.query(text, params),
};
