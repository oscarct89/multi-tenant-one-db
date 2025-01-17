/**
 * ===================================================
 * Routes for the "stocks" table (Products)
 * ===================================================
 */

// Import necessary dependencies
const express = require('express'); // Framework for handling routes and HTTP requests
const pool = require('../api/db_connections'); // Database connection configuration
const jwt = require('jsonwebtoken'); // For JWT validation
const router = express.Router(); // Create a router to handle specific routes

/**
 * Middleware to validate JWT and set tenant context
 */
const validateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Authorization token is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.tenantId = decoded.tenantId; // Attach tenantId to the request object
        next();
    } catch (err) {
        console.error('JWT validation error:', err);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

/**
 * ===================================================
 * Get all products for the active tenant
 * ===================================================
 */
router.get('/', validateJWT, async (req, res) => {
    try {
        // Query to fetch all products (stocks) for the active tenant
        const result = await pool.query('SELECT * FROM stocks WHERE tenant_id = $1', [req.tenantId]);
        res.json(result.rows); // Return the products in JSON format
    } catch (err) {
        console.error('Error fetching stocks:', err); // Log the error to the console
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * ===================================================
 * Create a new product
 * ===================================================
 */
router.post('/', validateJWT, async (req, res) => {
    const { product_name, quantity } = req.body; // Extract new product data from the request body
    if (!product_name || quantity == null) {
        return res.status(400).json({ error: 'Product name and quantity are required' });
    }

    try {
        // Insert a new product into the "stocks" table
        const result = await pool.query(
            'INSERT INTO stocks (tenant_id, product_name, quantity, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *',
            [req.tenantId, product_name, quantity]
        );
        res.status(201).json(result.rows[0]); // Return the newly created product with a 201 success code
    } catch (err) {
        console.error('Error creating stock:', err); // Log the error to the console
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
