import express from 'express';
import { Horse } from '../models/Horse.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

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
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Only sellers can create listings' });
    }

    const horse = new Horse({
      ...req.body,
      seller: req.user.id
    });

    await horse.save();
    res.status(201).json(horse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update horse
router.put('/:id', auth, async (req, res) => {
  try {
    const horse = await Horse.findById(req.params.id);
    if (!horse) {
      return res.status(404).json({ error: 'Horse not found' });
    }

    if (horse.seller.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
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
router.delete('/:id', auth, async (req, res) => {
  try {
    const horse = await Horse.findById(req.params.id);
    if (!horse) {
      return res.status(404).json({ error: 'Horse not found' });
    }

    if (horse.seller.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await horse.deleteOne();
    res.json({ message: 'Horse removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get seller's horses
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const horses = await Horse.find({ seller: req.params.sellerId })
      .populate('seller', 'email')
      .sort({ createdAt: -1 });
    res.json(horses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle favorite
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const horse = await Horse.findById(req.params.id);
    if (!horse) {
      return res.status(404).json({ error: 'Horse not found' });
    }

    const isFavorited = horse.favorites.includes(req.user.id);
    if (isFavorited) {
      horse.favorites = horse.favorites.filter(id => id.toString() !== req.user.id);
    } else {
      horse.favorites.push(req.user.id);
    }

    await horse.save();
    res.json({ isFavorited: !isFavorited });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 