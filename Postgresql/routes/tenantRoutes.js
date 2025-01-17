/**
 * ===================================================
 * Routes for the "tenants" table
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
 * Get all tenants (Admin-Only Example)
 * ===================================================
 */
router.get('/', validateJWT, async (req, res) => {
    try {
        // Query to fetch all tenants (requires admin access in real-world cases)
        const result = await pool.query('SELECT * FROM tenants');
        res.json(result.rows); // Return the results in JSON format
    } catch (err) {
        console.error('Error fetching tenants:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * ===================================================
 * Get a specific tenant by its ID
 * ===================================================
 */
router.get('/:id', validateJWT, async (req, res) => {
    const { id } = req.params; // Extract the tenant ID from the route parameters
    try {
        // Query to fetch a tenant by its ID (validate against tenantId if needed)
        const result = await pool.query('SELECT * FROM tenants WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        res.json(result.rows[0]); // Return the found tenant
    } catch (err) {
        console.error('Error fetching tenant:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * ===================================================
 * Create a new tenant
 * ===================================================
 */
router.post('/', validateJWT, async (req, res) => {
    const { name, domain } = req.body; // Extract new tenant data from the request body
    try {
        // Insert the new tenant into the table
        const result = await pool.query(
            'INSERT INTO tenants (name, domain) VALUES ($1, $2) RETURNING *',
            [name, domain]
        );
        res.status(201).json(result.rows[0]); // Return the newly created tenant with a 201 success code
    } catch (err) {
        console.error('Error creating tenant:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
