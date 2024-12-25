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
    sellerToken: '',
    horseId: '',
    sellerId: ''
};

const testSuites = [
    {
        name: 'Listing Management Tests',
        tests: [
            {
                name: 'Setup Test Seller',
                run: async () => {
                    debug('Registering new seller');
                    const registerResult = await makeRequest('POST', '/auth/register', {
                        name: 'Listing Test Seller',
                        email: 'listingtest@seller.com',
                        password: 'test123',
                        role: 'user'
                    });

                    debug('Registration response:', registerResult);
                    if (!registerResult.success) {
                        throw new Error('Failed to register seller');
                    }
                    testData.sellerToken = registerResult.token;

                    debug('Creating seller profile');
                    const profileResult = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Listing Test Stables',
                        description: 'Test stable for listing management',
                        location: {
                            state: 'Maharashtra',
                            city: 'Mumbai',
                            pincode: '400001'
                        },
                        contactDetails: {
                            phone: '9876543210',
                            email: 'listingtest@stables.com',
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

                    // Get seller ID
                    debug('Getting seller profile');
                    const meResult = await makeRequest('GET', '/sellers/me', null, testData.sellerToken);
                    debug('Seller profile response:', meResult);
                    
                    if (!meResult.success || !meResult.seller) {
                        throw new Error('Failed to get seller profile');
                    }
                    testData.sellerId = meResult.seller._id;
                    debug('Stored seller ID:', { sellerId: testData.sellerId });

                    debug('Subscribing to Royal Stallion package');
                    const subscribeResult = await makeRequest('POST', '/sellers/subscribe', {
                        package: 'Royal Stallion',
                        duration: 30
                    }, testData.sellerToken);

                    debug('Subscription response:', subscribeResult);
                    if (!subscribeResult.success) {
                        throw new Error('Failed to subscribe seller');
                    }

                    // Wait for subscription to be active
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Verify subscription is active
                    const subCheckResult = await makeRequest('GET', '/sellers/subscription', null, testData.sellerToken);
                    debug('Subscription check response:', subCheckResult);
                    if (!subCheckResult.success || !subCheckResult.subscription || subCheckResult.subscription.status !== 'active') {
                        throw new Error('Royal Stallion subscription not active');
                    }
                }
            },
            {
                name: 'Verify Listing Limits',
                run: async () => {
                    debug('Checking listing limits');
                    const result = await makeRequest('GET', '/listings/verify-limits', null, testData.sellerToken);
                    debug('Listing limits response:', result);

                    if (!result.success) {
                        throw new Error('Failed to verify listing limits');
                    }

                    // Verify Royal Stallion package limits
                    const { data } = result;
                    if (!data || typeof data.maxListings === 'undefined' || typeof data.currentActive === 'undefined') {
                        throw new Error('Missing listing limit data');
                    }

                    if (data.maxListings !== 20 || data.boostDuration !== 7) {
                        throw new Error(`Incorrect Royal Stallion package limits: maxListings=${data.maxListings}, boostDuration=${data.boostDuration}`);
                    }
                }
            },
            {
                name: 'Create Draft Horse Listing',
                run: async () => {
                    debug('Creating draft horse listing');
                    const createResult = await makeRequest('POST', '/horses', {
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
                        listingStatus: 'draft'
                    }, testData.sellerToken);

                    debug('Horse listing creation response:', createResult);
                    if (!createResult.success || !createResult.horse) {
                        throw new Error('Failed to create horse listing');
                    }
                    testData.horseId = createResult.horse._id;
                    debug('Stored horse ID:', { horseId: testData.horseId });
                }
            },
            {
                name: 'Update Horse Listing',
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

                    debug('Updating horse listing');
                    const updateResult = await makeRequest('PUT', `/horses/${testData.horseId}`, {
                        price: 120000,
                        description: 'Updated test horse description',
                        specifications: {
                            training: 'Advanced',
                            discipline: ['Dressage', 'Show Jumping'],
                            temperament: 'Very Calm',
                            healthStatus: 'Excellent',
                            vaccination: true,
                            papers: true
                        },
                        seller: testData.sellerId
                    }, testData.sellerToken);

                    debug('Update response:', updateResult);
                    if (!updateResult.success || !updateResult.horse) {
                        throw new Error('Failed to update horse listing');
                    }
                }
            },
            {
                name: 'Submit for Verification',
                run: async () => {
                    debug('Submitting listing for verification');
                    const result = await makeRequest('POST', `/listings/${testData.horseId}/verify`, {
                        documents: [
                            {
                                type: 'registration',
                                url: 'https://example.com/registration.pdf',
                                public_id: 'reg_doc_1'
                            },
                            {
                                type: 'medical',
                                url: 'https://example.com/medical.pdf',
                                public_id: 'med_doc_1'
                            }
                        ],
                        notes: 'Please verify this listing'
                    }, testData.sellerToken);

                    debug('Verification submission response:', result);
                    if (!result.success) {
                        throw new Error('Failed to submit listing for verification');
                    }

                    debug('Checking verification status');
                    const statusResult = await makeRequest('GET', `/listings/${testData.horseId}/verification`, null, testData.sellerToken);
                    debug('Verification status response:', statusResult);

                    if (!statusResult.success) {
                        throw new Error('Failed to get verification status');
                    }

                    if (statusResult.verificationStatus !== 'pending') {
                        throw new Error('Incorrect verification status');
                    }
                }
            },
            {
                name: 'Test Listing Boost',
                run: async () => {
                    debug('Boosting listing');
                    const result = await makeRequest('POST', `/listings/${testData.horseId}/boost`, null, testData.sellerToken);
                    debug('Boost response:', result);

                    if (!result.success) {
                        throw new Error('Failed to boost listing');
                    }

                    if (!result.boost || !result.boost.active) {
                        throw new Error('Listing not boosted correctly');
                    }

                    // Verify boost duration for Royal Stallion package
                    const boostEndDate = new Date(result.boost.endDate);
                    const boostStartDate = new Date(result.boost.startDate);
                    const boostDuration = Math.ceil((boostEndDate - boostStartDate) / (1000 * 60 * 60 * 24));
                    
                    if (boostDuration !== 7) {
                        throw new Error('Incorrect boost duration for Royal Stallion package');
                    }
                }
            },
            {
                name: 'Delete Horse Listing',
                run: async () => {
                    debug('Getting horse listing');
                    const listingResult = await makeRequest('GET', `/horses/${testData.horseId}`, null, testData.sellerToken);
                    debug('Horse listing response:', listingResult);

                    if (!listingResult.success || !listingResult.horse) {
                        throw new Error('Failed to get horse listing');
                    }

                    debug('Deleting horse listing');
                    const deleteResult = await makeRequest('DELETE', `/horses/${testData.horseId}`, null, testData.sellerToken);
                    debug('Delete response:', deleteResult);

                    if (!deleteResult.success) {
                        throw new Error('Failed to delete horse listing');
                    }

                    // Verify deletion
                    debug('Verifying deletion');
                    try {
                        const checkResult = await makeRequest('GET', `/horses/${testData.horseId}`, null, testData.sellerToken);
                        if (checkResult.success) {
                            throw new Error('Horse listing should not exist');
                        }
                    } catch (error) {
                        // This is expected - the listing should not be found
                        if (!error.message.includes('not found')) {
                            throw error;
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