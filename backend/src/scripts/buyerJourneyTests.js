const { log, makeRequest, runTests } = require('./test.utils');

// Test data storage
let testData = {
    userToken: '',
    favoriteHorses: [],
    inquiryIds: [],
    searchResults: [],
    filters: {
        breed: 'Thoroughbred',
        minPrice: 100000,
        maxPrice: 1000000,
        location: 'Maharashtra'
    }
};

// Test suites
const testSuites = [
    {
        name: 'User Registration and Profile',
        tests: [
            {
                name: 'Register as Buyer',
                run: async () => {
                    const result = await makeRequest('POST', '/auth/register', {
                        name: 'Test Buyer',
                        email: 'buyer@test.com',
                        password: 'buyer123',
                        role: 'user'
                    });

                    if (!result.success || !result.token) {
                        throw new Error('Failed to register buyer');
                    }
                    testData.userToken = result.token;
                }
            },
            {
                name: 'Update Profile',
                run: async () => {
                    const result = await makeRequest('PUT', '/users/profile', {
                        phone: '+91 9876543210',
                        location: {
                            state: 'Maharashtra',
                            city: 'Mumbai',
                            pincode: '400001'
                        },
                        preferences: {
                            breeds: ['Thoroughbred', 'Arabian'],
                            priceRange: {
                                min: 100000,
                                max: 1000000
                            },
                            purposes: ['Racing', 'Show Jumping']
                        }
                    }, testData.userToken);

                    if (!result.success) {
                        throw new Error('Failed to update profile');
                    }
                }
            }
        ]
    },
    {
        name: 'Browse and Search',
        tests: [
            {
                name: 'Get Featured Horses',
                run: async () => {
                    const result = await makeRequest('GET', '/horses/featured');
                    if (!result.success || !Array.isArray(result.horses)) {
                        throw new Error('Failed to get featured horses');
                    }
                    if (result.horses.length > 0) {
                        testData.favoriteHorses.push(result.horses[0]._id);
                    }
                }
            },
            {
                name: 'Search Horses by Filters',
                run: async () => {
                    const result = await makeRequest('GET', '/horses/search', {
                        params: testData.filters
                    });
                    if (!result.success || !Array.isArray(result.horses)) {
                        throw new Error('Failed to search horses');
                    }
                    testData.searchResults = result.horses;
                }
            },
            {
                name: 'Get Horse Categories',
                run: async () => {
                    const result = await makeRequest('GET', '/horses/categories');
                    if (!result.success || !Array.isArray(result.categories)) {
                        throw new Error('Failed to get categories');
                    }
                }
            },
            {
                name: 'Get Price Ranges',
                run: async () => {
                    const result = await makeRequest('GET', '/horses/price-ranges');
                    if (!result.success || !Array.isArray(result.ranges)) {
                        throw new Error('Failed to get price ranges');
                    }
                }
            }
        ]
    },
    {
        name: 'Favorites Management',
        tests: [
            {
                name: 'Add to Favorites',
                run: async () => {
                    if (testData.favoriteHorses.length === 0) {
                        return; // Skip if no horses available
                    }
                    const result = await makeRequest('POST', `/horses/${testData.favoriteHorses[0]}/favorite`, {}, testData.userToken);
                    if (!result.success) {
                        throw new Error('Failed to add to favorites');
                    }
                }
            },
            {
                name: 'Get Favorites',
                run: async () => {
                    const result = await makeRequest('GET', '/users/favorites', null, testData.userToken);
                    if (!result.success || !Array.isArray(result.favorites)) {
                        throw new Error('Failed to get favorites');
                    }
                }
            },
            {
                name: 'Remove from Favorites',
                run: async () => {
                    if (testData.favoriteHorses.length === 0) {
                        return; // Skip if no horses available
                    }
                    const result = await makeRequest('DELETE', `/horses/${testData.favoriteHorses[0]}/favorite`, null, testData.userToken);
                    if (!result.success) {
                        throw new Error('Failed to remove from favorites');
                    }
                }
            }
        ]
    },
    {
        name: 'Inquiries and Communication',
        tests: [
            {
                name: 'Create Inquiry',
                run: async () => {
                    if (testData.searchResults.length === 0) {
                        return; // Skip if no horses available
                    }
                    const result = await makeRequest('POST', '/inquiries', {
                        horse: testData.searchResults[0]._id,
                        message: 'I am interested in this horse. Please provide more details.',
                        contactPreference: 'email'
                    }, testData.userToken);

                    if (!result.success || !result.inquiry) {
                        throw new Error('Failed to create inquiry');
                    }
                    testData.inquiryIds.push(result.inquiry._id);
                }
            },
            {
                name: 'Get Inquiry Status',
                run: async () => {
                    if (testData.inquiryIds.length === 0) {
                        return; // Skip if no inquiries
                    }
                    const result = await makeRequest('GET', `/inquiries/${testData.inquiryIds[0]}`, null, testData.userToken);
                    if (!result.success || !result.inquiry) {
                        throw new Error('Failed to get inquiry status');
                    }
                }
            },
            {
                name: 'Get All Inquiries',
                run: async () => {
                    const result = await makeRequest('GET', '/inquiries/buyer', null, testData.userToken);
                    if (!result.success || !Array.isArray(result.inquiries)) {
                        throw new Error('Failed to get all inquiries');
                    }
                }
            }
        ]
    },
    {
        name: 'Support and Help',
        tests: [
            {
                name: 'Create Support Ticket',
                run: async () => {
                    const result = await makeRequest('POST', '/support/tickets', {
                        subject: 'Need help with horse details',
                        category: 'technical',
                        priority: 'medium',
                        description: 'I need help understanding the horse specifications.'
                    }, testData.userToken);

                    if (!result.success || !result.ticket) {
                        throw new Error('Failed to create support ticket');
                    }
                }
            },
            {
                name: 'Get Support Ticket Status',
                run: async () => {
                    const result = await makeRequest('GET', '/support/tickets', null, testData.userToken);
                    if (!result.success || !Array.isArray(result.tickets)) {
                        throw new Error('Failed to get support tickets');
                    }
                }
            },
            {
                name: 'Get FAQs',
                run: async () => {
                    const result = await makeRequest('GET', '/support/faqs');
                    if (!result.success || !Array.isArray(result.faqs)) {
                        throw new Error('Failed to get FAQs');
                    }
                }
            }
        ]
    },
    {
        name: 'Notifications and Alerts',
        tests: [
            {
                name: 'Set Alert Preferences',
                run: async () => {
                    const result = await makeRequest('PUT', '/users/alerts', {
                        priceDrops: true,
                        newListings: true,
                        inquiryResponses: true,
                        marketUpdates: false
                    }, testData.userToken);

                    if (!result.success) {
                        throw new Error('Failed to set alert preferences');
                    }
                }
            },
            {
                name: 'Get Notifications',
                run: async () => {
                    const result = await makeRequest('GET', '/users/notifications', null, testData.userToken);
                    if (!result.success || !Array.isArray(result.notifications)) {
                        throw new Error('Failed to get notifications');
                    }
                }
            },
            {
                name: 'Mark Notification as Read',
                run: async () => {
                    const result = await makeRequest('PUT', '/users/notifications/read-all', null, testData.userToken);
                    if (!result.success) {
                        throw new Error('Failed to mark notifications as read');
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