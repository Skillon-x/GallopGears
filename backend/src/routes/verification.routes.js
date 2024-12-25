const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
    submitForVerification,
    checkBadgeEligibility,
    getPremiumStables,
    getVerificationStatus,
    updateVerificationStatus
} = require('../controllers/verification.controller');

// Public routes
router.get('/premium-stables', getPremiumStables);

// Protected routes
router.use(protect);

// Seller verification routes
router.post('/submit', authorize('seller'), submitForVerification);
router.get('/status', authorize('seller'), getVerificationStatus);
router.get('/badges', authorize('seller'), checkBadgeEligibility);

// Admin routes
router.put('/sellers/:sellerId/verification', authorize('admin'), updateVerificationStatus);

module.exports = router; 