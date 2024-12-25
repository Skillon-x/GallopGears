const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    action: {
        type: String,
        required: true,
        enum: [
            // User actions
            'user_login',
            'user_logout',
            'user_register',
            'password_change',
            'profile_update',
            'preferences_update',
            'alert_preferences_update',
            'support_ticket_create',
            
            // Seller actions
            'seller_register',
            'subscription_purchase',
            'listing_create',
            'listing_update',
            'listing_delete',
            'document_upload',
            'listing_verify_submit',
            'listing_boost',
            'listing_expire',
            
            // Admin actions
            'user_block',
            'user_unblock',
            'listing_verify',
            'listing_reject',
            'promotion_create',
            'category_create',
            'category_update',
            'category_delete',
            
            // System actions
            'subscription_expire',
            'payment_process',
            'email_send',
            'notification_send',
            'backup_create',
            'system_update',

            // Visibility actions
            'add_spotlight',
            'social_share',
            'view_listing',
            'spotlight_expire'
        ]
    },
    entityType: {
        type: String,
        enum: [
            'user',
            'seller',
            'listing',
            'subscription',
            'payment',
            'category',
            'promotion',
            'ticket',
            'system',
            'spotlight',
            'social_share',
            'horse'
        ],
        required: true
    },
    entityId: mongoose.Schema.Types.ObjectId,
    description: {
        type: String,
        required: true
    },
    metadata: {
        ip: String,
        userAgent: String,
        browser: String,
        os: String,
        device: String,
        location: {
            country: String,
            city: String,
            coordinates: {
                latitude: Number,
                longitude: Number
            }
        }
    },
    status: {
        type: String,
        enum: ['success', 'failure', 'warning'],
        required: true
    },
    details: {
        before: mongoose.Schema.Types.Mixed,
        after: mongoose.Schema.Types.Mixed,
        reason: String,
        error: String
    },
    severity: {
        type: String,
        enum: ['info', 'low', 'medium', 'high', 'critical'],
        default: 'info'
    },
    tags: [String]
}, {
    timestamps: true
});

// Create indexes
activityLogSchema.index({ user: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });
activityLogSchema.index({ createdAt: 1 });
activityLogSchema.index({ status: 1 });
activityLogSchema.index({ severity: 1 });

// Add TTL index for automatic deletion after 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('ActivityLog', activityLogSchema); 