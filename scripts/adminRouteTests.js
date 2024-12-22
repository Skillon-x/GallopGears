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
    adminToken: '',
    userId: '',
    sellerId: '',
    listingId: '',
    userToken: '',
    sellerToken: '',
    testUser: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'Password123',
        role: 'user'
    },
    testSeller: {
        name: 'Test Seller',
        email: 'testseller@example.com',
        password: 'Password123',
        role: 'user'
    },
    testAdmin: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'AdminPass123',
        role: 'admin'
    },
    testHorse: {
        name: 'Test Horse',
        breed: 'Thoroughbred',
        age: { years: 5, months: 0 },
        gender: 'Stallion',
        color: 'Bay',
        price: 100000,
        description: 'Test horse for admin testing',
        location: {
            state: 'Test State',
            city: 'Test City',
            pincode: '123456'
        },
        specifications: {
            training: 'Advanced',
            discipline: ['Dressage'],
            temperament: 'Calm',
            healthStatus: 'Excellent',
            vaccination: true,
            papers: true
        }
    }
};

// Test suites
const testSuites = [
    {
        name: 'Admin Authentication',
        tests: [
            {
                name: 'Register Admin User',
                run: async () => {
                    debug('Registering admin user');
                    const result = await makeRequest('POST', '/auth/register', testData.testAdmin);
                    
                    if (!result.success || !result.token) {
                        throw new Error('Failed to register admin user');
                    }
                    testData.adminToken = result.token;
                }
            }
        ]
    },
    {
        name: 'User Management',
        tests: [
            {
                name: 'Create Test User',
                run: async () => {
                    debug('Creating test user');
                    const result = await makeRequest('POST', '/auth/register', testData.testUser);
                    
                    if (!result.success || !result.token) {
                        throw new Error('Failed to create test user');
                    }
                    testData.userToken = result.token;
                    testData.userId = result.user._id;
                }
            },
            {
                name: 'Create Test Seller',
                run: async () => {
                    debug('Creating test seller');
                    const result = await makeRequest('POST', '/auth/register', testData.testSeller);
                    
                    if (!result.success || !result.token) {
                        throw new Error('Failed to create test seller');
                    }
                    testData.sellerToken = result.token;

                    // Create seller profile
                    const profileResult = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Test Stables',
                        description: 'Test stable for admin routes testing',
                        location: {
                            state: 'Test State',
                            city: 'Test City',
                            pincode: '123456'
                        },
                        contactDetails: {
                            phone: '1234567890',
                            email: testData.testSeller.email,
                            whatsapp: '1234567890'
                        }
                    }, result.token);

                    if (!profileResult.success) {
                        throw new Error('Failed to create seller profile');
                    }

                    // Store both the seller ID and the user ID
                    testData.sellerId = profileResult.seller._id;
                    testData.sellerUserId = result.user._id;

                    // Create a test horse listing
                    const horseResult = await makeRequest('POST', '/horses', {
                        ...testData.testHorse,
                        seller: testData.sellerId
                    }, testData.sellerToken);

                    if (!horseResult.success) {
                        throw new Error('Failed to create test horse listing');
                    }
                    testData.listingId = horseResult.horse._id;
                }
            },
            {
                name: 'Get All Users',
                run: async () => {
                    debug('Getting all users');
                    try {
                        const result = await makeRequest('GET', '/admin/users', null, testData.adminToken);
                        
                        if (!result.success || !result.data || !Array.isArray(result.data.users)) {
                            debug('Failed response:', result);
                            throw new Error('Failed to get users list');
                        }
                    } catch (error) {
                        debug('Error getting users:', error);
                        throw error;
                    }
                }
            },
            {
                name: 'Get User By ID',
                run: async () => {
                    debug('Getting user by ID');
                    const result = await makeRequest('GET', `/admin/users/${testData.userId}`, null, testData.adminToken);
                    
                    if (!result.success || !result.user) {
                        throw new Error('Failed to get user by ID');
                    }

                    if (result.user.email !== testData.testUser.email) {
                        throw new Error('Invalid user data returned');
                    }
                }
            },
            {
                name: 'Block User',
                run: async () => {
                    debug('Blocking user');
                    const result = await makeRequest('POST', `/admin/users/${testData.userId}/block`, null, testData.adminToken);
                    
                    if (!result.success) {
                        throw new Error('Failed to block user');
                    }
                }
            }
        ]
    },
    {
        name: 'Seller Management',
        tests: [
            {
                name: 'Get Seller Details',
                run: async () => {
                    debug('Getting seller details');
                    const result = await makeRequest('GET', `/admin/sellers/${testData.sellerId}`, null, testData.adminToken);
                    
                    if (!result.success || !result.seller) {
                        throw new Error('Failed to get seller details');
                    }

                    if (!result.seller.user || result.seller.user.email !== testData.testSeller.email) {
                        throw new Error('Invalid seller data returned');
                    }
                }
            },
            {
                name: 'Get Seller Listings',
                run: async () => {
                    debug('Getting seller listings');
                    const result = await makeRequest('GET', `/admin/sellers/${testData.sellerId}/listings`, null, testData.adminToken);
                    
                    if (!result.success || !Array.isArray(result.listings)) {
                        throw new Error('Failed to get seller listings');
                    }
                }
            },
            {
                name: 'Get Seller Transactions',
                run: async () => {
                    debug('Getting seller transactions');
                    const result = await makeRequest('GET', `/admin/sellers/${testData.sellerId}/transactions`, null, testData.adminToken);
                    
                    if (!result.success || !Array.isArray(result.transactions)) {
                        throw new Error('Failed to get seller transactions');
                    }
                }
            },
            {
                name: 'Get Seller Activity',
                run: async () => {
                    debug('Getting seller activity');
                    const result = await makeRequest('GET', `/admin/sellers/${testData.sellerId}/activity`, null, testData.adminToken);
                    
                    if (!result.success || !Array.isArray(result.logs)) {
                        throw new Error('Failed to get seller activity');
                    }
                }
            },
            {
                name: 'Get Seller Communication History',
                run: async () => {
                    debug('Getting seller communication history');
                    const result = await makeRequest('GET', `/admin/sellers/${testData.sellerId}/communications`, null, testData.adminToken);
                    
                    if (!result.success || !Array.isArray(result.communications)) {
                        throw new Error('Failed to get seller communications');
                    }
                }
            }
        ]
    },
    {
        name: 'Listing Management',
        tests: [
            {
                name: 'Get Pending Listings',
                run: async () => {
                    debug('Getting pending listings');
                    const result = await makeRequest('GET', '/admin/listings/pending', null, testData.adminToken);
                    
                    if (!result.success || !Array.isArray(result.listings)) {
                        throw new Error('Failed to get pending listings');
                    }
                }
            },
            {
                name: 'Get Reported Listings',
                run: async () => {
                    debug('Getting reported listings');
                    const result = await makeRequest('GET', '/admin/listings/reported', null, testData.adminToken);
                    
                    if (!result.success || !Array.isArray(result.listings)) {
                        throw new Error('Failed to get reported listings');
                    }
                }
            },
            {
                name: 'Get Featured Listings',
                run: async () => {
                    debug('Getting featured listings');
                    const result = await makeRequest('GET', '/admin/listings/featured', null, testData.adminToken);
                    
                    if (!result.success || !Array.isArray(result.listings)) {
                        throw new Error('Failed to get featured listings');
                    }
                }
            },
            {
                name: 'Get Expired Listings',
                run: async () => {
                    debug('Getting expired listings');
                    const result = await makeRequest('GET', '/admin/listings/expired', null, testData.adminToken);
                    
                    if (!result.success || !Array.isArray(result.listings)) {
                        throw new Error('Failed to get expired listings');
                    }
                }
            },
            {
                name: 'Get Draft Listings',
                run: async () => {
                    debug('Getting draft listings');
                    const result = await makeRequest('GET', '/admin/listings/draft', null, testData.adminToken);
                    
                    if (!result.success || !Array.isArray(result.listings)) {
                        throw new Error('Failed to get draft listings');
                    }
                }
            },
            {
                name: 'Verify Listing',
                run: async () => {
                    debug('Verifying listing');
                    const result = await makeRequest('PUT', `/admin/listings/${testData.listingId}/verify`, {
                        status: 'verified'
                    }, testData.adminToken);
                    
                    if (!result.success || !result.horse) {
                        throw new Error('Failed to verify listing');
                    }
                }
            }
        ]
    },
    {
        name: 'Dashboard and Analytics',
        tests: [
            {
                name: 'Get Dashboard Stats',
                run: async () => {
                    debug('Getting dashboard stats');
                    try {
                        const result = await makeRequest('GET', '/admin/dashboard/stats', null, testData.adminToken);
                        
                        if (!result.success || !result.data) {
                            debug('Failed response:', result);
                            throw new Error('Failed to get dashboard stats');
                        }

                        // Verify stats structure
                        const requiredFields = ['totalUsers', 'totalSellers', 'totalListings', 'totalTransactions'];
                        for (const field of requiredFields) {
                            if (typeof result.data[field] === 'undefined') {
                                throw new Error(`Missing required stat: ${field}`);
                            }
                        }
                    } catch (error) {
                        debug('Error getting stats:', error);
                        throw error;
                    }
                }
            },
            {
                name: 'Get Analytics Data',
                run: async () => {
                    debug('Getting analytics data');
                    const result = await makeRequest('GET', '/admin/analytics', null, testData.adminToken);
                    
                    if (!result.success || !result.analytics) {
                        throw new Error('Failed to get analytics data');
                    }
                }
            }
        ]
    },
    {
        name: 'Cleanup',
        tests: [
            {
                name: 'Delete Test Seller',
                run: async () => {
                    debug('Deleting test seller');
                    try {
                        // Get all users to find the seller
                        const usersResult = await makeRequest('GET', '/admin/users', null, testData.adminToken);
                        if (!usersResult.success || !usersResult.data || !Array.isArray(usersResult.data.users)) {
                            debug('Failed to get users list:', usersResult);
                            throw new Error('Failed to get users list');
                        }

                        // Find the seller user
                        const sellerUser = usersResult.data.users.find(user => 
                            user.email === testData.testSeller.email && user.role === 'seller'
                        );

                        if (!sellerUser) {
                            debug('Seller user not found in users list:', {
                                email: testData.testSeller.email,
                                users: usersResult.data.users
                            });
                            throw new Error('Seller user not found');
                        }

                        // Delete the seller using their user ID
                        const result = await makeRequest('DELETE', `/admin/sellers/${sellerUser._id}`, null, testData.adminToken);
                        if (!result.success) {
                            debug('Failed to delete seller:', { 
                                sellerId: sellerUser._id,
                                response: result 
                            });
                            throw new Error('Failed to delete test seller');
                        }

                        // Verify the seller was deleted by checking users list again
                        const verifyResult = await makeRequest('GET', '/admin/users', null, testData.adminToken);
                        if (verifyResult.success && verifyResult.data && Array.isArray(verifyResult.data.users)) {
                            const sellerStillExists = verifyResult.data.users.some(user => 
                                user.email === testData.testSeller.email && user.role === 'seller'
                            );
                            if (sellerStillExists) {
                                debug('Seller still exists after deletion');
                                throw new Error('Seller was not properly deleted');
                            }
                        }
                    } catch (error) {
                        debug('Error in delete seller flow:', error);
                        throw error;
                    }
                }
            },
            {
                name: 'Delete Test User',
                run: async () => {
                    debug('Deleting test user');
                    const result = await makeRequest('DELETE', `/admin/users/${testData.userId}`, null, testData.adminToken);
                    
                    if (!result.success) {
                        throw new Error('Failed to delete test user');
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