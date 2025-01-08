const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/database');
const { 
    errorHandler, 
    notFound, 
    validationErrorHandler, 
    databaseErrorHandler, 
    jwtErrorHandler, 
    fileUploadErrorHandler 
} = require('./src/middlewares/error.middleware');
dotenv.config();
// Route imports
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const sellerRoutes = require('./src/routes/seller.routes');
const horseRoutes = require('./src/routes/horse.routes');
const inquiryRoutes = require('./src/routes/inquiry.routes');
const transactionRoutes = require('./src/routes/transaction.routes');
const adminRoutes = require('./src/routes/admin.routes');
const sellerDashboardRoutes = require('./src/routes/seller.dashboard.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const homeRoutes = require('./src/routes/home.routes');
const supportRoutes = require('./src/routes/support.routes');
const searchRoutes = require('./src/routes/search.routes');
const messagingRoutes = require('./src/routes/messaging.routes');
const recommendationRoutes = require('./src/routes/recommendation.routes');
const visibilityRoutes = require('./src/routes/visibility.routes');
const verificationRoutes = require('./src/routes/verification.routes');
const listingRoutes = require('./src/routes/listing.routes');
const photoRoutes = require('./src/routes/photo.routes');

const app = express();

// Connect to MongoDB
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000','https://zippy-belekoy-1fc802.netlify.app','https://precious-klepon-0d036c.netlify.app/','https://precious-klepon-0d036c.netlify.app'], // Your frontend URL
    credentials: true,  // Allow credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get('/api/auth/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running and healthy'
    });
});

// Routes
app.use('/api/home', homeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/horses', horseRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller/dashboard', sellerDashboardRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/messaging', messagingRoutes);

app.use('/api/recommendations', recommendationRoutes);
app.use('/api/visibility', visibilityRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/transactions', transactionRoutes);

// Error handlers
app.use(notFound);
app.use(validationErrorHandler);
app.use(databaseErrorHandler);
app.use(jwtErrorHandler);
app.use(fileUploadErrorHandler);
app.use(errorHandler);

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export for testing
module.exports = app; 