const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
    getPersonalizedRecommendations,
    getSimilarListings,
    getBreedRecommendations,
    getPriceRangeMatches
} = require('../controllers/recommendation.controller');

// Public routes
router.get('/similar/:horseId', getSimilarListings);

// Protected routes
router.use(protect);
router.get('/personalized', getPersonalizedRecommendations);
router.get('/breeds', getBreedRecommendations);
router.get('/price-matches', getPriceRangeMatches);

module.exports = router; 