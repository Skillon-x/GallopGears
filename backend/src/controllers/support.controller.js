const SupportTicket = require('../models/SupportTicket');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create support ticket
// @route   POST /api/support/tickets
// @access  Private
exports.createTicket = async (req, res) => {
    try {
        // Generate ticket number
        const count = await SupportTicket.countDocuments();
        const ticketNumber = `TKT${String(count + 1).padStart(6, '0')}`;

        const ticket = await SupportTicket.create({
            user: req.user._id,
            ticketNumber,
            ...req.body
        });

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'support_ticket_create',
            entityType: 'ticket',
            entityId: ticket._id,
            description: 'Support ticket created',
            status: 'success'
        });

        res.status(201).json({
            success: true,
            ticket
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get user's tickets
// @route   GET /api/support/tickets
// @access  Private
exports.getTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ user: req.user._id })
            .sort('-createdAt');

        res.json({
            success: true,
            tickets
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get ticket by ID
// @route   GET /api/support/tickets/:id
// @access  Private
exports.getTicketById = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Check ownership
        if (ticket.user.toString() !== req.user._id.toString() && 
            req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this ticket'
            });
        }

        res.json({
            success: true,
            ticket
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update ticket
// @route   PUT /api/support/tickets/:id
// @access  Private
exports.updateTicket = async (req, res) => {
    try {
        let ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Check ownership
        if (ticket.user.toString() !== req.user._id.toString() && 
            req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this ticket'
            });
        }

        // If adding a message, add to messages array
        if (req.body.message) {
            ticket.messages.push({
                sender: req.user._id,
                message: req.body.message
            });
            delete req.body.message;
        }

        // Update other fields
        ticket = await SupportTicket.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                messages: ticket.messages
            },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            ticket
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get FAQs
// @route   GET /api/support/faqs
// @access  Public
exports.getFaqs = async (req, res) => {
    try {
        // Static FAQs for now
        const faqs = [
            {
                id: 1,
                category: 'General',
                question: 'How do I create a seller account?',
                answer: 'To create a seller account, register as a user first and then upgrade to a seller account from your profile settings.'
            },
            {
                id: 2,
                category: 'Listings',
                question: 'How many horses can I list?',
                answer: 'The number of horses you can list depends on your subscription plan. Basic users can list up to 2 horses, while premium users have unlimited listings.'
            },
            {
                id: 3,
                category: 'Payments',
                question: 'What payment methods are accepted?',
                answer: 'We accept all major credit/debit cards and UPI payments through our secure payment gateway.'
            },
            {
                id: 4,
                category: 'Verification',
                question: 'How do I verify my seller account?',
                answer: 'Upload the required documents in your seller dashboard. Our team will review and verify your account within 2-3 business days.'
            }
        ];

        res.json({
            success: true,
            faqs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get FAQ by ID
// @route   GET /api/support/faqs/:id
// @access  Public
exports.getFaqById = async (req, res) => {
    try {
        // Static FAQs for now
        const faqs = {
            1: {
                category: 'General',
                question: 'How do I create a seller account?',
                answer: 'To create a seller account, register as a user first and then upgrade to a seller account from your profile settings.'
            },
            2: {
                category: 'Listings',
                question: 'How many horses can I list?',
                answer: 'The number of horses you can list depends on your subscription plan. Basic users can list up to 2 horses, while premium users have unlimited listings.'
            },
            3: {
                category: 'Payments',
                question: 'What payment methods are accepted?',
                answer: 'We accept all major credit/debit cards and UPI payments through our secure payment gateway.'
            },
            4: {
                category: 'Verification',
                question: 'How do I verify my seller account?',
                answer: 'Upload the required documents in your seller dashboard. Our team will review and verify your account within 2-3 business days.'
            }
        };

        const faq = faqs[req.params.id];
        if (!faq) {
            return res.status(404).json({
                success: false,
                message: 'FAQ not found'
            });
        }

        res.json({
            success: true,
            faq
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}; 