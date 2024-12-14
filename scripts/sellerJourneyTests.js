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
    horseId: '',
    paymentId: '',
    subscriptionId: '',
    sellerId: ''
};

// Test suites
const testSuites = [
    {
        name: 'Seller Registration Journey',
        tests: [
            {
                name: 'Register as User',
                run: async () => {
                    debug('Registering new user');
                    const result = await makeRequest('POST', '/auth/register', {
                        name: 'Test Seller',
                        email: 'journey@seller.com',
                        password: 'seller123',
                        role: 'user'
                    });

                    debug('Registration response:', result);
                    if (!result.success || !result.token) {
                        throw new Error('Failed to register user');
                    }
                    testData.userToken = result.token;
                }
            },
            {
                name: 'Create Seller Profile',
                run: async () => {
                    debug('Creating seller profile');
                    const result = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Journey Test Stables',
                        description: 'Premium horse stables for testing',
                        location: {
                            state: 'Maharashtra',
                            city: 'Mumbai',
                            pincode: '400001'
                        },
                        contactDetails: {
                            phone: '9876543210',
                            email: 'journey@seller.com',
                            whatsapp: '9876543210'
                        },
                        businessDocuments: {
                            gst: 'TESTGST123',
                            pan: 'TESTPAN123'
                        }
                    }, testData.userToken);

                    debug('Seller profile creation response:', result);
                    if (!result.success) {
                        throw new Error('Failed to create seller profile');
                    }

                    // Get updated token with seller role
                    debug('Getting updated user info');
                    const meResult = await makeRequest('GET', '/auth/me', null, testData.userToken);
                    debug('User info response:', meResult);
                    
                    if (!meResult.success || meResult.user.role !== 'seller') {
                        throw new Error('Failed to assign seller role');
                    }
                    testData.sellerToken = testData.userToken;
                }
            },
            {
                name: 'Get Subscription Plans',
                run: async () => {
                    const result = await makeRequest('GET', '/sellers/plans');
                    if (!result.success || !result.plans) {
                        throw new Error('Failed to get subscription plans');
                    }
                }
            },
            {
                name: 'Create Payment for Premium Plan',
                run: async () => {
                    const result = await makeRequest('POST', '/sellers/subscribe', {
                        package: 'Trot',
                        duration: 30
                    }, testData.sellerToken);

                    if (!result.success || !result.transaction) {
                        throw new Error('Failed to create subscription');
                    }
                    testData.subscriptionId = result.transaction._id;
                }
            },
            {
                name: 'Verify Payment',
                run: async () => {
                    const result = await makeRequest('GET', `/sellers/subscription`, null, testData.sellerToken);
                    
                    if (!result.success || !result.subscription) {
                        throw new Error('Failed to verify subscription');
                    }
                }
            }
        ]
    },
    {
        name: 'Seller Dashboard Journey',
        tests: [
            {
                name: 'Get Dashboard Stats',
                run: async () => {
                    const result = await makeRequest('GET', '/seller/dashboard/stats', null, testData.sellerToken);
                    if (!result.success || !result.dashboard) {
                        throw new Error('Failed to get dashboard stats');
                    }

                    // Verify dashboard structure
                    const { dashboard } = result;
                    if (!dashboard.subscription || !dashboard.listings || !dashboard.inquiries || !dashboard.transactions) {
                        throw new Error('Invalid dashboard structure');
                    }
                }
            },
            {
                name: 'Create Draft Horse Listing',
                run: async () => {
                    debug('Getting seller profile');
                    const meResult = await makeRequest('GET', '/sellers/me', null, testData.sellerToken);
                    debug('Seller profile response:', meResult);
                    
                    if (!meResult.success || !meResult.seller) {
                        throw new Error('Failed to get seller profile');
                    }
                    testData.sellerId = meResult.seller._id;
                    debug('Stored seller ID:', { sellerId: testData.sellerId });

                    debug('Creating horse listing');
                    const result = await makeRequest('POST', '/horses', {
                        name: 'Journey Test Horse',
                        breed: 'Thoroughbred',
                        age: { years: 5, months: 0 },
                        gender: 'Stallion',
                        color: 'Bay',
                        price: 100000,
                        description: 'Test horse for journey',
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
                        listingStatus: 'draft',
                        seller: testData.sellerId
                    }, testData.sellerToken);

                    debug('Horse listing creation response:', result);
                    if (!result.success || !result.horse) {
                        throw new Error('Failed to create horse listing');
                    }
                    testData.horseId = result.horse._id;
                    debug('Stored horse ID:', { horseId: testData.horseId });
                }
            },
            {
                name: 'Update Horse Details',
                run: async () => {
                    debug('Getting horse listing');
                    const listingResult = await makeRequest('GET', `/horses/${testData.horseId}`, null, testData.sellerToken);
                    debug('Horse listing response:', listingResult);
                    debug('Authorization check:', {
                        horseSellerId: listingResult.horse?.seller?._id,
                        testDataSellerId: testData.sellerId,
                        match: listingResult.horse?.seller?._id?.toString() === testData.sellerId?.toString()
                    });
                    
                    if (!listingResult.success || !listingResult.horse.seller || listingResult.horse.seller._id.toString() !== testData.sellerId.toString()) {
                        throw new Error('Not authorized to update this listing');
                    }

                    debug('Updating horse details');
                    const result = await makeRequest('PUT', `/horses/${testData.horseId}`, {
                        price: 120000,
                        description: 'Updated test horse description',
                        specifications: {
                            training: 'Advanced',
                            discipline: ['Dressage', 'Show Jumping', 'Cross Country'],
                            temperament: 'Very Calm',
                            healthStatus: 'Excellent',
                            vaccination: true,
                            papers: true
                        },
                        seller: testData.sellerId
                    }, testData.sellerToken);

                    debug('Update response:', result);
                    if (!result.success || !result.horse) {
                        throw new Error('Failed to update horse listing');
                    }
                }
            },
            {
                name: 'Publish Horse Listing',
                run: async () => {
                    debug('Getting subscription status');
                    const subResult = await makeRequest('GET', '/sellers/subscription', null, testData.sellerToken);
                    debug('Subscription response:', subResult);
                    
                    if (!subResult.success || !subResult.subscription || subResult.subscription.status !== 'active') {
                        throw new Error('Active subscription required to publish listing');
                    }

                    debug('Getting horse listing');
                    const listingResult = await makeRequest('GET', `/horses/${testData.horseId}`, null, testData.sellerToken);
                    debug('Horse listing response:', listingResult);
                    debug('Authorization check:', {
                        horseSellerId: listingResult.horse?.seller?._id,
                        testDataSellerId: testData.sellerId,
                        match: listingResult.horse?.seller?._id?.toString() === testData.sellerId?.toString()
                    });
                    
                    if (!listingResult.success || !listingResult.horse.seller || listingResult.horse.seller._id.toString() !== testData.sellerId.toString()) {
                        throw new Error('Not authorized to update this listing');
                    }

                    debug('Publishing horse listing');
                    const result = await makeRequest('PUT', `/horses/${testData.horseId}`, {
                        listingStatus: 'active',
                        seller: testData.sellerId
                    }, testData.sellerToken);

                    debug('Publish response:', result);
                    if (!result.success || !result.horse || result.horse.listingStatus !== 'active') {
                        throw new Error('Failed to publish horse listing');
                    }
                }
            },
            {
                name: 'Get Performance Metrics',
                run: async () => {
                    const result = await makeRequest('GET', '/seller/dashboard/performance', null, testData.sellerToken);
                    if (!result.success || !result.performance) {
                        throw new Error('Failed to get performance metrics');
                    }
                }
            },
            {
                name: 'Get Listing Analytics',
                run: async () => {
                    const result = await makeRequest('GET', '/seller/dashboard/analytics/listings', null, testData.sellerToken);
                    if (!result.success || !result.analytics) {
                        throw new Error('Failed to get listing analytics');
                    }
                }
            }
        ]
    },
    {
        name: 'Seller Interaction Journey',
        tests: [
            {
                name: 'Receive Inquiry',
                run: async () => {
                    // Register a test buyer
                    const buyerResult = await makeRequest('POST', '/auth/register', {
                        name: 'Test Buyer',
                        email: 'buyer@test.com',
                        password: 'buyer123',
                        role: 'user'
                    });

                    // Create inquiry
                    const result = await makeRequest('POST', '/inquiries', {
                        horse: testData.horseId,
                        message: 'Interested in this horse',
                        contactPreference: 'email'
                    }, buyerResult.token);

                    if (!result.success || !result.inquiry) {
                        throw new Error('Failed to create inquiry');
                    }
                }
            },
            {
                name: 'Check Inquiries',
                run: async () => {
                    const result = await makeRequest('GET', '/inquiries/seller', null, testData.sellerToken);
                    if (!result.success || !Array.isArray(result.inquiries)) {
                        throw new Error('Failed to get seller inquiries');
                    }

                    if (result.inquiries.length === 0) {
                        throw new Error('No inquiries found');
                    }
                }
            },
            {
                name: 'Get Inquiry Analytics',
                run: async () => {
                    const result = await makeRequest('GET', '/seller/dashboard/analytics/inquiries', null, testData.sellerToken);
                    if (!result.success || !result.analytics) {
                        throw new Error('Failed to get inquiry analytics');
                    }

                    if (result.analytics.totalInquiries === 0) {
                        throw new Error('No inquiries in analytics');
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