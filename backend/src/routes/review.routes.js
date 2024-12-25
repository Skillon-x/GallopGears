const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const {
    createReview,
    getEntityReviews,
    moderateReview,
    voteReview,
    reportReview
} = require('../controllers/review.controller');

// Validation middleware
const createReviewValidation = [
    body('entityType')
        .isIn(['seller', 'horse', 'transaction'])
        .withMessage('Valid entity type is required'),
    body('entityId').notEmpty().withMessage('Entity ID is required'),
    body('rating.overall')
        .isInt({ min: 1, max: 5 })
        .withMessage('Overall rating must be between 1 and 5'),
    body('rating.aspects.*')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Aspect ratings must be between 1 and 5'),
    body('content.description')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Review description must be between 10 and 1000 characters'),
    body('content.pros').optional().isArray().withMessage('Pros must be an array'),
    body('content.cons').optional().isArray().withMessage('Cons must be an array'),
    body('media').optional().isArray().withMessage('Media must be an array')
];

const moderationValidation = [
    body('status')
        .isIn(['approved', 'rejected', 'reported'])
        .withMessage('Valid status is required'),
    body('reason').notEmpty().withMessage('Moderation reason is required'),
    body('action').notEmpty().withMessage('Moderation action is required')
];

const reportValidation = [
    body('reason').notEmpty().withMessage('Report reason is required'),
    body('details').optional().isString().withMessage('Report details must be a string')
];

// Public routes
router.get('/:entityType/:entityId', getEntityReviews);

// Protected routes
router.use(protect);

// Review creation
router.post('/', createReviewValidation, createReview);

// Review moderation (Admin only)
router.put('/:reviewId/moderate', authorize('admin'), moderationValidation, moderateReview);

// Review interaction
router.post('/:reviewId/vote', voteReview);
router.post('/:reviewId/report', reportValidation, reportReview);

module.exports = router; 