const Seller = require('../models/Seller');
const ActivityLog = require('../models/ActivityLog');
const cloudinary = require('cloudinary').v2;

// Verification requirements by level
const VERIFICATION_REQUIREMENTS = {
    basic: {
        documents: ['identity', 'address'],
        reviewTime: '2-3 business days'
    },
    professional: {
        documents: ['identity', 'address', 'business_license', 'tax_registration', 'bank_statement'],
        reviewTime: '3-5 business days'
    }
};

// Badge criteria
const BADGE_CRITERIA = {
    'Top Seller': {
        minListings: 10,
        minRating: 4.5,
        minSales: 5,
        activeMonths: 3
    },
    'Premium Stable': {
        package: 'Royal Stallion',
        minListings: 5,
        minRating: 4.0,
        verificationLevel: 'professional'
    },
    'Verified Seller': {
        verificationLevel: 'basic'
    }
};

// @desc    Submit seller for verification
// @route   POST /api/verification/submit
// @access  Private (Seller)
exports.submitForVerification = async (req, res) => {
    try {
        const seller = await Seller.findById(req.seller._id);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        const { documents } = req.body;
        seller.verificationDocuments = documents;
        seller.verificationStatus = 'pending';
        seller.verificationSubmittedAt = Date.now();

        await seller.save();

        res.json({
            success: true,
            message: 'Documents submitted for verification'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get verification status
// @route   GET /api/verification/status
// @access  Private (Seller)
exports.getVerificationStatus = async (req, res) => {
    try {
        const seller = await Seller.findById(req.seller._id)
            .select('verificationStatus verificationDocuments verificationSubmittedAt');

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        res.json({
            success: true,
            verification: {
                status: seller.verificationStatus,
                documents: seller.verificationDocuments,
                submittedAt: seller.verificationSubmittedAt
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update verification status (Admin)
// @route   PUT /api/verification/sellers/:sellerId/verification
// @access  Private (Admin)
exports.updateVerificationStatus = async (req, res) => {
    try {
        const { verification, remarks } = req.body;
        const seller = await Seller.findById(req.params.sellerId);

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        seller.verification = {
            ...seller.verification,
            ...verification,
            updatedAt: Date.now()
        };
        seller.verificationRemarks = remarks;

        await seller.save();

        res.json({
            success: true,
            message: 'Verification status updated',
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

// @desc    Check badge eligibility
// @route   GET /api/verification/badges
// @access  Private (Seller)
exports.checkBadgeEligibility = async (req, res) => {
    try {
        const seller = await Seller.findById(req.seller._id)
            .populate('reviews');

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        const badges = [];

        // Premium Seller Badge
        if (seller.subscription && seller.subscription.plan === 'Royal Stallion') {
            badges.push('Premium Seller');
        }

        // Verified Seller Badge
        if (seller.verification && seller.verification.status === 'verified') {
            badges.push('Verified Seller');
        }

        // Top Rated Badge
        if (seller.reviews && seller.reviews.length >= 10 && seller.rating >= 4.5) {
            badges.push('Top Rated');
        }

        res.json({
            success: true,
            badges
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get premium stables
// @route   GET /api/verification/premium-stables
// @access  Public
exports.getPremiumStables = async (req, res) => {
    try {
        const premiumSellers = await Seller.find({
            'subscription.plan': 'Royal Stallion',
            'verification.status': 'verified'
        })
        .select('businessName location rating reviews')
        .populate('reviews', 'rating');

        res.json({
            success: true,
            sellers: premiumSellers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}; 