const express = require('express');
const router = express.Router();
const { protect, authorize, checkHorseOwnership } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const {
    createHorseListing,
    getHorses,
    getHorseById,
    updateHorseListing,
    deleteHorseListing,
    getFeaturedHorses,
    getCategories,
    getPriceRanges,
    searchHorses,
    addToFavorites,
    removeFromFavorites
} = require('../controllers/horse.controller');

// Validation middleware
const createHorseValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('breed').notEmpty().withMessage('Breed is required'),
    body('age').isObject().withMessage('Age must be an object'),
    body('age.years').isInt({ min: 0 }).withMessage('Years must be a positive number'),
    body('age.months').isInt({ min: 0, max: 11 }).withMessage('Months must be between 0 and 11'),
    body('gender').isIn(['Stallion', 'Mare', 'Gelding']).withMessage('Invalid gender'),
    body('color').notEmpty().withMessage('Color is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('description').notEmpty().withMessage('Description is required'),
    body('location').isObject().withMessage('Location must be an object'),
    body('location.state').notEmpty().withMessage('State is required'),
    body('location.city').notEmpty().withMessage('City is required'),
    body('location.pincode').matches(/^[0-9]{6}$/).withMessage('Please enter a valid 6-digit pincode'),
    body('specifications').isObject().withMessage('Specifications must be an object'),
    body('specifications.training').isIn(['Basic', 'Intermediate', 'Advanced']).withMessage('Invalid training level'),
    body('specifications.discipline').isArray().withMessage('Discipline must be an array'),
    body('specifications.temperament').notEmpty().withMessage('Temperament is required'),
    body('specifications.healthStatus').notEmpty().withMessage('Health status is required'),
    body('listingStatus').optional().isIn(['draft', 'active', 'sold', 'inactive']).withMessage('Invalid listing status')
];

const updateHorseValidation = [
    body('name').optional().trim().notEmpty().withMessage('Name is required'),
    body('breed').optional().notEmpty().withMessage('Breed is required'),
    body('age').optional().isObject().withMessage('Age must be an object'),
    body('age.years').optional().isInt({ min: 0 }).withMessage('Years must be a positive number'),
    body('age.months').optional().isInt({ min: 0, max: 11 }).withMessage('Months must be between 0 and 11'),
    body('gender').optional().isIn(['Stallion', 'Mare', 'Gelding']).withMessage('Invalid gender'),
    body('color').optional().notEmpty().withMessage('Color is required'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('description').optional().notEmpty().withMessage('Description is required'),
    body('location').optional().isObject().withMessage('Location must be an object'),
    body('location.state').optional().notEmpty().withMessage('State is required'),
    body('location.city').optional().notEmpty().withMessage('City is required'),
    body('location.pincode').optional().matches(/^[0-9]{6}$/).withMessage('Please enter a valid 6-digit pincode'),
    body('specifications').optional().isObject().withMessage('Specifications must be an object'),
    body('specifications.training').optional().isIn(['Basic', 'Intermediate', 'Advanced']).withMessage('Invalid training level'),
    body('specifications.discipline').optional().isArray().withMessage('Discipline must be an array'),
    body('specifications.temperament').optional().notEmpty().withMessage('Temperament is required'),
    body('specifications.healthStatus').optional().notEmpty().withMessage('Health status is required'),
    body('listingStatus').optional().isIn(['draft', 'active', 'sold', 'inactive']).withMessage('Invalid listing status')
];

// Public routes for buyers
router.get('/featured', getFeaturedHorses);
router.get('/categories', getCategories);
router.get('/price-ranges', getPriceRanges);
router.get('/search', searchHorses);

// Get all horses
router.get('/', getHorses);

// Get single horse
router.get('/:id', getHorseById);

// Create horse listing (Seller only)
router.post('/', protect, authorize('seller'), createHorseValidation, createHorseListing);

// Update horse listing (Seller only)
router.put('/:id', protect, authorize('seller'), checkHorseOwnership, updateHorseValidation, updateHorseListing);

// Delete horse listing (Seller only)
router.delete('/:id', protect, authorize('seller'), checkHorseOwnership, deleteHorseListing);

// Favorites management (Authenticated users)
router.post('/:id/favorite', protect, addToFavorites);
router.delete('/:id/favorite', protect, removeFromFavorites);

module.exports = router; 