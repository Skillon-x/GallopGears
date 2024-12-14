const Inquiry = require('../models/Inquiry');
const Horse = require('../models/Horse');
const Seller = require('../models/Seller');

// @desc    Create inquiry
// @route   POST /api/inquiries
// @access  Private
exports.createInquiry = async (req, res) => {
    try {
        const { horse: horseId, message, contactPreference } = req.body;

        // Check if horse exists
        const horse = await Horse.findById(horseId);
        if (!horse) {
            return res.status(404).json({
                success: false,
                message: 'Horse not found'
            });
        }

        // Get seller from horse
        const seller = await Seller.findById(horse.seller);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        // Create inquiry
        const inquiry = await Inquiry.create({
            user: req.user._id,
            seller: seller._id,
            horse: horseId,
            message,
            contactPreference,
            metadata: {
                userAgent: req.headers['user-agent'],
                ip: req.ip
            }
        });

        // Increment horse inquiries
        await horse.incrementInquiries();

        res.status(201).json({
            success: true,
            inquiry
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all inquiries for a seller
// @route   GET /api/inquiries/seller
// @access  Private (Seller)
exports.getSellerInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find({ seller: req.seller._id })
            .populate('user', 'name email')
            .populate('horse', 'name')
            .sort('-createdAt');

        res.json({
            success: true,
            inquiries
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all inquiries for a buyer
// @route   GET /api/inquiries/buyer
// @access  Private
exports.getBuyerInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find({ user: req.user._id })
            .populate('seller', 'businessName')
            .populate('horse', 'name')
            .sort('-createdAt');

        res.json({
            success: true,
            inquiries
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single inquiry
// @route   GET /api/inquiries/:id
// @access  Private
exports.getInquiryById = async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id)
            .populate('user', 'name email')
            .populate('seller', 'businessName')
            .populate('horse', 'name');

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        // Check if user is authorized to view this inquiry
        const isSeller = req.seller && inquiry.seller.toString() === req.seller._id.toString();
        const isBuyer = inquiry.user.toString() === req.user._id.toString();

        if (!isSeller && !isBuyer) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this inquiry'
            });
        }

        res.json({
            success: true,
            inquiry
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id/status
// @access  Private (Seller)
exports.updateInquiryStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        // Check if seller owns this inquiry
        if (inquiry.seller.toString() !== req.seller._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this inquiry'
            });
        }

        inquiry.status = status;
        inquiry.lastActivity = Date.now();
        await inquiry.save();

        res.json({
            success: true,
            inquiry
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Respond to inquiry
// @route   POST /api/inquiries/:id/respond
// @access  Private (Seller)
exports.respondToInquiry = async (req, res) => {
    try {
        const { message } = req.body;

        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        // Check if seller owns this inquiry
        if (inquiry.seller.toString() !== req.seller._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to respond to this inquiry'
            });
        }

        inquiry.response = {
            message,
            date: Date.now()
        };
        inquiry.status = 'responded';
        inquiry.lastActivity = Date.now();
        await inquiry.save();

        res.json({
            success: true,
            inquiry
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}; 