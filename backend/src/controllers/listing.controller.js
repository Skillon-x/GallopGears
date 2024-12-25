const Horse = require('../models/Horse');
const Seller = require('../models/Seller');
const ActivityLog = require('../models/ActivityLog');

// Package-based listing limits
const PACKAGE_LISTING_LIMITS = {
    'Royal Stallion': {
        maxActive: 20,
        duration: 90, // 3 months
        boostDuration: 7 // 7 days
    },
    'Gallop': {
        maxActive: 5,
        duration: 60, // 2 months
        boostDuration: 5 // 5 days
    },
    'Trot': {
        maxActive: 2,
        duration: 30, // 1 month
        boostDuration: 0 // No boost feature
    }
};

// @desc    Verify listing count limits for seller
// @route   GET /api/listings/verify-limits
// @access  Private (Seller)
exports.verifyListingLimits = async (req, res) => {
    try {
        const seller = await Seller.findOne({ user: req.user._id });
        if (!seller || !seller.subscription) {
            return res.status(400).json({
                success: false,
                message: 'Invalid seller subscription'
            });
        }

        const packageLimits = PACKAGE_LISTING_LIMITS[seller.subscription.plan];
        if (!packageLimits) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription plan'
            });
        }

        const activeListings = await Horse.countDocuments({
            seller: seller._id,
            listingStatus: 'active'
        });

        const data = {
            maxListings: packageLimits.maxActive,
            currentActive: activeListings,
            remainingSlots: packageLimits.maxActive - activeListings,
            listingDuration: packageLimits.duration,
            boostDuration: packageLimits.boostDuration
        };

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Verify listing limits error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying listing limits'
        });
    }
};

// @desc    Boost listing visibility
// @route   POST /api/listings/:id/boost
// @access  Private (Seller)
exports.boostListing = async (req, res) => {
    try {
        const seller = await Seller.findOne({ user: req.user._id });
        if (!seller || !seller.subscription) {
            return res.status(400).json({
                success: false,
                message: 'Invalid seller subscription'
            });
        }

        const packageLimits = PACKAGE_LISTING_LIMITS[seller.subscription.plan];
        if (!packageLimits) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription plan'
            });
        }

        if (packageLimits.boostDuration === 0) {
            return res.status(403).json({
                success: false,
                message: `Boost feature not available in ${seller.subscription.plan} package`
            });
        }

        const horse = await Horse.findById(req.params.id);
        if (!horse) {
            return res.status(404).json({
                success: false,
                message: 'Horse listing not found'
            });
        }

        if (horse.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to boost this listing'
            });
        }

        // Check if already boosted
        if (horse.boost && horse.boost.active && new Date(horse.boost.endDate) > new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Listing is already boosted'
            });
        }

        // Apply boost
        const boostEndDate = new Date();
        boostEndDate.setDate(boostEndDate.getDate() + packageLimits.boostDuration);

        horse.boost = {
            active: true,
            startDate: new Date(),
            endDate: boostEndDate
        };

        await horse.save();

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'listing_boost',
            entityType: 'horse',
            entityId: horse._id,
            description: `Boosted horse listing ${horse.name}`,
            status: 'success',
            details: {
                package: seller.subscription.plan,
                boostDuration: packageLimits.boostDuration
            }
        });

        res.json({
            success: true,
            message: `Listing boosted for ${packageLimits.boostDuration} days`,
            boost: horse.boost
        });

    } catch (error) {
        console.error('Boost listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Error boosting listing'
        });
    }
};

