const mongoose = require('mongoose');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Horse = require('../models/Horse');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');
const Category = require('../models/Category');
const dotenv = require('dotenv');
const readline = require('readline');

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

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

async function clearCollections(collections) {
    const models = {
        users: User,
        sellers: Seller,
        horses: Horse,
        transactions: Transaction,
        activityLogs: ActivityLog,
        categories: Category
    };

    for (const collection of collections) {
        if (models[collection]) {
            await models[collection].deleteMany({});
            console.log(`Cleared ${collection} collection`);
        }
    }
}

async function seedHomeData() {
    try {
        // Create categories (horse breeds)
        const breeds = ['Thoroughbred', 'Arabian', 'Quarter Horse', 'Mustang', 'Friesian', 'Appaloosa', 'Morgan', 'Paint Horse'];
        for (const breed of breeds) {
            await Category.create({
                name: breed,
                type: 'horse_breed',
                description: `${breed} breed description`,
                status: 'active'
            });
        }
        console.log('Created horse breed categories');

        // Create sellers with different subscription plans
        const subscriptionTypes = ['Royal Stallion', 'Gallop', 'Trot'];
        const sellers = [];

        for (let i = 0; i < 6; i++) {
            const subscriptionType = subscriptionTypes[i % 3];
            const user = await User.create({
                name: `Featured Seller ${i + 1}`,
                email: `featured.seller${i + 1}@example.com`,
                password: 'password123',
                role: 'seller',
                phone: `98765${i.toString().padStart(5, '0')}`,
                isVerified: true
            });

            const seller = await Seller.create({
                user: user._id,
                businessName: `Premium Stable ${i + 1}`,
                description: `High-quality horse stable with premium breeds`,
                contactDetails: {
                    email: `featured.seller${i + 1}@example.com`,
                    phone: `98765${i.toString().padStart(5, '0')}`
                },
                location: {
                    state: ['Maharashtra', 'Karnataka', 'Delhi', 'Punjab'][i % 4],
                    city: ['Mumbai', 'Bangalore', 'New Delhi', 'Chandigarh'][i % 4],
                    pincode: `40000${i + 1}`
                },
                subscription: {
                    type: subscriptionType,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    status: 'active',
                    features: SUBSCRIPTION_FEATURES[subscriptionType]
                },
                verificationStatus: 'verified',
                statistics: {
                    totalSales: Math.floor(Math.random() * 50) + 10,
                    activeListings: Math.floor(Math.random() * 5) + 1,
                    viewsThisMonth: Math.floor(Math.random() * 1000) + 100
                }
            });

            sellers.push(seller);
        }
        console.log('Created featured sellers');

        // Create horse listings with varying view counts
        for (const seller of sellers) {
            const listingCount = Math.floor(Math.random() * 3) + 2; // 2-4 listings per seller
            for (let i = 0; i < listingCount; i++) {
                await Horse.create({
                    seller: seller._id,
                    name: `Premium Horse ${seller._id}-${i + 1}`,
                    breed: breeds[Math.floor(Math.random() * breeds.length)],
                    age: {
                        years: Math.floor(Math.random() * 8) + 2,
                        months: Math.floor(Math.random() * 12)
                    },
                    gender: ['Stallion', 'Mare', 'Gelding'][Math.floor(Math.random() * 3)],
                    color: ['Bay', 'Black', 'Chestnut', 'Grey', 'Palomino'][Math.floor(Math.random() * 5)],
                    price: Math.floor(Math.random() * 500000) + 100000,
                    description: 'A premium horse with excellent breeding and training',
                    location: {
                        state: ['Maharashtra', 'Karnataka', 'Delhi', 'Punjab'][Math.floor(Math.random() * 4)],
                        city: ['Mumbai', 'Bangalore', 'New Delhi', 'Chandigarh'][Math.floor(Math.random() * 4)],
                        pincode: '400001'
                    },
                    images: [{
                        url: 'https://example.com/horse.jpg',
                        public_id: `horse_${i}`,
                        thumbnail_url: 'https://example.com/horse_thumb.jpg',
                        width: 800,
                        height: 600,
                        format: 'jpg'
                    }],
                    specifications: {
                        training: ['Basic', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
                        discipline: ['Dressage', 'Show Jumping', 'Racing'][Math.floor(Math.random() * 3)],
                        temperament: ['Calm', 'Energetic', 'Balanced'][Math.floor(Math.random() * 3)],
                        healthStatus: 'Excellent',
                        vaccination: true,
                        papers: true
                    },
                    listingStatus: 'active',
                    statistics: {
                        views: Math.floor(Math.random() * 1000) + 100,
                        saves: Math.floor(Math.random() * 50),
                        inquiries: Math.floor(Math.random() * 20)
                    },
                    verificationStatus: 'verified',
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date within last 30 days
                });
            }
        }
        console.log('Created featured horse listings');

    } catch (error) {
        console.error('Error seeding home data:', error);
        throw error;
    }
}

async function seedFullData() {
    try {
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
                location: {
                    state: ['Maharashtra', 'Karnataka', 'Delhi', 'Punjab'][i % 4],
                    city: ['Mumbai', 'Bangalore', 'New Delhi', 'Chandigarh'][i % 4],
                    pincode: '400001'
                },
                contactDetails: {
                    phone: `98765${i.toString().padStart(5, '0')}`,
                    email: `seller${i + 1}@example.com`,
                    whatsapp: `98765${i.toString().padStart(5, '0')}`
                },
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
                    location: {
                        state: ['Maharashtra', 'Karnataka', 'Delhi', 'Punjab'][Math.floor(Math.random() * 4)],
                        city: ['Mumbai', 'Bangalore', 'New Delhi', 'Chandigarh'][Math.floor(Math.random() * 4)],
                        pincode: '400001'
                    },
                    images: [{
                        url: 'https://example.com/horse.jpg',
                        public_id: `horse_${i}`,
                        thumbnail_url: 'https://example.com/horse_thumb.jpg',
                        width: 800,
                        height: 600,
                        format: 'jpg'
                    }],
                    specifications: {
                        training: ['Basic', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
                        discipline: ['Dressage', 'Show Jumping', 'Racing'][Math.floor(Math.random() * 3)],
                        temperament: ['Calm', 'Energetic', 'Balanced'][Math.floor(Math.random() * 3)],
                        healthStatus: 'Excellent',
                        vaccination: true,
                        papers: true
                    },
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
    } catch (error) {
        console.error('Error seeding full data:', error);
        throw error;
    }
}

async function showMenu() {
    console.log('\nData Seeding Options:');
    console.log('1. Seed Home Page Data');
    console.log('2. Seed Full Platform Data');
    console.log('3. Clear All Data');
    console.log('4. Exit');

    const choice = await question('\nSelect an option (1-4): ');

    switch (choice) {
        case '1':
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Connected to MongoDB');
            await clearCollections(['categories', 'users', 'sellers', 'horses']);
            await seedHomeData();
            break;
        case '2':
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Connected to MongoDB');
            await clearCollections(['users', 'sellers', 'horses', 'transactions', 'activityLogs']);
            await seedFullData();
            break;
        case '3':
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Connected to MongoDB');
            await clearCollections(['users', 'sellers', 'horses', 'transactions', 'activityLogs', 'categories']);
            console.log('All data cleared');
            break;
        case '4':
            console.log('Exiting...');
            break;
        default:
            console.log('Invalid option');
            await showMenu();
            return;
    }

    rl.close();
    process.exit(0);
}

// Start the script
showMenu().catch(error => {
    console.error('Error:', error);
    process.exit(1);
}); 