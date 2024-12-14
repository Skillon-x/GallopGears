const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const {
    createInquiry,
    getInquiryById,
    updateInquiryStatus,
    respondToInquiry,
    getSellerInquiries,
    getBuyerInquiries
} = require('../controllers/inquiry.controller');

// Validation middleware
const createInquiryValidation = [
    body('horse').notEmpty().withMessage('Horse ID is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('contactPreference')
        .isIn(['email', 'phone', 'whatsapp'])
        .withMessage('Valid contact preference is required')
];

const updateStatusValidation = [
    body('status')
        .isIn(['pending', 'responded', 'closed'])
        .withMessage('Valid status is required')
];

const respondValidation = [
    body('message').notEmpty().withMessage('Response message is required')
];

// Get all inquiries for a seller
router.get('/seller', protect, authorize('seller'), getSellerInquiries);

// Get all inquiries for a buyer
router.get('/buyer', protect, getBuyerInquiries);

// Get single inquiry
router.get('/:id', protect, getInquiryById);

// Create inquiry
router.post('/', protect, createInquiryValidation, createInquiry);

// Update inquiry status
router.put('/:id/status', protect, authorize('seller'), updateStatusValidation, updateInquiryStatus);

// Respond to inquiry
router.post('/:id/respond', protect, authorize('seller'), respondValidation, respondToInquiry);

module.exports = router; 