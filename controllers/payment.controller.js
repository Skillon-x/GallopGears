const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Seller = require('../models/Seller');
const { SUBSCRIPTION_FEATURES } = require('../models/Subscription');

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

// Add test mode flag
const isTestMode = process.env.NODE_ENV === 'test';

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
            package: packageName,
            duration
        } = req.body;

        // Skip signature verification in test mode
        if (!isTestMode) {
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
        }

        // Get subscription features for the package
        const features = SUBSCRIPTION_FEATURES[packageName];
        if (!features) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription package'
            });
        }

        // Create transaction record
        const transaction = await Transaction.create({
            seller: req.user._id,
            type: 'subscription',
            amount: req.body.amount,
            status: 'completed',
            paymentMethod: isTestMode ? 'test' : 'razorpay',
            paymentDetails: {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature
            },
            subscriptionDetails: {
                package: packageName,
                duration: duration || 30,
                startDate: new Date(),
                endDate: new Date(Date.now() + (duration || 30) * 24 * 60 * 60 * 1000)
            }
        });

        // Create exact feature object with deep copy of arrays and objects
        const subscriptionFeatures = {
            maxPhotos: features.maxPhotos,
            maxListings: features.maxListings,
            listingDuration: features.listingDuration,
            verificationLevel: features.verificationLevel,
            virtualStableTour: features.virtualStableTour,
            analytics: features.analytics,
            homepageSpotlight: features.homepageSpotlight,
            featuredListingBoosts: {
                count: features.featuredListingBoosts.count,
                duration: features.featuredListingBoosts.duration
            },
            priorityPlacement: features.priorityPlacement,
            badges: Array.isArray(features.badges) ? [...features.badges] : [],
            searchPlacement: features.searchPlacement,
            socialMediaSharing: features.socialMediaSharing,
            seriousBuyerAccess: features.seriousBuyerAccess
        };

        // Update seller subscription
        const seller = await Seller.findOneAndUpdate(
            { user: req.user._id },
            {
                subscription: {
                    plan: packageName,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + (duration || 30) * 24 * 60 * 60 * 1000),
                    status: 'active',
                    transaction: transaction._id,
                    features: subscriptionFeatures
                }
            },
            { 
                new: true,
                runValidators: true
            }
        ).populate('subscription.transaction');

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        res.json({
            success: true,
            subscription: seller.subscription,
            transaction
        });
    } catch (error) {
        console.error('Error verifying subscription payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment'
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

// Create Razorpay order
exports.createOrder = async (req, res) => {
    try {
        const { package: packageName, duration, amount } = req.body;

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            receipt: `order_${Date.now()}`,
            notes: {
                package: packageName,
                duration: duration
            }
        });

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order'
        });
    }
};

// Verify Razorpay payment
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            package: packageName,
            duration
        } = req.body;

        // Skip signature verification in test mode
        if (!isTestMode) {
            // Verify signature
            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payment signature'
                });
            }
        }

        // Get subscription features for the package
        const features = SUBSCRIPTION_FEATURES[packageName];
        if (!features) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription package'
            });
        }

        // Create transaction record
        const transaction = await Transaction.create({
            seller: req.user._id,
            type: 'subscription',
            amount: req.body.amount,
            status: 'completed',
            paymentMethod: isTestMode ? 'test' : 'razorpay',
            paymentDetails: {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature
            },
            subscriptionDetails: {
                package: packageName,
                duration: duration,
                startDate: new Date(),
                endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
            }
        });

        // Create exact feature object with deep copy of arrays and objects
        const subscriptionFeatures = {
            maxPhotos: features.maxPhotos,
            maxListings: features.maxListings,
            listingDuration: features.listingDuration,
            verificationLevel: features.verificationLevel,
            virtualStableTour: features.virtualStableTour,
            analytics: features.analytics,
            homepageSpotlight: features.homepageSpotlight,
            featuredListingBoosts: {
                count: features.featuredListingBoosts.count,
                duration: features.featuredListingBoosts.duration
            },
            priorityPlacement: features.priorityPlacement,
            badges: Array.isArray(features.badges) ? [...features.badges] : [],
            searchPlacement: features.searchPlacement,
            socialMediaSharing: features.socialMediaSharing,
            seriousBuyerAccess: features.seriousBuyerAccess
        };

        // Update seller subscription with lean: false to enable getters
        const seller = await Seller.findOneAndUpdate(
            { user: req.user._id },
            {
                subscription: {
                    plan: packageName,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
                    status: 'active',
                    transaction: transaction._id,
                    features: subscriptionFeatures
                }
            },
            { 
                new: true,
                runValidators: true,
                lean: false
            }
        ).populate('subscription.transaction');

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        // Convert to object to trigger getters
        const sellerObj = seller.toObject();

        res.json({
            success: true,
            subscription: sellerObj.subscription,
            transaction
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment'
        });
    }
}; 