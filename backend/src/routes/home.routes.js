const express = require('express');
const router = express.Router();
const Horse = require('../models/Horse');
const Category = require('../models/Category');
const Seller = require('../models/Seller');

// @desc    Get home page data
// @route   GET /api/home
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Get featured horses
        const featuredHorses = await Horse.find({ listingStatus: 'active' })
            .sort('-statistics.views')
            .limit(6)
            .populate('seller', 'businessName');

        // Get recently added horses
        const recentHorses = await Horse.find({ listingStatus: 'active' })
            .sort('-createdAt')
            .limit(8)
            .populate('seller', 'businessName');

        // Get popular breeds (categories)
        const popularBreeds = await Category.find({ 
            type: 'horse_breed',
            status: 'active' 
        })
        .sort('-sortOrder')
        .limit(8);

        // Get featured sellers
        const featuredSellers = await Seller.find({
            'subscription.status': 'active',
            'subscription.plan': { $in: ['professional', 'premium'] }
        })
        .select('businessName location images')
        .limit(4);

        // Get statistics
        const totalHorses = await Horse.countDocuments({ listingStatus: 'active' });
        const totalSellers = await Seller.countDocuments({ 'subscription.status': 'active' });
        const totalBreeds = await Category.countDocuments({ type: 'horse_breed', status: 'active' });

        res.json({
            success: true,
            data: {
                featured: {
                    horses: featuredHorses,
                    sellers: featuredSellers
                },
                recent: {
                    horses: recentHorses
                },
                categories: {
                    breeds: popularBreeds
                },
                stats: {
                    horses: totalHorses,
                    sellers: totalSellers,
                    breeds: totalBreeds
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