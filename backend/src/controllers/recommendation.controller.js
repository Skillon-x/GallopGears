const Horse = require('../models/Horse');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Helper function to calculate similarity score
const calculateSimilarityScore = (userPreferences, horse) => {
    let score = 0;
    const weights = {
        breed: 3,
        price: 2,
        location: 2,
        purpose: 1.5,
        age: 1
    };

    // Breed match
    if (userPreferences.breeds && userPreferences.breeds.includes(horse.breed)) {
        score += weights.breed;
    }

    // Price range match
    if (userPreferences.priceRange) {
        if (horse.price >= userPreferences.priceRange.min && 
            horse.price <= userPreferences.priceRange.max) {
            score += weights.price;
        }
    }

    // Location match
    if (userPreferences.location && userPreferences.location.states) {
        if (userPreferences.location.states.includes(horse.location.state)) {
            score += weights.location;
        }
    }

    // Purpose match
    if (userPreferences.purposes && horse.specifications.discipline) {
        const matchingPurposes = userPreferences.purposes.filter(
            p => horse.specifications.discipline.includes(p)
        );
        score += (matchingPurposes.length / userPreferences.purposes.length) * weights.purpose;
    }

    // Age preference match
    if (userPreferences.ageRange && horse.age) {
        if (horse.age.years >= userPreferences.ageRange.min && 
            horse.age.years <= userPreferences.ageRange.max) {
            score += weights.age;
        }
    }

    return score;
};

// @desc    Get personalized recommendations
// @route   GET /api/recommendations/personalized
// @access  Private
exports.getPersonalizedRecommendations = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const limit = parseInt(req.query.limit) || 10;

        // Get user's viewing history
        const viewingHistory = await ActivityLog.find({
            user: user._id,
            action: 'VIEW_LISTING',
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }).populate('target');

        // Get active listings
        let horses = await Horse.find({
            listingStatus: 'active',
            _id: { $nin: viewingHistory.map(h => h.target._id) }
        }).populate('seller', 'businessName location rating');

        // Calculate similarity scores
        const scoredHorses = horses.map(horse => ({
            horse,
            score: calculateSimilarityScore(user.preferences || {}, horse)
        }));

        // Sort by score and get top recommendations
        const recommendations = scoredHorses
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(sh => sh.horse);

        res.json({
            success: true,
            recommendations
        });

    } catch (error) {
        console.error('Personalized recommendations error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting recommendations'
        });
    }
};

// @desc    Get similar listings
// @route   GET /api/recommendations/similar/:horseId
// @access  Public
exports.getSimilarListings = async (req, res) => {
    try {
        const { horseId } = req.params;
        const limit = parseInt(req.query.limit) || 6;

        const sourceHorse = await Horse.findById(horseId);
        if (!sourceHorse) {
            return res.status(404).json({
                success: false,
                message: 'Horse not found'
            });
        }

        // Find similar horses based on attributes
        const similarHorses = await Horse.find({
            _id: { $ne: horseId },
            listingStatus: 'active',
            $or: [
                { breed: sourceHorse.breed },
                { 'specifications.discipline': { $in: sourceHorse.specifications.discipline } },
                {
                    price: {
                        $gte: sourceHorse.price * 0.8,
                        $lte: sourceHorse.price * 1.2
                    }
                }
            ]
        })
        .limit(limit)
        .populate('seller', 'businessName location rating');

        res.json({
            success: true,
            similarListings: similarHorses
        });

    } catch (error) {
        console.error('Similar listings error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting similar listings'
        });
    }
};

// @desc    Get breed recommendations
// @route   GET /api/recommendations/breeds
// @access  Private
exports.getBreedRecommendations = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const limit = parseInt(req.query.limit) || 5;

        // Get user's favorite breeds from preferences and history
        const favoriteBreeds = new Set(user.preferences?.breeds || []);
        
        // Get popular horses of favorite breeds
        const recommendations = await Horse.aggregate([
            {
                $match: {
                    breed: { $in: Array.from(favoriteBreeds) },
                    listingStatus: 'active'
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $limit: limit
            }
        ]);

        await Horse.populate(recommendations, {
            path: 'seller',
            select: 'businessName location'
        });

        res.json({
            success: true,
            recommendations
        });

    } catch (error) {
        console.error('Breed recommendations error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting breed recommendations'
        });
    }
};

// @desc    Get price range matches
// @route   GET /api/recommendations/price-matches
// @access  Private
exports.getPriceRangeMatches = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const limit = parseInt(req.query.limit) || 10;

        if (!user.preferences?.priceRange) {
            return res.status(400).json({
                success: false,
                message: 'No price range preferences set'
            });
        }

        const { min, max } = user.preferences.priceRange;

        // Find horses within user's price range
        const matches = await Horse.find({
            listingStatus: 'active',
            price: { $gte: min, $lte: max }
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('seller', 'businessName location rating');

        res.json({
            success: true,
            matches
        });

    } catch (error) {
        console.error('Price range matches error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error getting price range matches'
        });
    }
}; 