import express from 'express';
import { Horse } from '../models/Horse.js';

const router = express.Router();

// Middleware to check if user is authenticated and is a seller
const checkSeller = (req, res, next) => {
    console.log('Session in checkSeller:', req.session); // Debug log

    if (!req.session.userId) {
        console.log('No userId in session');
        return res.status(401).json({ error: 'Not authenticated' });
    }

    console.log('UserRole in session:', req.session.userRole); // Debug log

    if (req.session.userRole !== 'seller') {
        console.log('User role is not seller:', req.session.userRole);
        return res.status(403).json({ error: 'Not authorized. Seller access required.' });
    }

    next();
};

// Get all horses
router.get('/', async (req, res) => {
    try {
        const filters = {};
        const {
            minPrice, maxPrice, minAge, maxAge, breed,
            gender, discipline, location, searchTerm
        } = req.query;

        if (minPrice) filters.price = { $gte: Number(minPrice) };
        if (maxPrice) filters.price = { ...filters.price, $lte: Number(maxPrice) };
        if (minAge) filters.age = { $gte: Number(minAge) };
        if (maxAge) filters.age = { ...filters.age, $lte: Number(maxAge) };
        if (breed) filters.breed = breed;
        if (gender) filters.gender = gender;
        if (discipline) filters.discipline = discipline;
        if (location) filters.location = new RegExp(location, 'i');
        if (searchTerm) {
            filters.$or = [
                { name: new RegExp(searchTerm, 'i') },
                { breed: new RegExp(searchTerm, 'i') },
                { description: new RegExp(searchTerm, 'i') }
            ];
        }

        const horses = await Horse.find(filters)
            .populate('seller', 'email')
            .sort({ createdAt: -1 });
        res.json(horses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single horse
router.get('/:id', async (req, res) => {
    try {
        const horse = await Horse.findById(req.params.id).populate('seller', 'email');
        if (!horse) {
            return res.status(404).json({ error: 'Horse not found' });
        }
        res.json(horse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create horse (sellers only)
router.post('/', checkSeller, async (req, res) => {
    try {
        console.log('Adding horse for seller:', req.session.userId); // Debug log

        const horseData = {
            ...req.body,
            seller: req.session.userId
        };

        const horse = new Horse(horseData);
        await horse.save();
        res.status(201).json(horse);
    } catch (error) {
        console.error('Error adding horse:', error);
        res.status(400).json({ error: error.message });
    }
});

// Update horse
router.put('/:id', checkSeller, async (req, res) => {
    try {
        const horse = await Horse.findById(req.params.id);
        if (!horse) {
            return res.status(404).json({ error: 'Horse not found' });
        }

        const updatedHorse = await Horse.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(updatedHorse);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete horse
router.delete('/:id', checkSeller, async (req, res) => {
    try {
        const horse = await Horse.findById(req.params.id);
        if (!horse) {
            return res.status(404).json({ error: 'Horse not found' });
        }

        await horse.deleteOne();
        res.json({ message: 'Horse removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get seller's horses
router.get('/seller/:sellerId', checkSeller, async (req, res) => {
    try {
        const horses = await Horse.find({ seller: req.session.userId });
        res.json(horses);
    } catch (error) {
        console.error('Error fetching seller horses:', error);
        res.status(500).json({ error: error.message });
    }
});

// Toggle favorite
router.post('/:id/favorite', checkSeller, async (req, res) => {
    try {
        const horse = await Horse.findById(req.params.id);
        if (!horse) {
            return res.status(404).json({ error: 'Horse not found' });
        }

        const isFavorited = horse.favorites.includes(req.session.userId);
        if (isFavorited) {
            horse.favorites = horse.favorites.filter(id => id.toString() !== req.session.userId);
        } else {
            horse.favorites.push(req.session.userId);
        }

        await horse.save();
        res.json({ isFavorited: !isFavorited });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 