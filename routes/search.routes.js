const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const {
    advancedSearch,
    saveSearchPreferences,
    getSavedSearches,
    getSearchSuggestions
} = require('../controllers/search.controller');

// Validation middleware
const searchValidation = [
    body('filters').isObject().withMessage('Filters must be an object'),
    body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    body('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
];

const preferencesValidation = [
    body('preferences').isObject().withMessage('Preferences must be an object'),
    body('preferences.breeds').optional().isArray().withMessage('Breeds must be an array'),
    body('preferences.priceRange').optional().isObject().withMessage('Price range must be an object'),
    body('preferences.location').optional().isObject().withMessage('Location must be an object')
];

// Public routes
router.post('/', searchValidation, advancedSearch);
router.get('/suggestions', getSearchSuggestions);

// Protected routes
router.post('/preferences', protect, preferencesValidation, saveSearchPreferences);
router.get('/saved', protect, getSavedSearches);

module.exports = router; 