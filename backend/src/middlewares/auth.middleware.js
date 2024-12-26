const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Horse = require('../models/Horse');
const ActivityLog = require('../models/ActivityLog');

// Protect routes
exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // If user is a seller, check subscription status
        if (req.user.role === 'seller') {
            const seller = await Seller.findOne({ user: req.user._id });
            if (seller && seller.subscription) {
                // Check if subscription has expired
                if (seller.subscription.status === 'active' && 
                    seller.subscription.endDate && 
                    new Date() > new Date(seller.subscription.endDate)) {
                    
                    // Update subscription status to expired
                    seller.subscription = {
                        ...seller.subscription,
                        status: 'expired',
                        features: {
                            maxPhotos: 1,
                            maxListings: 1,
                            listingDuration: 7,
                            verificationLevel: 'basic',
                            virtualStableTour: false,
                            analytics: false,
                            homepageSpotlight: 0,
                            featuredListingBoosts: {
                                count: 0,
                                duration: 0
                            },
                            priorityPlacement: false,
                            badges: ['Free User'],
                            searchPlacement: 'basic',
                            socialMediaSharing: false,
                            seriousBuyerAccess: false
                        }
                    };
                    await seller.save();

                    // Log the expiry
                    await ActivityLog.create({
                        user: req.user._id,
                        action: 'subscription_expired',
                        entityType: 'subscription',
                        entityId: seller._id,
                        description: `Subscription expired for plan: ${seller.subscription.plan}`,
                        status: 'success'
                    });
                }
                req.seller = seller;
            }
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return async (req, res, next) => {
        // Special case for seller profile creation
        if (roles.includes('user') && req.path === '/profile' && req.method === 'POST') {
            if (req.user.role !== 'user') {
                return res.status(403).json({
                    success: false,
                    message: 'Only users can create seller profiles'
                });
            }
            return next();
        }

        // Special case for seller role
        if (roles.includes('seller')) {
            // Check if user has seller role
            if (req.user.role !== 'seller') {
                return res.status(403).json({
                    success: false,
                    message: 'Seller role required'
                });
            }

            // Check if seller profile exists
            const seller = await Seller.findOne({ user: req.user._id });
            if (!seller) {
                // Revert role to user if profile doesn't exist
                req.user.role = 'user';
                await req.user.save();
                return res.status(403).json({
                    success: false,
                    message: 'Seller profile required'
                });
            }

            req.seller = seller;
            return next();
        }

        // For other roles
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }

        next();
    };
};

// Check if seller's subscription is active
exports.isSubscriptionActive = async (req, res, next) => {
    try {
        if (!req.seller) {
            return res.status(403).json({
                success: false,
                message: 'Seller profile required'
            });
        }

        // For Starter package, always consider active
        if (req.seller.subscription.package === 'Starter') {
            return next();
        }

        if (req.seller.subscription.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Active subscription required'
            });
        }

        // Check if subscription has expired
        if (new Date() > new Date(req.seller.subscription.endDate)) {
            // Downgrade to Starter package if subscription expires
            req.seller.subscription = {
                package: 'Starter',
                status: 'active',
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                features: {
                    maxListings: 1,
                    maxPhotos: 3,
                    commission: 6,
                    searchPlacement: 'basic',
                    paymentOptions: ['platform'],
                    customAgreements: false,
                    boostFeatures: false,
                    homepageVisibility: false,
                    badges: []
                }
            };
            await req.seller.save();
            
            return res.status(403).json({
                success: false,
                message: 'Subscription has expired. Downgraded to Starter package.'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Check if seller owns the horse
exports.checkHorseOwnership = async (req, res, next) => {
    try {
        const horse = await Horse.findById(req.params.id);
        
        if (!horse) {
            return res.status(404).json({
                success: false,
                message: 'Horse not found'
            });
        }

        if (horse.seller.toString() !== req.seller._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this listing'
            });
        }

        req.horse = horse;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}; 