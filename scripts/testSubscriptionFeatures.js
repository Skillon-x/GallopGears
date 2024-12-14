const dotenv = require('dotenv');
const { log, makeRequest, runTests } = require('./test.utils');

dotenv.config();

let testData = {
    adminToken: '',
    royalSellerToken: '',
    gallopSellerToken: '',
    trotSellerToken: '',
    starterSellerToken: '',
    userToken: '',
    horseIds: {}
};

// Test configuration
const config = {
    admin: {
        email: 'admin@test.com',
        password: 'admin123',
        name: 'Test Admin',
        role: 'admin'
    },
    royalSeller: {
        email: 'royal@test.com',
        password: 'seller123',
        name: 'Royal Stables',
        role: 'user'
    },
    gallopSeller: {
        email: 'gallop@test.com',
        password: 'seller123',
        name: 'Gallop Stables',
        role: 'user'
    },
    trotSeller: {
        email: 'trot@test.com',
        password: 'seller123',
        name: 'Trot Stables',
        role: 'user'
    },
    starterSeller: {
        email: 'starter@test.com',
        password: 'seller123',
        name: 'Starter Stables',
        role: 'user'
    },
    user: {
        email: 'user@test.com',
        password: 'user123',
        name: 'Test User',
        role: 'user'
    }
};

