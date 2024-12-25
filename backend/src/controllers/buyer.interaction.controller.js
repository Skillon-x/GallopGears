const User = require('../models/User');
const Seller = require('../models/Seller');
const Horse = require('../models/Horse');
const Inquiry = require('../models/Inquiry');
const ActivityLog = require('../models/ActivityLog');

// Buyer verification levels
const VERIFICATION_LEVELS = {
    basic: {
        requirements: ['email', 'phone'],
        benefits: ['basic_messaging']
    },
    verified: {
        requirements: ['email', 'phone', 'identity'],
        benefits: ['full_messaging', 'contact_info']
    },
    premium: {
        requirements: ['email', 'phone', 'identity', 'payment_method'],
        benefits: ['full_messaging', 'contact_info', 'priority_support']
    }
};

// @desc    Verify buyer credentials
// @route   POST /api/buyer/verify
// @access  Private
exports.verifyBuyer = async (req, res) => {
    try {
        const { level = 'basic', documents } = req.body;

        if (!VERIFICATION_LEVELS[level]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification level'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check required documents
        const requiredDocs = VERIFICATION_LEVELS[level].requirements;
        const missingDocs = requiredDocs.filter(doc => 
            !documents || !documents.find(d => d.type === doc)
        );

        if (missingDocs.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required documents: ${missingDocs.join(', ')}`
            });
        }

        // Update user verification
        user.buyerVerification = {
            level,
            status: 'verified',
            verifiedAt: new Date(),
            documents: documents.map(doc => ({
                type: doc.type,
                verified: true,
                verifiedAt: new Date()
            }))
        };

        await user.save();

        // Log activity
        await ActivityLog.create({
            user: user._id,
            action: 'BUYER_VERIFICATION',
            details: {
                level,
                documentCount: documents.length
            }
        });

        res.json({
            success: true,
            message: 'Buyer verification successful',
            verification: user.buyerVerification
        });

    } catch (error) {
        console.error('Buyer verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error verifying buyer'
        });
    }
};

// @desc    Get seller contact access
// @route   POST /api/buyer/contact-access/:sellerId
// @access  Private (Verified Buyers)
exports.getSellerContactAccess = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user?.buyerVerification?.status === 'verified') {
            return res.status(403).json({
                success: false,
                message: 'Buyer verification required for contact access'
            });
        }

        const seller = await Seller.findById(req.params.sellerId);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        // Check if already has access
        const existingAccess = user.contactAccess?.find(
            access => access.seller.toString() === seller._id.toString()
        );

        if (existingAccess) {
            return res.json({
                success: true,
                message: 'Contact access already granted',
                contactInfo: seller.contactDetails
            });
        }

        // Grant access
        if (!user.contactAccess) user.contactAccess = [];
        user.contactAccess.push({
            seller: seller._id,
            grantedAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });

        await user.save();

        // Log activity
        await ActivityLog.create({
            user: user._id,
            action: 'CONTACT_ACCESS_GRANTED',
            target: seller._id,
            targetModel: 'Seller'
        });

        res.json({
            success: true,
            message: 'Contact access granted',
            contactInfo: seller.contactDetails
        });

    } catch (error) {
        console.error('Contact access error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error granting contact access'
        });
    }
};

// @desc    Track buyer activity
// @route   POST /api/buyer/activity/:horseId
// @access  Private
exports.trackActivity = async (req, res) => {
    try {
        const { action, details } = req.body;

        const horse = await Horse.findById(req.params.horseId);
        if (!horse) {
            return res.status(404).json({
                success: false,
                message: 'Horse listing not found'
            });
        }

        // Log activity
        const activity = await ActivityLog.create({
            user: req.user._id,
            action,
            target: horse._id,
            targetModel: 'Horse',
            details: {
                ...details,
                timestamp: new Date()
            }
        });

        // Update user interests if viewing
        if (action === 'VIEW_LISTING') {
            const user = await User.findById(req.user._id);
            if (!user.interests) user.interests = [];
            
            if (!user.interests.includes(horse.breed)) {
                user.interests.push(horse.breed);
                await user.save();
            }
        }

        res.json({
            success: true,
            activity
        });

    } catch (error) {
        console.error('Activity tracking error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error tracking activity'
        });
    }
};

// @desc    Score inquiry quality
// @route   POST /api/buyer/score-inquiry/:inquiryId
// @access  Private (Seller)
exports.scoreInquiryQuality = async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.inquiryId)
            .populate('horse')
            .populate('buyer');

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        // Verify seller ownership
        const seller = await Seller.findOne({ user: req.user._id });
        if (inquiry.horse.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to score this inquiry'
            });
        }

        // Calculate quality score (0-100)
        const score = {
            buyerVerification: inquiry.buyer.buyerVerification ? 20 : 0,
            messageLength: Math.min(inquiry.message.length / 20, 20),
            contactInfo: inquiry.contactDetails ? 20 : 0,
            previousInquiries: 0,
            responseRate: 0
        };

        // Check previous inquiries
        const previousInquiries = await Inquiry.find({
            buyer: inquiry.buyer._id,
            createdAt: { $lt: inquiry.createdAt }
        });

        if (previousInquiries.length > 0) {
            const respondedCount = previousInquiries.filter(i => i.response).length;
            score.previousInquiries = Math.min(previousInquiries.length * 5, 20);
            score.responseRate = (respondedCount / previousInquiries.length) * 20;
        }

        const totalScore = Object.values(score).reduce((a, b) => a + b, 0);

        // Update inquiry with score
        inquiry.qualityScore = totalScore;
        await inquiry.save();

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'SCORE_INQUIRY',
            target: inquiry._id,
            targetModel: 'Inquiry',
            details: { score, total: totalScore }
        });

        res.json({
            success: true,
            score: {
                total: totalScore,
                breakdown: score
            }
        });

    } catch (error) {
        console.error('Inquiry scoring error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error scoring inquiry'
        });
    }
}; 