const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const {
    updateProfile,
    getFavorites,
    getNotifications,
    markNotificationsRead,
    setAlertPreferences,
    getAlertPreferences
} = require('../controllers/user.controller');

// Validation middleware
const updateProfileValidation = [
    body('name').optional().trim().notEmpty().withMessage('Name is required'),
    body('phone').optional().matches(/^[+]?[\d\s-]+$/).withMessage('Please enter a valid phone number'),
    body('location').optional().isObject().withMessage('Location must be an object'),
    body('location.state').optional().notEmpty().withMessage('State is required'),
    body('location.city').optional().notEmpty().withMessage('City is required'),
    body('location.pincode').optional().matches(/^[0-9]{6}$/).withMessage('Please enter a valid 6-digit pincode'),
    body('preferences').optional().isObject().withMessage('Preferences must be an object')
];

const alertPreferencesValidation = [
    body('priceDrops').isBoolean().withMessage('Price drops must be boolean'),
    body('newListings').isBoolean().withMessage('New listings must be boolean'),
    body('inquiryResponses').isBoolean().withMessage('Inquiry responses must be boolean'),
    body('marketUpdates').isBoolean().withMessage('Market updates must be boolean')
];

// Profile routes
router.put('/profile', protect, updateProfileValidation, updateProfile);

// Favorites routes
router.get('/favorites', protect, getFavorites);

// Notifications routes
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read-all', protect, markNotificationsRead);

// Alert preferences routes
router.get('/alerts', protect, getAlertPreferences);
router.put('/alerts', protect, alertPreferencesValidation, setAlertPreferences);

module.exports = router; 