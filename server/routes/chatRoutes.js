import express from 'express';
import { Chat, Message } from '../models/Chat.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get user's conversations
router.get('/conversations/:userId', auth, async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.params.userId
        })
            .populate('participants', 'name email')
            .populate('horseId', 'name')
            .sort({ lastMessageAt: -1 });

        const conversations = chats.map(chat => ({
            id: chat._id,
            otherUser: chat.participants.find(p => p._id.toString() !== req.params.userId),
            horseDetails: chat.horseId,
            lastMessage: chat.lastMessage,
            lastMessageAt: chat.lastMessageAt
        }));

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get messages for a chat
router.get('/:chatId/messages', auth, async (req, res) => {
    try {
        const messages = await Message.find({ chatId: req.params.chatId })
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send a message
router.post('/:chatId/messages', auth, async (req, res) => {
    try {
        const { content, senderId } = req.body;
        const message = await Message.create({
            chatId: req.params.chatId,
            senderId,
            content
        });

        await Chat.findByIdAndUpdate(req.params.chatId, {
            lastMessage: content,
            lastMessageAt: new Date()
        });

        res.json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start a new chat
router.post('/new', auth, async (req, res) => {
    try {
        const { participants, horseId } = req.body;
        const existingChat = await Chat.findOne({
            participants: { $all: participants },
            horseId
        });

        if (existingChat) {
            return res.json(existingChat);
        }

        const chat = await Chat.create({
            participants,
            horseId
        });

        res.json(chat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 