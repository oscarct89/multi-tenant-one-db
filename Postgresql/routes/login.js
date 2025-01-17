/**
 * ===================================================
 * Route for User Login (Supports Any Tenant)
 * ===================================================
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // For password hash comparison
const pool = require('../api/db_connections'); // Database connection configuration
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
        console.log('Attempting login for email:', email);

        // Fetch user details based on the provided email
        const query = 'SELECT id, tenant_id, password_hash FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);

        // If no user is found, return an error
        if (result.rows.length === 0) {
            console.log('Email not found in database.');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const { id, tenant_id, password_hash } = result.rows[0];
        console.log('Found user with Tenant ID:', tenant_id);

        // Compare the provided password with the stored hash
        const isPasswordValid = await bcrypt.compare(password, password_hash);
        if (!isPasswordValid) {
            console.log('Password does not match.');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate a JWT token with tenant ID and user ID
        const token = jwt.sign(
            { userId: id, tenantId: tenant_id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('Generated token for user:', id, 'with Tenant ID:', tenant_id);

        // Return the token and user details
        return res.status(200).json({
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