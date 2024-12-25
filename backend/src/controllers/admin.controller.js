const User = require('../models/User');
const Seller = require('../models/Seller');
const Horse = require('../models/Horse');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Promotion = require('../models/Promotion');
const SupportTicket = require('../models/SupportTicket');
const ActivityLog = require('../models/ActivityLog');
const Inquiry = require('../models/Inquiry');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const Report = require('../models/Report');
const { asyncHandler } = require('../middlewares/error.middleware');

// Cloudinary helper functions
const uploadToCloudinary = async (file, folder) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: `galloping-gears/${folder}`,
            resource_type: 'auto'
        });
        return result;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload file');
    }
};

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete file');
    }
};

// Dashboard and System
exports.getDashboardStats = async (req, res) => {
    try {
        const stats = {
            users: await User.countDocuments(),
            sellers: await Seller.countDocuments(),
            horses: await Horse.countDocuments(),
            transactions: await Transaction.countDocuments()
        };
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getSystemHealth = async (req, res) => {
    try {
        res.json({
            success: true,
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getEmergencyAlerts = async (req, res) => {
    try {
        res.json({ success: true, alerts: [] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getVisitorAnalytics = async (req, res) => {
    try {
        res.json({ success: true, analytics: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// User Management
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getSellers = async (req, res) => {
    try {
        const sellers = await Seller.find().populate('user', '-password');
        res.json({ success: true, sellers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Add all other controller methods with basic implementations
exports.getSellerDetails = async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id).populate('user', '-password');
        if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
        res.json({ success: true, seller });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Financial Management
exports.getFinancialDashboard = async (req, res) => {
    try {
        const stats = {
            totalRevenue: await Transaction.aggregate([
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            recentTransactions: await Transaction.find().limit(10).sort('-createdAt')
        };
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Listing Management
exports.getListings = async (req, res) => {
    try {
        const listings = await Horse.find().populate('seller', 'businessName');
        res.json({ success: true, listings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Add remaining controller methods with basic implementations
exports.updateListingVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, images } = req.body;

        const horse = await Horse.findById(id);
        if (!horse) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        // Handle image uploads if provided
        if (images && images.length > 0) {
            const uploadPromises = images.map(image => uploadToCloudinary(image, 'horses'));
            const uploadedImages = await Promise.all(uploadPromises);
            
            // Delete old images if they exist
            if (horse.images && horse.images.length > 0) {
                const deletePromises = horse.images.map(img => deleteFromCloudinary(img.publicId));
                await Promise.all(deletePromises);
            }

            horse.images = uploadedImages.map(img => ({
                url: img.secure_url,
                publicId: img.public_id
            }));
        }

        horse.verificationStatus = status;
        await horse.save();

        res.json({ success: true, horse });
    } catch (error) {
        console.error('Error updating listing verification:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Category Management
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Communication Center
exports.getCommunicationDashboard = async (req, res) => {
    try {
        const stats = {
            totalTickets: await SupportTicket.countDocuments(),
            openTickets: await SupportTicket.countDocuments({ status: 'open' })
        };
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Add all other required controller methods with basic implementations
exports.getSellerPaymentHistory = async (req, res) => {
    res.json({ success: true, payments: [] });
};

exports.getSellerComplaintHistory = async (req, res) => {
    res.json({ success: true, complaints: [] });
};

exports.getSellerActivityLogs = async (req, res) => {
    res.json({ success: true, logs: [] });
};

exports.getSellerCommunicationHistory = async (req, res) => {
    res.json({ success: true, communications: [] });
};

exports.toggleUserBlock = async (req, res) => {
    res.json({ success: true, message: 'User status updated' });
};

exports.getBuyerDetails = async (req, res) => {
    res.json({ success: true, buyer: {} });
};

exports.getBuyerInquiryHistory = async (req, res) => {
    res.json({ success: true, inquiries: [] });
};

exports.getBuyerReportHistory = async (req, res) => {
    res.json({ success: true, reports: [] });
};

exports.getBuyerActivityLogs = async (req, res) => {
    res.json({ success: true, logs: [] });
};

exports.getPendingApprovals = async (req, res) => {
    res.json({ success: true, listings: [] });
};

exports.getReportedListings = async (req, res) => {
    res.json({ success: true, listings: [] });
};

exports.getFeaturedListings = async (req, res) => {
    res.json({ success: true, listings: [] });
};

exports.getExpiredListings = async (req, res) => {
    res.json({ success: true, listings: [] });
};

exports.getDraftListings = async (req, res) => {
    res.json({ success: true, listings: [] });
};

exports.updateListingFeatured = async (req, res) => {
    res.json({ success: true, message: 'Listing updated' });
};

exports.manageFeaturedSchedule = async (req, res) => {
    res.json({ success: true, message: 'Schedule updated' });
};

exports.manageBoosts = async (req, res) => {
    res.json({ success: true, message: 'Boosts updated' });
};

exports.getRevenueStats = async (req, res) => {
    res.json({ success: true, stats: {} });
};

exports.getPackageRevenue = async (req, res) => {
    res.json({ success: true, revenue: {} });
};

exports.getBoostRevenue = async (req, res) => {
    res.json({ success: true, revenue: {} });
};

exports.getFeatureRevenue = async (req, res) => {
    res.json({ success: true, revenue: {} });
};

exports.manageRefunds = async (req, res) => {
    res.json({ success: true, message: 'Refund processed' });
};

exports.generateInvoice = async (req, res) => {
    res.json({ success: true, invoice: {} });
};

exports.getFinancialReports = async (req, res) => {
    res.json({ success: true, reports: [] });
};

exports.updatePackagePricing = async (req, res) => {
    res.json({ success: true, message: 'Pricing updated' });
};

exports.updateBoostPricing = async (req, res) => {
    res.json({ success: true, message: 'Pricing updated' });
};

exports.createPromotion = async (req, res) => {
    res.json({ success: true, promotion: {} });
};

exports.manageCoupons = async (req, res) => {
    res.json({ success: true, message: 'Coupons updated' });
};

exports.createSpecialOffer = async (req, res) => {
    res.json({ success: true, offer: {} });
};

exports.getCategoryDashboard = async (req, res) => {
    res.json({ success: true, stats: {} });
};

exports.updateCategory = async (req, res) => {
    res.json({ success: true, category: {} });
};

exports.deleteCategory = async (req, res) => {
    res.json({ success: true, message: 'Category deleted' });
};

exports.manageHorseBreeds = async (req, res) => {
    res.json({ success: true, message: 'Breeds updated' });
};

exports.manageEquipmentCategories = async (req, res) => {
    res.json({ success: true, message: 'Categories updated' });
};

exports.manageServiceCategories = async (req, res) => {
    res.json({ success: true, message: 'Categories updated' });
};

exports.sendBulkEmail = async (req, res) => {
    res.json({ success: true, message: 'Emails sent' });
};

exports.getTickets = async (req, res) => {
    res.json({ success: true, tickets: [] });
};

exports.getTicketDetails = async (req, res) => {
    res.json({ success: true, ticket: {} });
};

exports.respondToTicket = async (req, res) => {
    res.json({ success: true, message: 'Response sent' });
};

exports.getAnalytics = async (req, res) => {
    res.json({ success: true, analytics: {} });
};

exports.getSystemLogs = async (req, res) => {
    res.json({ success: true, logs: [] });
};

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const { 
            role, 
            status,
            sort = '-createdAt',
            page = 1,
            limit = 10,
            search
        } = req.query;

        const query = {};

        // Apply filters
        if (role && role !== 'all') query.role = role;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const total = await User.countDocuments(query);

        // Get users with additional details
        const users = await User.find(query)
            .select('-password')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Enhance user data with additional information
        const enhancedUsers = await Promise.all(users.map(async (user) => {
            const userData = user.toObject();

            if (user.role === 'seller') {
                const seller = await Seller.findOne({ user: user._id });
                if (seller) {
                    userData.sellerDetails = {
                        businessName: seller.businessName,
                        subscription: seller.subscription,
                        listingsCount: await Horse.countDocuments({ seller: seller._id })
                    };
                }
            }

            return userData;
        }));

        res.json({
            success: true,
            data: {
                users: enhancedUsers,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userData = user.toObject();

        if (user.role === 'seller') {
            const seller = await Seller.findOne({ user: user._id });
            if (seller) {
                userData.sellerDetails = {
                    businessName: seller.businessName,
                    subscription: seller.subscription,
                    listingsCount: await Horse.countDocuments({ seller: seller._id })
                };
            }
        }

        res.json({
            success: true,
            user: userData
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete user and all associated data
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Don't allow deleting other admins
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin users'
            });
        }

        // If user is a seller, delete seller data first
        if (user.role === 'seller') {
            const seller = await Seller.findOne({ user: user._id }).session(session);
            if (seller) {
                // Delete seller's listings
                const listings = await Horse.find({ seller: seller._id }).session(session);
                for (const listing of listings) {
                    // Delete listing images from cloudinary
                    if (listing.images && listing.images.length > 0) {
                        for (const image of listing.images) {
                            if (image.publicId) {
                                await cloudinary.uploader.destroy(image.publicId);
                            }
                        }
                    }
                }
                await Horse.deleteMany({ seller: seller._id }).session(session);

                // Delete seller's inquiries
                await Inquiry.deleteMany({ seller: seller._id }).session(session);

                // Delete seller's transactions
                await Transaction.deleteMany({ seller: seller._id }).session(session);

                // Delete seller's documents from cloudinary
                if (seller.businessDocuments) {
                    for (const doc of Object.values(seller.businessDocuments)) {
                        if (doc.publicId) {
                            await cloudinary.uploader.destroy(doc.publicId);
                        }
                    }
                }

                // Delete seller profile
                await seller.remove({ session });
            }
        }

        // Delete user's activities
        await ActivityLog.deleteMany({ user: user._id }).session(session);

        // Delete user's inquiries (as a buyer)
        await Inquiry.deleteMany({ buyer: user._id }).session(session);

        // Delete user's transactions (as a buyer)
        await Transaction.deleteMany({ buyer: user._id }).session(session);

        // Delete user's favorites
        await Horse.updateMany(
            { _id: { $in: user.favorites || [] } },
            { $pull: { favoriteBy: user._id } }
        ).session(session);

        // Delete user's support tickets
        await SupportTicket.deleteMany({ user: user._id }).session(session);

        // Delete user's profile image from cloudinary if exists
        if (user.profileImage && user.profileImage.publicId) {
            await cloudinary.uploader.destroy(user.profileImage.publicId);
        }

        // Finally, delete the user
        await user.remove({ session });

        // Log the deletion
        await ActivityLog.create([{
            action: 'user_block',
            entityType: 'user',
            entityId: user._id,
            description: `User ${user.email} was deleted by admin`,
            status: 'success',
            severity: 'high',
            metadata: {
                userEmail: user.email,
                userName: user.name,
                userRole: user.role
            }
        }], { session });

        // Commit the transaction
        await session.commitTransaction();

        res.json({
            success: true,
            message: 'User and all associated data deleted successfully'
        });
    } catch (error) {
        // Abort transaction on error
        await session.abortTransaction();
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    } finally {
        session.endSession();
    }
};

// @desc    Delete seller and all their listings
// @route   DELETE /api/admin/sellers/:id
// @access  Private (Admin)
exports.deleteSeller = async (req, res) => {
    try {
        // Start a transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find the seller
            const seller = await Seller.findOne({ user: req.params.id }).session(session);
            if (!seller) {
                throw new Error('Seller not found');
            }

            // Get all listings by this seller
            const listings = await Horse.find({ seller: seller._id }).session(session);

            // Delete all images from cloudinary
            for (const listing of listings) {
                for (const image of listing.images) {
                    if (image.public_id) {
                        await cloudinary.uploader.destroy(image.public_id);
                    }
                }
            }

            // Delete all listings
            await Horse.deleteMany({ seller: seller._id }).session(session);

            // Delete all inquiries
            await Inquiry.deleteMany({ seller: seller._id }).session(session);

            // Delete seller profile
            await seller.remove({ session });

            // Update user role to regular user
            await User.findByIdAndUpdate(
                req.params.id,
                { 
                    role: 'user',
                    status: 'inactive'
                },
                { session }
            );

            // Commit the transaction
            await session.commitTransaction();

            res.json({
                success: true,
                message: 'Seller and all associated data deleted successfully'
            });
        } catch (error) {
            // If an error occurred, abort the transaction
            await session.abortTransaction();
            throw error;
        } finally {
            // End the session
            session.endSession();
        }
    } catch (error) {
        console.error('Delete seller error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// Update seller profile with document handling
exports.updateSellerProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { documents, ...updateData } = req.body;

        const seller = await Seller.findById(id);
        if (!seller) {
            return res.status(404).json({ success: false, message: 'Seller not found' });
        }

        // Handle document uploads if provided
        if (documents) {
            const uploadPromises = Object.entries(documents).map(async ([key, file]) => {
                if (file) {
                    const result = await uploadToCloudinary(file, 'documents');
                    // Delete old document if it exists
                    if (seller.businessDocuments && seller.businessDocuments[key]) {
                        await deleteFromCloudinary(seller.businessDocuments[key].publicId);
                    }
                    return [key, {
                        url: result.secure_url,
                        publicId: result.public_id
                    }];
                }
                return null;
            });

            const uploadedDocs = await Promise.all(uploadPromises);
            const newDocs = Object.fromEntries(uploadedDocs.filter(doc => doc !== null));
            
            seller.businessDocuments = {
                ...seller.businessDocuments,
                ...newDocs
            };
        }

        Object.assign(seller, updateData);
        await seller.save();

        res.json({ success: true, seller });
    } catch (error) {
        console.error('Error updating seller profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Analytics and Stats
exports.getStats = async (req, res) => {
    try {
        // Get basic stats
        const [
            totalUsers,
            totalSellers,
            totalListings,
            totalTransactions,
            activeListings,
            pendingListings,
            revenue
        ] = await Promise.all([
            User.countDocuments(),
            Seller.countDocuments(),
            Horse.countDocuments(),
            Transaction.countDocuments(),
            Horse.countDocuments({ status: 'active' }),
            Horse.countDocuments({ status: 'pending' }),
            Transaction.aggregate([
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        // Calculate growth rates (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            newUsers,
            newListings,
            newSellers
        ] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Horse.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Seller.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
        ]);

        // Calculate growth percentages
        const userGrowth = ((newUsers / totalUsers) * 100).toFixed(1);
        const listingGrowth = ((newListings / totalListings) * 100).toFixed(1);
        const sellerGrowth = ((newSellers / totalSellers) * 100).toFixed(1);

        const stats = {
            totalUsers,
            totalSellers,
            totalListings,
            totalTransactions,
            activeListings,
            pendingListings,
            totalRevenue: revenue[0]?.total || 0,
            userGrowth: parseFloat(userGrowth) || 0,
            listingGrowth: parseFloat(listingGrowth) || 0,
            sellerGrowth: parseFloat(sellerGrowth) || 0
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const analytics = {
            userGrowth: await User.countDocuments({ 
                createdAt: { 
                    $gte: new Date(new Date().setDate(new Date().getDate() - 30)) 
                }
            }),
            listingGrowth: await Horse.countDocuments({
                createdAt: {
                    $gte: new Date(new Date().setDate(new Date().getDate() - 30))
                }
            }),
            recentTransactions: await Transaction.find()
                .sort('-createdAt')
                .limit(10)
                .populate('buyer', 'name email')
                .populate('seller', 'businessName')
        };
        res.json({ success: true, analytics });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Seller Management
exports.getSellerListings = async (req, res) => {
    try {
        const listings = await Horse.find({ seller: req.params.id })
            .populate('seller', 'businessName')
            .sort('-createdAt');
        res.json({ success: true, listings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getSellerTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ seller: req.params.id })
            .populate('buyer', 'name email')
            .sort('-createdAt');
        res.json({ success: true, transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Buyer Management
exports.getBuyerDetails = async (req, res) => {
    try {
        const buyer = await User.findById(req.params.id)
            .select('-password')
            .populate('favorites');
        if (!buyer) {
            return res.status(404).json({ success: false, message: 'Buyer not found' });
        }
        res.json({ success: true, buyer });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getBuyerInquiryHistory = async (req, res) => {
    try {
        const inquiries = await Inquiry.find({ buyer: req.params.id })
            .populate('horse')
            .populate('seller', 'businessName')
            .sort('-createdAt');
        res.json({ success: true, inquiries });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getBuyerReportHistory = async (req, res) => {
    try {
        const reports = await ActivityLog.find({
            user: req.params.id,
            type: 'report'
        }).sort('-createdAt');
        res.json({ success: true, reports });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getBuyerActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find({ user: req.params.id })
            .sort('-createdAt');
        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Listing Management
exports.getPendingApprovals = async (req, res) => {
    try {
        const listings = await Horse.find({ status: 'pending' })
            .populate('seller', 'businessName')
            .sort('-createdAt');
        res.json({ success: true, listings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getReportedListings = async (req, res) => {
    try {
        const listings = await Horse.find({ isReported: true })
            .populate('seller', 'businessName')
            .sort('-reportedAt');
        res.json({ success: true, listings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getFeaturedListings = async (req, res) => {
    try {
        const listings = await Horse.find({ isFeatured: true })
            .populate('seller', 'businessName')
            .sort('-featuredUntil');
        res.json({ success: true, listings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getExpiredListings = async (req, res) => {
    try {
        const listings = await Horse.find({
            $or: [
                { status: 'expired' },
                { 
                    status: 'active',
                    expiresAt: { $lt: new Date() }
                }
            ]
        })
            .populate('seller', 'businessName')
            .sort('-expiresAt');
        res.json({ success: true, listings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getDraftListings = async (req, res) => {
    try {
        const listings = await Horse.find({ status: 'draft' })
            .populate('seller', 'businessName')
            .sort('-updatedAt');
        res.json({ success: true, listings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getDashboardActivities = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query based on filters
        const query = {
            status: 'success'
        };

        // Type filter
        if (req.query.type && req.query.type !== 'all') {
            query.entityType = req.query.type;
        }

        // Severity filter
        if (req.query.severity && req.query.severity !== 'all') {
            query.severity = req.query.severity;
        }

        // Date range filter
        if (req.query.dateRange && req.query.dateRange !== 'all') {
            const now = new Date();
            let dateFilter = now;

            switch (req.query.dateRange) {
                case 'today':
                    dateFilter = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    dateFilter = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    dateFilter = new Date(now.setMonth(now.getMonth() - 1));
                    break;
            }

            query.createdAt = { $gte: dateFilter };
        }

        // Search filter
        if (req.query.search) {
            query.$or = [
                { description: { $regex: req.query.search, $options: 'i' } },
                { action: { $regex: req.query.search, $options: 'i' } },
                { entityType: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Get total count for pagination
        const total = await ActivityLog.countDocuments(query);

        // Get activities with pagination
        const activities = await ActivityLog.find(query)
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .select('action entityType description metadata createdAt status severity');

        // Format activities for frontend
        const formattedActivities = activities.map(activity => ({
            description: activity.description,
            message: `${activity.action.replace('_', ' ')} - ${activity.entityType}`,
            type: activity.entityType,
            createdAt: activity.createdAt,
            metadata: activity.metadata,
            severity: activity.severity,
            status: activity.status
        }));

        res.json({ 
            success: true, 
            activities: formattedActivities,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard activities:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getRecentDashboardActivities = async (req, res) => {
    try {
        // Get most recent 10 activities
        const activities = await ActivityLog.find({
            status: 'success',
            severity: { $in: ['info', 'low', 'medium'] }
        })
        .sort('-createdAt')
        .limit(10)
        .select('action entityType description metadata createdAt');

        // Format activities for frontend
        const formattedActivities = activities.map(activity => ({
            description: activity.description,
            message: `${activity.action.replace('_', ' ')} - ${activity.entityType}`,
            type: activity.entityType,
            createdAt: activity.createdAt,
            metadata: activity.metadata
        }));

        res.json({ 
            success: true, 
            activities: formattedActivities
        });
    } catch (error) {
        console.error('Error fetching recent dashboard activities:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteListing = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the listing
        const listing = await Horse.findById(id);
        if (!listing) {
            return res.status(404).json({
                success: false,
                message: 'Listing not found'
            });
        }

        // Delete images from cloudinary if they exist
        if (listing.images && listing.images.length > 0) {
            for (const image of listing.images) {
                if (image.publicId) {
                    await cloudinary.uploader.destroy(image.publicId);
                }
            }
        }

        // Delete the listing
        await listing.remove();

        // Log the activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'listing_delete',
            entityType: 'horse',
            entityId: listing._id,
            description: `Admin deleted horse listing ${listing.title}`,
            status: 'success'
        });

        res.json({
            success: true,
            message: 'Listing deleted successfully'
        });
    } catch (error) {
        console.error('Delete listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting listing'
        });
    }
};

// Transaction Management
exports.getAdminTransactions = async (req, res) => {
    try {
        const { status, page = 1, limit = 10, sort = '-createdAt' } = req.query;
        const query = {};

        // Apply status filter if provided
        if (status && status !== 'all') {
            query.status = status;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const total = await Transaction.countDocuments(query);

        // Get transactions with pagination and populate seller details
        const transactions = await Transaction.find(query)
            .populate('seller', 'businessName')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get admin transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('seller', 'businessName');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        res.json({
            success: true,
            transaction
        });
    } catch (error) {
        console.error('Get transaction by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.updateTransactionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('seller', 'businessName');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        // Log the activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'transaction_update',
            entityType: 'transaction',
            entityId: transaction._id,
            description: `Transaction status updated to ${status}`,
            status: 'success'
        });

        res.json({
            success: true,
            transaction
        });
    } catch (error) {
        console.error('Update transaction status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.exportTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('seller', 'businessName')
            .populate('buyer', 'name email')
            .sort('-createdAt');

        // Convert transactions to CSV format
        const csv = transactions.map(t => ({
            ID: t._id,
            Date: new Date(t.createdAt).toLocaleDateString(),
            Seller: t.seller?.businessName || 'N/A',
            Buyer: t.buyer?.name || 'N/A',
            Amount: t.amount,
            Status: t.status,
            Type: t.type,
            PaymentMethod: t.paymentMethod
        }));

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
        res.status(200).send(csv);
    } catch (error) {
        console.error('Export transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getReports = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const sort = req.query.sort || '-createdAt';

    const query = {};
    if (status && status !== 'all') {
        query.status = status;
    }

    const total = await Report.countDocuments(query);
    const pages = Math.ceil(total / limit);

    const reports = await Report.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('reportedBy', 'name email')
        .populate('reportedItem', 'title');

    res.json({
        success: true,
        data: {
            reports,
            pagination: {
                page,
                limit,
                total,
                pages
            }
        }
    });
});

// @desc    Get single report
// @route   GET /api/admin/reports/:id
// @access  Private/Admin
exports.getReport = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id)
        .populate('reportedBy', 'name email')
        .populate('reportedItem', 'title');

    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    res.json({
        success: true,
        data: report
    });
});

// @desc    Update report status
// @route   PUT /api/admin/reports/:id
// @access  Private/Admin
exports.updateReport = asyncHandler(async (req, res) => {
    const { status, notes } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    report.status = status || report.status;
    report.notes = notes || report.notes;
    report.resolvedAt = status === 'resolved' ? Date.now() : report.resolvedAt;
    report.resolvedBy = status === 'resolved' ? req.user._id : report.resolvedBy;

    const updatedReport = await report.save();

    // Create activity log
    await ActivityLog.create({
        user: req.user._id,
        action: 'report_update',
        details: `Updated report status to ${status}`,
        metadata: {
            reportId: report._id,
            status,
            notes
        }
    });

    res.json({
        success: true,
        data: updatedReport
    });
});

// @desc    Delete report
// @route   DELETE /api/admin/reports/:id
// @access  Private/Admin
exports.deleteReport = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);

    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    await report.remove();

    // Create activity log
    await ActivityLog.create({
        user: req.user._id,
        action: 'report_delete',
        details: `Deleted report`,
        metadata: {
            reportId: report._id,
            type: report.type,
            status: report.status
        }
    });

    res.json({
        success: true,
        data: {}
    });
});