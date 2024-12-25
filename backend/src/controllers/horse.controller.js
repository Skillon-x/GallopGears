const Horse = require('../models/Horse');
const Category = require('../models/Category');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const Seller = require('../models/Seller');

// @desc    Get featured horses
// @route   GET /api/horses/featured
// @access  Public
exports.getFeaturedHorses = async (req, res) => {
    try {
        const horses = await Horse.find({ listingStatus: 'active' })
            .sort('-statistics.views')
            .limit(6)
            .populate('seller', 'businessName location');

        res.json({
            success: true,
            horses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get horse categories
// @route   GET /api/horses/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ 
            type: 'horse_breed',
            status: 'active' 
        }).sort('name');

        res.json({
            success: true,
            categories
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get price ranges
// @route   GET /api/horses/price-ranges
// @access  Public
exports.getPriceRanges = async (req, res) => {
    try {
        const ranges = [
            { min: 0, max: 100000, label: 'Under ₹1 Lakh' },
            { min: 100000, max: 300000, label: '₹1-3 Lakhs' },
            { min: 300000, max: 500000, label: '₹3-5 Lakhs' },
            { min: 500000, max: 1000000, label: '₹5-10 Lakhs' },
            { min: 1000000, max: 2000000, label: '₹10-20 Lakhs' },
            { min: 2000000, max: null, label: 'Above ₹20 Lakhs' }
        ];

        res.json({
            success: true,
            ranges
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Search horses
// @route   GET /api/horses/search
// @access  Public
exports.searchHorses = async (req, res) => {
    try {
        const {
            breed,
            gender,
            minPrice,
            maxPrice,
            location,
            training,
            discipline,
            minAge,
            maxAge,
            sort = '-createdAt'
        } = req.query;

        const query = { listingStatus: 'active' };

        // Apply filters
        if (breed) query.breed = breed;
        if (gender) query.gender = gender;
        if (location) query['location.state'] = location;
        if (training) query['specifications.training'] = training;
        if (discipline) query['specifications.discipline'] = discipline;
        
        // Price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = minPrice;
            if (maxPrice) query.price.$lte = maxPrice;
        }

        // Age range
        if (minAge || maxAge) {
            query['age.years'] = {};
            if (minAge) query['age.years'].$gte = minAge;
            if (maxAge) query['age.years'].$lte = maxAge;
        }

        const horses = await Horse.find(query)
            .sort(sort)
            .populate('seller', 'businessName location');

        res.json({
            success: true,
            horses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Add horse to favorites
// @route   POST /api/horses/:id/favorite
// @access  Private
exports.addToFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user.favorites) user.favorites = [];
        
        if (!user.favorites.includes(req.params.id)) {
            user.favorites.push(req.params.id);
            await user.save();
        }

        res.json({
            success: true,
            message: 'Added to favorites'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Remove horse from favorites
// @route   DELETE /api/horses/:id/favorite
// @access  Private
exports.removeFromFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user.favorites) user.favorites = [];
        
        user.favorites = user.favorites.filter(
            id => id.toString() !== req.params.id
        );
        await user.save();

        res.json({
            success: true,
            message: 'Removed from favorites'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all horses
// @route   GET /api/horses
// @access  Public
exports.getHorses = async (req, res) => {
    try {
        const horses = await Horse.find()
            .populate('seller', 'businessName location');

        res.json({
            success: true,
            horses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get single horse
// @route   GET /api/horses/:id
// @access  Public
exports.getHorseById = async (req, res) => {
    try {
        const horse = await Horse.findById(req.params.id)
            .populate('seller', 'businessName location');

        if (!horse) {
            return res.status(404).json({
                success: false,
                message: 'Horse not found'
            });
        }

        // Increment views
        await horse.incrementViews();

        res.json({
            success: true,
            horse
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Create horse listing
// @route   POST /api/horses
// @access  Private (Seller only)
exports.createHorseListing = async (req, res) => {
    try {
        // Get seller profile
        const seller = await Seller.findOne({ user: req.user._id });
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller profile not found'
            });
        }

        const horse = await Horse.create({
            seller: seller._id,
            ...req.body
        });

        res.status(201).json({
            success: true,
            horse
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update horse listing
// @route   PUT /api/horses/:id
// @access  Private (Seller only)
exports.updateHorseListing = async (req, res) => {
    try {
        // The horse is already verified by checkHorseOwnership middleware
        const horse = req.horse;

        // Update the horse
        const updatedHorse = await Horse.findByIdAndUpdate(
            horse._id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).populate('seller', 'businessName location');

        res.json({
            success: true,
            horse: updatedHorse
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete horse listing
// @route   DELETE /api/horses/:id
// @access  Private (Seller only)
exports.deleteHorseListing = async (req, res) => {
    try {
        const seller = await Seller.findOne({ user: req.user._id });
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller profile not found'
            });
        }

        const horse = await Horse.findById(req.params.id);
        if (!horse) {
            return res.status(404).json({
                success: false,
                message: 'Horse listing not found'
            });
        }

        // Make sure seller owns the listing
        if (horse.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this listing'
            });
        }

        // Delete images from cloudinary
        for (const image of horse.images) {
            if (image.public_id) {
                await cloudinary.uploader.destroy(image.public_id);
            }
        }

        await horse.remove();

        res.json({
            success: true,
            message: 'Horse listing deleted'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all horse listings (Admin)
// @route   GET /api/horses/admin/listings
// @access  Private (Admin only)
exports.getAllListingsAdmin = async (req, res) => {
    try {
        const { 
            status, 
            seller, 
            sort = '-createdAt',
            page = 1,
            limit = 10
        } = req.query;

        const query = {};

        // Apply filters
        if (status) query.listingStatus = status;
        if (seller) query.seller = seller;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const total = await Horse.countDocuments(query);

        // Get listings with seller details
        const listings = await Horse.find(query)
            .populate({
                path: 'seller',
                select: 'businessName location subscription user',
                populate: {
                    path: 'user',
                    select: 'name email'
                }
            })
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Add additional statistics
        const enhancedListings = listings.map(listing => ({
            ...listing.toObject(),
            sellerDetails: {
                businessName: listing.seller.businessName,
                location: listing.seller.location,
                subscriptionPlan: listing.seller.subscription?.plan || 'No Plan',
                email: listing.seller.user.email,
                name: listing.seller.user.name
            },
            statistics: {
                views: listing.statistics?.views || 0,
                inquiries: listing.statistics?.inquiries || 0,
                favorites: listing.statistics?.favorites || 0,
                daysListed: Math.ceil((new Date() - new Date(listing.createdAt)) / (1000 * 60 * 60 * 24))
            }
        }));

        res.json({
            success: true,
            data: {
                listings: enhancedListings,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                    limit: parseInt(limit)
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
 