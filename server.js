require('dotenv').config(); // Load environment variables at the very beginning
const express = require('express');
const sequelize = require('./config/database'); // Sequelize instance
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
// Parse JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies
app.use(express.urlencoded({extended: true}));

// --- Routes ---
// Authentication routes (login, logout)
app.use('/api/auth', authRoutes);
// User management routes (create user, get user, list users)
app.use('/api/users', userRoutes);

// Basic root route for health check or API info
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Auth API is running successfully!',
        status: 'OK',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        documentation: '/api-docs' // Placeholder for API documentation link
    });
});

// --- Global Error Handler ---
// Catches errors from route handlers and middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack || err.message || err);
    // Avoid sending detailed error messages to the client in production
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'An unexpected error occurred on the server.'
        : err.message || 'Internal Server Error';

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        // Optionally include stack trace in development
        ...(process.env.NODE_ENV !== 'production' && {stack: err.stack}),
    });
});

// --- Start Server and Connect to Database ---
const startServer = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Sync models with the database.
        // It's generally recommended to use migrations for production environments
        // instead of `sequelize.sync()`. `sync()` is fine for development.
        // await sequelize.sync({ force: true }); // Drops and recreates tables - USE WITH CAUTION
        await sequelize.sync(); // Creates tables if they don't exist, does nothing if they do.
        console.log('All models were synchronized with the database successfully.');

        // Start listening for incoming requests
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log(`API base URL: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        const {DB_HOST, DB_USER, DB_PORT, DB_PASSWORD, DB_NAME, DB_DIALECT} = process.env
        console.log("[Tim debug] {DB_HOST, DB_USER, DB_PORT, DB_PASSWORD, DB_NAME, DB_DIALECT}", {
            DB_HOST,
            DB_USER,
            DB_PORT,
            DB_PASSWORD,
            DB_NAME,
            DB_DIALECT
        });

        console.error('Unable to connect to the database or start server:', error);
        process.exit(1); // Exit the process with an error code
    }
};

// Initialize the server
startServer();
