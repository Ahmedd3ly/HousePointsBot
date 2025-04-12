const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Test the connection
pool.connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Error connecting to database:', err.message));

  // Expose the `query` method for use in other files
module.exports = pool;
