/**
 * ============================================
 * server.js - Main Server File
 * ============================================
 */

<<<<<<< HEAD
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
=======
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const tenantRoutes = require('./routes/tenantRoutes');
const stockRoutes = require('./routes/stockRoutes');
const loginRoute = require('./routes/login');
const tenantMiddleware = require('./middleware/tenantMiddleware');
require('dotenv').config();
>>>>>>> 172c3adbcba742cc00b5426af0bce6a3672e341f

const app = express();

/** 
 * =======================
 * Middleware
 * =======================
 */
app.use(cors({
<<<<<<< HEAD
    origin: process.env.CORS_ORIGIN || 'http://your-frontend-domain.com', // Restrict origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));

app.use(express.json()); // Middleware to parse JSON body
app.use(express.urlencoded({ extended: true })); // Middleware to parse x-www-form-urlencoded data
=======
    origin: process.env.NODE_ENV === 'production' ? 'https://your-frontend-domain.com' : '*', // Allow all in development
}));
app.use(helmet());
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.json()); // Parse JSON data
>>>>>>> 172c3adbcba742cc00b5426af0bce6a3672e341f

// Configure Pug as the template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Apply rate limiting for login route
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
<<<<<<< HEAD
    max: 10000, // Set a realistic limit for stress testing
    message: 'Too many requests, please try again later',
=======
    max: 10, // Limit each IP to 10 login attempts per window
    message: 'Too many login attempts, please try again later',
>>>>>>> 172c3adbcba742cc00b5426af0bce6a3672e341f
});
app.use('/login', loginLimiter);

// Apply tenant middleware only to protected routes
app.use('/tenants', tenantMiddleware);
app.use('/stocks', tenantMiddleware);

/** 
 * =======================
 * Routes
 * =======================
 */
app.use('/login', loginRoute);
app.use('/tenants', tenantRoutes);
app.use('/stocks', stockRoutes);

// Render the login page
app.get('/loginpage', (req, res) => {
    res.render('loginpage');
});

// Default route for the homepage
app.get('/', (req, res) => {
    res.render('loginpage'); // Render loginpage as the default view
});

/** 
 * =======================
 * Error Handling
 * =======================
 */
// Handle undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res) => {
    console.error(err.stack);
    const statusCode = err.status || 500;

    // If it's an API request, return JSON
    if (req.path && req.path.startsWith('/api')) {
        return res.status(statusCode).json({ error: err.message || 'Internal server error' });
    }

    // Render error view for HTML requests
    res.status(statusCode).render('error', { message: err.message || 'Internal server error' });
});

/** 
 * =======================
 * Server Startup
 * =======================
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} in ${isTestMode ? 'test' : process.env.NODE_ENV || 'development'} mode`);
});
