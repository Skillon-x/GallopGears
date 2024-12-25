const { log, makeRequest, runTests } = require('./test.utils');
const fs = require('fs');
const path = require('path');

// Test data storage
let testData = {
    sellerToken: '',
    adminToken: '',
    verificationId: '',
    testDocuments: []
};

const testSuites = [
    {
        name: 'Seller Verification Tests',
        tests: [
            {
                name: 'Setup Test Users',
                run: async () => {
                    // Register admin
                    const adminResult = await makeRequest('POST', '/auth/register', {
                        name: 'Verification Admin',
                        email: 'verifyadmin@test.com',
                        password: 'admin123',
                        role: 'admin'
                    });
                    if (!adminResult.success) {
                        throw new Error('Failed to register admin');
                    }
                    testData.adminToken = adminResult.token;

                    // Register seller
                    const sellerResult = await makeRequest('POST', '/auth/register', {
                        name: 'Verification Test Seller',
                        email: 'verifytest@seller.com',
                        password: 'test123',
                        role: 'seller'
                    });
                    if (!sellerResult.success) {
                        throw new Error('Failed to register seller');
                    }
                    testData.sellerToken = sellerResult.token;

                    // Create seller profile
                    const profileResult = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Verification Test Stables',
                        description: 'Test stable for verification',
                        location: {
                            state: 'Maharashtra',
                            city: 'Mumbai',
                            pincode: '400001'
                        },
                        contactDetails: {
                            phone: '9876543210',
                            email: 'verifytest@stables.com',
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
                }
            },
            {
                name: 'Submit Basic Verification',
                run: async () => {
                    // Create test documents
                    testData.testDocuments = [
                        {
                            type: 'identity',
                            file: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
                        },
                        {
                            type: 'address',
                            file: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
                        }
                    ];

                    const result = await makeRequest('POST', '/verification/submit', {
                        level: 'basic',
                        documents: testData.testDocuments,
                        notes: 'Basic verification test'
                    }, testData.sellerToken);

                    if (!result.success) {
                        throw new Error('Failed to submit basic verification');
                    }

                    if (result.verification.status !== 'pending') {
                        throw new Error('Incorrect verification status');
                    }
                }
            },
            {
                name: 'Check Verification Status',
                run: async () => {
                    const result = await makeRequest('GET', '/verification/status', null, testData.sellerToken);
                    if (!result.success) {
                        throw new Error('Failed to get verification status');
                    }

                    if (result.verification.status !== 'pending' || result.verification.level !== 'basic') {
                        throw new Error('Incorrect verification status or level');
                    }
                }
            },
            {
                name: 'Submit Professional Verification',
                run: async () => {
                    // Create professional documents
                    const professionalDocs = [
                        ...testData.testDocuments,
                        {
                            type: 'business_license',
                            file: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
                        },
                        {
                            type: 'tax_registration',
                            file: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
                        },
                        {
                            type: 'bank_statement',
                            file: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
                        }
                    ];

                    const result = await makeRequest('POST', '/verification/submit', {
                        level: 'professional',
                        documents: professionalDocs,
                        notes: 'Professional verification test'
                    }, testData.sellerToken);

                    if (!result.success) {
                        throw new Error('Failed to submit professional verification');
                    }

                    if (result.verification.status !== 'pending' || result.verification.level !== 'professional') {
                        throw new Error('Incorrect verification status or level');
                    }
                }
            },
            {
                name: 'Check Badge Eligibility - Initial',
                run: async () => {
                    const result = await makeRequest('GET', '/verification/badges', null, testData.sellerToken);
                    if (!result.success) {
                        throw new Error('Failed to check badge eligibility');
                    }

                    // Should not be eligible for any badges yet
                    if (result.eligibleBadges.length > 0) {
                        throw new Error('Should not be eligible for badges without meeting criteria');
                    }
                }
            },
            {
                name: 'Setup for Badge Eligibility',
                run: async () => {
                    // Subscribe to Royal Stallion
                    await makeRequest('POST', '/sellers/subscribe', {
                        package: 'Royal Stallion',
                        duration: 12
                    }, testData.sellerToken);

                    // Create multiple listings
                    for (let i = 0; i < 5; i++) {
                        await makeRequest('POST', '/horses', {
                            name: `Badge Test Horse ${i + 1}`,
                            breed: 'Thoroughbred',
                            age: { years: 5, months: 0 },
                            gender: 'Stallion',
                            color: 'Bay',
                            price: 100000,
                            description: 'Test horse for badges',
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
                    }

                    // Add some reviews
                    for (let i = 0; i < 3; i++) {
                        await makeRequest('POST', '/sellers/reviews', {
                            rating: 5,
                            comment: 'Excellent seller'
                        }, testData.sellerToken);
                    }
                }
            },
            {
                name: 'Check Badge Eligibility - After Setup',
                run: async () => {
                    const result = await makeRequest('GET', '/verification/badges', null, testData.sellerToken);
                    if (!result.success) {
                        throw new Error('Failed to check badge eligibility');
                    }

                    // Should be eligible for Premium Stable badge
                    if (!result.eligibleBadges.includes('Premium Stable')) {
                        throw new Error('Should be eligible for Premium Stable badge');
                    }
                }
            },
            {
                name: 'Check Premium Stables Listing',
                run: async () => {
                    const result = await makeRequest('GET', '/verification/premium-stables');
                    if (!result.success) {
                        throw new Error('Failed to get premium stables');
                    }

                    // Verify response structure
                    if (!Array.isArray(result.data)) {
                        throw new Error('Premium stables data should be an array');
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