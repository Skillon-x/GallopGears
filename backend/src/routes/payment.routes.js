const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Get Razorpay key
// @route   GET /api/payments/key
// @access  Public
router.get('/key', (req, res) => {
    res.json({
        success: true,
        key: process.env.RAZORPAY_KEY_ID
    });
});

// @desc    Create payment order
// @route   POST /api/payments/create
// @access  Private
router.post('/create', protect, async (req, res) => {
    try {
        const { amount, currency = 'INR', notes } = req.body;

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt: `order_${Date.now()}`,
            notes: {
                ...notes,
                userId: req.user._id.toString()
            },
            payment_capture: 1
        });

        // Create a pending transaction
        const transaction = await Transaction.create({
            seller: req.user._id,
            type: notes?.type || 'subscription',
            amount: amount,
            currency,
            status: 'pending',
            razorpayOrderId: order.id,
            paymentMethod: 'razorpay',
            subscriptionDetails: {
                package: notes?.package || 'Royal Stallion',
                duration: notes?.duration || 1
            }
        });

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency
            },
            transaction: transaction._id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
router.post('/verify', protect, async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // Update transaction status
        const transaction = await Transaction.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            {
                status: 'completed',
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature
            },
            { new: true }
        );

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        // Handle subscription activation if it's a subscription payment
        if (transaction.type === 'subscription') {
            const seller = await req.user.model('Seller').findOne({ user: req.user._id });
            if (seller) {
                const duration = transaction.subscriptionDetails?.duration || 1;
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + (duration * 30)); // Add months

                seller.subscription = {
                    plan: transaction.subscriptionDetails?.package || 'Royal Stallion',
                    status: 'active',
                    startDate: new Date(),
                    expiresAt: expiryDate
                };
                await seller.save();
            }
        }

        res.json({
            success: true,
            transaction
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get payment details
// @route   GET /api/payments/:paymentId
// @access  Private
router.get('/:paymentId', protect, async (req, res) => {
    try {
        const payment = await razorpay.payments.fetch(req.params.paymentId);
        res.json({
            success: true,
            payment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Create test payment (only in development)
// @route   POST /api/payments/test
// @access  Private
router.post('/test', protect, async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(404).json({
            success: false,
            message: 'Endpoint not available in production'
        });
    }

    try {
        const { amount = 500, currency = 'INR' } = req.body;

        // Create a test order
        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency,
            receipt: `test_${Date.now()}`,
            notes: {
                isTest: true,
                userId: req.user._id.toString()
            },
            payment_capture: 1
        });

        // Create a test transaction
        const transaction = await Transaction.create({
            seller: req.user._id,
            type: 'subscription',
            amount,
            currency,
            status: 'pending',
            razorpayOrderId: order.id,
            paymentMethod: 'razorpay',
            subscriptionDetails: {
                package: 'Royal Stallion',
                duration: 1
            }
        });

        res.json({
            success: true,
            message: 'Test payment initiated',
            testData: {
                key: process.env.RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Galloping Gears",
                description: "Test Payment",
                order_id: order.id,
                prefill: {
                    name: req.user.name,
                    email: req.user.email
                },
                notes: {
                    transactionId: transaction._id.toString()
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router; 