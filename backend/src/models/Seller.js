const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    businessName: {
        type: String,
        required: true,
        trim: true
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
    contactDetails: {
        phone: {
            type: String,
            required: true,
            match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
        },
        email: {
            type: String,
            required: true,
            match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email']
        },
        whatsapp: {
            type: String,
            match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit WhatsApp number']
        }
    },
    businessDocuments: {
        gst: String,
        pan: String,
        otherDocuments: [{
            name: String,
            url: String,
            verified: {
                type: Boolean,
                default: false
            }
        }]
    },
    subscription: {
        plan: {
            type: String,
            enum: ['Free', 'Royal Stallion', 'Gallop', 'Trot', null],
            default: null
        },
        status: {
            type: String,
            enum: ['inactive', 'active', 'expired', 'cancelled'],
            default: 'inactive'
        },
        startDate: {
            type: Date,
            default: null
        },
        endDate: {
            type: Date,
            default: null
        },
        features: {
            maxPhotos: {
                type: Number,
                default: 0
            },
            maxListings: {
                type: Number,
                default: 0
            },
            listingDuration: {
                type: Number,
                default: 0
            },
            verificationLevel: {
                type: String,
                enum: ['none', 'basic', 'premium'],
                default: 'none'
            },
            virtualStableTour: {
                type: Boolean,
                default: false
            },
            analytics: {
                type: Boolean,
                default: false
            },
            homepageSpotlight: {
                type: Number,
                default: 0
            },
            featuredListingBoosts: {
                count: {
                    type: Number,
                    default: 0
                },
                duration: {
                    type: Number,
                    default: 0
                }
            },
            priorityPlacement: {
                type: Boolean,
                default: false
            },
            badges: [{
                type: String
            }],
            searchPlacement: {
                type: String,
                enum: ['none', 'basic', 'premium'],
                default: 'none'
            },
            socialMediaSharing: {
                type: Boolean,
                default: false
            },
            seriousBuyerAccess: {
                type: Boolean,
                default: false
            }
        },
        transaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction'
        }
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    verification: {
        level: {
            type: String,
            enum: ['basic', 'professional', null],
            default: null
        },
        status: {
            type: String,
            enum: ['unverified', 'pending', 'verified', 'rejected'],
            default: 'unverified'
        },
        submittedAt: Date,
        verifiedAt: Date,
        expiresAt: Date,
        documents: [{
            type: {
                type: String,
                enum: ['identity', 'address', 'business_license', 'tax_registration', 'bank_statement']
            },
            url: String,
            public_id: String,
            verified: {
                type: Boolean,
                default: false
            },
            verifiedAt: Date,
            verifiedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
        notes: String,
        rejectionReason: String
    },
    badges: [{
        type: {
            type: String,
            enum: ['Top Seller', 'Premium Stable', 'Verified Seller']
        },
        awardedAt: {
            type: Date,
            default: Date.now
        },
        expiresAt: Date,
        criteria: {
            type: Map,
            of: mongoose.Schema.Types.Mixed
        }
    }],
    statistics: {
        totalListings: {
            type: Number,
            default: 0
        },
        activeListings: {
            type: Number,
            default: 0
        },
        activeSales: {
            type: Number,
            default: 0
        },
        totalSales: {
            type: Number,
            default: 0
        },
        totalRevenue: {
            type: Number,
            default: 0
        },
        responseRate: {
            type: Number,
            default: 0
        },
        responseTime: {
            type: Number, // in hours
            default: 0
        }
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

// Pre-save hook to update statistics
sellerSchema.pre('save', async function(next) {
    if (this.isModified('reviews')) {
        // Update rating
        if (this.reviews && this.reviews.length > 0) {
            const totalRating = this.reviews.reduce((acc, review) => acc + review.rating, 0);
            this.statistics.rating = totalRating / this.reviews.length;
            this.statistics.reviewCount = this.reviews.length;
        }
    }

    // Check badge expiry
    if (this.badges) {
        this.badges = this.badges.filter(badge => 
            !badge.expiresAt || badge.expiresAt > new Date()
        );
    }

    // Check verification expiry
    if (this.verification && this.verification.expiresAt && this.verification.expiresAt < new Date()) {
        this.verification.status = 'unverified';
        this.verification.level = null;
    }

    next();
});

// Method to check badge eligibility
sellerSchema.methods.checkBadgeEligibility = async function() {
    const eligibleBadges = [];

    // Top Seller criteria
    if (
        this.statistics.totalSales >= 5 &&
        this.statistics.rating >= 4.5 &&
        this.statistics.totalListings >= 10
    ) {
        eligibleBadges.push('Top Seller');
    }

    // Premium Stable criteria
    if (
        this.subscription?.plan === 'Royal Stallion' &&
        this.verification?.level === 'professional' &&
        this.statistics.rating >= 4.0 &&
        this.statistics.totalListings >= 5
    ) {
        eligibleBadges.push('Premium Stable');
    }

    // Verified Seller criteria
    if (this.verification?.level === 'basic') {
        eligibleBadges.push('Verified Seller');
    }

    return eligibleBadges;
};

// Method to award badge
sellerSchema.methods.awardBadge = async function(badgeType) {
    if (!this.badges) {
        this.badges = [];
    }

    // Remove existing badge of same type
    this.badges = this.badges.filter(b => b.type !== badgeType);

    // Add new badge
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 3); // Badges expire after 3 months

    this.badges.push({
        type: badgeType,
        awardedAt: new Date(),
        expiresAt: expiryDate,
        criteria: this.statistics
    });

    await this.save();
};

// Method to check if subscription is active
sellerSchema.methods.hasActiveSubscription = function() {
    return this.subscription.status === 'active' && 
           new Date() < this.subscription.expiresAt;
};

// Method to get listing limit based on subscription
sellerSchema.methods.getListingLimit = function() {
    switch (this.subscription.plan) {
        case 'Trot':
            return 2;
        case 'Gallop':
            return 10;
        case 'Royal Stallion':
            return 9999;
        default:
            return 0;
    }
};

// Method to check if can add more listings
sellerSchema.methods.canAddListing = function() {
    if (!this.hasActiveSubscription()) return false;
    return this.statistics.activeListings < this.getListingLimit();
};

// Method to generate auth token (if needed for tests)
sellerSchema.methods.generateAuthToken = function() {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
        { 
            _id: this._id,
            role: 'seller',
            businessName: this.businessName
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

module.exports = mongoose.model('Seller', sellerSchema); 