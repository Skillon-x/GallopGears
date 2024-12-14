const dotenv = require('dotenv');
const { log, makeRequest, runTests } = require('./test.utils');

dotenv.config();

let testData = {
    adminToken: '',
    sellerToken: '',
    userToken: '',
    horseId: '',
    inquiryId: '',
    transactionId: ''
};

// Test configuration
const config = {
    admin: {
        email: 'admin@test.com',
        password: 'admin123',
        name: 'Test Admin',
        role: 'admin'
    },
    seller: {
        email: 'seller@test.com',
        password: 'seller123',
        name: 'Test Seller',
        role: 'user'
    },
    user: {
        email: 'user@test.com',
        password: 'user123',
        name: 'Test User',
        role: 'user'
    }
};

// Test suites
const testSuites = [
    {
        name: 'User Registration',
        tests: [
            {
                name: 'Register Admin',
                run: async () => {
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
                name: 'Register Seller',
                run: async () => {
                    // Register as user first
                    const userResult = await makeRequest('POST', '/auth/register', {
                        name: 'Test Seller',
                        email: 'seller@test.com',
                        password: 'seller123',
                        role: 'user'
                    });

                    // Create seller profile
                    const sellerResult = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Test Stables',
                        description: 'Test horse stables'
                    }, userResult.token);

                    // Get updated token with seller role
                    const meResult = await makeRequest('GET', '/auth/me', null, userResult.token);
                    testData.sellerToken = userResult.token;
                }
            },
            {
                name: 'Register User',
                run: async () => {
                    const result = await makeRequest('POST', '/auth/register', {
                        name: 'Test User',
                        email: 'user@test.com',
                        password: 'user123',
                        role: 'user'
                    });
                    testData.userToken = result.token;
                }
            }
        ]
    },
    {
        name: 'Authentication',
        tests: [
            {
                name: 'Login Admin',
                run: async () => {
                    const result = await makeRequest('POST', '/auth/login', {
                        email: 'admin@test.com',
                        password: 'admin123'
                    });
                    if (!result.success || !result.token) {
                        throw new Error('Admin login failed');
                    }
                }
            },
            {
                name: 'Login Seller',
                run: async () => {
                    const result = await makeRequest('POST', '/auth/login', {
                        email: 'seller@test.com',
                        password: 'seller123'
                    });
                    if (!result.success || !result.token) {
                        throw new Error('Seller login failed');
                    }
                }
            },
            {
                name: 'Login User',
                run: async () => {
                    const result = await makeRequest('POST', '/auth/login', {
                        email: 'user@test.com',
                        password: 'user123'
                    });
                    if (!result.success || !result.token) {
                        throw new Error('User login failed');
                    }
                }
            }
        ]
    },
    {
        name: 'Horse Management',
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
                        description: 'Test horse for sale',
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
                }
            },
            {
                name: 'Get Horse Details',
                run: async () => {
                    const result = await makeRequest('GET', `/horses/${testData.horseId}`);
                    if (!result.success || !result.horse) {
                        throw new Error('Failed to get horse details');
                    }
                }
            },
            {
                name: 'Update Horse Listing',
                run: async () => {
                    const result = await makeRequest('PUT', `/horses/${testData.horseId}`, {
                        price: 120000,
                        description: 'Updated test horse for sale'
                    }, testData.sellerToken);
                    if (!result.success || !result.horse) {
                        throw new Error('Failed to update horse listing');
                    }
                }
            }
        ]
    },
    {
        name: 'Inquiry Management',
        tests: [
            {
                name: 'Create Inquiry',
                run: async () => {
                    const result = await makeRequest('POST', '/inquiries', {
                        horse: testData.horseId,
                        message: 'Interested in this horse',
                        contactPreference: 'email'
                    }, testData.userToken);
                    if (!result.success || !result.inquiry) {
                        throw new Error('Failed to create inquiry');
                    }
                    testData.inquiryId = result.inquiry._id;
                }
            },
            {
                name: 'Get Seller Inquiries',
                run: async () => {
                    const result = await makeRequest('GET', '/inquiries/seller', null, testData.sellerToken);
                    if (!result.success || !Array.isArray(result.inquiries)) {
                        throw new Error('Failed to get seller inquiries');
                    }
                }
            },
            {
                name: 'Update Inquiry Status',
                run: async () => {
                    const result = await makeRequest('PUT', `/inquiries/${testData.inquiryId}/status`, {
                        status: 'responded'
                    }, testData.sellerToken);
                    if (!result.success || !result.inquiry) {
                        throw new Error('Failed to update inquiry');
                    }
                }
            }
        ]
    },
    {
        name: 'Transaction Management',
        tests: [
            {
                name: 'Create Transaction',
                run: async () => {
                    const result = await makeRequest('POST', '/transactions', {
                        horse: testData.horseId,
                        amount: 120000,
                        paymentMethod: 'platform'
                    }, testData.userToken);
                    if (!result.success || !result.transaction) {
                        throw new Error('Failed to create transaction');
                    }
                    testData.transactionId = result.transaction._id;
                }
            },
            {
                name: 'Get Transaction Details',
                run: async () => {
                    const result = await makeRequest('GET', `/transactions/${testData.transactionId}`, null, testData.sellerToken);
                    if (!result.success || !result.transaction) {
                        throw new Error('Failed to get transaction details');
                    }
                }
            },
            {
                name: 'Update Transaction Status',
                run: async () => {
                    const result = await makeRequest('PUT', `/transactions/${testData.transactionId}/status`, {
                        status: 'completed'
                    }, testData.adminToken);
                    if (!result.success || !result.transaction) {
                        throw new Error('Failed to update transaction');
                    }
                }
            }
        ]
    },
    {
        name: 'Admin Features',
        tests: [
            {
                name: 'Get All Users',
                run: async () => {
                    const result = await makeRequest('GET', '/admin/users', null, testData.adminToken);
                    if (!result.success || !Array.isArray(result.users)) {
                        throw new Error('Failed to get users');
                    }
                }
            },
            {
                name: 'Get All Transactions',
                run: async () => {
                    const result = await makeRequest('GET', '/admin/transactions', null, testData.adminToken);
                    if (!result.success || !Array.isArray(result.transactions)) {
                        throw new Error('Failed to get transactions');
                    }
                }
            },
            {
                name: 'Get Platform Stats',
                run: async () => {
                    const result = await makeRequest('GET', '/admin/stats', null, testData.adminToken);
                    if (!result.success || !result.stats) {
                        throw new Error('Failed to get platform stats');
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