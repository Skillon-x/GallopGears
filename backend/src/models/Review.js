const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    entityType: {
        type: String,
        enum: ['seller', 'horse', 'transaction'],
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'entityType'
    },
    rating: {
        overall: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        aspects: {
            communication: { type: Number, min: 1, max: 5 },
            accuracy: { type: Number, min: 1, max: 5 },
            value: { type: Number, min: 1, max: 5 },
            experience: { type: Number, min: 1, max: 5 }
        }
    },
    content: {
        title: String,
        description: {
            type: String,
            required: true,
            minlength: 10,
            maxlength: 1000
        },
        pros: [String],
        cons: [String]
    },
    media: [{
        url: String,
        public_id: String,
        type: {
            type: String,
            enum: ['image', 'video']
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'reported'],
        default: 'pending'
    },
    moderation: {
        moderatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        moderatedAt: Date,
        reason: String,
        action: String
    },
    helpfulVotes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        helpful: Boolean,
        votedAt: {
            type: Date,
            default: Date.now
        }
    }],
    verified: {
        type: Boolean,
        default: false
    },
    verificationDetails: {
        transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction'
        },
        purchaseDate: Date,
        verifiedAt: Date
    }
}, {
    timestamps: true
});

// Create indexes
reviewSchema.index({ entityType: 1, entityId: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ 'rating.overall': -1 });
reviewSchema.index({ createdAt: -1 });

// Static methods
reviewSchema.statics.getAverageRating = async function(entityType, entityId) {
    const aggregation = await this.aggregate([
        {
            $match: {
                entityType,
                entityId,
                status: 'approved'
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating.overall' },
                totalReviews: { $sum: 1 },
                aspects: {
                    $avg: {
                        communication: '$rating.aspects.communication',
                        accuracy: '$rating.aspects.accuracy',
                        value: '$rating.aspects.value',
                        experience: '$rating.aspects.experience'
                    }
                }
            }
        }
    ]);

    return aggregation[0] || {
        averageRating: 0,
        totalReviews: 0,
        aspects: {
            communication: 0,
            accuracy: 0,
            value: 0,
            experience: 0
        }
    };
};

// Methods
reviewSchema.methods.isHelpful = function() {
    const helpfulCount = this.helpfulVotes.filter(vote => vote.helpful).length;
    const totalVotes = this.helpfulVotes.length;
    return totalVotes > 0 ? helpfulCount / totalVotes > 0.5 : false;
};

module.exports = mongoose.model('Review', reviewSchema); 