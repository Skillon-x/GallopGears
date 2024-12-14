const { log, makeRequest, runTests } = require('../scripts/test.utils');
const dotenv = require('dotenv');

dotenv.config();

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
    sellerToken: '',
    sellerId: '',
    horseIds: [],
    inquiryIds: [],
    conversationIds: [],
    spotlightIds: []
};

const testSuites = [
    {
        name: 'Seller Dashboard Tests',
        tests: [
            {
                name: 'Setup Test Seller',
                run: async () => {
                    debug('Registering new seller');
                    const registerResult = await makeRequest('POST', '/auth/register', {
                        name: 'Dashboard Test Seller',
                        email: 'dashboardtest@seller.com',
                        password: 'test123',
                        role: 'user'
                    });

                    debug('Registration response:', registerResult);
                    if (!registerResult.success) {
                        throw new Error('Failed to register seller');
                    }
                    testData.sellerToken = registerResult.token;

                    debug('Creating seller profile');
                    const profileResult = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Dashboard Test Stables',
                        description: 'Test stable for dashboard testing',
                        location: {
                            state: 'Maharashtra',
                            city: 'Mumbai',
                            pincode: '400001'
                        },
                        contactDetails: {
                            phone: '9876543210',
                            email: 'dashboardtest@stables.com',
                            whatsapp: '9876543210'
                        },
                        businessDocuments: {
                            gst: 'TESTGST123',
                            pan: 'TESTPAN123'
                        }
                    }, testData.sellerToken);

                    debug('Profile creation response:', profileResult);
                    if (!profileResult.success) {
                        throw new Error('Failed to create seller profile');
                    }

                    // Subscribe to Royal Stallion package
                    debug('Subscribing to Royal Stallion package');
                    const subscribeResult = await makeRequest('POST', '/sellers/subscribe', {
                        package: 'Royal Stallion',
                        duration: 30
                    }, testData.sellerToken);

                    debug('Subscription response:', subscribeResult);
                    if (!subscribeResult.success) {
                        throw new Error('Failed to subscribe seller');
                    }

                    // Get seller ID
                    const meResult = await makeRequest('GET', '/sellers/me', null, testData.sellerToken);
                    testData.sellerId = meResult.seller._id;
                }
            },
            {
                name: 'Create Test Data',
                run: async () => {
                    // Create multiple horse listings
                    for (let i = 0; i < 3; i++) {
                        const horseResult = await makeRequest('POST', '/horses', {
                            name: `Test Horse ${i + 1}`,
                            breed: 'Thoroughbred',
                            age: { years: 5, months: 0 },
                            gender: 'Stallion',
                            color: 'Bay',
                            price: 100000 + (i * 50000),
                            description: `Test horse ${i + 1} for dashboard testing`,
                            location: {
                                state: 'Maharashtra',
                                city: 'Mumbai',
                                pincode: '400001'
                            },
                            specifications: {
                                training: 'Basic',
                                discipline: ['Dressage'],
                                temperament: 'Calm',
                                healthStatus: 'Good',
                                vaccination: true,
                                papers: true
                            },
                            images: [{
                                url: `https://example.com/test${i}.jpg`,
                                public_id: `test_image_${i}`,
                                thumbnail_url: `https://example.com/thumb${i}.jpg`,
                                width: 800,
                                height: 600,
                                format: 'jpg'
                            }],
                            listingStatus: 'active'
                        }, testData.sellerToken);

                        if (!horseResult.success) {
                            throw new Error(`Failed to create horse listing ${i + 1}`);
                        }
                        testData.horseIds.push(horseResult.horse._id);
                    }

                    // Create test inquiries
                    const buyerResult = await makeRequest('POST', '/auth/register', {
                        name: 'Test Buyer',
                        email: 'testbuyer@example.com',
                        password: 'test123',
                        role: 'user'
                    });

                    for (const horseId of testData.horseIds) {
                        const inquiryResult = await makeRequest('POST', '/inquiries', {
                            horse: horseId,
                            message: 'Interested in this horse',
                            contactPreference: 'email'
                        }, buyerResult.token);

                        if (!inquiryResult.success) {
                            throw new Error('Failed to create inquiry');
                        }
                        testData.inquiryIds.push(inquiryResult.inquiry._id);
                    }

                    // Create test conversations
                    for (const horseId of testData.horseIds) {
                        const conversationResult = await makeRequest('POST', '/messaging/conversations', {
                            recipientId: testData.sellerId,
                            entityType: 'horse',
                            entityId: horseId
                        }, buyerResult.token);

                        if (!conversationResult.success) {
                            throw new Error('Failed to create conversation');
                        }
                        testData.conversationIds.push(conversationResult.conversation._id);
                    }

                    // Add spotlights
                    for (const horseId of testData.horseIds) {
                        const spotlightResult = await makeRequest('POST', `/visibility/spotlight/${horseId}`, null, testData.sellerToken);
                        if (!spotlightResult.success) {
                            throw new Error('Failed to create spotlight');
                        }
                        testData.spotlightIds.push(spotlightResult.spotlight._id);
                    }
                }
            },
            {
                name: 'Test Dashboard Stats',
                run: async () => {
                    const result = await makeRequest('GET', '/seller/dashboard/stats', null, testData.sellerToken);
                    debug('Dashboard stats response:', result);

                    if (!result.success) {
                        throw new Error('Failed to get dashboard stats');
                    }

                    const { dashboard } = result;
                    
                    // Verify subscription
                    if (!dashboard.subscription || dashboard.subscription.plan !== 'Royal Stallion') {
                        throw new Error('Invalid subscription data');
                    }

                    // Verify listings
                    if (dashboard.listings.total !== 3 || dashboard.listings.active !== 3) {
                        throw new Error('Invalid listing counts');
                    }

                    // Verify inquiries
                    if (dashboard.inquiries.total !== 3 || dashboard.inquiries.pending !== 3) {
                        throw new Error('Invalid inquiry counts');
                    }

                    // Verify recent activities
                    if (!Array.isArray(dashboard.listings.recent) || dashboard.listings.recent.length === 0) {
                        throw new Error('Missing recent listings');
                    }
                }
            },
            {
                name: 'Test Performance Metrics',
                run: async () => {
                    const result = await makeRequest('GET', '/seller/dashboard/performance', null, testData.sellerToken);
                    debug('Performance metrics response:', result);

                    if (!result.success) {
                        throw new Error('Failed to get performance metrics');
                    }

                    const { performance } = result;
                    
                    // Verify metrics structure
                    const required = ['totalViews', 'totalInquiries', 'responseRate', 'averageResponseTime', 'listingCount'];
                    const missing = required.filter(field => typeof performance.thirtyDayMetrics[field] === 'undefined');
                    
                    if (missing.length > 0) {
                        throw new Error(`Missing required metrics: ${missing.join(', ')}`);
                    }
                }
            },
            {
                name: 'Test Listing Analytics',
                run: async () => {
                    const result = await makeRequest('GET', '/seller/dashboard/analytics/listings', null, testData.sellerToken);
                    debug('Listing analytics response:', result);

                    if (!result.success) {
                        throw new Error('Failed to get listing analytics');
                    }

                    const { analytics } = result;
                    
                    // Verify analytics structure
                    if (!analytics.period || !analytics.dailyStats) {
                        throw new Error('Invalid analytics structure');
                    }

                    // Verify daily stats
                    const today = new Date().toISOString().split('T')[0];
                    if (!analytics.dailyStats[today]) {
                        throw new Error('Missing today\'s stats');
                    }
                }
            },
            {
                name: 'Test Inquiry Analytics',
                run: async () => {
                    const result = await makeRequest('GET', '/seller/dashboard/analytics/inquiries', null, testData.sellerToken);
                    debug('Inquiry analytics response:', result);

                    if (!result.success) {
                        throw new Error('Failed to get inquiry analytics');
                    }

                    const { analytics } = result;
                    
                    // Verify analytics structure
                    if (!analytics.period || !analytics.dailyStats || typeof analytics.totalInquiries !== 'number') {
                        throw new Error('Invalid inquiry analytics structure');
                    }

                    // Verify total inquiries
                    if (analytics.totalInquiries !== testData.inquiryIds.length) {
                        throw new Error('Incorrect total inquiries count');
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