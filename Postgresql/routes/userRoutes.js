/**
 * ===================================================
 * Routes for the "users" table
 * ===================================================
 */

const express = require('express'); // Framework for handling routes and HTTP requests
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT validation
const pool = require('../db'); // Database connection configuration
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
 * Get all users for the active tenant
 * ===================================================
 */
router.get('/', validateJWT, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE tenant_id = $1', [req.tenantId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * ===================================================
 * Get a specific user by their ID
 * ===================================================
 */
router.get('/:id', validateJWT, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1 AND tenant_id = $2', [id, req.tenantId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * ===================================================
 * Create a new user
 * ===================================================
 */
router.post('/', validateJWT, async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    try {
        const password_hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (tenant_id, username, email, password_hash, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
            [req.tenantId, username, email, password_hash]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * ===================================================
 * Update an existing user
 * ===================================================
 */
router.put('/:id', validateJWT, async (req, res) => {
    const { id } = req.params;
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    try {
        const password_hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'UPDATE users SET username = $1, email = $2, password_hash = $3 WHERE id = $4 AND tenant_id = $5 RETURNING *',
            [username, email, password_hash, id, req.tenantId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * ===================================================
 * Delete a user
 * ===================================================
 */
router.delete('/:id', validateJWT, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 AND tenant_id = $2 RETURNING *', [id, req.tenantId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

<<<<<<< HEAD
// Export the router to use it in other files
module.exports = router;
=======
module.exports = router;
>>>>>>> 172c3adbcba742cc00b5426af0bce6a3672e341f
