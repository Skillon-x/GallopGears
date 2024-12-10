import mongoose from 'mongoose';

// Check if the model already exists before creating it
const Message = mongoose.models.Message || mongoose.model('Message', new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    horseName: {
        type: String,
        required: true
    },
    horseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Horse',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    senderEmail: String,
}, {
    timestamps: true
}));

export { Message }; 