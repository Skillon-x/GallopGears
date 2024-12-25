const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['horse_breed', 'equipment', 'service'],
        required: true
    },
    description: String,
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    attributes: [{
        name: String,
        type: String,
        required: Boolean,
        options: [String] // For dropdown/multiple choice attributes
    }],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    image: {
        url: String,
        public_id: String
    },
    metadata: {
        seoTitle: String,
        seoDescription: String,
        keywords: [String]
    },
    sortOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create indexes
categorySchema.index({ name: 1, type: 1 }, { unique: true });
categorySchema.index({ parent: 1 });

module.exports = mongoose.model('Category', categorySchema); 