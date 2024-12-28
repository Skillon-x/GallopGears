const mongoose = require('mongoose');

const horseSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    breed: {
        type: String,
        required: true
    },
    age: {
        years: {
            type: Number,
            required: true,
            min: 0
        },
        months: {
            type: Number,
            required: true,
            min: 0,
            max: 11
        }
    },
    gender: {
        type: String,
        required: true,
        enum: ['Stallion', 'Mare', 'Gelding', 'Other']
    },
    color: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    location: {
        state: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        }
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        },
        thumbnail_url: String,
        width: Number,
        height: Number,
        format: String
    }],
    specifications: {
        training: {
            type: String,
            required: true,
            enum: ['Basic', 'Intermediate', 'Advanced']
        },
        discipline: [{
            type: String,
            required: true
        }],
        temperament: {
            type: String,
            required: true
        },
        healthStatus: {
            type: String,
            required: true
        },
        vaccination: {
            type: Boolean,
            default: false
        },
        papers: {
            type: Boolean,
            default: false
        }
    },
    listingStatus: {
        type: String,
        enum: ['draft', 'active', 'sold', 'inactive'],
        default: 'draft'
    },
    statistics: {
        views: {
            type: Number,
            default: 0
        },
        inquiries: {
            type: Number,
            default: 0
        },
        lastViewed: {
            type: Date,
            default: Date.now
        }
    },
    boost: {
        active: {
            type: Boolean,
            default: false
        },
        startDate: Date,
        endDate: Date
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'unverified'],
        default: 'unverified'
    },
    verificationDetails: {
        submittedAt: Date,
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        verifiedAt: Date,
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        documents: [{
            type: {
                type: String,
                enum: ['registration', 'medical', 'ownership', 'other']
            },
            url: String,
            public_id: String,
            verified: {
                type: Boolean,
                default: false
            }
        }],
        notes: String,
        rejectionReason: String
    },
    expiryDate: {
        type: Date,
        required: true,
        default: () => {
            const date = new Date();
            date.setDate(date.getDate() + 30); // Default 30 days
            return date;
        }
    },
    featured: {
        active: {
            type: Boolean,
            default: false
        },
        startDate: Date,
        endDate: Date,
        position: Number
    }
}, {
    timestamps: true
});

// Update statistics when horse is viewed
horseSchema.methods.incrementViews = async function(userId) {
    // Only increment if userId is provided (authenticated user)
    if (userId) {
        const HorseView = mongoose.model('HorseView');
        
        // Check if user has already viewed today
        const hasViewed = await HorseView.hasViewedToday(this._id, userId);
        
        if (!hasViewed) {
            // Create new view record
            await HorseView.create({
                horse: this._id,
                user: userId,
                viewDate: new Date()
            });
            
            // Increment view count
            this.statistics.views += 1;
            this.statistics.lastViewed = Date.now();
            await this.save();
        }
    }
    return this;
};

// Update statistics when inquiry is created
horseSchema.methods.incrementInquiries = async function() {
    this.statistics.inquiries += 1;
    await this.save();
};

// Check if listing is expired
horseSchema.methods.isExpired = function() {
    return this.expiryDate && this.expiryDate < new Date();
};

// Check if listing is boosted
horseSchema.methods.isBoosted = function() {
    return this.boost && 
           this.boost.active && 
           this.boost.endDate && 
           this.boost.endDate > new Date();
};

// Check if listing is featured
horseSchema.methods.isFeatured = function() {
    return this.featured && 
           this.featured.active && 
           this.featured.endDate && 
           this.featured.endDate > new Date();
};

// Pre-save hook to check expiry and status
horseSchema.pre('save', function(next) {
    // Update listing status if expired
    if (this.isExpired() && this.listingStatus === 'active') {
        this.listingStatus = 'expired';
    }

    // Deactivate boost if expired
    if (this.boost && this.boost.active && this.boost.endDate < new Date()) {
        this.boost.active = false;
    }

    // Deactivate featured status if expired
    if (this.featured && this.featured.active && this.featured.endDate < new Date()) {
        this.featured.active = false;
        this.featured.position = undefined;
    }

    next();
});

module.exports = mongoose.model('Horse', horseSchema); 