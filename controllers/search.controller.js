const Horse = require('../models/Horse');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Helper function to build search query
const buildSearchQuery = (filters) => {
    const query = { listingStatus: 'active' };

    if (filters.breed) {
        query.breed = { $in: Array.isArray(filters.breed) ? filters.breed : [filters.breed] };
    }

    if (filters.price) {
        query.price = {
            $gte: filters.price.min || 0,
            $lte: filters.price.max || Number.MAX_SAFE_INTEGER
        };
    }

    if (filters.age) {
        query['age.years'] = {
            $gte: filters.age.min || 0,
            $lte: filters.age.max || Number.MAX_SAFE_INTEGER
        };
    }

    if (filters.location) {
        if (filters.location.state) {
            query['location.state'] = filters.location.state;
        }
        if (filters.location.city) {
            query['location.city'] = filters.location.city;
        }
    }

    if (filters.gender) {
        query.gender = { $in: Array.isArray(filters.gender) ? filters.gender : [filters.gender] };
    }

    if (filters.specifications) {
        Object.entries(filters.specifications).forEach(([key, value]) => {
            if (value) {
                query[`specifications.${key}`] = value;
            }
        });
    }

    return query;
};

// @desc    Advanced search with filters
// @route   POST /api/search
// @access  Public
exports.advancedSearch = async (req, res) => {
    try {
        const {
            filters,
            sort = { createdAt: -1 },
            page = 1,
            limit = 10
        } = req.body;

        const query = buildSearchQuery(filters);
        const skip = (page - 1) * limit;

        // Execute search with pagination
        const [horses, total] = await Promise.all([
            Horse.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('seller', 'businessName location rating'),
            Horse.countDocuments(query)
        ]);

        // Log search activity if user is authenticated
        if (req.user) {
            await ActivityLog.create({
                user: req.user._id,
                action: 'SEARCH',
                details: {
                    filters,
                    resultsCount: horses.length,
                    page
                }
            });

            // Update user preferences based on search
            await User.findByIdAndUpdate(req.user._id, {
                $set: {
                    'preferences.lastSearch': {
                        filters,
                        timestamp: new Date()
                    }
                }
            });
        }

        res.json({
            success: true,
            data: {
                horses,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    hasMore: total > skip + horses.length
                }
            }
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error performing search'
        });
    }
};

// @desc    Save search preferences
// @route   POST /api/search/preferences
// @access  Private
exports.saveSearchPreferences = async (req, res) => {
    try {
        const { preferences } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: { preferences }
            },
            { new: true }
        );

        res.json({
            success: true,
            preferences: user.preferences
        });

    } catch (error) {
        console.error('Save preferences error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error saving preferences'
        });
    }
};

// @desc    Get saved searches
// @route   GET /api/search/saved
// @access  Private
exports.getSavedSearches = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('preferences.savedSearches');

        res.json({
            success: true,
            savedSearches: user.preferences?.savedSearches || []
        });

    } catch (error) {
        console.error('Get saved searches error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error retrieving saved searches'
        });
    }
};

// @desc    Get search suggestions
// @route   GET /api/search/suggestions
// @access  Public
exports.getSearchSuggestions = async (req, res) => {
    try {
        const { query, type } = req.query;

        let suggestions = [];
        switch (type) {
            case 'breed':
                suggestions = await Horse.distinct('breed', {
                    breed: new RegExp(query, 'i'),
                    listingStatus: 'active'
                });
                break;
            case 'location':
                suggestions = await Horse.distinct('location.city', {
                    'location.city': new RegExp(query, 'i'),
                    listingStatus: 'active'
                });
                break;
            case 'price':
                const priceRanges = await Horse.aggregate([
                    { $match: { listingStatus: 'active' } },
                    {
                        $group: {
                            _id: {
                                $round: [
                                    { $divide: ['$price', 100000] },
                                    -1
                                ]
                            },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: 1 } }
                ]);
                suggestions = priceRanges.map(range => ({
                    range: `${range._id * 100000}-${(range._id + 1) * 100000}`,
                    count: range.count
                }));
                break;
            default:
                suggestions = [];
        }

        res.json({
            success: true,
            suggestions
        });

    } catch (error) {
        console.error('Search suggestions error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting search suggestions'
        });
    }
}; 