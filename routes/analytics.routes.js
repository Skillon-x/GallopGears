const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
    getMonthlyPerformance,
    getListingPerformance,
    getBuyerEngagement,
    getROIAnalytics
} = require('../controllers/analytics.controller');

// All routes require authentication and seller role
router.use(protect);
router.use(authorize('seller'));

// Performance analytics
router.get('/performance/monthly', getMonthlyPerformance);
router.get('/listings/:id', getListingPerformance);

// Engagement analytics
router.get('/engagement', protect, authorize(['admin', 'seller']), getBuyerEngagement);

// ROI analytics
router.get('/roi', getROIAnalytics);

module.exports = router; 