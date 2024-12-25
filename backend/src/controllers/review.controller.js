const Review = require('../models/Review');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
    try {
        const {
            entityType,
            entityId,
            rating,
            content,
            media
        } = req.body;

        // Check if user has already reviewed
        const existingReview = await Review.findOne({
            reviewer: req.user._id,
            entityType,
            entityId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this entity'
            });
        }

        // Create review
        const review = await Review.create({
            reviewer: req.user._id,
            entityType,
            entityId,
            rating,
            content,
            media: media || []
        });

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'CREATE_REVIEW',
            target: review._id,
            targetModel: 'Review',
            details: {
                entityType,
                entityId,
                rating: rating.overall
            }
        });

        res.status(201).json({
            success: true,
            review
        });

    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating review'
        });
    }
};

// @desc    Get reviews for entity
// @route   GET /api/reviews/:entityType/:entityId
// @access  Public
exports.getEntityReviews = async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || '-createdAt';
        const filter = req.query.filter || 'all';

        const query = {
            entityType,
            entityId,
            status: 'approved'
        };

        if (filter === 'verified') {
            query.verified = true;
        } else if (filter === 'media') {
            query['media.0'] = { $exists: true };
        }

        const reviews = await Review.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('reviewer', 'name');

        const total = await Review.countDocuments(query);

        // Get average rating
        const stats = await Review.getAverageRating(entityType, entityId);

        res.json({
            success: true,
            data: {
                reviews,
                stats,
                pagination: {
                    page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting reviews'
        });
    }
};

// @desc    Moderate review
// @route   PUT /api/reviews/:reviewId/moderate
// @access  Private (Admin)
exports.moderateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { status, reason, action } = req.body;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        review.status = status;
        review.moderation = {
            moderatedBy: req.user._id,
            moderatedAt: new Date(),
            reason,
            action
        };

        await review.save();

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'MODERATE_REVIEW',
            target: review._id,
            targetModel: 'Review',
            details: { status, reason }
        });

        res.json({
            success: true,
            review
        });

    } catch (error) {
        console.error('Moderate review error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error moderating review'
        });
    }
};

// @desc    Vote on review helpfulness
// @route   POST /api/reviews/:reviewId/vote
// @access  Private
exports.voteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { helpful } = req.body;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user has already voted
        const existingVote = review.helpfulVotes.find(
            vote => vote.user.toString() === req.user._id.toString()
        );

        if (existingVote) {
            existingVote.helpful = helpful;
        } else {
            review.helpfulVotes.push({
                user: req.user._id,
                helpful
            });
        }

        await review.save();

        res.json({
            success: true,
            message: 'Vote recorded successfully'
        });

    } catch (error) {
        console.error('Vote review error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error voting on review'
        });
    }
};

// @desc    Report review
// @route   POST /api/reviews/:reviewId/report
// @access  Private
exports.reportReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reason, details } = req.body;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        review.status = 'reported';
        review.moderation = {
            moderatedBy: req.user._id,
            moderatedAt: new Date(),
            reason,
            action: 'reported',
            details
        };

        await review.save();

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'REPORT_REVIEW',
            target: review._id,
            targetModel: 'Review',
            details: { reason }
        });

        res.json({
            success: true,
            message: 'Review reported successfully'
        });

    } catch (error) {
        console.error('Report review error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error reporting review'
        });
    }
}; 