// Test suite
const testSuites = [
    {
        name: 'User Registration',
        tests: [
            {
                name: 'Register Admin',
                run: async () => {
                    const result = await makeRequest('POST', '/auth/register', config.admin);
                    testData.adminToken = result.token;
                }
            },
            {
                name: 'Register Royal Stallion Seller',
                run: async () => {
                    // Register as user first
                    const userResult = await makeRequest('POST', '/auth/register', config.royalSeller);

                    // Create seller profile with required fields
                    const sellerResult = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Royal Stables',
                        description: 'Premium horse stables',
                        location: {
                            state: 'Maharashtra',
                            city: 'Mumbai',
                            pincode: '400001'
                        },
                        contactDetails: {
                            phone: '9876543210',
                            email: 'royal@test.com',
                            whatsapp: '9876543210'
                        },
                        businessDocuments: {
                            gst: 'TESTGST123',
                            pan: 'TESTPAN123'
                        }
                    }, userResult.token);

                    // Get updated token with seller role
                    const meResult = await makeRequest('GET', '/auth/me', null, userResult.token);
                    testData.royalSellerToken = userResult.token;
                }
            },
            {
                name: 'Register Gallop Seller',
                run: async () => {
                    // Register as user first
                    const userResult = await makeRequest('POST', '/auth/register', config.gallopSeller);

                    // Create seller profile with required fields
                    const sellerResult = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Gallop Stables',
                        description: 'Standard horse stables',
                        location: {
                            state: 'Karnataka',
                            city: 'Bangalore',
                            pincode: '560001'
                        },
                        contactDetails: {
                            phone: '9876543211',
                            email: 'gallop@test.com',
                            whatsapp: '9876543211'
                        },
                        businessDocuments: {
                            gst: 'TESTGST124',
                            pan: 'TESTPAN124'
                        }
                    }, userResult.token);

                    // Get updated token with seller role
                    const meResult = await makeRequest('GET', '/auth/me', null, userResult.token);
                    testData.gallopSellerToken = userResult.token;
                }
            },
            {
                name: 'Register Trot Seller',
                run: async () => {
                    // Register as user first
                    const userResult = await makeRequest('POST', '/auth/register', config.trotSeller);

                    // Create seller profile with required fields
                    const sellerResult = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Trot Stables',
                        description: 'Basic horse stables',
                        location: {
                            state: 'Tamil Nadu',
                            city: 'Chennai',
                            pincode: '600001'
                        },
                        contactDetails: {
                            phone: '9876543212',
                            email: 'trot@test.com',
                            whatsapp: '9876543212'
                        },
                        businessDocuments: {
                            gst: 'TESTGST125',
                            pan: 'TESTPAN125'
                        }
                    }, userResult.token);

                    // Get updated token with seller role
                    const meResult = await makeRequest('GET', '/auth/me', null, userResult.token);
                    testData.trotSellerToken = userResult.token;
                }
            },
            {
                name: 'Register Starter Seller',
                run: async () => {
                    // Register as user first
                    const userResult = await makeRequest('POST', '/auth/register', config.starterSeller);

                    // Create seller profile with required fields
                    const sellerResult = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Starter Stables',
                        description: 'Free horse stables',
                        location: {
                            state: 'Gujarat',
                            city: 'Ahmedabad',
                            pincode: '380001'
                        },
                        contactDetails: {
                            phone: '9876543213',
                            email: 'starter@test.com',
                            whatsapp: '9876543213'
                        },
                        businessDocuments: {
                            gst: 'TESTGST126',
                            pan: 'TESTPAN126'
                        }
                    }, userResult.token);

                    // Get updated token with seller role
                    const meResult = await makeRequest('GET', '/auth/me', null, userResult.token);
                    testData.starterSellerToken = userResult.token;
                }
            },
            {
                name: 'Register User',
                run: async () => {
                    const result = await makeRequest('POST', '/auth/register', config.user);
                    testData.userToken = result.token;
                }
            }
        ]
    },
    {
        name: 'Subscription Plans',
        tests: [
            {
                name: 'Get Available Plans',
                run: async () => {
                    const result = await makeRequest('GET', '/sellers/plans');
                    if (!result.success || !Array.isArray(result.plans)) {
                        throw new Error('Invalid subscription plans response');
                    }
                }
            },
            {
                name: 'Subscribe to Royal Stallion Plan',
                run: async () => {
                    const result = await makeRequest('POST', '/sellers/subscribe', {
                        package: 'Royal Stallion',
                        duration: 30
                    }, testData.royalSellerToken);

                    if (!result.success || !result.subscription || !result.transaction) {
                        throw new Error('Failed to subscribe to Royal Stallion plan');
                    }
                }
            },
            {
                name: 'Subscribe to Gallop Plan',
                run: async () => {
                    const result = await makeRequest('POST', '/sellers/subscribe', {
                        package: 'Gallop',
                        duration: 30
                    }, testData.gallopSellerToken);

                    if (!result.success || !result.subscription || !result.transaction) {
                        throw new Error('Failed to subscribe to Gallop plan');
                    }
                }
            },
            {
                name: 'Subscribe to Trot Plan',
                run: async () => {
                    const result = await makeRequest('POST', '/sellers/subscribe', {
                        package: 'Trot',
                        duration: 30
                    }, testData.trotSellerToken);

                    if (!result.success || !result.subscription || !result.transaction) {
                        throw new Error('Failed to subscribe to Trot plan');
                    }
                }
            }
        ]
    },
    {
        name: 'Subscription Features',
        tests: [
            {
                name: 'Get Royal Stallion Features',
                run: async () => {
                    const result = await makeRequest('GET', '/sellers/subscription', null, testData.royalSellerToken);
                    if (!result.success || !result.subscription) {
                        throw new Error('Failed to get Royal Stallion subscription');
                    }
                }
            },
            {
                name: 'Get Gallop Features',
                run: async () => {
                    const result = await makeRequest('GET', '/sellers/subscription', null, testData.gallopSellerToken);
                    if (!result.success || !result.subscription) {
                        throw new Error('Failed to get Gallop subscription');
                    }
                }
            },
            {
                name: 'Get Trot Features',
                run: async () => {
                    const result = await makeRequest('GET', '/sellers/subscription', null, testData.trotSellerToken);
                    if (!result.success || !result.subscription) {
                        throw new Error('Failed to get Trot subscription');
                    }
                }
            }
        ]
    },
    {
        name: 'Listing Management',
        tests: [
            {
                name: 'Create Horse Listings',
                run: async () => {
                    // Create a horse listing for each seller
                    const horseData = {
                        name: 'Test Horse',
                        breed: 'Thoroughbred',
                        age: { years: 5, months: 0 },
                        gender: 'Stallion',
                        color: 'Bay',
                        price: 100000,
                        description: 'Test horse',
                        location: {
                            state: 'Maharashtra',
                            city: 'Mumbai',
                            pincode: '400001'
                        },
                        images: [{
                            url: 'https://example.com/image.jpg',
                            public_id: 'test_image_1',
                            thumbnail_url: 'https://example.com/thumb.jpg',
                            width: 800,
                            height: 600,
                            format: 'jpg'
                        }],
                        specifications: {
                            training: 'Advanced',
                            discipline: ['Dressage', 'Show Jumping'],
                            temperament: 'Calm',
                            healthStatus: 'Excellent',
                            vaccination: true,
                            papers: true
                        }
                    };

                    // Royal Stallion - Create multiple listings
                    for (let i = 0; i < 3; i++) {
                        const result = await makeRequest('POST', '/horses', {
                            ...horseData,
                            name: `Royal Horse ${i + 1}`
                        }, testData.royalSellerToken);
                        if (!result.success) {
                            throw new Error('Failed to create Royal Stallion listing');
                        }
                    }

                    // Gallop - Create limited listings
                    for (let i = 0; i < 2; i++) {
                        const result = await makeRequest('POST', '/horses', {
                            ...horseData,
                            name: `Gallop Horse ${i + 1}`
                        }, testData.gallopSellerToken);
                        if (!result.success) {
                            throw new Error('Failed to create Gallop listing');
                        }
                    }

                    // Trot - Create single listing
                    const trotResult = await makeRequest('POST', '/horses', {
                        ...horseData,
                        name: 'Trot Horse'
                    }, testData.trotSellerToken);
                    if (!trotResult.success) {
                        throw new Error('Failed to create Trot listing');
                    }

                    // Starter - Create single listing
                    const starterResult = await makeRequest('POST', '/horses', {
                        ...horseData,
                        name: 'Starter Horse'
                    }, testData.starterSellerToken);
                    if (!starterResult.success) {
                        throw new Error('Failed to create Starter listing');
                    }
                }
            },
            {
                name: 'Get Seller Listings',
                run: async () => {
                    // Get listings for each seller
                    const royalResult = await makeRequest('GET', '/sellers/listings', null, testData.royalSellerToken);
                    if (!royalResult.success || !Array.isArray(royalResult.listings)) {
                        throw new Error('Failed to get Royal Stallion listings');
                    }

                    const gallopResult = await makeRequest('GET', '/sellers/listings', null, testData.gallopSellerToken);
                    if (!gallopResult.success || !Array.isArray(gallopResult.listings)) {
                        throw new Error('Failed to get Gallop listings');
                    }

                    const trotResult = await makeRequest('GET', '/sellers/listings', null, testData.trotSellerToken);
                    if (!trotResult.success || !Array.isArray(trotResult.listings)) {
                        throw new Error('Failed to get Trot listings');
                    }

                    const starterResult = await makeRequest('GET', '/sellers/listings', null, testData.starterSellerToken);
                    if (!starterResult.success || !Array.isArray(starterResult.listings)) {
                        throw new Error('Failed to get Starter listings');
                    }
                }
            }
        ]
    }
];

// Add command line arguments handling
const args = process.argv.slice(2);
if (args.includes('--debug')) {
    process.env.DEBUG = 'true';
}

// Run tests
runTests(testSuites); 