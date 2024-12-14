const Horse = require('../models/Horse');
const Inquiry = require('../models/Inquiry');
const Transaction = require('../models/Transaction');
const Seller = require('../models/Seller');

// @desc    Get seller dashboard stats
// @route   GET /api/seller/dashboard/stats
// @access  Private (Seller)
exports.getDashboardStats = async (req, res) => {
    try {
        // Get seller's horses count
        const totalHorses = await Horse.countDocuments({ seller: req.seller._id });
        const activeHorses = await Horse.countDocuments({ 
            seller: req.seller._id, 
            listingStatus: 'active' 
        });
        const draftHorses = await Horse.countDocuments({ 
            seller: req.seller._id, 
            listingStatus: 'draft' 
        });

        // Get seller's inquiries stats
        const totalInquiries = await Inquiry.countDocuments({ seller: req.seller._id });
        const pendingInquiries = await Inquiry.countDocuments({ 
            seller: req.seller._id,
            status: 'pending'
        });
        const respondedInquiries = await Inquiry.countDocuments({ 
            seller: req.seller._id,
            status: 'responded'
        });

        // Get seller's transactions stats
        const transactions = await Transaction.find({ 
            seller: req.seller._id,
            status: 'completed'
        });
        const totalRevenue = transactions.reduce((acc, curr) => acc + curr.amount, 0);

        // Get recent activities
        const recentHorses = await Horse.find({ seller: req.seller._id })
            .sort('-createdAt')
            .limit(5)
            .select('name price listingStatus createdAt');

        const recentInquiries = await Inquiry.find({ seller: req.seller._id })
            .sort('-createdAt')
            .limit(5)
            .populate('horse', 'name')
            .populate('user', 'name');

        const recentTransactions = await Transaction.find({ seller: req.seller._id })
            .sort('-createdAt')
            .limit(5);

        // Get subscription info
        const seller = await Seller.findById(req.seller._id)
            .select('subscription businessName');

        res.json({
            success: true,
            dashboard: {
                subscription: seller.subscription,
                listings: {
                    total: totalHorses,
                    active: activeHorses,
                    draft: draftHorses,
                    recent: recentHorses
                },
                inquiries: {
                    total: totalInquiries,
                    pending: pendingInquiries,
                    responded: respondedInquiries,
                    recent: recentInquiries
                },
                transactions: {
                    total: transactions.length,
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
};

// @desc    Get seller's performance metrics
// @route   GET /api/seller/dashboard/performance
// @access  Private (Seller)
exports.getPerformanceMetrics = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get listing views
        const horses = await Horse.find({ 
            seller: req.seller._id,
            createdAt: { $gte: thirtyDaysAgo }
        }).select('statistics');

        const totalViews = horses.reduce((acc, horse) => acc + horse.statistics.views, 0);
        const totalInquiryRate = horses.reduce((acc, horse) => acc + horse.statistics.inquiries, 0);

        // Get response rate
        const inquiries = await Inquiry.find({
            seller: req.seller._id,
            createdAt: { $gte: thirtyDaysAgo }
        });

        const responseRate = inquiries.length > 0 
            ? (inquiries.filter(i => i.status === 'responded').length / inquiries.length) * 100 
            : 0;

        // Get average response time
        const respondedInquiries = inquiries.filter(i => i.status === 'responded' && i.response);
        const avgResponseTime = respondedInquiries.length > 0
            ? respondedInquiries.reduce((acc, curr) => {
                const responseTime = new Date(curr.response.date) - new Date(curr.createdAt);
                return acc + responseTime;
            }, 0) / respondedInquiries.length
            : 0;

        res.json({
            success: true,
            performance: {
                thirtyDayMetrics: {
                    totalViews,
                    totalInquiries: totalInquiryRate,
                    responseRate: Math.round(responseRate),
                    averageResponseTime: Math.round(avgResponseTime / (1000 * 60 * 60)), // Convert to hours
                    listingCount: horses.length
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
};

// @desc    Get seller's listing analytics
// @route   GET /api/seller/dashboard/analytics/listings
// @access  Private (Seller)
exports.getListingAnalytics = async (req, res) => {
    try {
        const { period = '30' } = req.query; // Default to 30 days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        const horses = await Horse.find({
            seller: req.seller._id,
            createdAt: { $gte: startDate }
        }).select('statistics createdAt price listingStatus');

        // Group data by date
        const dailyStats = {};
        horses.forEach(horse => {
            const date = horse.createdAt.toISOString().split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = {
                    views: 0,
                    inquiries: 0,
                    listings: 0,
                    averagePrice: 0
                };
            }
            dailyStats[date].views += horse.statistics.views;
            dailyStats[date].inquiries += horse.statistics.inquiries;
            dailyStats[date].listings += 1;
            dailyStats[date].averagePrice = 
                (dailyStats[date].averagePrice * (dailyStats[date].listings - 1) + horse.price) / 
                dailyStats[date].listings;
        });

        res.json({
            success: true,
            analytics: {
                period,
                dailyStats
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get seller's inquiry analytics
// @route   GET /api/seller/dashboard/analytics/inquiries
// @access  Private (Seller)
exports.getInquiryAnalytics = async (req, res) => {
    try {
        const { period = '30' } = req.query; // Default to 30 days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        const inquiries = await Inquiry.find({
            seller: req.seller._id,
            createdAt: { $gte: startDate }
        }).populate('horse', 'name price');

        // Group data by date and status
        const dailyStats = {};
        inquiries.forEach(inquiry => {
            const date = inquiry.createdAt.toISOString().split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = {
                    total: 0,
                    byStatus: {
                        pending: 0,
                        responded: 0,
                        closed: 0
                    },
                    byContactPreference: {
                        email: 0,
                        phone: 0,
                        whatsapp: 0
                    }
                };
            }
            dailyStats[date].total += 1;
            dailyStats[date].byStatus[inquiry.status] += 1;
            dailyStats[date].byContactPreference[inquiry.contactPreference] += 1;
        });

        res.json({
            success: true,
            analytics: {
                period,
                dailyStats,
                totalInquiries: inquiries.length
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}; 