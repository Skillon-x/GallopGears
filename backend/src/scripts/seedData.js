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
        verificationLevel: 'premium',
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
        searchPlacement: 'basic',
        socialMediaSharing: false,
        seriousBuyerAccess: false
    },
    'Trot': {
        maxPhotos: 5,
        maxListings: 2,
        listingDuration: 1,
        verificationLevel: 'none',
        virtualStableTour: false,
        analytics: false,
        homepageSpotlight: 0,
        featuredListingBoosts: {
            count: 0,
            duration: 0
        },
        priorityPlacement: false,
        badges: ['Verified Seller'],
        searchPlacement: 'none',
        socialMediaSharing: false,
        seriousBuyerAccess: false
    }
};

// Add more variety in horse data
const HORSE_DATA = {
    breeds: [
        'Thoroughbred', 'Arabian', 'Quarter Horse', 'Mustang', 'Friesian', 
        'Appaloosa', 'Morgan', 'Paint Horse', 'Andalusian', 'Hanoverian',
        'Clydesdale', 'Marwari', 'Kathiawari', 'Manipuri Pony'
    ],
    colors: [
        'Bay', 'Black', 'Chestnut', 'Grey', 'Palomino', 'Roan', 
        'Buckskin', 'Dun', 'Cremello', 'Pinto', 'White'
    ],
    disciplines: [
        'Dressage', 'Show Jumping', 'Racing', 'Trail Riding', 'Endurance',
        'Western Pleasure', 'Eventing', 'Polo', 'Reining'
    ],
    training: ['Basic', 'Intermediate', 'Advanced'],
    temperament: ['Calm', 'Energetic', 'Balanced', 'Gentle', 'Spirited', 'Athletic'],
    locations: [
        { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur'] },
        { state: 'Karnataka', cities: ['Bangalore', 'Mysore', 'Hubli'] },
        { state: 'Delhi', cities: ['New Delhi', 'North Delhi', 'South Delhi'] },
        { state: 'Punjab', cities: ['Chandigarh', 'Amritsar', 'Ludhiana'] },
        { state: 'Rajasthan', cities: ['Jaipur', 'Udaipur', 'Jodhpur'] }
    ]
};

// Helper function to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to get random location
const getRandomLocation = () => {
    const location = getRandomItem(HORSE_DATA.locations);
    return {
        state: location.state,
        city: getRandomItem(location.cities),
        pincode: Math.floor(Math.random() * 900000) + 100000
    };
};

// Helper function to get random price in range
const getRandomPrice = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const PLACEHOLDER_IMAGES = [
    {
        url: 'https://images.unsplash.com/photo-1534773728080-33d31da27ae5',
        public_id: 'galloping-gears/horses/brown-horse-1',
        thumbnail_url: 'https://images.unsplash.com/photo-1534773728080-33d31da27ae5?auto=format&fit=crop&w=200&q=80',
        preview: 'https://images.unsplash.com/photo-1534773728080-33d31da27ae5?auto=format&fit=crop&w=800&q=80',
        width: 800,
        height: 600,
        format: 'jpg',
        size: 1024 * 1024,
        name: 'brown-horse-1.jpg',
        content: null
    },
    {
        url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a',
        public_id: 'galloping-gears/horses/white-horse-1',
        thumbnail_url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=200&q=80',
        preview: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80',
        width: 800,
        height: 600,
        format: 'jpg',
        size: 1024 * 1024,
        name: 'white-horse-1.jpg',
        content: null
    },
    {
        url: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3',
        public_id: 'galloping-gears/horses/black-horse-1',
        thumbnail_url: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&w=200&q=80',
        preview: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&w=800&q=80',
        width: 800,
        height: 600,
        format: 'jpg',
        size: 1024 * 1024,
        name: 'black-horse-1.jpg',
        content: null
    },
    {
        url: 'https://images.unsplash.com/photo-1593179449458-e0d43d512551',
        public_id: 'galloping-gears/horses/brown-horse-2',
        thumbnail_url: 'https://images.unsplash.com/photo-1593179449458-e0d43d512551?auto=format&fit=crop&w=200&q=80',
        preview: 'https://images.unsplash.com/photo-1593179449458-e0d43d512551?auto=format&fit=crop&w=800&q=80',
        width: 800,
        height: 600,
        format: 'jpg',
        size: 1024 * 1024,
        name: 'brown-horse-2.jpg',
        content: null
    },
    {
        url: 'https://images.unsplash.com/photo-1566251037378-5e04e3bec343',
        public_id: 'galloping-gears/horses/white-horse-2',
        thumbnail_url: 'https://images.unsplash.com/photo-1566251037378-5e04e3bec343?auto=format&fit=crop&w=200&q=80',
        preview: 'https://images.unsplash.com/photo-1566251037378-5e04e3bec343?auto=format&fit=crop&w=800&q=80',
        width: 800,
        height: 600,
        format: 'jpg',
        size: 1024 * 1024,
        name: 'white-horse-2.jpg',
        content: null
    }
];

// Helper function to get random images based on subscription plan
const getRandomImages = (plan) => {
    const maxPhotos = SUBSCRIPTION_FEATURES[plan].maxPhotos;
    const numImages = Math.floor(Math.random() * maxPhotos) + 1;
    const images = [];
    
    for (let i = 0; i < numImages; i++) {
        const placeholderImage = PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length];
        const uniqueId = `${Date.now()}_${i}`;
        images.push({
            ...placeholderImage,
            public_id: `${placeholderImage.public_id}_${uniqueId}`,
            preview: placeholderImage.url,
            existing: true
        });
    }
    
    return images;
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
        console.log('Starting seed process...');

        // Create categories (horse breeds) if they don't exist
        for (const breed of HORSE_DATA.breeds) {
            await Category.findOneAndUpdate(
                { name: breed },
                {
                    name: breed,
                    type: 'horse_breed',
                    description: `${breed} horses are known for their unique characteristics and qualities.`,
                    status: 'active'
                },
                { upsert: true }
            );
        }
        console.log('Created/updated horse breed categories');

        // Create sellers with different subscription plans
        const subscriptionTypes = ['Royal Stallion', 'Gallop', 'Trot'];
        const sellers = [];

        console.log('Creating sellers...');
        for (let i = 0; i < 10; i++) {
            const subscriptionType = subscriptionTypes[i % 3];
            const location = getRandomLocation();
            const email = `featured.seller${i + 1}@example.com`;
            
            console.log(`Processing seller ${i + 1} with subscription ${subscriptionType}`);

            // Find or create user
            let user = await User.findOne({ email });
            if (!user) {
                console.log(`Creating new user with email ${email}`);
                user = await User.create({
                    name: `Featured Seller ${i + 1}`,
                    email: email,
                    password: 'password123',
                    role: 'seller',
                    phone: `98765${i.toString().padStart(5, '0')}`,
                    isVerified: true
                });
            } else {
                console.log(`Found existing user with email ${email}`);
            }

            // Find or create seller
            let seller = await Seller.findOne({ user: user._id });
            if (!seller) {
                console.log(`Creating new seller for user ${user._id}`);
                seller = await Seller.create({
                    user: user._id,
                    businessName: `Premium Stable ${i + 1}`,
                    description: `High-quality horse stable specializing in premium breeds and professional training.`,
                    contactDetails: {
                        email: email,
                        phone: `98765${i.toString().padStart(5, '0')}`,
                        whatsapp: `98765${i.toString().padStart(5, '0')}`
                    },
                    location: location,
                    subscription: {
                        plan: subscriptionType,
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                        status: 'active',
                        features: SUBSCRIPTION_FEATURES[subscriptionType]
                    },
                    verificationStatus: 'verified',
                    statistics: {
                        totalSales: Math.floor(Math.random() * 50) + 10,
                        activeListings: Math.floor(Math.random() * 10) + 5,
                        viewsThisMonth: Math.floor(Math.random() * 5000) + 1000
                    }
                });
            } else {
                console.log(`Found existing seller for user ${user._id}`);
                // Update the seller's subscription
                seller.subscription = {
                    plan: subscriptionType,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    status: 'active',
                    features: SUBSCRIPTION_FEATURES[subscriptionType]
                };
                await seller.save();
                console.log(`Updated subscription for seller ${seller._id}`);
            }

            sellers.push(seller);
        }
        console.log('Created/updated featured sellers');

        // Delete existing horse listings
        console.log('Clearing existing horse listings...');
        await Horse.deleteMany({});
        console.log('Cleared existing horse listings');

        // Create horse listings with varying details
        console.log('Creating horse listings...');
        for (const seller of sellers) {
            console.log(`Creating listings for seller ${seller._id} with plan ${seller.subscription.plan}`);
            const listingCount = Math.floor(Math.random() * 8) + 5; // 5-12 listings per seller
            for (let i = 0; i < listingCount; i++) {
                const location = getRandomLocation();
                const breed = getRandomItem(HORSE_DATA.breeds);
                const discipline = getRandomItem(HORSE_DATA.disciplines);
                const training = getRandomItem(HORSE_DATA.training);
                
                let minPrice, maxPrice;
                switch (seller.subscription.plan) {
                    case 'Royal Stallion':
                        minPrice = 500000;
                        maxPrice = 2000000;
                        break;
                    case 'Gallop':
                        minPrice = 200000;
                        maxPrice = 800000;
                        break;
                    case 'Trot':
                        minPrice = 100000;
                        maxPrice = 400000;
                        break;
                    default:
                        console.log(`Warning: Unknown subscription plan ${seller.subscription.plan}, using default prices`);
                        minPrice = 100000;
                        maxPrice = 400000;
                }

                await Horse.create({
                    seller: seller._id,
                    name: `${breed} ${training} ${i + 1}`,
                    breed: breed,
                    age: {
                        years: Math.floor(Math.random() * 12) + 2,
                        months: Math.floor(Math.random() * 12)
                    },
                    gender: ['Stallion', 'Mare', 'Gelding'][Math.floor(Math.random() * 3)],
                    color: getRandomItem(HORSE_DATA.colors),
                    price: getRandomPrice(minPrice, maxPrice),
                    description: `A ${training.toLowerCase()}-level ${breed} with excellent ${discipline.toLowerCase()} training. Perfect for ${discipline.toLowerCase()} enthusiasts.`,
                    location: location,
                    images: getRandomImages(seller.subscription.plan),
                    specifications: {
                        training: training,
                        discipline: discipline,
                        temperament: getRandomItem(HORSE_DATA.temperament),
                        healthStatus: 'Excellent',
                        vaccination: true,
                        papers: true
                    },
                    listingStatus: 'active',
                    statistics: {
                        views: Math.floor(Math.random() * 2000) + 500,
                        saves: Math.floor(Math.random() * 100) + 20,
                        inquiries: Math.floor(Math.random() * 30) + 5
                    },
                    verificationStatus: 'verified',
                    featured: Math.random() < 0.3, // 30% chance of being featured
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
                });
                console.log(`Created listing ${i + 1} for seller ${seller._id}`);
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
        // Create test users and sellers
        for (let i = 0; i < 20; i++) {
            const location = getRandomLocation();
            const subscriptionType = ['Royal Stallion', 'Gallop', 'Trot'][Math.floor(Math.random() * 3)];
            
            const user = await User.create({
                name: `Test User ${i}`,
                email: `test.user${i}@example.com`,
                password: 'password123',
                role: Math.random() < 0.7 ? 'seller' : 'user',
                phone: `98765${i.toString().padStart(5, '0')}`,
                isVerified: Math.random() < 0.8
            });

            if (user.role === 'seller') {
                const seller = await Seller.create({
                    user: user._id,
                    businessName: `Test Stable ${i}`,
                    description: `A professional horse stable offering quality horses and training.`,
                    contactDetails: {
                        email: `test.stable${i}@example.com`,
                        phone: `98765${i.toString().padStart(5, '0')}`,
                        whatsapp: `98765${i.toString().padStart(5, '0')}`
                    },
                    location: location,
                    subscription: {
                        plan: subscriptionType,
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                        status: ['active', 'expired', 'cancelled'][Math.floor(Math.random() * 3)],
                        features: SUBSCRIPTION_FEATURES[subscriptionType]
                    },
                    verificationStatus: ['pending', 'verified', 'rejected'][Math.floor(Math.random() * 3)],
                    statistics: {
                        totalSales: Math.floor(Math.random() * 50),
                        activeListings: Math.floor(Math.random() * 10),
                        viewsThisMonth: Math.floor(Math.random() * 1000)
                    }
                });

                // Create horse listings for each seller
                const listingCount = Math.floor(Math.random() * 5) + 1;
                for (let j = 0; j < listingCount; j++) {
                    const breed = getRandomItem(HORSE_DATA.breeds);
                    const discipline = getRandomItem(HORSE_DATA.disciplines);
                    const training = getRandomItem(HORSE_DATA.training);
                    const location = getRandomLocation();

                    let minPrice, maxPrice;
                    switch (subscriptionType) {
                        case 'Royal Stallion':
                            minPrice = 500000;
                            maxPrice = 2000000;
                            break;
                        case 'Gallop':
                            minPrice = 200000;
                            maxPrice = 800000;
                            break;
                        case 'Trot':
                            minPrice = 100000;
                            maxPrice = 400000;
                            break;
                        default:
                            minPrice = 100000;
                            maxPrice = 400000;
                    }

                    await Horse.create({
                        seller: seller._id,
                        name: `${breed} ${training} ${j + 1}`,
                        breed: breed,
                        age: {
                            years: Math.floor(Math.random() * 12) + 2,
                            months: Math.floor(Math.random() * 12)
                        },
                        gender: ['Stallion', 'Mare', 'Gelding'][Math.floor(Math.random() * 3)],
                        color: getRandomItem(HORSE_DATA.colors),
                        price: getRandomPrice(minPrice, maxPrice),
                        description: `A ${training.toLowerCase()}-level ${breed} with excellent ${discipline.toLowerCase()} training. Perfect for ${discipline.toLowerCase()} enthusiasts.`,
                        location: location,
                        images: getRandomImages(subscriptionType),
                        specifications: {
                            training: training,
                            discipline: discipline,
                            temperament: getRandomItem(HORSE_DATA.temperament),
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
                        verificationStatus: ['pending', 'verified', 'rejected'][Math.floor(Math.random() * 3)],
                        featured: Math.random() < 0.2,
                        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
                    });
                }
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

// Connect to MongoDB and show menu
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        showMenu()
            .catch(error => {
                console.error('Error:', error);
                process.exit(1);
            });
    })
    .catch(error => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }); 