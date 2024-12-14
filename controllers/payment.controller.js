const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Seller = require('../models/Seller');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Subscription package prices (in paise)
const PACKAGE_PRICES = {
    'Royal Stallion': 999900, // ₹9,999
    'Gallop': 499900, // ₹4,999
    'Trot': 199900, // ₹1,999
    'Starter': 0 // Free
};

// @desc    Create subscription order
// @route   POST /api/payments/subscription/order
// @access  Private (Seller)
exports.createSubscriptionOrder = async (req, res) => {
    try {
        const { package } = req.body;

        // Validate package
        if (!PACKAGE_PRICES.hasOwnProperty(package)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid package selected'
            });
        }

        // Free package doesn't need payment
        if (PACKAGE_PRICES[package] === 0) {
            // Update seller subscription directly
            await req.seller.updateSubscription(package);
            await req.seller.save();

            // Create free transaction record
            await Transaction.create({
                seller: req.seller._id,
                type: 'subscription',
                amount: 0,
                status: 'completed',
                subscriptionDetails: {
                    package,
                    duration: req.seller.subscription.features.listingDuration,
                    startDate: req.seller.subscription.startDate,
                    endDate: req.seller.subscription.endDate
                },
                paymentMethod: 'free'
            });

            return res.json({
                success: true,
                message: 'Free subscription activated'
            });
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: PACKAGE_PRICES[package],
            currency: 'INR',
            receipt: `sub_${req.seller._id}_${Date.now()}`,
            notes: {
                package,
                sellerId: req.seller._id.toString()
            }
        });

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency
            },
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Verify subscription payment
// @route   POST /api/payments/subscription/verify
// @access  Private (Seller)
exports.verifySubscriptionPayment = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            package
        } = req.body;

        // Verify payment signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // Get payment details from Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        // Verify payment amount
        if (payment.amount !== PACKAGE_PRICES[package]) {
            return res.status(400).json({
                success: false,
                message: 'Payment amount mismatch'
            });
        }

        // Update seller subscription
        await req.seller.updateSubscription(package);
        await req.seller.save();

        // Create transaction record
        await Transaction.create({
            seller: req.seller._id,
            type: 'subscription',
            amount: payment.amount / 100, // Convert paise to rupees
            status: 'completed',
            subscriptionDetails: {
                package,
                duration: req.seller.subscription.features.listingDuration,
                startDate: req.seller.subscription.startDate,
                endDate: req.seller.subscription.endDate
            },
            paymentMethod: 'razorpay',
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            razorpaySignature: razorpay_signature
        });

        res.json({
            success: true,
            message: 'Payment verified and subscription activated'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get subscription prices
// @route   GET /api/payments/subscription/prices
// @access  Public
exports.getSubscriptionPrices = async (req, res) => {
    try {
        // Convert paise to rupees for display
        const prices = Object.entries(PACKAGE_PRICES).reduce((acc, [key, value]) => {
            acc[key] = value / 100;
            return acc;
        }, {});

        res.json({
            success: true,
            prices
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private (Seller)
exports.getPaymentHistory = async (req, res) => {
    try {
        const transactions = await Transaction.find({ seller: req.seller._id })
            .sort('-createdAt');

        res.json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}; 