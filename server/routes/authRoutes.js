import express from 'express';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create user
        user = new User({
            email,
            password, // Note: In a real app, you should hash the password
            role: role || 'user'
        });

        await user.save();

        res.json({
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Simple password check (in real app, use proper password hashing)
        if (password !== user.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set both userId and userRole in session
        req.session.userId = user._id;
        req.session.userRole = user.role;  // Make sure we set the role!

        // Return user data
        res.json({
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add a route to check session status
router.get('/check-session', (req, res) => {
    console.log('Session data:', req.session); // For debugging
    res.json({
        isAuthenticated: !!req.session.userId,
        userRole: req.session.userRole,
        userId: req.session.userId
    });
});

// Check auth status
router.get('/me', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router; 