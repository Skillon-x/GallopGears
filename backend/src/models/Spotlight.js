const mongoose = require('mongoose');

const spotlightSchema = new mongoose.Schema({
    horse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Horse',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active'
    },
    package: {
        type: String,
        enum: ['Royal Stallion', 'Gallop', 'Trot'],
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    clicks: {
        type: Number,
        default: 0
    },
    inquiries: {
        type: Number,
        default: 0
    },
    metadata: {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastModifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }
}, {
    timestamps: true
});

// Create indexes
spotlightSchema.index({ horse: 1, status: 1 });
spotlightSchema.index({ seller: 1, status: 1 });
spotlightSchema.index({ startDate: 1, endDate: 1 });

// Pre-save middleware to update horse featured status
spotlightSchema.pre('save', async function(next) {
    if (this.isNew || this.isModified('status')) {
        const Horse = mongoose.model('Horse');
        await Horse.findByIdAndUpdate(this.horse, {
            featured: {
                active: this.status === 'active',
                startDate: this.startDate,
                endDate: this.endDate,
                type: 'spotlight'
            }
        });
    }
    next();
});

module.exports = mongoose.model('Spotlight', spotlightSchema); 