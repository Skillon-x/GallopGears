const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const {
    startConversation,
    sendMessage,
    getConversations,
    getMessages,
    updateConversationSettings
} = require('../controllers/messaging.controller');

// Validation middleware
const startConversationValidation = [
    body('recipientId').notEmpty().withMessage('Recipient ID is required'),
    body('entityType')
        .isIn(['horse', 'inquiry', 'transaction'])
        .withMessage('Valid entity type is required'),
    body('entityId').notEmpty().withMessage('Entity ID is required')
];

const sendMessageValidation = [
    body('conversationId').notEmpty().withMessage('Conversation ID is required'),
    body('content').notEmpty().withMessage('Message content is required'),
    body('attachments').optional().isArray().withMessage('Attachments must be an array')
];

const settingsValidation = [
    body('muted').optional().isBoolean().withMessage('Muted must be a boolean'),
    body('autoResponder').optional().isObject().withMessage('Auto responder must be an object'),
    body('notifications').optional().isObject().withMessage('Notifications must be an object')
];

// All routes require authentication
router.use(protect);

// Conversation routes
router.post('/conversations', startConversationValidation, startConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getMessages);
router.put('/conversations/:conversationId/settings', settingsValidation, updateConversationSettings);

// Message routes
router.post('/messages', sendMessageValidation, sendMessage);

module.exports = router; 