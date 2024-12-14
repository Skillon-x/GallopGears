const User = require('../models/User');
const Seller = require('../models/Seller');
const Horse = require('../models/Horse');
const Inquiry = require('../models/Inquiry');
const Transaction = require('../models/Transaction');

// @desc    Create seller profile
// @route   POST /api/sellers/profile
// @access  Private (User)
exports.createProfile = async (req, res) => {
    try {
        // Check if seller profile already exists
        let seller = await Seller.findOne({ user: req.user._id });
        if (seller) {
            return res.status(400).json({
                success: false,
                message: 'Seller profile already exists'
            });
        }

        // Create seller profile with Starter package
        seller = await Seller.create({
            user: req.user._id,
            businessName: req.body.businessName,
            description: req.body.description,
            location: req.body.location,
            contactDetails: req.body.contactDetails,
            businessDocuments: req.body.businessDocuments,
            businessType: req.body.businessType,
            experience: req.body.experience,
            specializations: req.body.specializations,
            subscription: {
                plan: 'Trot',
                status: 'active',
                startDate: new Date(),
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
            }
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
};

// @desc    Get current seller profile
// @route   GET /api/sellers/me
// @access  Private (Seller)
exports.getMe = async (req, res) => {
    try {
        const seller = await Seller.findOne({ user: req.user._id });
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller profile not found'
            });
        }

        res.json({
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
};

// @desc    Update seller profile
// @route   PUT /api/sellers/profile
// @access  Private (Seller)
exports.updateProfile = async (req, res) => {
    try {
        const seller = await Seller.findOneAndUpdate(
            { user: req.user._id },
            {
                businessName: req.body.businessName,
                description: req.body.description,
                contactInfo: req.body.contactInfo,
                socialMedia: req.body.socialMedia
            },
            { new: true, runValidators: true }
        );

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller profile not found'
            });
        }

        res.json({
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
};

// @desc    Update bank details
// @route   PUT /api/sellers/bank-details
// @access  Private (Seller)
exports.updateBankDetails = async (req, res) => {
    try {
        const seller = await Seller.findOneAndUpdate(
            { user: req.user._id },
            { bankDetails: req.body },
            { new: true, runValidators: true }
        );

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller profile not found'
            });
        }

        res.json({
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
};

// @desc    Get payment history
// @route   GET /api/sellers/payments
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

// @desc    Get seller analytics
// @route   GET /api/sellers/analytics
// @access  Private (Seller)
exports.getAnalytics = async (req, res) => {
    try {
        // Get basic analytics
        const analytics = {
            totalListings: await Horse.countDocuments({ seller: req.seller._id }),
            activeListings: await Horse.countDocuments({ seller: req.seller._id, status: 'active' }),
            totalInquiries: await Inquiry.countDocuments({ seller: req.seller._id }),
            totalTransactions: await Transaction.countDocuments({ seller: req.seller._id }),
            revenue: await Transaction.aggregate([
                { $match: { seller: req.seller._id, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        };

        res.json({
            success: true,
            analytics
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get seller listings
// @route   GET /api/sellers/listings
// @access  Private (Seller)
exports.getListings = async (req, res) => {
    try {
        const listings = await Horse.find({ seller: req.seller._id })
            .sort('-createdAt');

        res.json({
            success: true,
            listings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get seller inquiries
// @route   GET /api/sellers/inquiries
// @access  Private (Seller)
exports.getInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find({ seller: req.seller._id })
            .populate('user', 'name email')
            .populate('horse', 'name')
            .sort('-createdAt');

        res.json({
            success: true,
            inquiries
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get seller reviews
// @route   GET /api/sellers/reviews
// @access  Private (Seller)
exports.getReviews = async (req, res) => {
    try {
        const seller = await Seller.findById(req.seller._id)
            .populate('reviews.user', 'name');

        res.json({
            success: true,
            reviews: seller.reviews
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Add review for seller
// @route   POST /api/sellers/reviews
// @access  Private
exports.addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const seller = await Seller.findById(req.params.id);

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        const review = {
            user: req.user._id,
            rating,
            comment,
            date: Date.now()
        };

        seller.reviews.push(review);

        // Update average rating
        const totalRating = seller.reviews.reduce((sum, item) => sum + item.rating, 0);
        seller.rating = totalRating / seller.reviews.length;

        await seller.save();

        res.json({
            success: true,
            review
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update subscription
// @route   PUT /api/sellers/subscription
// @access  Private (Seller)
exports.updateSubscription = async (req, res) => {
    try {
        const { subscriptionPackage } = req.body;
        let features;

        switch (subscriptionPackage) {
            case 'Royal Stallion':
                features = {
                    listingLimit: 50,
                    photosPerListing: 30,
                    videosPerListing: 5,
                    featuredListings: true,
                    virtualTours: true,
                    analytics: true,
                    support: '24/7'
                };
                break;
            case 'Gallop':
                features = {
                    listingLimit: 25,
                    photosPerListing: 20,
                    videosPerListing: 3,
                    featuredListings: true,
                    virtualTours: false,
                    analytics: true,
                    support: 'business hours'
                };
                break;
            case 'Trot':
                features = {
                    listingLimit: 10,
                    photosPerListing: 10,
                    videosPerListing: 1,
                    featuredListings: false,
                    virtualTours: false,
                    analytics: false,
                    support: 'email'
                };
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid subscription package'
                });
        }

        const seller = await Seller.findById(req.seller._id);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        seller.subscription = {
            package: subscriptionPackage,
            features,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: 'active'
        };

        await seller.save();

        res.json({
            success: true,
            subscription: seller.subscription
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Cancel subscription
// @route   DELETE /api/sellers/subscription
// @access  Private (Seller)
exports.cancelSubscription = async (req, res) => {
    try {
        const seller = await Seller.findOneAndUpdate(
            { user: req.user._id },
            {
                subscription: {
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
                        badges: [],
                        spotlightRemaining: 0,
                        boostRemaining: 0
                    }
                }
            },
            { new: true }
        );

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller profile not found'
            });
        }

        res.json({
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
};

// @desc    Get subscription details
// @route   GET /api/sellers/subscription
// @access  Private (Seller)
exports.getSubscriptionDetails = async (req, res) => {
    try {
        const seller = await Seller.findOne({ user: req.user._id })
            .select('subscription');

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller profile not found'
            });
        }

        res.json({
            success: true,
            subscription: seller.subscription
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}; 