const User = require('../models/User');
const Horse = require('../models/Horse');
const ActivityLog = require('../models/ActivityLog');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                ...req.body,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        ).select('-password');

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'profile_update',
            entityType: 'user',
            entityId: req.user._id,
            description: 'Profile updated',
            status: 'success'
        });

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get user's favorite horses
// @route   GET /api/users/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const favorites = await Horse.find({
            _id: { $in: user.favorites },
            listingStatus: 'active'
        }).populate('seller', 'businessName location');

        res.json({
            success: true,
            favorites
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get user's notifications
// @route   GET /api/users/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('notifications')
            .sort('-notifications.createdAt');

        res.json({
            success: true,
            notifications: user.notifications || []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/users/notifications/read-all
// @access  Private
exports.markNotificationsRead = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    'notifications.$[].isRead': true,
                    'notifications.$[].readAt': Date.now()
                }
            }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get alert preferences
// @route   GET /api/users/alerts
// @access  Private
exports.getAlertPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('alertPreferences');

        res.json({
            success: true,
            alertPreferences: user.alertPreferences || {
                priceDrops: true,
                newListings: true,
                inquiryResponses: true,
                marketUpdates: false
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

// @desc    Set alert preferences
// @route   PUT /api/users/alerts
// @access  Private
exports.setAlertPreferences = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                alertPreferences: {
                    ...req.body,
                    updatedAt: Date.now()
                }
            },
            { new: true }
        ).select('alertPreferences');

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'alert_preferences_update',
            entityType: 'user',
            entityId: req.user._id,
            description: 'Alert preferences updated',
            status: 'success'
        });

        res.json({
            success: true,
            alertPreferences: user.alertPreferences
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}; 