const { log, makeRequest, runTests } = require('./test.utils');

console.log('Starting seller dashboard tests...');

// Test data storage
let testData = {
    sellerToken: '',
    horseId: ''
};

// Test suites
const testSuites = [
    {
        name: 'Seller Dashboard Setup',
        tests: [
            {
                name: 'Register Seller',
                run: async () => {
                    try {
                        // Register as user first
                        const userResult = await makeRequest('POST', '/auth/register', {
                            name: 'Test Seller',
                            email: 'dashboardseller@test.com',
                            password: 'seller123',
                            role: 'user'
                        });

                        if (!userResult.success || !userResult.token) {
                            throw new Error('Failed to register seller');
                        }

                        // Create seller profile
                        const sellerResult = await makeRequest('POST', '/sellers/profile', {
                            businessName: 'Dashboard Test Stables',
                            description: 'Test horse stables for dashboard'
                        }, userResult.token);

                        if (!sellerResult.success) {
                            throw new Error('Failed to create seller profile');
                        }

                        testData.sellerToken = userResult.token;

                        // Get updated token with seller role
                        const meResult = await makeRequest('GET', '/auth/me', null, userResult.token);
                        if (!meResult.success) {
                            throw new Error('Failed to get updated user info');
                        }
                    } catch (error) {
                        throw new Error(`Register Seller failed: ${error.message}`);
                    }
                }
            },
            {
                name: 'Create Test Horse Listing',
                run: async () => {
                    try {
                        const result = await makeRequest('POST', '/horses', {
                            name: 'Dashboard Test Horse',
                            breed: 'Thoroughbred',
                            age: { years: 5, months: 0 },
                            gender: 'Stallion',
                            color: 'Bay',
                            price: 100000,
                            description: 'Test horse for dashboard',
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
                            },
                            listingStatus: 'active'
                        }, testData.sellerToken);

                        if (!result.success || !result.horse) {
                            throw new Error('Failed to create horse listing');
                        }
                        testData.horseId = result.horse._id;

                        // View the horse to generate view statistics
                        const viewResult = await makeRequest('GET', `/horses/${testData.horseId}`);
                        if (!viewResult.success) {
                            throw new Error('Failed to view horse');
                        }
                    } catch (error) {
                        throw new Error(`Create Horse Listing failed: ${error.message}`);
                    }
                }
            },
            {
                name: 'Create Test Inquiry',
                run: async () => {
                    try {
                        // Register a test user first
                        const userResult = await makeRequest('POST', '/auth/register', {
                            name: 'Test User',
                            email: 'dashboarduser@test.com',
                            password: 'user123',
                            role: 'user'
                        });

                        if (!userResult.success || !userResult.token) {
                            throw new Error('Failed to register user');
                        }

                        // Create inquiry
                        const result = await makeRequest('POST', '/inquiries', {
                            horse: testData.horseId,
                            message: 'Interested in this horse for dashboard test',
                            contactPreference: 'email'
                        }, userResult.token);

                        if (!result.success || !result.inquiry) {
                            throw new Error('Failed to create inquiry');
                        }
                    } catch (error) {
                        throw new Error(`Create Inquiry failed: ${error.message}`);
                    }
                }
            }
        ]
    },
    {
        name: 'Seller Dashboard Features',
        tests: [
            {
                name: 'Get Dashboard Stats',
                run: async () => {
                    try {
                        const result = await makeRequest('GET', '/seller/dashboard/stats', null, testData.sellerToken);
                        if (!result.success || !result.dashboard) {
                            throw new Error('Failed to get dashboard stats');
                        }

                        // Verify dashboard structure
                        const { dashboard } = result;
                        if (!dashboard.subscription || !dashboard.listings || !dashboard.inquiries || !dashboard.transactions) {
                            throw new Error('Invalid dashboard structure');
                        }
                    } catch (error) {
                        throw new Error(`Get Dashboard Stats failed: ${error.message}`);
                    }
                }
            },
            {
                name: 'Get Performance Metrics',
                run: async () => {
                    try {
                        const result = await makeRequest('GET', '/seller/dashboard/performance', null, testData.sellerToken);
                        if (!result.success || !result.performance) {
                            throw new Error('Failed to get performance metrics');
                        }

                        // Verify metrics structure
                        const { performance } = result;
                        if (!performance.thirtyDayMetrics) {
                            throw new Error('Invalid performance metrics structure');
                        }
                    } catch (error) {
                        throw new Error(`Get Performance Metrics failed: ${error.message}`);
                    }
                }
            },
            {
                name: 'Get Listing Analytics',
                run: async () => {
                    try {
                        const result = await makeRequest('GET', '/seller/dashboard/analytics/listings', null, testData.sellerToken);
                        if (!result.success || !result.analytics) {
                            throw new Error('Failed to get listing analytics');
                        }

                        // Verify analytics structure
                        const { analytics } = result;
                        if (!analytics.period || !analytics.dailyStats) {
                            throw new Error('Invalid listing analytics structure');
                        }
                    } catch (error) {
                        throw new Error(`Get Listing Analytics failed: ${error.message}`);
                    }
                }
            },
            {
                name: 'Get Inquiry Analytics',
                run: async () => {
                    try {
                        const result = await makeRequest('GET', '/seller/dashboard/analytics/inquiries', null, testData.sellerToken);
                        if (!result.success || !result.analytics) {
                            throw new Error('Failed to get inquiry analytics');
                        }

                        // Verify analytics structure
                        const { analytics } = result;
                        if (!analytics.period || !analytics.dailyStats || !analytics.totalInquiries) {
                            throw new Error('Invalid inquiry analytics structure');
                        }
                    } catch (error) {
                        throw new Error(`Get Inquiry Analytics failed: ${error.message}`);
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

console.log('Running tests...');

// Run tests
runTests(testSuites); 