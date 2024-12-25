const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const connectDB = require('./config/database');
const cloudinary = require('cloudinary').v2;

// Load env vars
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ strict: false }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// Custom middleware to handle empty request bodies
app.use((req, res, next) => {
    if (req.method === 'POST' && !req.body) {
        req.body = {};
    }
    next();
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/horses', require('./routes/horse.routes'));
app.use('/api/sellers', require('./routes/seller.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/inquiries', require('./routes/inquiry.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/photos', require('./routes/photo.routes'));
app.use('/api/listings', require('./routes/listing.routes'));
app.use('/api/verification', require('./routes/verification.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/visibility', require('./routes/visibility.routes'));


// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    const startServer = async () => {
        try {
            // Connect to database
            await connectDB();

            // Configure Cloudinary
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET
            });

            const PORT = process.env.PORT || 5000;
            const server = app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });

            // Handle unhandled promise rejections
            process.on('unhandledRejection', (err, promise) => {
                console.log(`Error: ${err.message}`);
                // Close server & exit process
                server.close(() => process.exit(1));
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    };

    startServer();
}

// Export app for testing
module.exports = app; 