import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import authRoutes from './routes/authRoutes.js';
import horseRoutes from './routes/horseRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { upload, uploadToCloudinary } from './middleware/upload.js';
import MongoStore from 'connect-mongo';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: 'lax'
    }
}));

// Debug middleware to log session data
app.use((req, res, next) => {
    console.log('Session data:', {
        userId: req.session.userId,
        userRole: req.session.userRole
    });
    next();
});

// Database connection with retry logic
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/horses', horseRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

// Image upload route
app.post('/api/upload', upload.array('images', 5), async (req, res) => {
    try {
        const uploadPromises = req.files.map(file => uploadToCloudinary(file));
        const urls = await Promise.all(uploadPromises);
        res.json({ urls });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
});