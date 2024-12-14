const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Horse = require('../models/Horse');
const Seller = require('../models/Seller');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private (Admin)
router.get('/transactions', protect, authorize('admin'), async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('seller', 'businessName')
            .sort('-createdAt');

        res.json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        // Get counts
        const userCount = await User.countDocuments();
        const sellerCount = await Seller.countDocuments();
        const horseCount = await Horse.countDocuments();
        const transactionCount = await Transaction.countDocuments();

        // Get total transaction amount
        const transactions = await Transaction.find({ status: 'completed' });
        const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0);

        // Get active listings
        const activeListings = await Horse.countDocuments({ listingStatus: 'active' });

        // Get recent transactions
        const recentTransactions = await Transaction.find()
            .populate('seller', 'businessName')
            .sort('-createdAt')
            .limit(5);

        res.json({
            success: true,
            stats: {
                users: {
                    total: userCount,
                    sellers: sellerCount,
                    buyers: userCount - sellerCount
                },
                horses: {
                    total: horseCount,
                    active: activeListings
                },
                transactions: {
                    total: transactionCount,
                    totalRevenue,
                    recent: recentTransactions
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router; 