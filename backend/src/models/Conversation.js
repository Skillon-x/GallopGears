const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['buyer', 'seller'],
            required: true
        },
        lastRead: {
            type: Date,
            default: Date.now
        },
        muted: {
            type: Boolean,
            default: false
        }
    }],
    relatedEntity: {
        type: {
            type: String,
            enum: ['horse', 'inquiry', 'transaction'],
            required: true
        },
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    },
    lastMessage: {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: String,
        sentAt: Date
    },
    settings: {
        autoResponder: {
            enabled: {
                type: Boolean,
                default: false
            },
            message: String
        },
        notifications: {
            enabled: {
                type: Boolean,
                default: true
            },
            schedule: {
                start: String,
                end: String,
                timezone: String
            }
        }
    },
    status: {
        type: String,
        enum: ['active', 'archived', 'blocked'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Create indexes
conversationSchema.index({ 'participants.user': 1, status: 1 });
conversationSchema.index({ 'relatedEntity.type': 1, 'relatedEntity.id': 1 });
conversationSchema.index({ updatedAt: -1 });

// Methods
conversationSchema.methods.isParticipant = function(userId) {
    return this.participants.some(p => p.user.toString() === userId.toString());
};

conversationSchema.methods.updateLastMessage = async function(message) {
    this.lastMessage = {
        sender: message.sender,
        content: message.content,
        sentAt: message.createdAt
    };
    await this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema); 