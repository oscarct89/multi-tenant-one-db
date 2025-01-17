/**
 * ===================================================
 * Routes for User Profile Management
 * ===================================================
 */

const express = require('express'); // Framework for handling routes and HTTP requests
const pool = require('../api/db_connections'); // Database connection configuration
const router = express.Router(); // Create a router to handle specific routes

/**
 * ===================================================
 * Get all users for the active tenant
 * ===================================================
 */
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE tenant_id = current_setting(\'app.tenant_id\')::INT'
        );
        res.json(result.rows); // Return the results in JSON format
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
router.get('/:id', async (req, res) => {
    const { id } = req.params; // Extract the user ID from the route parameters
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1 AND tenant_id = current_setting(\'app.tenant_id\')::INT',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]); // Return the found user
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
router.post('/', async (req, res) => {
    const { username, email, password_hash } = req.body; // Extract new user data from the request body
    if (!username || !email || !password_hash) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO users (tenant_id, username, email, password_hash, created_at) VALUES (current_setting(\'app.tenant_id\')::INT, $1, $2, $3, CURRENT_TIMESTAMP) RETURNING *',
            [username, email, password_hash]
        );
        res.status(201).json(result.rows[0]); // Return the newly created user with a 201 status code
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
router.put('/:id', async (req, res) => {
    const { id } = req.params; // Extract the user ID from the route parameters
    const { username, email, password_hash } = req.body; // Extract updated data from the request body

    if (!username || !email || !password_hash) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const result = await pool.query(
            'UPDATE users SET username = $1, email = $2, password_hash = $3 WHERE id = $4 AND tenant_id = current_setting(\'app.tenant_id\')::INT RETURNING *',
            [username, email, password_hash, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]); // Return the updated user
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
router.delete('/:id', async (req, res) => {
    const { id } = req.params; // Extract the user ID from the route parameters

    try {
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 AND tenant_id = current_setting(\'app.tenant_id\')::INT RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully', user: result.rows[0] });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export the router to use it in other files
module.exports = router;