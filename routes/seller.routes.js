const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const Seller = require('../models/Seller');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');
const { validateSubscription } = require('../src/utils/validation');

const {
    getMe,
    createProfile,
    updateProfile,
    updateBankDetails,
    getPaymentHistory,
    getAnalytics,
    getListings,
    getInquiries,
    getReviews,
    addReview,
    updateSubscription,
    cancelSubscription,
    getSubscriptionDetails
} = require('../controllers/seller.controller');

// Get subscription plans
router.get('/plans', async (req, res) => {
    try {
        const plans = [
            {
                id: 'starter',
                name: 'Starter',
                price: 0,
                features: [
                    'Up to 2 horse listings',
                    'Basic analytics',
                    'Email support'
                ],
                duration: 'forever'
            },
            {
                id: 'gallop',
                name: 'Gallop',
                price: 4999,
                features: [
                    'Up to 10 horse listings',
                    'Advanced analytics',
                    'Priority email support',
                    'Featured listings',
                    'Social media promotion'
                ],
                duration: '30 days'
            },
            {
                id: 'royal_stallion',
                name: 'Royal Stallion',
                price: 9999,
                features: [
                    'Unlimited horse listings',
                    'Premium analytics',
                    '24/7 priority support',
                    'Featured listings',
                    'Social media promotion',
                    'Custom branding',
                    'Verified seller badge'
                ],
                duration: '30 days'
            }
        ];

        res.json({
            success: true,
            plans
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Subscribe to a plan
router.post('/subscribe', protect, authorize('seller'), async (req, res) => {
    try {
        const { package: packageName, duration } = req.body;

        // Validate package
        const validPackages = ['Royal Stallion', 'Gallop', 'Trot'];
        if (!validPackages.includes(packageName)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid package selected'
            });
        }

        // Create subscription transaction
        const transaction = await Transaction.create({
            seller: req.user._id,
            type: 'subscription',
            amount: packageName === 'Royal Stallion' ? 9999 : 
                    packageName === 'Gallop' ? 4999 : 999,
            status: 'pending',
            subscriptionDetails: {
                package: packageName,
                duration: duration || 30, // Default to 30 days
                startDate: new Date(),
                endDate: new Date(Date.now() + (duration || 30) * 24 * 60 * 60 * 1000)
            }
        });

        // Update seller subscription
        const seller = await Seller.findOneAndUpdate(
            { user: req.user._id },
            {
                subscription: {
                    plan: packageName,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + (duration || 30) * 24 * 60 * 60 * 1000),
                    status: 'active',
                    transaction: transaction._id
                }
            },
            { new: true }
        );

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'subscription_purchase',
            entityType: 'subscription',
            entityId: transaction._id,
            description: `Subscribed to ${packageName} package`,
            status: 'success'
        });

        res.json({
            success: true,
            subscription: seller.subscription,
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

// Create seller profile
router.post('/profile', protect, async (req, res) => {
    try {
        const seller = await req.user.model('Seller').create({
            user: req.user._id,
            ...req.body
        });

        // Update user role to seller
        req.user.role = 'seller';
        await req.user.save();

        res.status(201).json({
            success: true,
            seller
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get seller profile
router.get('/me', protect, authorize('seller'), getMe);

// Update seller profile
router.put('/profile', protect, authorize('seller'), updateProfile);

// Bank details
router.put('/bank-details', protect, authorize('seller'), updateBankDetails);

// Payment history
router.get('/payments', protect, authorize('seller'), getPaymentHistory);

// Analytics
router.get('/analytics', protect, authorize('seller'), getAnalytics);

// Listings
router.get('/listings', protect, authorize('seller'), getListings);

// Inquiries
router.get('/inquiries', protect, authorize('seller'), getInquiries);

// Reviews
router.get('/reviews', protect, authorize('seller'), getReviews);
router.post('/reviews', protect, addReview);

// Subscription management
router.put('/subscription', protect, authorize('seller'), updateSubscription);
router.delete('/subscription', protect, authorize('seller'), cancelSubscription);
router.get('/subscription', protect, authorize('seller'), getSubscriptionDetails);

module.exports = router;