const mongoose = require('mongoose');

const horseViewSchema = new mongoose.Schema({
    horse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Horse',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    viewDate: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    timestamps: true
});

// Create a compound index for horse and user
horseViewSchema.index({ horse: 1, user: 1, viewDate: 1 });

// Static method to check if user has viewed horse today
horseViewSchema.statics.hasViewedToday = async function(horseId, userId) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const view = await this.findOne({
        horse: horseId,
        user: userId,
        viewDate: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    return !!view;
};

module.exports = mongoose.model('HorseView', horseViewSchema); 