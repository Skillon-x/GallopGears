const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { 
    errorHandler, 
    notFound, 
    validationErrorHandler, 
    databaseErrorHandler, 
    jwtErrorHandler, 
    fileUploadErrorHandler 
} = require('./middlewares/error.middleware');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const sellerRoutes = require('./routes/seller.routes');
const horseRoutes = require('./routes/horse.routes');
const inquiryRoutes = require('./routes/inquiry.routes');
const transactionRoutes = require('./routes/transaction.routes');
const adminRoutes = require('./routes/admin.routes');
const sellerDashboardRoutes = require('./routes/seller.dashboard.routes');
const paymentRoutes = require('./routes/payment.routes');
const homeRoutes = require('./routes/home.routes');
const supportRoutes = require('./routes/support.routes');
const searchRoutes = require('./routes/search.routes');
const messagingRoutes = require('./routes/messaging.routes');
const reviewRoutes = require('./routes/review.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const visibilityRoutes = require('./routes/visibility.routes');
const verificationRoutes = require('./routes/verification.routes');
const listingRoutes = require('./routes/listing.routes');
const photoRoutes = require('./routes/photo.routes');

const app = express();

// Connect to MongoDB
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

// Middleware
app.use(cors());
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
app.use('/api/reviews', reviewRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/visibility', visibilityRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/photos', photoRoutes);

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