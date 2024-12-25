const { log, makeRequest, runTests } = require('./test.utils');

// Test data storage
let testData = {
    sellerToken: '',
    horseId: '',
    inquiryIds: []
};

const testSuites = [
    {
        name: 'Analytics Tests',
        tests: [
            {
                name: 'Setup Test Data',
                run: async () => {
                    // Register seller
                    const registerResult = await makeRequest('POST', '/auth/register', {
                        name: 'Analytics Test Seller',
                        email: 'analyticstest@seller.com',
                        password: 'test123',
                        role: 'seller'
                    });
                    if (!registerResult.success) {
                        throw new Error('Failed to register seller');
                    }
                    testData.sellerToken = registerResult.token;

                    // Create seller profile
                    const profileResult = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Analytics Test Stables',
                        description: 'Test stable for analytics',
                        location: {
                            state: 'Maharashtra',
                            city: 'Mumbai',
                            pincode: '400001'
                        },
                        contactDetails: {
                            phone: '9876543210',
                            email: 'analyticstest@stables.com',
                            whatsapp: '9876543210'
                        },
                        businessDocuments: {
                            gst: 'TESTGST123',
                            pan: 'TESTPAN123'
                        }
                    }, testData.sellerToken);
                    if (!profileResult.success) {
                        throw new Error('Failed to create seller profile');
                    }

                    // Subscribe to Royal Stallion package
                    const subscribeResult = await makeRequest('POST', '/sellers/subscribe', {
                        package: 'Royal Stallion',
                        duration: 12
                    }, testData.sellerToken);
                    if (!subscribeResult.success) {
                        throw new Error('Failed to subscribe seller');
                    }

                    // Create test listing
                    const listingResult = await makeRequest('POST', '/horses', {
                        name: 'Analytics Test Horse',
                        breed: 'Thoroughbred',
                        age: { years: 5, months: 0 },
                        gender: 'Stallion',
                        color: 'Bay',
                        price: 100000,
                        description: 'Test horse for analytics',
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
                        }
                    }, testData.sellerToken);
                    if (!listingResult.success) {
                        throw new Error('Failed to create horse listing');
                    }
                    testData.horseId = listingResult.horse._id;

                    // Create test inquiries
                    for (let i = 0; i < 3; i++) {
                        const inquiryResult = await makeRequest('POST', '/inquiries', {
                            horse: testData.horseId,
                            message: `Test inquiry ${i + 1}`,
                            contactPreference: 'email'
                        }, testData.sellerToken);
                        if (!inquiryResult.success) {
                            throw new Error('Failed to create inquiry');
                        }
                        testData.inquiryIds.push(inquiryResult.inquiry._id);
                    }

                    // Respond to some inquiries
                    for (let i = 0; i < 2; i++) {
                        await makeRequest('POST', `/inquiries/${testData.inquiryIds[i]}/respond`, {
                            message: `Test response ${i + 1}`
                        }, testData.sellerToken);
                    }
                }
            },
            {
                name: 'Test Monthly Performance Analytics',
                run: async () => {
                    const result = await makeRequest('GET', '/analytics/performance/monthly', null, testData.sellerToken);
                    if (!result.success) {
                        throw new Error('Failed to get monthly performance');
                    }

                    // Verify response structure
                    const required = ['listings', 'inquiries', 'sales', 'conversionRates'];
                    const missing = required.filter(field => !result.data[field]);
                    if (missing.length > 0) {
                        throw new Error(`Missing required fields: ${missing.join(', ')}`);
                    }
                }
            },
            {
                name: 'Test Listing Performance Analytics',
                run: async () => {
                    const result = await makeRequest('GET', `/analytics/listings/${testData.horseId}`, null, testData.sellerToken);
                    if (!result.success) {
                        throw new Error('Failed to get listing performance');
                    }

                    // Verify metrics
                    const metrics = result.data.metrics;
                    if (!metrics.views && !metrics.inquiries && !metrics.responseRate) {
                        throw new Error('Missing required metrics');
                    }

                    // Verify response rate calculation
                    const expectedResponseRate = (2 / 3 * 100).toFixed(2); // 2 responses out of 3 inquiries
                    if (metrics.responseRate !== expectedResponseRate) {
                        throw new Error('Incorrect response rate calculation');
                    }
                }
            },
            {
                name: 'Test Buyer Engagement Analytics',
                run: async () => {
                    const result = await makeRequest('GET', '/analytics/engagement', null, testData.sellerToken);
                    if (!result.success) {
                        throw new Error('Failed to get buyer engagement analytics');
                    }

                    // Verify buyer analytics
                    if (!Array.isArray(result.data.buyerAnalytics)) {
                        throw new Error('Buyer analytics should be an array');
                    }

                    // Verify engagement trends
                    if (!Array.isArray(result.data.engagementTrends)) {
                        throw new Error('Engagement trends should be an array');
                    }
                }
            },
            {
                name: 'Test ROI Analytics',
                run: async () => {
                    const result = await makeRequest('GET', '/analytics/roi', null, testData.sellerToken);
                    if (!result.success) {
                        throw new Error('Failed to get ROI analytics');
                    }

                    // Verify ROI data structure
                    const summary = result.data.summary;
                    if (typeof summary.totalCost !== 'number' || 
                        typeof summary.totalRevenue !== 'number' || 
                        typeof summary.averageMonthlyROI !== 'number') {
                        throw new Error('Invalid ROI summary structure');
                    }

                    // Verify monthly ROI data
                    if (typeof result.data.monthlyROI !== 'object') {
                        throw new Error('Monthly ROI data should be an object');
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