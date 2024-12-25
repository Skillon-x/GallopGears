const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    type: {
        type: String,
        enum: ['subscription', 'feature_purchase', 'refund'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    subscriptionDetails: {
        package: {
            type: String,
            enum: ['Royal Stallion', 'Gallop', 'Trot']
        },
        duration: Number, // in months
        startDate: Date,
        endDate: Date
    },
    featureDetails: {
        type: {
            type: String,
            enum: ['spotlight', 'featured_listing', 'virtual_tour']
        },
        duration: Number, // in days
        horseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Horse'
        }
    },
    paymentMethod: {
        type: String,
        required: function() {
            return process.env.NODE_ENV !== 'test';
        },
        default: function() {
            return process.env.NODE_ENV === 'test' ? 'test_payment' : undefined;
        }
    },
    razorpayPaymentId: String,
    razorpayOrderId: String,
    razorpaySignature: String,
    razorpayRefundId: String,
    invoice: {
        number: String,
        url: String
    },
    refundReason: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema); 