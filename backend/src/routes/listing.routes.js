const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
    verifyListingLimits,
    boostListing,
    submitForVerification,
    getVerificationStatus
} = require('../controllers/listing.controller');

// All routes require authentication
router.use(protect);
router.use(authorize('seller'));

// Get listing limits
router.get('/verify-limits', verifyListingLimits);

// Boost listing
router.post('/:id/boost', boostListing);

// Verification routes
router.post('/:id/verify', submitForVerification);
router.get('/:id/verification', getVerificationStatus);

module.exports = router; 