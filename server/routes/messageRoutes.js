import express from 'express';
import { Message } from '../models/Message.js';

const router = express.Router();

// Get messages for a seller
router.get('/seller/:sellerId', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const messages = await Message.find({
            receiver: req.session.userId
        }).sort({ createdAt: -1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark message as read
router.put('/:messageId/read', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const message = await Message.findOneAndUpdate(
            {
                _id: req.params.messageId,
                receiver: req.session.userId
            },
            { read: true },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json(message);
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send a message
router.post('/', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { receiver, horseName, horseId, message, senderEmail } = req.body;

        const newMessage = new Message({
            sender: req.session.userId,
            receiver,
            horseName,
            horseId,
            message,
            senderEmail
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router; 