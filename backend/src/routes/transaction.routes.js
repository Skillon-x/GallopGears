const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransactionStatus,
    getSellerTransactions,
    getAdminTransactions
} = require('../controllers/transaction.controller');

// Validation middleware
const createTransactionValidation = [
    body('horse').notEmpty().withMessage('Horse ID is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('paymentMethod')
        .isIn(['razorpay', 'bank_transfer', 'platform'])
        .withMessage('Valid payment method is required')
];

const updateStatusValidation = [
    body('status')
        .isIn(['pending', 'completed', 'failed', 'refunded'])
        .withMessage('Valid status is required')
];

// Get all transactions (Admin only)
router.get('/admin', protect, authorize('admin'), getAdminTransactions);

// Get seller's transactions
router.get('/seller', protect, authorize('seller'), getSellerTransactions);

// Get all transactions for current user
router.get('/', protect, getTransactions);

// Get single transaction
router.get('/:id', protect, getTransactionById);

// Create transaction
router.post('/', protect, createTransactionValidation, createTransaction);

// Update transaction status (Admin only)
router.put('/:id/status', protect, authorize('admin'), updateStatusValidation, updateTransactionStatus);

module.exports = router; 