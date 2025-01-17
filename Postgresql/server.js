/**
 * ============================================
 * server.js - Main Server File
 * ============================================
 */

const express = require('express'); // Web framework
const path = require('path'); // For file path handling
const cors = require('cors'); // Middleware for CORS
const helmet = require('helmet'); // Middleware for HTTP header security
const rateLimit = require('express-rate-limit'); // Middleware for rate limiting

// Cargar variables de entorno
require('dotenv').config();
console.log('🔍 TEST_MODE desde server.js:', process.env.TEST_MODE);  // Debug log

// 🔹 Forzar Modo Test si está Activado
const isTestMode = process.env.TEST_MODE === 'true';

if (isTestMode) {
    console.log('🔹 Modo Test Activado: Autenticación Deshabilitada');
} else {
    console.log('🔹 Modo Normal: Autenticación Habilitada');
}

// Import routes
const registerRoute = require('./routes/register'); // Route for registration
const loginRoute = require('./routes/login'); // Route for login
const tenantRoutes = require('./routes/tenantRoutes'); // Routes for tenants
const stockRoutes = require('./routes/stockRoutes'); // Routes for stocks
const userRoutes = require('./routes/userRoutes'); // Routes for user profiles
const tenantMiddleware = require('./middleware/tenantMiddleware'); // Middleware for tenant context

// Create an Express application
const app = express();

/**
 * =======================
 * Middleware
 * =======================
 */
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://your-frontend-domain.com', // Restrict origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));

app.use(express.json()); // Middleware to parse JSON body
app.use(express.urlencoded({ extended: true })); // Middleware to parse x-www-form-urlencoded data

// Configure Pug as the template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting for login and registration routes
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Set a realistic limit for stress testing
    message: 'Too many requests, please try again later',
});
app.use('/login', rateLimiter);
app.use('/register', rateLimiter);

/**
 * =======================
 * Routes
 * =======================
 */
app.use('/register', registerRoute); // Register route
app.use('/login', loginRoute); // Login route
app.use('/tenants', tenantMiddleware, tenantRoutes); // Tenant routes
app.use('/stocks', tenantMiddleware, stockRoutes); // Stock routes
app.use('/userprofile', tenantMiddleware, userRoutes); // User profile routes

// Render login page
app.get('/', (req, res) => {
    res.render('loginpage');
});

/**
 * =======================
 * Error Handling
 * =======================
 */
// Handle undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

/**
 * =======================
 * Server Startup
 * =======================
 */
const PORT = process.env.PORT || 3000; // Use port from environment variables or 3000 by default
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} in ${isTestMode ? 'test' : process.env.NODE_ENV || 'development'} mode`);
});
