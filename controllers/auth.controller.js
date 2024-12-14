const User = require('../models/User');
const Seller = require('../models/Seller');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

// Helper function to get user with seller info
const getUserWithSellerInfo = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return null;

    if (user.role === 'seller') {
        const seller = await Seller.findOne({ user: user._id });
        if (seller) {
            return {
                ...user.toObject(),
                seller
            };
        }
    }
    return user.toObject();
};

// Helper function to create token
const createToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// @desc    Health check
// @route   GET /api/auth/health
// @access  Public
exports.healthCheck = async (req, res) => {
    try {
        // Check database connection
        await User.findOne();
        res.json({
            success: true,
            message: 'Server is healthy',
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server is not healthy',
            error: error.message
        });
    }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, role } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user
        user = await User.create({
            name,
            email,
            password,
            role: role || 'user'
        });

        // Get user with seller info if applicable
        const userWithInfo = await getUserWithSellerInfo(user._id);

        // Create token
        const token = createToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: userWithInfo
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Get user with seller info if applicable
        const userWithInfo = await getUserWithSellerInfo(user._id);

        // Create token
        const token = createToken(user._id);

        res.json({
            success: true,
            token,
            user: userWithInfo
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const userWithInfo = await getUserWithSellerInfo(req.user._id);
        if (!userWithInfo) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: userWithInfo
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}; 