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
    buyerToken: '',
    sellerToken: '',
    horseId: '',
    conversationId: '',
    messageId: ''
};

const testSuites = [
    {
        name: 'Messaging System Tests',
        tests: [
            {
                name: 'Setup Test Users',
                run: async () => {
                    debug('Registering buyer');
                    const buyerResult = await makeRequest('POST', '/auth/register', {
                        name: 'Test Buyer',
                        email: 'testbuyer@example.com',
                        password: 'test123',
                        role: 'user'
                    });

                    debug('Buyer registration response:', buyerResult);
                    if (!buyerResult.success) {
                        throw new Error('Failed to register buyer');
                    }
                    testData.buyerToken = buyerResult.token;
                    testData.buyerId = buyerResult.user._id;

                    debug('Registering seller');
                    const sellerRegResult = await makeRequest('POST', '/auth/register', {
                        name: 'Test Seller',
                        email: 'testseller@example.com',
                        password: 'test123',
                        role: 'seller'
                    });

                    debug('Seller registration response:', sellerRegResult);
                    if (!sellerRegResult.success) {
                        throw new Error('Failed to register seller');
                    }
                    testData.sellerToken = sellerRegResult.token;
                    testData.sellerId = sellerRegResult.user._id;
                    const sellerUserId = sellerRegResult.user._id;

                    debug('Creating seller profile');
                    const profileResult = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Test Stables',
                        description: 'Test stable for messaging',
                        location: {
                            state: 'Maharashtra',
                            city: 'Mumbai',
                            pincode: '400001'
                        },
                        contactDetails: {
                            phone: '9876543210',
                            email: 'testseller@stables.com',
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
                    testData.sellerProfileId = profileResult.seller._id;

                    // Create a test horse listing
                    debug('Creating test horse listing');
                    const horseResult = await makeRequest('POST', '/horses', {
                        name: 'Test Horse',
                        breed: 'Thoroughbred',
                        age: { years: 5, months: 0 },
                        gender: 'Stallion',
                        color: 'Bay',
                        price: 100000,
                        description: 'Test horse for messaging',
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

                    debug('Horse creation response:', horseResult);
                    if (!horseResult.success) {
                        throw new Error('Failed to create horse listing');
                    }
                    testData.horseId = horseResult.horse._id;
                }
            },
            {
                name: 'Start New Conversation',
                run: async () => {
                    debug('Starting new conversation');
                    debug('User IDs:', {
                        buyerId: testData.buyerId,
                        sellerId: testData.sellerId,
                        horseId: testData.horseId
                    });
                    const result = await makeRequest('POST', '/messaging/conversations', {
                        recipientId: testData.sellerId,
                        entityType: 'horse',
                        entityId: testData.horseId
                    }, testData.buyerToken);

                    debug('Conversation creation response:', result);
                    if (!result.success || !result.conversation) {
                        throw new Error('Failed to start conversation');
                    }

                    testData.conversationId = result.conversation._id;
                    debug('Stored conversation ID:', { conversationId: testData.conversationId });
                }
            },
            {
                name: 'Get Existing Conversation',
                run: async () => {
                    debug('Getting existing conversation');
                    const result = await makeRequest('POST', '/messaging/conversations', {
                        recipientId: testData.sellerId,
                        entityType: 'horse',
                        entityId: testData.horseId
                    }, testData.buyerToken);

                    debug('Get conversation response:', result);
                    if (!result.success || !result.conversation) {
                        throw new Error('Failed to get conversation');
                    }

                    if (result.conversation._id !== testData.conversationId) {
                        debug('Conversation IDs:', {
                            expected: testData.conversationId,
                            received: result.conversation._id
                        });
                        throw new Error('Returned different conversation ID');
                    }
                }
            },
            {
                name: 'Get User Conversations',
                run: async () => {
                    debug('Getting user conversations');
                    const result = await makeRequest('GET', '/messaging/conversations', null, testData.buyerToken);

                    debug('User conversations response:', result);
                    if (!result.success || !result.data || !result.data.conversations) {
                        throw new Error('Failed to get user conversations');
                    }

                    if (result.data.conversations.length !== 1) {
                        throw new Error('Incorrect number of conversations');
                    }

                    // Store the conversation ID if we don't have it yet
                    if (!testData.conversationId) {
                        testData.conversationId = result.data.conversations[0]._id;
                        debug('Stored conversation ID from list:', { conversationId: testData.conversationId });
                    }
                }
            },
            {
                name: 'Send Message',
                run: async () => {
                    debug('Sending message');
                    if (!testData.conversationId) {
                        throw new Error('No conversation ID available');
                    }
                    const result = await makeRequest('POST', '/messaging/messages', {
                        conversationId: testData.conversationId,
                        content: 'Hello, I am interested in your horse.'
                    }, testData.buyerToken);

                    debug('Send message response:', result);
                    if (!result.success || !result.message) {
                        throw new Error('Failed to send message');
                    }

                    testData.messageId = result.message._id;
                }
            },
            {
                name: 'Get Conversation Messages',
                run: async () => {
                    debug('Getting conversation messages');
                    debug('Conversation ID:', testData.conversationId);
                    
                    if (!testData.conversationId) {
                        throw new Error('Conversation ID is missing');
                    }
                    
                    const result = await makeRequest('GET', `/messaging/conversations/${testData.conversationId}/messages`, null, testData.sellerToken);

                    debug('Get messages response:', result);
                    if (!result.success || !result.messages) {
                        throw new Error('Failed to get messages');
                    }

                    if (result.messages.length !== 1) {
                        throw new Error('Incorrect number of messages');
                    }

                    // Verify message is marked as read
                    const message = result.messages[0];
                    if (!message.readBy || !message.readBy.some(r => r.user.toString() === testData.sellerId.toString())) {
                        throw new Error('Message not marked as read');
                    }
                }
            },
            {
                name: 'Update Conversation Settings',
                run: async () => {
                    debug('Updating conversation settings');
                    if (!testData.conversationId) {
                        throw new Error('No conversation ID available');
                    }
                    const result = await makeRequest('PUT', `/messaging/conversations/${testData.conversationId}/settings`, {
                        muted: true,
                        autoResponder: {
                            enabled: true,
                            message: 'I will respond within 24 hours.'
                        },
                        notifications: {
                            enabled: true,
                            schedule: {
                                start: '09:00',
                                end: '18:00',
                                timezone: 'Asia/Kolkata'
                            }
                        }
                    }, testData.sellerToken);

                    debug('Settings update response:', result);
                    if (!result.success) {
                        throw new Error('Failed to update conversation settings');
                    }

                    // Verify settings were applied
                    const conversationResult = await makeRequest('GET', '/messaging/conversations', null, testData.sellerToken);
                    debug('Get updated conversation response:', conversationResult);

                    const conversation = conversationResult.data.conversations.find(c => c._id === testData.conversationId);
                    if (!conversation) {
                        throw new Error('Conversation not found');
                    }

                    const sellerParticipant = conversation.participants.find(p => p.user._id === testData.sellerId);
                    if (!sellerParticipant || !sellerParticipant.muted) {
                        throw new Error('Muted setting not applied correctly');
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