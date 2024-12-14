const mongoose = require('mongoose');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Horse = require('../models/Horse');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');
const dotenv = require('dotenv');

dotenv.config();

const SUBSCRIPTION_FEATURES = {
    'Royal Stallion': {
        maxPhotos: 20,
        maxListings: Infinity,
        listingDuration: 3,
        verificationLevel: 'professional',
        virtualStableTour: true,
        analytics: true,
        homepageSpotlight: 5,
        featuredListingBoosts: {
            count: 3,
            duration: 7
        },
        priorityPlacement: true,
        badges: ['Top Seller', 'Premium Stables'],
        searchPlacement: 'premium',
        socialMediaSharing: true,
        seriousBuyerAccess: true
    },
    'Gallop': {
        maxPhotos: 10,
        maxListings: 5,
        listingDuration: 2,
        verificationLevel: 'basic',
        virtualStableTour: false,
        analytics: false,
        homepageSpotlight: 2,
        featuredListingBoosts: {
            count: 1,
            duration: 5
        },
        priorityPlacement: false,
        badges: ['Verified Seller'],
        searchPlacement: 'standard',
        socialMediaSharing: false,
        seriousBuyerAccess: false
    },
    'Trot': {
        maxPhotos: 5,
        maxListings: 2,
        listingDuration: 1,
        verificationLevel: 'basic',
        virtualStableTour: false,
        analytics: false,
        homepageSpotlight: 0,
        featuredListingBoosts: {
            count: 0,
            duration: 0
        },
        priorityPlacement: false,
        badges: ['Verified Seller'],
        searchPlacement: 'standard',
        socialMediaSharing: false,
        seriousBuyerAccess: false
    }
};

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Seller.deleteMany({}),
            Horse.deleteMany({}),
            Transaction.deleteMany({}),
            ActivityLog.deleteMany({})
        ]);

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            phone: '1234567890',
            isVerified: true
        });

        // Create test sellers with different subscription types
        const subscriptionTypes = ['Royal Stallion', 'Gallop', 'Trot'];
        const sellers = [];

        for (let i = 0; i < 15; i++) {
            const subscriptionType = subscriptionTypes[i % 3];
            const user = await User.create({
                name: `Seller ${i + 1}`,
                email: `seller${i + 1}@example.com`,
                password: 'password123',
                role: 'seller',
                phone: `98765${i.toString().padStart(5, '0')}`,
                isVerified: true
            });

            const seller = await Seller.create({
                user: user._id,
                businessName: `Horse Stable ${i + 1}`,
                description: `Premium horse stable with quality breeds`,
                subscription: {
                    type: subscriptionType,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    status: 'active',
                    features: SUBSCRIPTION_FEATURES[subscriptionType],
                    spotlightUsed: Math.floor(Math.random() * SUBSCRIPTION_FEATURES[subscriptionType].homepageSpotlight),
                    boostsUsed: Math.floor(Math.random() * SUBSCRIPTION_FEATURES[subscriptionType].featuredListingBoosts.count)
                },
                verificationStatus: ['pending', 'verified', 'rejected'][Math.floor(Math.random() * 3)],
                statistics: {
                    totalSales: Math.floor(Math.random() * 50),
                    activeListings: Math.floor(Math.random() * SUBSCRIPTION_FEATURES[subscriptionType].maxListings),
                    viewsThisMonth: Math.floor(Math.random() * 1000)
                }
            });

            sellers.push(seller);

            // Create transactions for subscriptions
            await Transaction.create({
                seller: seller._id,
                type: 'subscription',
                amount: subscriptionType === 'Royal Stallion' ? 9999 : subscriptionType === 'Gallop' ? 4999 : 1999,
                status: 'completed',
                subscriptionDetails: {
                    package: subscriptionType,
                    duration: subscriptionType === 'Royal Stallion' ? 3 : subscriptionType === 'Gallop' ? 2 : 1,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                },
                paymentMethod: 'razorpay'
            });

            // Create some activity logs
            await ActivityLog.create({
                user: user._id,
                action: 'seller_register',
                entityType: 'seller',
                entityId: seller._id,
                description: `Seller registration: ${seller.businessName}`,
                status: 'success',
                severity: 'info'
            });
        }

        // Create some horse listings
        for (const seller of sellers) {
            const listingCount = Math.min(
                Math.floor(Math.random() * 5) + 1,
                seller.subscription.features.maxListings
            );

            for (let i = 0; i < listingCount; i++) {
                await Horse.create({
                    seller: seller._id,
                    name: `Horse ${i + 1}`,
                    breed: ['Arabian', 'Thoroughbred', 'Mustang'][Math.floor(Math.random() * 3)],
                    age: {
                        years: Math.floor(Math.random() * 10) + 2,
                        months: Math.floor(Math.random() * 12)
                    },
                    gender: ['Stallion', 'Mare', 'Gelding'][Math.floor(Math.random() * 3)],
                    color: ['Bay', 'Black', 'Chestnut'][Math.floor(Math.random() * 3)],
                    price: Math.floor(Math.random() * 500000) + 50000,
                    description: 'A beautiful horse with great temperament',
                    listingStatus: ['draft', 'active', 'sold', 'inactive'][Math.floor(Math.random() * 4)],
                    statistics: {
                        views: Math.floor(Math.random() * 1000),
                        saves: Math.floor(Math.random() * 100),
                        inquiries: Math.floor(Math.random() * 50)
                    },
                    verificationStatus: ['pending', 'verified', 'rejected'][Math.floor(Math.random() * 3)]
                });
            }
        }

        console.log('Test data seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData(); 