const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const Seller = require('../models/Seller');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');
const Horse = require('../models/Horse');
const { validateSubscription } = require('../src/utils/validation');
const { createOrder, verifyPayment } = require('../controllers/payment.controller');
const jwt = require('jsonwebtoken');
const { SUBSCRIPTION_FEATURES } = require('../models/Subscription');

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
    getSubscriptionDetails,
    deleteSeller
} = require('../controllers/seller.controller');

// Get subscription plans
router.get('/plans', async (req, res) => {
    try {
        const plans = [
            {
                id: 'royal_stallion',
                name: 'Royal Stallion',
                price: 9999,
                features: {
                    ...SUBSCRIPTION_FEATURES['Royal Stallion'],
                    maxListings: '9999 listings',
                    maxPhotos: '20 photos per listing',
                    listingDuration: '90 days listing duration',
                    verificationLevel: 'Premium verification',
                    virtualStableTour: 'Virtual stable tour',
                    analytics: 'Advanced analytics',
                    homepageSpotlight: '5 homepage spotlight slots',
                    featuredListingBoosts: {
                        count: '3 featured listing boosts',
                        duration: '7 days per boost'
                    },
                    priorityPlacement: 'Priority placement in search',
                    badges: ['Top Seller', 'Premium Stable'],
                    searchPlacement: 'Premium search placement',
                    socialMediaSharing: 'Social media promotion',
                    seriousBuyerAccess: 'Serious buyer access'
                },
                duration: '30 days'
            },
            {
                id: 'gallop',
                name: 'Gallop',
                price: 4999,
                features: {
                    ...SUBSCRIPTION_FEATURES['Gallop'],
                    maxListings: '10 listings',
                    maxPhotos: '10 photos per listing',
                    listingDuration: '60 days listing duration',
                    verificationLevel: 'Basic verification',
                    virtualStableTour: 'Not included',
                    analytics: 'Basic analytics',
                    homepageSpotlight: '2 homepage spotlight slots',
                    featuredListingBoosts: {
                        count: '1 featured listing boost',
                        duration: '5 days per boost'
                    },
                    priorityPlacement: 'Standard placement',
                    badges: ['Verified Seller'],
                    searchPlacement: 'Standard search placement',
                    socialMediaSharing: 'Social media sharing',
                    seriousBuyerAccess: 'Not included'
                },
                duration: '30 days'
            },
            {
                id: 'trot',
                name: 'Trot',
                price: 1999,
                features: {
                    ...SUBSCRIPTION_FEATURES['Trot'],
                    maxListings: '5 listings',
                    maxPhotos: '5 photos per listing',
                    listingDuration: '30 days listing duration',
                    verificationLevel: 'Basic verification',
                    virtualStableTour: 'Not included',
                    analytics: 'Not included',
                    homepageSpotlight: 'Not included',
                    featuredListingBoosts: {
                        count: 'Not included',
                        duration: 'Not included'
                    },
                    priorityPlacement: 'Standard placement',
                    badges: ['Basic Seller'],
                    searchPlacement: 'Standard search placement',
                    socialMediaSharing: 'Not included',
                    seriousBuyerAccess: 'Not included'
                },
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
        const validPackages = ['Free', 'Royal Stallion', 'Gallop', 'Trot'];
        if (!validPackages.includes(packageName)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid package selected'
            });
        }

        // Get features for the package
        const features = SUBSCRIPTION_FEATURES[packageName];
        if (!features) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription package'
            });
        }

        // Create exact feature object
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
            badges: [...features.badges],
            searchPlacement: features.searchPlacement,
            socialMediaSharing: features.socialMediaSharing,
            seriousBuyerAccess: features.seriousBuyerAccess
        };

        // Create subscription transaction
        const transaction = await Transaction.create({
            seller: req.user._id,
            type: 'subscription',
            amount: packageName === 'Royal Stallion' ? 9999 : 
                    packageName === 'Gallop' ? 4999 : 
                    packageName === 'Trot' ? 1999 : 0,
            status: 'completed',
            subscriptionDetails: {
                package: packageName,
                duration: packageName === 'Free' ? 'Unlimited' : (duration || 30),
                startDate: new Date(),
                endDate: packageName === 'Free' ? null : new Date(Date.now() + (duration || 30) * 24 * 60 * 60 * 1000)
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
                    transaction: transaction._id,
                    features: subscriptionFeatures
                }
            },
            { 
                new: true,
                runValidators: true
            }
        ).populate('subscription.transaction');

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
        // Create seller with inactive subscription status and features
        const seller = await Seller.create({
            user: req.user._id,
            businessName: req.body.businessName,
            description: req.body.description,
            location: req.body.location,
            contactDetails: req.body.contactDetails,
            subscription: {
                plan: null,
                status: 'inactive',
                startDate: null,
                endDate: null,
                features: {
                    maxPhotos: 0,
                    maxListings: 0,
                    listingDuration: 0,
                    verificationLevel: 'none',
                    virtualStableTour: false,
                    analytics: false,
                    homepageSpotlight: 0,
                    featuredListingBoosts: {
                        count: 0,
                        duration: 0
                    },
                    priorityPlacement: false,
                    badges: [],
                    searchPlacement: 'none',
                    socialMediaSharing: false,
                    seriousBuyerAccess: false
                }
            }
        });

        // Update user role to seller
        const user = await User.findById(req.user._id);
        user.role = 'seller';
        await user.save();

        // Generate new token with updated role
        const token = jwt.sign(
            { 
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
            seller,
            token
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

// Razorpay payment routes
router.post('/subscribe/create-order', protect, authorize('seller'), createOrder);
router.post('/subscribe/verify-payment', protect, authorize('seller'), verifyPayment);

// Admin Routes
router.delete('/admin/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        // Delete all horse listings by this seller
        await Horse.deleteMany({ seller: seller._id });

        // Delete seller's transactions
        await Transaction.deleteMany({ seller: seller._id });

        // Delete seller's activity logs
        await ActivityLog.deleteMany({ user: seller.user });

        // Delete seller profile
        await seller.remove();

        // Update user role back to 'user'
        await User.findByIdAndUpdate(seller.user, { role: 'user' });

        res.json({
            success: true,
            message: 'Seller and all associated data deleted successfully'
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