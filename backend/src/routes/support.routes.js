const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { body } = require('express-validator');
const {
    createTicket,
    getTickets,
    getTicketById,
    updateTicket,
    getFaqs,
    getFaqById
} = require('../controllers/support.controller');

// Validation middleware
const createTicketValidation = [
    body('subject').notEmpty().withMessage('Subject is required'),
    body('category')
        .isIn(['account', 'payment', 'listing', 'technical', 'verification', 'report', 'other'])
        .withMessage('Valid category is required'),
    body('priority')
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Valid priority is required'),
    body('description').notEmpty().withMessage('Description is required')
];

const updateTicketValidation = [
    body('status')
        .optional()
        .isIn(['open', 'in_progress', 'waiting_for_user', 'resolved', 'closed'])
        .withMessage('Valid status is required'),
    body('message').optional().notEmpty().withMessage('Message is required')
];

// Support ticket routes
router.post('/tickets', protect, createTicketValidation, createTicket);
router.get('/tickets', protect, getTickets);
router.get('/tickets/:id', protect, getTicketById);
router.put('/tickets/:id', protect, updateTicketValidation, updateTicket);

// FAQ routes
router.get('/faqs', getFaqs);
router.get('/faqs/:id', getFaqById);

module.exports = router; 