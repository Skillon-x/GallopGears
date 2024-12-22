const mongoose = require('mongoose');

// Define subscription features for each plan
const SUBSCRIPTION_FEATURES = {
    'Royal Stallion': {
        maxPhotos: 20,
        maxListings: 9999,
        listingDuration: 90,
        verificationLevel: 'premium',
        virtualStableTour: true,
        analytics: true,
        homepageSpotlight: 5,
        featuredListingBoosts: {
            count: 3,
            duration: 7
        },
        priorityPlacement: true,
        badges: ['Top Seller', 'Premium Stable'],
        searchPlacement: 'premium',
        socialMediaSharing: true,
        seriousBuyerAccess: true
    },
    'Gallop': {
        maxPhotos: 10,
        maxListings: 10,
        listingDuration: 60,
        verificationLevel: 'basic',
        virtualStableTour: false,
        analytics: true,
        homepageSpotlight: 2,
        featuredListingBoosts: {
            count: 1,
            duration: 5
        },
        priorityPlacement: false,
        badges: ['Verified Seller'],
        searchPlacement: 'basic',
        socialMediaSharing: true,
        seriousBuyerAccess: false
    },
    'Trot': {
        maxPhotos: 5,
        maxListings: 5,
        listingDuration: 30,
        verificationLevel: 'basic',
        virtualStableTour: false,
        analytics: false,
        homepageSpotlight: 0,
        featuredListingBoosts: {
            count: 0,
            duration: 0
        },
        priorityPlacement: false,
        badges: ['Basic Seller'],
        searchPlacement: 'basic',
        socialMediaSharing: false,
        seriousBuyerAccess: false
    }
};

const subscriptionSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    plan: {
        type: String,
        enum: ['Royal Stallion', 'Gallop', 'Trot', null],
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
    lastPayment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    }
}, {
    timestamps: true
});

// Static method to get subscription features
subscriptionSchema.statics.getFeatures = function(planName) {
    return SUBSCRIPTION_FEATURES[planName] || null;
};

// Method to update subscription features
subscriptionSchema.methods.updateFeatures = function(planName) {
    if (SUBSCRIPTION_FEATURES[planName]) {
        this.plan = planName;
        this.status = 'active';
        this.startDate = new Date();
        this.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        this.features = SUBSCRIPTION_FEATURES[planName];
    }
    return this;
};

module.exports = {
    Subscription: mongoose.model('Subscription', subscriptionSchema),
    SUBSCRIPTION_FEATURES
}; 