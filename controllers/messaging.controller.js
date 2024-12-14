const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Seller = require('../models/Seller');
const ActivityLog = require('../models/ActivityLog');

// @desc    Start or get conversation
// @route   POST /api/messaging/conversations
// @access  Private
exports.startConversation = async (req, res) => {
    try {
        const { recipientId, entityType, entityId } = req.body;

        // Validate recipient
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: 'Recipient not found'
            });
        }

        // Get seller profile if recipient is a seller
        let seller = null;
        if (recipient.role === 'seller') {
            seller = await Seller.findOne({ user: recipient._id });
            if (!seller) {
                return res.status(404).json({
                    success: false,
                    message: 'Seller profile not found'
                });
            }
        }

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            'participants.user': { $all: [req.user._id, recipient._id] },
            'relatedEntity.type': entityType,
            'relatedEntity.id': entityId,
            status: 'active'
        }).populate('participants.user', 'name email role');

        if (conversation) {
            return res.status(200).json({
                success: true,
                conversation
            });
        }

        // Create new conversation
        conversation = await Conversation.create({
            participants: [
                {
                    user: req.user._id,
                    role: req.user.role === 'seller' ? 'seller' : 'buyer'
                },
                {
                    user: recipient._id,
                    role: recipient.role === 'seller' ? 'seller' : 'buyer'
                }
            ],
            relatedEntity: {
                type: entityType,
                id: entityId
            }
        });

        // Populate user details
        conversation = await conversation.populate('participants.user', 'name email role');

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'user_register',
            entityType: 'user',
            entityId: conversation._id,
            description: `Started conversation with ${recipient.name}`,
            status: 'success'
        });

        res.status(201).json({
            success: true,
            conversation
        });

    } catch (error) {
        console.error('Start conversation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error starting conversation'
        });
    }
};

// @desc    Send message
// @route   POST /api/messaging/messages
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId, content, attachments } = req.body;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Verify participant
        if (!conversation.isParticipant(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to send messages in this conversation'
            });
        }

        // Create message
        const message = await Message.create({
            conversation: conversationId,
            sender: req.user._id,
            content,
            attachments: attachments || [],
            readBy: [{
                user: req.user._id,
                readAt: new Date()
            }]
        });

        // Update conversation last message
        await conversation.updateLastMessage(message);

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'user_register',
            entityType: 'user',
            entityId: message._id,
            description: 'Sent message',
            status: 'success'
        });

        res.status(201).json({
            success: true,
            message: await message.populate('sender', 'name email role')
        });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error sending message'
        });
    }
};

// @desc    Get conversations
// @route   GET /api/messaging/conversations
// @access  Private
exports.getConversations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const conversations = await Conversation.find({
            'participants.user': req.user._id,
            status: 'active'
        })
            .sort('-updatedAt')
            .skip(skip)
            .limit(limit)
            .populate('participants.user', 'name email role')
            .populate('lastMessage.sender', 'name email');

        const total = await Conversation.countDocuments({
            'participants.user': req.user._id,
            status: 'active'
        });

        res.json({
            success: true,
            data: {
                conversations,
                pagination: {
                    page,
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting conversations'
        });
    }
};

// @desc    Get conversation messages
// @route   GET /api/messaging/conversations/:conversationId/messages
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Verify participant
        if (!conversation.isParticipant(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this conversation'
            });
        }

        // Mark messages as read
        await Message.updateMany(
            {
                conversation: conversationId,
                sender: { $ne: req.user._id },
                'readBy.user': { $ne: req.user._id }
            },
            {
                $push: {
                    readBy: {
                        user: req.user._id,
                        readAt: new Date()
                    }
                }
            }
        );

        // Update participant's last read timestamp
        await Conversation.updateOne(
            {
                _id: conversationId,
                'participants.user': req.user._id
            },
            {
                $set: {
                    'participants.$.lastRead': new Date()
                }
            }
        );

        // Get updated messages
        const updatedMessages = await Message.find({ conversation: conversationId })
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .populate('sender', 'name email role');

        res.json({
            success: true,
            messages: updatedMessages
        });

    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting messages'
        });
    }
};

// @desc    Update conversation settings
// @route   PUT /api/messaging/conversations/:conversationId/settings
// @access  Private
exports.updateConversationSettings = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { muted, autoResponder, notifications } = req.body;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Verify participant
        if (!conversation.isParticipant(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this conversation'
            });
        }

        // Update participant settings
        if (typeof muted === 'boolean') {
            await Conversation.updateOne(
                {
                    _id: conversationId,
                    'participants.user': req.user._id
                },
                {
                    $set: {
                        'participants.$.muted': muted
                    }
                }
            );
        }

        // Update conversation settings
        if (autoResponder || notifications) {
            const update = {};
            if (autoResponder) {
                update['settings.autoResponder'] = autoResponder;
            }
            if (notifications) {
                update['settings.notifications'] = notifications;
            }
            await conversation.updateOne({ $set: update });
        }

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'user_register',
            entityType: 'user',
            entityId: conversation._id,
            description: `Updated conversation settings`,
            status: 'success'
        });

        res.json({
            success: true,
            message: 'Conversation settings updated'
        });

    } catch (error) {
        console.error('Update conversation settings error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating conversation settings'
        });
    }
}; 