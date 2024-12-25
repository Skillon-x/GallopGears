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
    sellers: {
        royal: { token: '', userId: '', profileId: '', orderId: '', paymentId: '', horses: [] },
        gallop: { token: '', userId: '', profileId: '', orderId: '', paymentId: '', horses: [] },
        trot: { token: '', userId: '', profileId: '', orderId: '', paymentId: '', horses: [] },
        starter: { token: '', userId: '', profileId: '', horses: [] }
    },
    buyers: {
        premium: { token: '', userId: '', inquiries: [], conversations: [] },
        standard: { token: '', userId: '', inquiries: [], conversations: [] }
    },
    adminToken: '',
    uploadedPhotos: {}
};

const testSuites = [
    // Previous test suites remain the same...

    {
        name: 'Buyer Registration',
        tests: [
            {
                name: 'Register Buyers',
                run: async () => {
                    const buyerTypes = ['premium', 'standard'];
                    
                    for (const type of buyerTypes) {
                        debug(`Registering ${type} buyer`);
                        const result = await makeRequest('POST', '/auth/register', {
                            name: `${type.charAt(0).toUpperCase() + type.slice(1)} Buyer`,
                            email: `${type}buyer@test.com`,
                            password: 'buyer123',
                            role: 'user'
                        });

                        if (!result.success) {
                            throw new Error(`Failed to register ${type} buyer`);
                        }
                        
                        testData.buyers[type].token = result.token;
                        testData.buyers[type].userId = result.user._id;
                    }
                }
            }
        ]
    },
    {
        name: 'Horse Listing Management',
        tests: [
            {
                name: 'Create Horse Listings',
                run: async () => {
                    for (const [sellerType, sellerData] of Object.entries(testData.sellers)) {
                        debug(`Creating horse listings for ${sellerType} seller`);

                        const listingsCount = {
                            royal: 3,
                            gallop: 2,
                            trot: 1,
                            starter: 1
                        }[sellerType];

                        for (let i = 0; i < listingsCount; i++) {
                            const result = await makeRequest('POST', '/horses', {
                                name: `${sellerType.charAt(0).toUpperCase() + sellerType.slice(1)} Horse ${i + 1}`,
                                breed: 'Thoroughbred',
                                age: { years: 5, months: 0 },
                                gender: 'Stallion',
                                color: 'Bay',
                                price: 100000 * (i + 1),
                                description: `Test horse ${i + 1} for ${sellerType} seller`,
                                location: {
                                    state: 'Maharashtra',
                                    city: 'Mumbai',
                                    pincode: '400001'
                                },
                                specifications: {
                                    training: 'Advanced',
                                    discipline: ['Dressage', 'Show Jumping'],
                                    temperament: 'Calm',
                                    healthStatus: 'Excellent',
                                    vaccination: true,
                                    papers: true
                                }
                            }, sellerData.token);

                            if (!result.success) {
                                throw new Error(`Failed to create horse listing for ${sellerType}`);
                            }

                            testData.sellers[sellerType].horses.push(result.horse._id);
                        }
                    }
                }
            },
            {
                name: 'Upload Photos',
                run: async () => {
                    for (const [sellerType, sellerData] of Object.entries(testData.sellers)) {
                        for (const horseId of sellerData.horses) {
                            debug(`Uploading photos for horse ${horseId}`);

                            const testPhotos = [
                                {
                                    name: 'main.jpg',
                                    content: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QBORXhpZgAATU0AKgAAAAgABAMCAAIAAAA...',
                                    size: 1024 * 1024
                                },
                                {
                                    name: 'profile.jpg',
                                    content: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QBORXhpZgAATU0AKgAAAAgABAMCAAIAAAA...',
                                    size: 1024 * 1024
                                }
                            ];

                            const result = await makeRequest('POST', `/photos/upload/${horseId}`, {
                                photos: testPhotos
                            }, sellerData.token);

                            if (!result.success) {
                                throw new Error(`Failed to upload photos for horse ${horseId}`);
                            }

                            testData.uploadedPhotos[horseId] = result.images;
                        }
                    }
                }
            }
        ]
    },
    {
        name: 'Buyer-Seller Interaction',
        tests: [
            {
                name: 'Create Inquiries',
                run: async () => {
                    for (const [buyerType, buyerData] of Object.entries(testData.buyers)) {
                        debug(`Creating inquiries for ${buyerType} buyer`);

                        // Select random horse listings to inquire about
                        const allHorses = Object.values(testData.sellers)
                            .flatMap(seller => seller.horses);
                        
                        const selectedHorses = allHorses
                            .sort(() => 0.5 - Math.random())
                            .slice(0, 2);

                        for (const horseId of selectedHorses) {
                            const result = await makeRequest('POST', '/inquiries', {
                                horse: horseId,
                                message: `I am interested in this horse. Can you provide more details?`,
                                contactPreference: 'email'
                            }, buyerData.token);

                            if (!result.success) {
                                throw new Error(`Failed to create inquiry for ${buyerType} buyer`);
                            }

                            testData.buyers[buyerType].inquiries.push(result.inquiry._id);
                        }
                    }
                }
            },
            {
                name: 'Start Conversations',
                run: async () => {
                    for (const [buyerType, buyerData] of Object.entries(testData.buyers)) {
                        for (const [sellerType, sellerData] of Object.entries(testData.sellers)) {
                            if (sellerData.horses.length === 0) continue;

                            debug(`Starting conversation between ${buyerType} buyer and ${sellerType} seller`);

                            const result = await makeRequest('POST', '/messaging/conversations', {
                                recipientId: sellerData.userId,
                                entityType: 'horse',
                                entityId: sellerData.horses[0]
                            }, buyerData.token);

                            if (!result.success) {
                                throw new Error(`Failed to start conversation for ${buyerType} buyer`);
                            }

                            testData.buyers[buyerType].conversations.push(result.conversation._id);

                            // Send initial message
                            await makeRequest('POST', '/messaging/messages', {
                                conversationId: result.conversation._id,
                                content: 'Hello, I am interested in your horse. Is it still available?'
                            }, buyerData.token);

                            // Seller responds
                            await makeRequest('POST', '/messaging/messages', {
                                conversationId: result.conversation._id,
                                content: 'Yes, the horse is available. Would you like to schedule a viewing?'
                            }, sellerData.token);
                        }
                    }
                }
            },
            {
                name: 'Test Message Notifications',
                run: async () => {
                    for (const [buyerType, buyerData] of Object.entries(testData.buyers)) {
                        for (const conversationId of buyerData.conversations) {
                            debug(`Testing message notifications for conversation ${conversationId}`);

                            // Get initial notification count
                            const initialNotifications = await makeRequest('GET', '/users/notifications', null, buyerData.token);
                            const initialCount = initialNotifications.notifications.length;

                            // Send a new message
                            await makeRequest('POST', '/messaging/messages', {
                                conversationId: conversationId,
                                content: 'When would be a good time to visit?'
                            }, buyerData.token);

                            // Verify notification was created
                            const updatedNotifications = await makeRequest('GET', '/users/notifications', null, buyerData.token);
                            if (updatedNotifications.notifications.length <= initialCount) {
                                throw new Error('Message notification not created');
                            }
                        }
                    }
                }
            }
        ]
    },
    {
        name: 'Listing Cleanup',
        tests: [
            {
                name: 'Delete Horse Listings',
                run: async () => {
                    for (const [sellerType, sellerData] of Object.entries(testData.sellers)) {
                        debug(`Deleting horse listings for ${sellerType} seller`);

                        for (const horseId of sellerData.horses) {
                            const result = await makeRequest('DELETE', `/horses/${horseId}`, null, sellerData.token);

                            if (!result.success) {
                                throw new Error(`Failed to delete horse ${horseId}`);
                            }

                            // Verify deletion
                            try {
                                await makeRequest('GET', `/horses/${horseId}`, null, sellerData.token);
                                throw new Error(`Horse ${horseId} still exists after deletion`);
                            } catch (error) {
                                if (!error.message.includes('not found')) {
                                    throw error;
                                }
                            }
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