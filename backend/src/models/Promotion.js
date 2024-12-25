const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['coupon', 'special_offer', 'package_discount'],
        required: true
    },
    code: {
        type: String,
        unique: true,
        sparse: true // Allow null values to be unique
    },
    description: String,
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
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
    applicableTo: {
        type: String,
        enum: ['all_packages', 'specific_package', 'boost', 'feature'],
        required: true
    },
    specificPackage: {
        type: String,
        enum: ['Royal Stallion', 'Gallop', 'Trot']
    },
    minimumPurchaseAmount: {
        type: Number,
        default: 0
    },
    maximumDiscount: Number,
    usageLimit: {
        perUser: Number,
        total: Number
    },
    currentUsage: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active'
    },
    conditions: {
        newUsersOnly: {
            type: Boolean,
            default: false
        },
        specificUserType: {
            type: String,
            enum: ['all', 'seller', 'buyer']
        },
        minimumListings: Number
    },
    metadata: {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
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
promotionSchema.index({ code: 1 }, { unique: true, sparse: true });
promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ status: 1 });

module.exports = mongoose.model('Promotion', promotionSchema); 