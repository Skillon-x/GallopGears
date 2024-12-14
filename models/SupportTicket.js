const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    ticketNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: [
            'account',
            'payment',
            'listing',
            'technical',
            'verification',
            'report',
            'other'
        ],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'waiting_for_user', 'resolved', 'closed'],
        default: 'open'
    },
    description: {
        type: String,
        required: true
    },
    attachments: [{
        url: String,
        public_id: String,
        filename: String,
        fileType: String
    }],
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: {
            type: String,
            required: true
        },
        attachments: [{
            url: String,
            public_id: String,
            filename: String,
            fileType: String
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    relatedEntity: {
        type: {
            type: String,
            enum: ['listing', 'order', 'payment', 'user']
        },
        id: mongoose.Schema.Types.ObjectId
    },
    metadata: {
        browser: String,
        os: String,
        ip: String,
        userAgent: String
    },
    resolution: {
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        resolvedAt: Date,
        resolution: String,
        feedback: {
            rating: Number,
            comment: String
        }
    },
    tags: [String],
    internalNotes: [{
        note: String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Create ticket number before saving
supportTicketSchema.pre('save', async function(next) {
    if (!this.ticketNumber) {
        const count = await mongoose.model('SupportTicket').countDocuments();
        this.ticketNumber = `TKT${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

// Create indexes
supportTicketSchema.index({ ticketNumber: 1 }, { unique: true });
supportTicketSchema.index({ user: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ assignedTo: 1 });
supportTicketSchema.index({ 'relatedEntity.type': 1, 'relatedEntity.id': 1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema); 