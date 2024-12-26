const mongoose = require('mongoose');

// Define subscription features for each plan
const SUBSCRIPTION_FEATURES = {
    'Free': {
        maxPhotos: 1,
        maxListings: 1,
        listingDuration: 7,
        verificationLevel: 'basic',
        virtualStableTour: false,
        analytics: false,
        homepageSpotlight: 0,
        featuredListingBoosts: {
            count: 0,
            duration: 0
        },
        priorityPlacement: false,
        badges: ['Free User'],
        searchPlacement: 'basic',
        socialMediaSharing: false,
        seriousBuyerAccess: false
    },
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

const queuedPlanSchema = new mongoose.Schema({
    plan: {
        type: String,
        enum: ['Royal Stallion', 'Gallop', 'Trot', 'Free'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    features: {
        maxPhotos: Number,
        maxListings: Number,
        listingDuration: Number,
        verificationLevel: {
            type: String,
            enum: ['none', 'basic', 'premium']
        },
        virtualStableTour: Boolean,
        analytics: Boolean,
        homepageSpotlight: Number,
        featuredListingBoosts: {
            count: Number,
            duration: Number
        },
        priorityPlacement: Boolean,
        badges: [String],
        searchPlacement: {
            type: String,
            enum: ['none', 'basic', 'premium']
        },
        socialMediaSharing: Boolean,
        seriousBuyerAccess: Boolean
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }
}, { _id: false });

const subscriptionSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    plan: {
        type: String,
        enum: ['Royal Stallion', 'Gallop', 'Trot', 'Free', null],
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
    queuedPlans: [queuedPlanSchema],
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
subscriptionSchema.methods.updateFeatures = function(planName, startDate = new Date()) {
    if (SUBSCRIPTION_FEATURES[planName]) {
        this.plan = planName;
        this.status = 'active';
        this.startDate = startDate;
        this.endDate = new Date(startDate.getTime() + (planName === 'Free' ? 7 : 30) * 24 * 60 * 60 * 1000);
        this.features = SUBSCRIPTION_FEATURES[planName];
    }
    return this;
};

// Method to queue a plan
subscriptionSchema.methods.queuePlan = function(planName, transaction) {
    if (!SUBSCRIPTION_FEATURES[planName]) return this;

    const startDate = this.endDate || new Date();
    const duration = planName === 'Free' ? 7 : 30;
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);

    this.queuedPlans.push({
        plan: planName,
        startDate,
        endDate,
        features: SUBSCRIPTION_FEATURES[planName],
        transaction
    });

    return this;
};

// Method to activate next queued plan
subscriptionSchema.methods.activateNextPlan = function() {
    if (this.queuedPlans.length === 0) return false;

    const nextPlan = this.queuedPlans[0];
    this.plan = nextPlan.plan;
    this.startDate = nextPlan.startDate;
    this.endDate = nextPlan.endDate;
    this.features = nextPlan.features;
    this.status = 'active';
    this.lastPayment = nextPlan.transaction;

    this.queuedPlans.shift();
    return true;
};

module.exports = {
    Subscription: mongoose.model('Subscription', subscriptionSchema),
    SUBSCRIPTION_FEATURES
}; 