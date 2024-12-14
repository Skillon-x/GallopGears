const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
    verifyBuyer,
    getSellerContactAccess,
    trackActivity,
    scoreInquiryQuality
} = require('../controllers/buyer.interaction.controller');

// Protected routes - all require authentication
router.use(protect);

// Buyer verification
router.post('/verify', verifyBuyer);

// Contact access
router.post('/contact-access/:sellerId', getSellerContactAccess);

// Activity tracking
router.post('/activity/:horseId', trackActivity);

// Inquiry scoring (seller only)
router.post('/score-inquiry/:inquiryId', authorize('seller'), scoreInquiryQuality);

module.exports = router; 