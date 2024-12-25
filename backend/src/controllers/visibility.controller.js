const Horse = require('../models/Horse');
const Seller = require('../models/Seller');
const Spotlight = require('../models/Spotlight');
const ActivityLog = require('../models/ActivityLog');

// Package-based spotlight limits
const SPOTLIGHT_LIMITS = {
    'Royal Stallion': {
        spotlightsPerMonth: 5,
        duration: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    },
    'Gallop': {
        spotlightsPerMonth: 2,
        duration: 5 * 24 * 60 * 60 * 1000 // 5 days in milliseconds
    },
    'Trot': {
        spotlightsPerMonth: 0,
        duration: 0
    }
};

// @desc    Add listing to homepage spotlight
// @route   POST /api/visibility/spotlight/:horseId
// @access  Private (Seller)
exports.addToSpotlight = async (req, res) => {
    try {
        const seller = await Seller.findOne({ user: req.user._id });
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        // Check package limits
        const packageLimits = SPOTLIGHT_LIMITS[seller.subscription.plan];
        if (!packageLimits || packageLimits.spotlightsPerMonth === 0) {
            return res.status(403).json({
                success: false,
                message: `Spotlight feature not available in ${seller.subscription.plan} package`
            });
        }

        // Check monthly usage
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlySpotlightCount = await Spotlight.countDocuments({
            seller: seller._id,
            startDate: { $gte: startOfMonth }
        });

        if (monthlySpotlightCount >= packageLimits.spotlightsPerMonth) {
            return res.status(400).json({
                success: false,
                message: `Monthly spotlight limit (${packageLimits.spotlightsPerMonth}) reached`
            });
        }

        // Get horse listing
        const horse = await Horse.findById(req.params.horseId);
        if (!horse) {
            return res.status(404).json({
                success: false,
                message: 'Horse listing not found'
            });
        }

        // Verify ownership
        if (horse.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to spotlight this listing'
            });
        }

        // Create spotlight
        const endDate = new Date(Date.now() + packageLimits.duration);
        const spotlight = await Spotlight.create({
            horse: horse._id,
            seller: seller._id,
            startDate: new Date(),
            endDate: endDate,
            status: 'active',
            package: seller.subscription.plan,
            metadata: {
                createdBy: req.user._id
            }
        });

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'add_spotlight',
            target: horse._id,
            entityType: 'spotlight',
            entityId: spotlight._id,
            description: `Added horse listing ${horse.name} to spotlight`,
            status: 'success',
            details: {
                package: seller.subscription.plan,
                duration: packageLimits.duration / (24 * 60 * 60 * 1000), // Convert to days
                startDate: spotlight.startDate,
                endDate: spotlight.endDate
            }
        });

        res.json({
            success: true,
            message: `Listing added to spotlight for ${packageLimits.duration / (24 * 60 * 60 * 1000)} days`,
            spotlight
        });

    } catch (error) {
        console.error('Add to spotlight error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error adding listing to spotlight'
        });
    }
};

// @desc    Get featured listings for homepage
// @route   GET /api/visibility/featured
// @access  Public
exports.getFeaturedListings = async (req, res) => {
    try {
        const now = new Date();

        // Get active spotlights
        const spotlights = await Horse.find({
            'featured.active': true,
            'featured.endDate': { $gt: now },
            listingStatus: 'active'
        })
        .populate('seller', 'businessName location verification badges')
        .sort('-featured.startDate')
        .limit(6);

        // Get premium listings (from verified Royal Stallion sellers)
        const premiumListings = await Horse.find({
            listingStatus: 'active',
            seller: {
                $in: await Seller.find({
                    'subscription.plan': 'Royal Stallion',
                    'verification.status': 'verified'
                }).select('_id')
            }
        })
        .populate('seller', 'businessName location verification badges')
        .sort('-createdAt')
        .limit(4);

        res.json({
            success: true,
            data: {
                spotlights,
                premiumListings
            }
        });

    } catch (error) {
        console.error('Get featured listings error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting featured listings'
        });
    }
};

// @desc    Share listing on social media
// @route   POST /api/visibility/share/:horseId
// @access  Private (Seller)
exports.shareOnSocial = async (req, res) => {
    try {
        const { platforms } = req.body;
        if (!platforms || !Array.isArray(platforms)) {
            return res.status(400).json({
                success: false,
                message: 'Please specify platforms to share on'
            });
        }

        const horse = await Horse.findById(req.params.horseId)
            .populate('seller', 'businessName');

        if (!horse) {
            return res.status(404).json({
                success: false,
                message: 'Horse listing not found'
            });
        }

        // Verify ownership
        const seller = await Seller.findOne({ user: req.user._id });
        if (horse.seller._id.toString() !== seller._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to share this listing'
            });
        }

        // Generate sharing content
        const content = {
            title: `${horse.name} - ${horse.breed} for Sale`,
            description: horse.description.substring(0, 200) + '...',
            price: `₹${horse.price.toLocaleString()}`,
            seller: horse.seller.businessName,
            images: horse.images.map(img => img.url),
            link: `${process.env.FRONTEND_URL}/horses/${horse._id}`
        };

        // Share on each platform
        const shareResults = await Promise.all(platforms.map(async platform => {
            try {
                // Implement actual social media sharing here
                // This is a placeholder for demonstration
                return {
                    platform,
                    success: true,
                    postId: `test_${Date.now()}`
                };
            } catch (error) {
                return {
                    platform,
                    success: false,
                    error: error.message
                };
            }
        }));

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'social_share',
            entityType: 'social_share',
            entityId: horse._id,
            description: `Shared horse listing ${horse.name} on social media`,
            status: 'success',
            details: {
                platforms,
                results: shareResults,
                content
            }
        });

        res.json({
            success: true,
            message: 'Listing shared on social media',
            shares: shareResults
        });

    } catch (error) {
        console.error('Social share error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error sharing on social media'
        });
    }
};

// @desc    Get listing visibility stats
// @route   GET /api/visibility/stats/:horseId
// @access  Private (Seller)
exports.getVisibilityStats = async (req, res) => {
    try {
        const horse = await Horse.findById(req.params.horseId);
        if (!horse) {
            return res.status(404).json({
                success: false,
                message: 'Horse listing not found'
            });
        }

        // Verify ownership
        const seller = await Seller.findOne({ user: req.user._id });
        if (horse.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these stats'
            });
        }

        // Get spotlight history
        const spotlights = await Spotlight.find({
            horse: horse._id
        }).sort('-createdAt');

        // Get visibility stats
        const metrics = {
            totalViews: horse.statistics.views || 0,
            spotlightViews: spotlights.length > 0 ? spotlights[0].views : 0,
            socialShares: await ActivityLog.countDocuments({
                action: 'social_share',
                entityId: horse._id
            }),
            spotlightHistory: spotlights.map(s => ({
                startDate: s.startDate,
                endDate: s.endDate,
                status: s.status
            }))
        };

        // Get visibility trends
        const visibilityTrends = {};
        const today = new Date().toISOString().split('T')[0];
        visibilityTrends[today] = {
            views: horse.statistics.views || 0,
            shares: await ActivityLog.countDocuments({
                action: 'social_share',
                entityId: horse._id,
                createdAt: { $gte: new Date(today) }
            })
        };

        res.json({
            success: true,
            data: {
                metrics,
                spotlights,
                visibilityTrends
            }
        });

    } catch (error) {
        console.error('Get visibility stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting visibility stats'
        });
    }
}; 