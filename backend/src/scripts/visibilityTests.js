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
    sellerId: '',
    spotlightId: '',
    adminToken: ''
};

const testSuites = [
    {
        name: 'Visibility Tests',
        tests: [
            {
                name: 'Setup Test Data',
                run: async () => {
                    debug('Registering new seller');
                    const registerResult = await makeRequest('POST', '/auth/register', {
                        name: 'Visibility Test Seller',
                        email: 'visibilitytest@seller.com',
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
                        businessName: 'Visibility Test Stables',
                        description: 'Test stable for visibility features',
                        location: {
                            state: 'Maharashtra',
                            city: 'Mumbai',
                            pincode: '400001'
                        },
                        contactDetails: {
                            phone: '9876543210',
                            email: 'visibilitytest@stables.com',
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

                    // Register admin user
                    debug('Registering admin user');
                    const adminRegisterResult = await makeRequest('POST', '/auth/register', {
                        name: 'Test Admin',
                        email: 'testadmin@example.com',
                        password: 'admin123',
                        role: 'admin'
                    });
                    debug('Admin registration response:', adminRegisterResult);
                    testData.adminToken = adminRegisterResult.token;

                    // Submit verification documents
                    debug('Submitting verification documents');
                    const verifyResult = await makeRequest('POST', '/verification/submit', {
                        level: 'professional',
                        documents: [
                            {
                                type: 'identity',
                                url: 'https://example.com/id.pdf',
                                public_id: 'test_id_1'
                            },
                            {
                                type: 'address',
                                url: 'https://example.com/address.pdf',
                                public_id: 'test_address_1'
                            },
                            {
                                type: 'business_license',
                                url: 'https://example.com/license.pdf',
                                public_id: 'test_license_1'
                            },
                            {
                                type: 'tax_registration',
                                url: 'https://example.com/tax.pdf',
                                public_id: 'test_tax_1'
                            },
                            {
                                type: 'bank_statement',
                                url: 'https://example.com/bank.pdf',
                                public_id: 'test_bank_1'
                            }
                        ],
                        notes: 'Test verification documents'
                    }, testData.sellerToken);
                    debug('Verification submission response:', verifyResult);

                    // Admin approves verification
                    debug('Admin approving verification');
                    const approveResult = await makeRequest('PUT', `/verification/sellers/${testData.sellerId}/verification`, {
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
                                    type: 'address',
                                    verified: true,
                                    verifiedAt: new Date()
                                },
                                {
                                    type: 'business_license',
                                    verified: true,
                                    verifiedAt: new Date()
                                },
                                {
                                    type: 'tax_registration',
                                    verified: true,
                                    verifiedAt: new Date()
                                },
                                {
                                    type: 'bank_statement',
                                    verified: true,
                                    verifiedAt: new Date()
                                }
                            ]
                        },
                        remarks: 'All documents verified'
                    }, testData.adminToken);
                    debug('Verification approval response:', approveResult);

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

                    // Verify Royal Stallion subscription is active
                    const subCheckResult = await makeRequest('GET', '/sellers/subscription', null, testData.sellerToken);
                    debug('Subscription check response:', subCheckResult);
                    if (!subCheckResult.success || subCheckResult.subscription.plan !== 'Royal Stallion') {
                        throw new Error('Royal Stallion subscription not active');
                    }

                    debug('Creating test listing');
                    const listingResult = await makeRequest('POST', '/horses', {
                        name: 'Visibility Test Horse',
                        breed: 'Thoroughbred',
                        age: { years: 5, months: 0 },
                        gender: 'Stallion',
                        color: 'Bay',
                        price: 100000,
                        description: 'Test horse for visibility features',
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
                    }, testData.sellerToken);

                    debug('Listing creation response:', listingResult);
                    if (!listingResult.success || !listingResult.horse) {
                        throw new Error('Failed to create horse listing');
                    }
                    testData.horseId = listingResult.horse._id;
                    debug('Stored horse ID:', { horseId: testData.horseId });

                    // Generate some views for the listing
                    debug('Generating test views');
                    for (let i = 0; i < 5; i++) {
                        await makeRequest('GET', `/horses/${testData.horseId}`);
                    }
                }
            },
            {
                name: 'Test Add to Spotlight',
                run: async () => {
                    // Verify Royal Stallion subscription before spotlight
                    debug('Verifying Royal Stallion subscription');
                    const subResult = await makeRequest('GET', '/sellers/subscription', null, testData.sellerToken);
                    if (!subResult.success || subResult.subscription.plan !== 'Royal Stallion') {
                        throw new Error('Royal Stallion subscription required for spotlight');
                    }

                    debug('Adding listing to spotlight');
                    const result = await makeRequest('POST', `/visibility/spotlight/${testData.horseId}`, null, testData.sellerToken);
                    debug('Spotlight response:', result);

                    if (!result.success) {
                        throw new Error('Failed to add listing to spotlight');
                    }

                    testData.spotlightId = result.spotlight._id;
                    debug('Stored spotlight ID:', { spotlightId: testData.spotlightId });

                    // Verify spotlight duration for Royal Stallion package
                    const startDate = new Date(result.spotlight.startDate);
                    const endDate = new Date(result.spotlight.endDate);
                    const durationDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
                    
                    if (durationDays !== 7) { // Royal Stallion gets 7 days
                        throw new Error('Incorrect spotlight duration');
                    }

                    // Generate some spotlight views
                    debug('Generating spotlight views');
                    for (let i = 0; i < 3; i++) {
                        await makeRequest('GET', `/horses/${testData.horseId}`);
                    }
                }
            },
            {
                name: 'Test Get Featured Listings',
                run: async () => {
                    debug('Getting featured listings');
                    const result = await makeRequest('GET', '/visibility/featured');
                    debug('Featured listings response:', result);

                    if (!result.success) {
                        throw new Error('Failed to get featured listings');
                    }

                    // Verify response structure
                    if (!result.data.spotlights || !result.data.premiumListings) {
                        throw new Error('Invalid featured listings response structure');
                    }

                    // Verify our listing is in spotlights
                    const ourListing = result.data.spotlights.find(h => h._id === testData.horseId);
                    if (!ourListing) {
                        throw new Error('Test listing not found in spotlights');
                    }
                }
            },
            {
                name: 'Test Social Media Sharing',
                run: async () => {
                    if (!testData.horseId) {
                        throw new Error('Horse ID not found');
                    }

                    debug('Sharing listing on social media');
                    const result = await makeRequest('POST', `/visibility/share/${testData.horseId}`, {
                        platforms: ['facebook', 'instagram', 'twitter']
                    }, testData.sellerToken);
                    debug('Social sharing response:', result);

                    if (!result.success) {
                        throw new Error('Failed to share on social media');
                    }

                    // Verify share results
                    if (!Array.isArray(result.shares) || result.shares.length !== 3) {
                        throw new Error('Invalid share results');
                    }

                    // Verify each platform share
                    const platforms = ['facebook', 'instagram', 'twitter'];
                    platforms.forEach(platform => {
                        const share = result.shares.find(s => s.platform === platform);
                        if (!share || !share.success) {
                            throw new Error(`Failed to share on ${platform}`);
                        }
                    });
                }
            },
            {
                name: 'Test Visibility Stats',
                run: async () => {
                    if (!testData.horseId) {
                        throw new Error('Horse ID not found');
                    }

                    debug('Getting visibility stats');
                    const result = await makeRequest('GET', `/visibility/stats/${testData.horseId}`, null, testData.sellerToken);
                    debug('Visibility stats response:', result);

                    if (!result.success) {
                        throw new Error('Failed to get visibility stats');
                    }

                    // Verify metrics structure
                    const metrics = result.data.metrics;
                    const required = ['totalViews', 'spotlightViews', 'socialShares', 'spotlightHistory'];
                    const missing = required.filter(field => typeof metrics[field] === 'undefined');
                    if (missing.length > 0) {
                        throw new Error(`Missing required metrics: ${missing.join(', ')}`);
                    }

                    // Verify trends data
                    if (typeof result.data.visibilityTrends !== 'object') {
                        throw new Error('Invalid visibility trends data');
                    }
                }
            },
            {
                name: 'Test Spotlight Limits',
                run: async () => {
                    debug('Testing spotlight limits');
                    // Try to add more spotlights than allowed
                    const attempts = 6; // Royal Stallion limit is 5 per month
                    let error = null;

                    for (let i = 0; i < attempts; i++) {
                        debug(`Attempt ${i + 1} to add spotlight`);
                        try {
                            const result = await makeRequest('POST', `/visibility/spotlight/${testData.horseId}`, null, testData.sellerToken);
                            debug(`Spotlight attempt ${i + 1} response:`, result);
                        } catch (e) {
                            error = e;
                            debug(`Spotlight attempt ${i + 1} error:`, e);
                            break;
                        }
                    }

                    if (!error || !error.message.includes('limit')) {
                        throw new Error('Should have hit spotlight limit');
                    }
                }
            },
            {
                name: 'Test Featured Listings Functionality',
                run: async () => {
                    debug('Testing featured listings functionality');

                    // First, get initial featured listings
                    const initialResult = await makeRequest('GET', '/visibility/featured');
                    debug('Initial featured listings:', initialResult);

                    if (!initialResult.success) {
                        throw new Error('Failed to get initial featured listings');
                    }

                    // Verify our spotlight is included
                    const ourSpotlight = initialResult.data.spotlights.find(h => h._id === testData.horseId);
                    if (!ourSpotlight) {
                        throw new Error('Our spotlighted listing not found in featured listings');
                    }

                    // Verify premium listings section exists
                    if (!Array.isArray(initialResult.data.premiumListings)) {
                        throw new Error('Premium listings not returned as array');
                    }

                    // Our listing should be in premium listings since we have Royal Stallion
                    const ourPremium = initialResult.data.premiumListings.find(h => h._id === testData.horseId);
                    if (!ourPremium) {
                        throw new Error('Our listing not found in premium listings despite Royal Stallion subscription');
                    }

                    // Verify listing details in featured response
                    const requiredFields = ['name', 'breed', 'price', 'images'];
                    requiredFields.forEach(field => {
                        if (!ourSpotlight[field]) {
                            throw new Error(`Featured listing missing required field: ${field}`);
                        }
                    });

                    // Verify seller details are populated
                    if (!ourSpotlight.seller || !ourSpotlight.seller.businessName) {
                        throw new Error('Seller details not populated in featured listing');
                    }

                    debug('Featured listings test passed successfully');
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