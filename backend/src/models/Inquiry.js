const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true
    },
    horse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Horse',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'responded', 'closed'],
        default: 'pending'
    },
    response: {
        message: String,
        date: Date
    },
    contactPreference: {
        type: String,
        enum: ['email', 'phone', 'whatsapp'],
        required: true
    },
    attachments: [{
        url: String,
        public_id: String,
        filename: String,
        fileType: String
    }],
    metadata: {
        userAgent: String,
        ip: String,
        location: {
            country: String,
            city: String
        }
    },
    isRead: {
        type: Boolean,
        default: false
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create indexes
inquirySchema.index({ user: 1, seller: 1 });
inquirySchema.index({ horse: 1 });
inquirySchema.index({ status: 1 });
inquirySchema.index({ createdAt: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema); 