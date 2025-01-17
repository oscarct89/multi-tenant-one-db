/**
 * ===================================================
 * Route for User Login
 * ===================================================
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../api/db_connections');
require('dotenv').config();

const router = express.Router();

/**
 * POST /login
 * Authenticate user and return a JWT
 */
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Fetch user details based on the provided email
        const result = await pool.query(
            'SELECT id, tenant_id, password_hash FROM users WHERE email = $1',
            [email]
        );

        // If no user is found, return an error
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const { id, tenant_id, password_hash } = result.rows[0];

        // Compare the provided password with the stored hash
        const isPasswordValid = await bcrypt.compare(password, password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate a JWT token with tenant ID and user ID
        const token = jwt.sign(
            { userId: id, tenantId: tenant_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Return the JSON response
        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id,
                email,
                tenantId: tenant_id,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;