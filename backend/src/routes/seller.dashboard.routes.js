const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
    getDashboardStats,
    getPerformanceMetrics,
    getListingAnalytics,
    getInquiryAnalytics
} = require('../controllers/seller.dashboard.controller');

// All routes are protected and require seller role
router.use(protect);
router.use(authorize('seller'));

// Get dashboard stats
router.get('/stats', getDashboardStats);

// Get performance metrics
router.get('/performance', getPerformanceMetrics);

// Get listing analytics
router.get('/analytics/listings', getListingAnalytics);

// Get inquiry analytics
router.get('/analytics/inquiries', getInquiryAnalytics);

module.exports = router; 