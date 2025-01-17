const jwt = require('jsonwebtoken'); // Library for handling JSON Web Tokens (JWT)
const pool = require('../api/db_connections'); // Database connection pool
require('dotenv').config(); // Load environment variables from .env file

const tenantMiddleware = async (req, res, next) => {
    try {
        // 🔹 Skip authentication in test mode
        if (process.env.TEST_MODE === 'true') {
            console.log('🔹 Test Mode Activated: Skipping authentication');
            return next(); // Allow the request to proceed without authentication
        }

        // Retrieve the token from the Authorization header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            // If no token is provided, return a 401 Unauthorized response
            return res.status(401).json({ error: 'Authorization token is required' });
        }

        // Verify the JWT token using the secret key from the environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { tenantId } = decoded; // Extract the tenantId from the decoded token payload

        // Validate that tenantId is present and is a valid number
        if (!tenantId || isNaN(tenantId)) {
            return res.status(400).json({ error: 'Tenant ID must be a valid number' });
        }

        // 🔹 Check if the tenant exists in the database
        const query = 'SELECT COUNT(*) FROM tenants WHERE id = $1';
        const result = await pool.query(query, [tenantId]);
        if (result.rows[0].count === '0') {
            // If no matching tenant is found, return a 400 Bad Request response
            return res.status(400).json({ error: 'Invalid tenant' });
        }

        // Set the tenant context for the current database session
        console.log(`Setting tenant ID: ${tenantId}`);
        await pool.query('SET app.tenant_id = $1', [tenantId]);

        // Allow the request to proceed to the next middleware or route handler
        next();
    } catch (err) {
        // Log the error message
        console.error('Error:', err.message);

        // Handle specific JWT errors and return appropriate HTTP status codes
        const statusCode = err.name === 'JsonWebTokenError' ? 401 : 500;
        res.status(statusCode).json({ error: err.message || 'Internal server error' });
    }
};

module.exports = tenantMiddleware; // Export the middleware for use in other parts of the application
