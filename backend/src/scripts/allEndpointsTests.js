const dotenv = require('dotenv');
const crypto = require('crypto');
const { log, makeRequest, runTests } = require('./test.utils');

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
    // User tokens
    adminToken: '',
    userToken: '',
    royalSellerToken: '',
    gallopSellerToken: '',
    trotSellerToken: '',
    starterSellerToken: '',
    
    // IDs and references
    horseIds: [],
    sellerId: '',
    spotlightId: '',
    uploadedPhotos: [],
    inquiryIds: [],
    
    // Payment related
    orderId: '',
    transactionId: '',
    paymentId: '',
    
    // Search and filters
    searchResults: [],
    filters: {
        breed: 'Thoroughbred',
        minPrice: 100000,
        maxPrice: 1000000,
        location: 'Maharashtra'
    }
};

const testSuites = [
    {
        name: 'User Registration and Setup',
        tests: [
            {
                name: 'Register Admin',
                run: async () => {
                    debug('Registering admin user');
                    const result = await makeRequest('POST', '/auth/register', {
                        name: 'Test Admin',
                        email: 'admin@test.com',
                        password: 'admin123',
                        role: 'admin'
                    });
                    testData.adminToken = result.token;
                }
            },
            {
                name: 'Register Buyer',
                run: async () => {
                    const result = await makeRequest('POST', '/auth/register', {
                        name: 'Test Buyer',
                        email: 'buyer@test.com',
                        password: 'buyer123',
                        role: 'user'
                    });
                    testData.userToken = result.token;
                }
            },
            {
                name: 'Register Royal Stallion Seller',
                run: async () => {
                    const userResult = await makeRequest('POST', '/auth/register', {
                        name: 'Royal Stables',
                        email: 'royal@test.com',
                        password: 'seller123',
                        role: 'user'
                    });
                    testData.royalSellerToken = userResult.token;

                    await makeRequest('POST', '/sellers/profile', {
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
                    }, testData.royalSellerToken);

                    // Get seller ID
                    const meResult = await makeRequest('GET', '/sellers/me', null, testData.royalSellerToken);
                    testData.sellerId = meResult.seller._id;
                }
            },
            // Similar registration blocks for Gallop, Trot, and Starter sellers
            // (Omitted for brevity but would follow same pattern)
        ]
    },
    {
        name: 'Subscription and Verification',
        tests: [
            {
                name: 'Submit Verification Documents',
                run: async () => {
                    const verifyResult = await makeRequest('POST', '/verification/submit', {
                        level: 'professional',
                        documents: [
                            {
                                type: 'identity',
                                url: 'https://example.com/id.pdf',
                                public_id: 'test_id_1'
                            },
                            {
                                type: 'business_license',
                                url: 'https://example.com/license.pdf',
                                public_id: 'test_license_1'
                            }
                        ],
                        notes: 'Test verification documents'
                    }, testData.royalSellerToken);

                    // Admin approves verification
                    await makeRequest('PUT', `/verification/sellers/${testData.sellerId}/verification`, {
                        verification: {
                            status: 'verified',
                            level: 'professional',
                            documents: [
                                {
                                    type: 'identity',
                                    verified: true,
                                    verifiedAt: new Date()
                                },
                                {
                                    type: 'business_license',
                                    verified: true,
                                    verifiedAt: new Date()
                                }
                            ]
                        },
                        remarks: 'All documents verified'
                    }, testData.adminToken);
                }
            },
            {
                name: 'Subscribe to Royal Stallion Package',
                run: async () => {
                    // Create payment order
                    const orderResult = await makeRequest('POST', '/payments/create', {
                        amount: 9999,
                        currency: 'INR',
                        notes: {
                            type: 'subscription',
                            package: 'Royal Stallion'
                        }
                    }, testData.royalSellerToken);

                    testData.orderId = orderResult.order.id;
                    testData.transactionId = orderResult.transaction;

                    // Simulate payment verification
                    const paymentId = 'pay_' + Date.now();
                    const signature = crypto
                        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                        .update(orderResult.order.id + '|' + paymentId)
                        .digest('hex');

                    await makeRequest('POST', '/payments/verify', {
                        razorpay_payment_id: paymentId,
                        razorpay_order_id: orderResult.order.id,
                        razorpay_signature: signature
                    }, testData.royalSellerToken);

                    // Subscribe to package
                    await makeRequest('POST', '/sellers/subscribe', {
                        package: 'Royal Stallion',
                        duration: 30
                    }, testData.royalSellerToken);
                }
            }
        ]
    },
    {
        name: 'Listing Management',
        tests: [
            {
                name: 'Create Horse Listing',
                run: async () => {
                    const result = await makeRequest('POST', '/horses', {
                        name: 'Test Horse',
                        breed: 'Thoroughbred',
                        age: { years: 5, months: 0 },
                        gender: 'Stallion',
                        color: 'Bay',
                        price: 100000,
                        description: 'Test horse for listing management',
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
                            url: 'https://example.com/test.jpg',
                            public_id: 'test_image_1',
                            thumbnail_url: 'https://example.com/thumb.jpg',
                            width: 800,
                            height: 600,
                            format: 'jpg'
                        }],
                        listingStatus: 'active',
                        seller: testData.sellerId
                    }, testData.royalSellerToken);

                    testData.horseIds.push(result.horse._id);
                }
            },
            {
                name: 'Upload Photos',
                run: async () => {
                    const testPhotos = [
                        {
                            name: 'test1.jpg',
                            content: 'data:image/jpeg;base64,...', // Base64 content here
                            size: 1024 * 1024
                        },
                        {
                            name: 'test2.jpg',
                            content: 'data:image/jpeg;base64,...', // Base64 content here
                            size: 1024 * 1024
                        }
                    ];

                    const result = await makeRequest('POST', `/photos/upload/${testData.horseIds[0]}`, {
                        photos: testPhotos
                    }, testData.royalSellerToken);

                    testData.uploadedPhotos = result.images;
                }
            },
            {
                name: 'Add to Spotlight',
                run: async () => {
                    const result = await makeRequest('POST', `/visibility/spotlight/${testData.horseIds[0]}`, null, testData.royalSellerToken);
                    testData.spotlightId = result.spotlight._id;
                }
            }
        ]
    },
    {
        name: 'Search and Browse',
        tests: [
            {
                name: 'Search Horses',
                run: async () => {
                    const result = await makeRequest('GET', '/horses/search', {
                        params: testData.filters
                    });
                    testData.searchResults = result.horses;
                }
            },
            {
                name: 'Create Inquiry',
                run: async () => {
                    if (testData.searchResults.length > 0) {
                        const result = await makeRequest('POST', '/inquiries', {
                            horse: testData.searchResults[0]._id,
                            message: 'I am interested in this horse.',
                            contactPreference: 'email'
                        }, testData.userToken);

                        testData.inquiryIds.push(result.inquiry._id);
                    }
                }
            }
        ]
    },
    {
        name: 'Support and Notifications',
        tests: [
            {
                name: 'Create Support Ticket',
                run: async () => {
                    await makeRequest('POST', '/support/tickets', {
                        subject: 'Need help with listing',
                        category: 'technical',
                        priority: 'medium',
                        description: 'Having issues with photo upload'
                    }, testData.royalSellerToken);
                }
            },
            {
                name: 'Set Alert Preferences',
                run: async () => {
                    await makeRequest('PUT', '/users/alerts', {
                        priceDrops: true,
                        newListings: true,
                        inquiryResponses: true,
                        marketUpdates: false
                    }, testData.userToken);
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