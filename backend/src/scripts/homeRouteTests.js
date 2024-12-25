const { log, makeRequest, runTests } = require('./test.utils');

// Debug function
const debug = (message, data = null) => {
    if (process.env.DEBUG) {
        console.log('\n[DEBUG]', message);
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
    }
};

// Test data storage
let testData = {
    userToken: '',
    sellerToken: '',
    horseIds: [],
    sellerIds: []
};

// Test suites
const testSuites = [
    {
        name: 'Setup Test Data',
        tests: [
            {
                name: 'Register Seller',
                run: async () => {
                    debug('Registering test seller');
                    
                    // Register user first
                    const userResult = await makeRequest('POST', '/auth/register', {
                        name: 'Test Seller',
                        email: 'seller@test.com',
                        password: 'test123',
                        role: 'user'
                    });

                    if (!userResult.success) {
                        throw new Error('Failed to register seller');
                    }

                    // Create seller profile
                    const sellerResult = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Test Stables',
                        description: 'Test stable description',
                        location: {
                            state: 'Test State',
                            city: 'Test City',
                            pincode: '123456'
                        },
                        contactDetails: {
                            phone: '1234567890',
                            email: 'seller@test.com',
                            whatsapp: '1234567890'
                        }
                    }, userResult.token);

                    if (!sellerResult.success) {
                        throw new Error('Failed to create seller profile');
                    }

                    // Subscribe to Trot plan
                    await makeRequest('POST', '/sellers/subscribe', {
                        package: 'Trot',
                        duration: 30
                    }, userResult.token);

                    testData.sellerToken = userResult.token;
                    testData.sellerIds.push(sellerResult.seller._id);
                }
            },
            {
                name: 'Create Horse Listings',
                run: async () => {
                    debug('Creating test horse listings');
                    
                    // Create multiple horses
                    for (let i = 0; i < 10; i++) {
                        const result = await makeRequest('POST', '/horses', {
                            name: `Test Horse ${i}`,
                            breed: 'Thoroughbred',
                            age: { years: 5, months: 0 },
                            gender: 'Stallion',
                            color: 'Bay',
                            price: 100000 + (i * 10000),
                            description: `Test horse description ${i}`,
                            location: {
                                state: 'Test State',
                                city: 'Test City',
                                pincode: '123456'
                            },
                            images: [{
                                url: 'https://example.com/image.jpg',
                                public_id: `test_image_${i}`,
                                thumbnail_url: 'https://example.com/thumb.jpg',
                                width: 800,
                                height: 600,
                                format: 'jpg'
                            }],
                            specifications: {
                                training: 'Advanced',
                                discipline: ['Dressage'],
                                temperament: 'Calm',
                                healthStatus: 'Excellent',
                                vaccination: true,
                                papers: true
                            },
                            listingStatus: 'active'
                        }, testData.sellerToken);

                        if (!result.success) {
                            throw new Error(`Failed to create horse listing ${i}`);
                        }
                        testData.horseIds.push(result.horse._id);
                    }
                }
            }
        ]
    },
    {
        name: 'Home Page Tests',
        tests: [
            {
                name: 'Get Home Page Data',
                run: async () => {
                    debug('Fetching home page data');
                    const result = await makeRequest('GET', '/home');

                    if (!result.success) {
                        throw new Error('Failed to get home page data');
                    }

                    // Verify response structure
                    const { data } = result;
                    if (!data.featured || !data.recent || !data.categories || !data.stats) {
                        throw new Error('Invalid home page data structure');
                    }

                    // Verify featured horses
                    if (!Array.isArray(data.featured.horses) || data.featured.horses.length > 6) {
                        throw new Error('Invalid featured horses data');
                    }

                    // Verify recent horses
                    if (!Array.isArray(data.recent.horses) || data.recent.horses.length > 8) {
                        throw new Error('Invalid recent horses data');
                    }

                    // Verify featured sellers
                    if (!Array.isArray(data.featured.sellers) || data.featured.sellers.length > 4) {
                        throw new Error('Invalid featured sellers data');
                    }

                    // Verify breeds
                    if (!Array.isArray(data.categories.breeds)) {
                        throw new Error('Invalid breeds data');
                    }

                    // Verify statistics exist (but don't check specific values)
                    if (typeof data.stats.horses !== 'number' || 
                        typeof data.stats.sellers !== 'number' || 
                        typeof data.stats.breeds !== 'number') {
                        throw new Error('Invalid statistics data');
                    }
                }
            },
            {
                name: 'Verify Featured Horses Order',
                run: async () => {
                    const result = await makeRequest('GET', '/home');
                    
                    if (!result.success) {
                        throw new Error('Failed to get home page data');
                    }

                    const featuredHorses = result.data.featured.horses;
                    
                    // Check if horses are ordered by views
                    for (let i = 1; i < featuredHorses.length; i++) {
                        if (featuredHorses[i-1].statistics.views < featuredHorses[i].statistics.views) {
                            throw new Error('Featured horses are not properly sorted by views');
                        }
                    }
                }
            },
            {
                name: 'Verify Recent Horses Order',
                run: async () => {
                    const result = await makeRequest('GET', '/home');
                    
                    if (!result.success) {
                        throw new Error('Failed to get home page data');
                    }

                    const recentHorses = result.data.recent.horses;
                    
                    // Check if horses are ordered by creation date
                    for (let i = 1; i < recentHorses.length; i++) {
                        const prevDate = new Date(recentHorses[i-1].createdAt);
                        const currDate = new Date(recentHorses[i].createdAt);
                        if (prevDate < currDate) {
                            throw new Error('Recent horses are not properly sorted by creation date');
                        }
                    }
                }
            },
            {
                name: 'Verify Featured Sellers',
                run: async () => {
                    const result = await makeRequest('GET', '/home');
                    
                    if (!result.success) {
                        throw new Error('Failed to get home page data');
                    }

                    const featuredSellers = result.data.featured.sellers;
                    
                    // Verify all featured sellers have premium/professional subscriptions
                    for (const seller of featuredSellers) {
                        if (!seller.subscription || !['Trot', 'Gallop', 'Royal Stallion'].includes(seller.subscription.plan)) {
                            throw new Error('Featured sellers include non-premium sellers');
                        }
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