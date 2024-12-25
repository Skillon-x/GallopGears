const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
    addToSpotlight,
    getFeaturedListings,
    shareOnSocial,
    getVisibilityStats
} = require('../controllers/visibility.controller');

// Public routes
router.get('/featured', getFeaturedListings);

// Protected routes
router.use(protect);

// Seller visibility routes
router.post('/spotlight/:horseId', authorize('seller'), addToSpotlight);
router.post('/share/:horseId', authorize('seller'), shareOnSocial);
router.get('/stats/:horseId', authorize('seller'), getVisibilityStats);

module.exports = router; 