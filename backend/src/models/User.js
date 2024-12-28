const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'seller', 'admin', 'pending_seller'],
        default: 'user'
    },
    registrationStep: {
        type: Number,
        min: 0,
        max: 3,
        default: 0
    },
    isSellerRegistration: {
        type: Boolean,
        default: false
    },
    registrationTimestamp: {
        type: Date
    },
    phone: {
        type: String,
        match: [/^[+]?[\d\s-]+$/, 'Please enter a valid phone number']
    },
    location: {
        state: String,
        city: String,
        pincode: {
            type: String,
            match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Horse'
    }],
    notifications: [{
        type: {
            type: String,
            enum: ['inquiry_response', 'price_drop', 'new_listing', 'system'],
            required: true
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        relatedEntity: {
            type: {
                type: String,
                enum: ['horse', 'inquiry', 'seller']
            },
            id: mongoose.Schema.Types.ObjectId
        },
        isRead: {
            type: Boolean,
            default: false
        },
        readAt: Date,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    alertPreferences: {
        priceDrops: {
            type: Boolean,
            default: true
        },
        newListings: {
            type: Boolean,
            default: true
        },
        inquiryResponses: {
            type: Boolean,
            default: true
        },
        marketUpdates: {
            type: Boolean,
            default: false
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    preferences: {
        breeds: [String],
        priceRange: {
            min: Number,
            max: Number
        },
        purposes: [String],
        location: {
            states: [String],
            maxDistance: Number
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Add notification
userSchema.methods.addNotification = async function(notification) {
    this.notifications.unshift(notification);
    if (this.notifications.length > 50) {
        this.notifications = this.notifications.slice(0, 50);
    }
    return this.save();
};

// Get unread notifications count
userSchema.methods.getUnreadNotificationsCount = function() {
    return this.notifications.filter(n => !n.isRead).length;
};

// Create indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'notifications.isRead': 1 });
userSchema.index({ 'notifications.createdAt': -1 });

module.exports = mongoose.model('User', userSchema); 