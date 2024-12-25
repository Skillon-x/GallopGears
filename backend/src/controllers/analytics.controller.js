const Horse = require('../models/Horse');
const Seller = require('../models/Seller');
const Inquiry = require('../models/Inquiry');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get seller's monthly performance analytics
// @route   GET /api/analytics/performance/monthly
// @access  Private (Seller)
exports.getMonthlyPerformance = async (req, res) => {
    try {
        const seller = await Seller.findOne({ user: req.user._id });
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);

        // Get listing performance
        const listingStats = await Horse.aggregate([
            {
                $match: {
                    seller: seller._id,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalListings: { $sum: 1 },
                    activeListings: {
                        $sum: {
                            $cond: [{ $eq: ['$listingStatus', 'active'] }, 1, 0]
                        }
                    },
                    totalViews: { $sum: '$statistics.views' },
                    totalInquiries: { $sum: '$statistics.inquiries' }
                }
            }
        ]);

        // Get inquiry performance
        const inquiryStats = await Inquiry.aggregate([
            {
                $match: {
                    seller: seller._id,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalInquiries: { $sum: 1 },
                    respondedInquiries: {
                        $sum: {
                            $cond: [{ $ne: ['$response', null] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        // Get sales performance
        const salesStats = await Transaction.aggregate([
            {
                $match: {
                    seller: seller._id,
                    status: 'completed',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: '$amount' }
                }
            }
        ]);

        // Calculate conversion rates
        const conversionRates = {
            viewToInquiry: listingStats[0]?.totalViews > 0 
                ? (listingStats[0].totalInquiries / listingStats[0].totalViews * 100).toFixed(2) 
                : 0,
            inquiryToSale: inquiryStats[0]?.totalInquiries > 0 
                ? (salesStats[0]?.totalSales / inquiryStats[0].totalInquiries * 100).toFixed(2) 
                : 0
        };

        res.json({
            success: true,
            data: {
                listings: listingStats[0] || {
                    totalListings: 0,
                    activeListings: 0,
                    totalViews: 0,
                    totalInquiries: 0
                },
                inquiries: inquiryStats[0] || {
                    totalInquiries: 0,
                    respondedInquiries: 0
                },
                sales: salesStats[0] || {
                    totalSales: 0,
                    totalRevenue: 0
                },
                conversionRates
            }
        });

    } catch (error) {
        console.error('Get monthly performance error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting monthly performance'
        });
    }
};

// @desc    Get listing performance metrics
// @route   GET /api/analytics/listings/:id
// @access  Private (Seller)
exports.getListingPerformance = async (req, res) => {
    try {
        const horse = await Horse.findById(req.params.id)
            .populate('seller', 'user');

        if (!horse) {
            return res.status(404).json({
                success: false,
                message: 'Horse listing not found'
            });
        }

        // Verify ownership
        if (horse.seller.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these analytics'
            });
        }

        // Get inquiries for this listing
        const inquiries = await Inquiry.find({ horse: horse._id });

        // Calculate engagement metrics
        const metrics = {
            views: horse.statistics.views || 0,
            inquiries: inquiries.length,
            responseRate: inquiries.length > 0 
                ? (inquiries.filter(i => i.response).length / inquiries.length * 100).toFixed(2)
                : 0,
            avgResponseTime: inquiries.length > 0
                ? inquiries.reduce((acc, i) => {
                    if (i.response && i.respondedAt) {
                        return acc + (i.respondedAt - i.createdAt) / (1000 * 60 * 60); // hours
                    }
                    return acc;
                }, 0) / inquiries.filter(i => i.response).length
                : 0,
            viewToInquiryRate: horse.statistics.views > 0
                ? (inquiries.length / horse.statistics.views * 100).toFixed(2)
                : 0
        };

        // Get view trends
        const viewLogs = await ActivityLog.find({
            action: 'VIEW_LISTING',
            target: horse._id
        }).sort('createdAt');

        const viewTrends = viewLogs.reduce((acc, log) => {
            const date = log.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                metrics,
                viewTrends,
                inquiryDetails: inquiries.map(i => ({
                    date: i.createdAt,
                    status: i.status,
                    responded: !!i.response,
                    responseTime: i.respondedAt 
                        ? (i.respondedAt - i.createdAt) / (1000 * 60 * 60)
                        : null
                }))
            }
        });

    } catch (error) {
        console.error('Get listing performance error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting listing performance'
        });
    }
};

// @desc    Get buyer engagement analytics
// @route   GET /api/analytics/engagement
// @access  Private (Admin/Seller)
exports.getBuyerEngagement = async (req, res) => {
    try {
        const seller = await Seller.findOne({ user: req.user._id });
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        // Get engagement metrics
        const engagement = {
            totalInquiries: await Inquiry.countDocuments({ seller: seller._id }),
            activeListings: await Horse.countDocuments({ seller: seller._id, status: 'active' }),
            responseRate: seller.statistics.responseRate || 0,
            responseTime: seller.statistics.responseTime || 0,
            averageRating: seller.statistics.rating || 0,
            reviewCount: seller.statistics.reviewCount || 0
        };

        res.status(200).json({
            success: true,
            engagement
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get ROI analytics
// @route   GET /api/analytics/roi
// @access  Private (Seller)
exports.getROIAnalytics = async (req, res) => {
    try {
        const seller = await Seller.findOne({ user: req.user._id });
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        // Get subscription costs
        const subscriptionCosts = await Transaction.aggregate([
            {
                $match: {
                    seller: seller._id,
                    type: 'subscription',
                    status: 'completed',
                    createdAt: {
                        $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    cost: { $sum: '$amount' }
                }
            }
        ]);

        // Get sales revenue
        const salesRevenue = await Transaction.aggregate([
            {
                $match: {
                    seller: seller._id,
                    type: 'sale',
                    status: 'completed',
                    createdAt: {
                        $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$amount' }
                }
            }
        ]);

        // Calculate monthly ROI
        const monthlyROI = {};
        subscriptionCosts.forEach(cost => {
            const key = `${cost._id.year}-${cost._id.month}`;
            if (!monthlyROI[key]) {
                monthlyROI[key] = { cost: 0, revenue: 0, roi: 0 };
            }
            monthlyROI[key].cost = cost.cost;
        });

        salesRevenue.forEach(revenue => {
            const key = `${revenue._id.year}-${revenue._id.month}`;
            if (!monthlyROI[key]) {
                monthlyROI[key] = { cost: 0, revenue: 0, roi: 0 };
            }
            monthlyROI[key].revenue = revenue.revenue;
        });

        // Calculate ROI percentages
        Object.keys(monthlyROI).forEach(key => {
            const { cost, revenue } = monthlyROI[key];
            monthlyROI[key].roi = cost > 0 
                ? ((revenue - cost) / cost * 100).toFixed(2)
                : 0;
        });

        res.json({
            success: true,
            data: {
                monthlyROI,
                summary: {
                    totalCost: subscriptionCosts.reduce((acc, curr) => acc + curr.cost, 0),
                    totalRevenue: salesRevenue.reduce((acc, curr) => acc + curr.revenue, 0),
                    averageMonthlyROI: Object.values(monthlyROI)
                        .reduce((acc, curr) => acc + parseFloat(curr.roi), 0) / Object.keys(monthlyROI).length
                }
            }
        });

    } catch (error) {
        console.error('Get ROI analytics error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting ROI analytics'
        });
    }
}; 