// @desc    Submit listing for verification
// @route   POST /api/listings/:id/verify
// @access  Private (Seller)
exports.submitForVerification = async (req, res) => {
    try {
        const seller = await Seller.findOne({ user: req.user._id });
        if (!seller) {
            return res.status(400).json({
                success: false,
                message: 'Seller not found'
            });
        }

        const horse = await Horse.findById(req.params.id);
        if (!horse) {
            return res.status(404).json({
                success: false,
                message: 'Horse listing not found'
            });
        }

        if (horse.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to verify this listing'
            });
        }

        // Check if already under verification
        if (horse.verificationStatus === 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Listing is already under verification'
            });
        }

        // Required fields for verification
        const requiredFields = [
            'name', 'breed', 'age', 'gender', 'color', 'price',
            'description', 'location', 'specifications', 'images'
        ];

        const missingFields = requiredFields.filter(field => {
            if (field === 'images') {
                return !horse.images || horse.images.length === 0;
            }
            return !horse[field];
        });

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields for verification: ${missingFields.join(', ')}`
            });
        }

        // Update verification status
        horse.verificationStatus = 'pending';
        horse.verificationDetails = {
            submittedAt: new Date(),
            submittedBy: req.user._id,
            documents: req.body.documents || [],
            notes: req.body.notes || ''
        };

        await horse.save();

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'listing_verify_submit',
            entityType: 'horse',
            entityId: horse._id,
            description: `Submitted horse listing ${horse.name} for verification`,
            status: 'success',
            details: {
                documents: req.body.documents,
                notes: req.body.notes
            }
        });

        res.json({
            success: true,
            message: 'Listing submitted for verification',
            verificationStatus: horse.verificationStatus,
            verificationDetails: horse.verificationDetails
        });

    } catch (error) {
        console.error('Submit for verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting listing for verification'
        });
    }
};

// @desc    Check listing expiry and update status
// @route   GET /api/listings/check-expiry
// @access  Private (System)
exports.checkListingExpiry = async () => {
    try {
        const expiredListings = await Horse.find({
            listingStatus: 'active',
            createdAt: {
                $lt: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)) // 30 days old
            }
        }).populate('seller', 'subscription');

        for (const listing of expiredListings) {
            const packageLimits = PACKAGE_LISTING_LIMITS[listing.seller.subscription.plan];
            const listingAge = Math.floor((Date.now() - listing.createdAt) / (24 * 60 * 60 * 1000));

            if (listingAge > packageLimits.duration) {
                listing.listingStatus = 'expired';
                await listing.save();

                // Log activity
                await ActivityLog.create({
                    user: listing.seller.user,
                    action: 'LISTING_EXPIRED',
                    target: listing._id,
                    targetModel: 'Horse',
                    details: {
                        listingAge,
                        packageDuration: packageLimits.duration
                    }
                });
            }
        }

        return {
            success: true,
            message: `Checked ${expiredListings.length} listings for expiry`
        };

    } catch (error) {
        console.error('Check listing expiry error:', error);
        return {
            success: false,
            message: 'Error checking listing expiry'
        };
    }
};

// @desc    Get listing verification status
// @route   GET /api/listings/:id/verification
// @access  Private (Seller)
exports.getVerificationStatus = async (req, res) => {
    try {
        const horse = await Horse.findById(req.params.id)
            .select('verificationStatus verificationDetails seller')
            .populate('seller', '_id');

        if (!horse) {
            return res.status(404).json({
                success: false,
                message: 'Horse listing not found'
            });
        }

        // Verify ownership
        const seller = await Seller.findOne({ user: req.user._id });
        if (!seller || horse.seller._id.toString() !== seller._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this verification status'
            });
        }

        res.json({
            success: true,
            verificationStatus: horse.verificationStatus || 'pending',
            verificationDetails: horse.verificationDetails || {}
        });

    } catch (error) {
        console.error('Get verification status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting verification status'
        });
    }
};

// @desc    Delete horse listing
// @route   DELETE /api/horses/:id
// @access  Private (Seller)
exports.deleteHorseListing = async (req, res) => {
    try {
        const seller = await Seller.findOne({ user: req.user._id });
        if (!seller) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this listing'
            });
        }

        const horse = await Horse.findById(req.params.id);
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
                message: 'Not authorized to delete this listing'
            });
        }

        // Delete images from cloudinary
        for (const image of horse.images) {
            if (image.public_id) {
                await cloudinary.uploader.destroy(image.public_id);
            }
        }

        await horse.remove();

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'listing_delete',
            entityType: 'horse',
            entityId: horse._id,
            description: `Deleted horse listing ${horse.name}`,
            status: 'success'
        });

        res.json({
            success: true,
            message: 'Horse listing deleted'
        });
    } catch (error) {
        console.error('Delete listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting listing'
        });
    }
}; 