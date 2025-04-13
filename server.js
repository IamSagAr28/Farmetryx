const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const apiRoutes = require(path.join(__dirname, 'src', 'routes', 'api.js'));

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware for parsing JSON and form data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enable CORS for all routes
app.use(cors({
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Content-Type', 'multipart/form-data'],
    credentials: true,
    exposedHeaders: ['Content-Disposition']
}));

// Add more detailed request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);
    if (req.file) {
        console.log('Uploaded file:', req.file);
    }
    next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Use API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Available routes:');
    console.log('- POST /api/detect-disease');
    console.log('- GET /api/market-prices');
}); 