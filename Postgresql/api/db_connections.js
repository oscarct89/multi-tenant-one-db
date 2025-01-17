/**
 * ===================================================
 * db.js - PostgreSQL Connection Configuration
 * ===================================================
 */

// Import the 'pg' module to interact with PostgreSQL
const { Pool } = require('pg');

// Load environment variables from the .env file
require('dotenv').config();

/**
 * Create a connection pool for PostgreSQL
 * This allows the management of multiple simultaneous connections
 */
const pool = new Pool({
    user: process.env.DB_USER, // Database user defined in .env
    host: process.env.DB_HOST, // Address of the database server
    database: process.env.DB_NAME, // Name of the database to connect to
    password: process.env.DB_PASSWORD, // Password for the database user
    port: process.env.DB_PORT, // Port where PostgreSQL is listening
});

/**
 * Export the pool so it can be used in other files
 * Enables database queries from anywhere in the project
 */
module.exports = pool;
