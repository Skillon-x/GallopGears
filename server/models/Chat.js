import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    horseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Horse'
    },
    lastMessage: String,
    lastMessageAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

export const Chat = mongoose.model('Chat', chatSchema);
export const Message = mongoose.model('Message', messageSchema); 