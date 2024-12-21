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
    sellerId: '',
    royalToken: '',
    royalSellerToken: '',
    royalSellerId: '',
    royalOrderId: '',
    gallopToken: '',
    gallopSellerToken: '',
    gallopSellerId: '',
    gallopOrderId: '',
    trotToken: '',
    trotSellerToken: '',
    trotSellerId: '',
    trotOrderId: ''
};

// Subscription features by plan
const SUBSCRIPTION_FEATURES = {
    'Royal Stallion': {
        maxPhotos: 20,
        maxListings: 9999,
        listingDuration: 90,
        verificationLevel: 'premium',
        virtualStableTour: true,
        analytics: true,
        homepageSpotlight: 5,
        featuredListingBoosts: {
            count: 3,
            duration: 7
        },
        priorityPlacement: true,
        badges: ['Top Seller', 'Premium Stable'],
        searchPlacement: 'premium',
        socialMediaSharing: true,
        seriousBuyerAccess: true
    },
    'Gallop': {
        maxPhotos: 10,
        maxListings: 10,
        listingDuration: 60,
        verificationLevel: 'basic',
        virtualStableTour: false,
        analytics: true,
        homepageSpotlight: 2,
        featuredListingBoosts: {
            count: 1,
            duration: 5
        },
        priorityPlacement: false,
        badges: ['Verified Seller'],
        searchPlacement: 'basic',
        socialMediaSharing: true,
        seriousBuyerAccess: false
    },
    'Trot': {
        maxPhotos: 5,
        maxListings: 5,
        listingDuration: 30,
        verificationLevel: 'basic',
        virtualStableTour: false,
        analytics: false,
        homepageSpotlight: 0,
        featuredListingBoosts: {
            count: 0,
            duration: 0
        },
        priorityPlacement: false,
        badges: ['Basic Seller'],
        searchPlacement: 'basic',
        socialMediaSharing: false,
        seriousBuyerAccess: false
    }
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
                    debug('Using token:', testData.userToken);
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
                        }
                    }, testData.userToken);

                    debug('Seller profile creation response:', result);
                    if (!result.success) {
                        throw new Error('Failed to create seller profile');
                    }

                    // Verify subscription is inactive with default features
                    if (!result.seller.subscription || 
                        result.seller.subscription.status !== 'inactive' || 
                        result.seller.subscription.plan !== null ||
                        !result.seller.subscription.features) {
                        throw new Error('Invalid initial subscription state');
                    }

                    // Verify default features
                    const features = result.seller.subscription.features;
                    if (features.maxPhotos !== 0 ||
                        features.maxListings !== 0 ||
                        features.listingDuration !== 0 ||
                        features.verificationLevel !== 'none' ||
                        features.virtualStableTour !== false ||
                        features.analytics !== false ||
                        features.homepageSpotlight !== 0 ||
                        features.featuredListingBoosts.count !== 0 ||
                        features.featuredListingBoosts.duration !== 0 ||
                        features.priorityPlacement !== false ||
                        features.searchPlacement !== 'none' ||
                        features.socialMediaSharing !== false ||
                        features.seriousBuyerAccess !== false) {
                        throw new Error('Invalid initial subscription features');
                    }

                    // Store the new token with seller role
                    testData.sellerToken = result.token;
                    testData.sellerId = result.seller._id;
                    debug('Updated seller token and ID:', { 
                        token: testData.sellerToken,
                        sellerId: testData.sellerId 
                    });
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
                name: 'Subscribe to Trot Plan',
                run: async () => {
                    const result = await makeRequest('POST', '/sellers/subscribe', {
                        package: 'Trot',
                        duration: 30
                    }, testData.sellerToken);

                    if (!result.success || !result.subscription) {
                        throw new Error('Failed to create subscription');
                    }

                    // Verify subscription features are updated
                    const features = result.subscription.features;
                    const expectedFeatures = SUBSCRIPTION_FEATURES['Trot'];
                    
                    if (features.maxPhotos !== expectedFeatures.maxPhotos ||
                        features.maxListings !== expectedFeatures.maxListings ||
                        features.listingDuration !== expectedFeatures.listingDuration ||
                        features.verificationLevel !== expectedFeatures.verificationLevel ||
                        features.virtualStableTour !== expectedFeatures.virtualStableTour ||
                        features.analytics !== expectedFeatures.analytics ||
                        features.homepageSpotlight !== expectedFeatures.homepageSpotlight ||
                        features.featuredListingBoosts.count !== expectedFeatures.featuredListingBoosts.count ||
                        features.featuredListingBoosts.duration !== expectedFeatures.featuredListingBoosts.duration ||
                        features.priorityPlacement !== expectedFeatures.priorityPlacement ||
                        features.searchPlacement !== expectedFeatures.searchPlacement ||
                        features.socialMediaSharing !== expectedFeatures.socialMediaSharing ||
                        features.seriousBuyerAccess !== expectedFeatures.seriousBuyerAccess) {
                        throw new Error('Subscription features not properly updated');
                    }

                    testData.subscriptionId = result.subscription._id;
                }
            },
            {
                name: 'Verify Subscription Status',
                run: async () => {
                    const result = await makeRequest('GET', '/sellers/subscription', null, testData.sellerToken);
                    
                    if (!result.success || !result.subscription) {
                        throw new Error('Failed to verify subscription');
                    }

                    // Verify subscription is active with correct plan
                    if (result.subscription.status !== 'active' || 
                        result.subscription.plan !== 'Trot') {
                        throw new Error('Invalid subscription status or plan');
                    }

                    // Verify essential features match Trot plan
                    const features = result.subscription.features;
                    const expectedFeatures = SUBSCRIPTION_FEATURES['Trot'];
                    
                    const essentialFeatures = [
                        'maxPhotos',
                        'maxListings',
                        'listingDuration',
                        'verificationLevel',
                        'virtualStableTour',
                        'analytics',
                        'homepageSpotlight',
                        'priorityPlacement',
                        'searchPlacement',
                        'socialMediaSharing',
                        'seriousBuyerAccess'
                    ];

                    for (const feature of essentialFeatures) {
                        if (features[feature] !== expectedFeatures[feature]) {
                            throw new Error(`Feature mismatch: ${feature} - Expected ${expectedFeatures[feature]}, got ${features[feature]}`);
                        }
                    }

                    // Verify featuredListingBoosts
                    if (features.featuredListingBoosts.count !== expectedFeatures.featuredListingBoosts.count ||
                        features.featuredListingBoosts.duration !== expectedFeatures.featuredListingBoosts.duration) {
                        throw new Error('Featured listing boosts do not match');
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
                name: 'Get Seller Profile',
                run: async () => {
                    debug('Fetching seller profile');
                    const result = await makeRequest('GET', '/sellers/me', null, testData.sellerToken);
                    console.log(result);
                    debug('Seller profile response:', result);
                    if (!result.success || !result.seller) {
                        throw new Error('Failed to get seller profile');
                    }

                    // Verify profile structure
                    const { seller } = result;
                    if (!seller.businessName || !seller.contactDetails || !seller.location || !seller.subscription) {
                        throw new Error('Invalid seller profile structure');
                    }

                    // Verify contact details
                    if (!seller.contactDetails.email || !seller.contactDetails.phone) {
                        throw new Error('Missing required contact details');
                    }

                    // Verify location
                    if (!seller.location.state || !seller.location.city || !seller.location.pincode) {
                        throw new Error('Missing required location details');
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
    },
    {
        name: 'Royal Stallion Subscription Journey',
        tests: [
            {
                name: 'Register Royal Stallion Seller',
                run: async () => {
                    debug('Registering Royal Stallion seller');
                    const result = await makeRequest('POST', '/auth/register', {
                        name: 'Royal Stallion Seller',
                        email: 'royal@seller.com',
                        password: 'royal123',
                        role: 'user'
                    });

                    if (!result.success || !result.token) {
                        throw new Error('Failed to register Royal Stallion seller');
                    }
                    testData.royalToken = result.token;
                }
            },
            {
                name: 'Create Royal Stallion Profile',
                run: async () => {
                    debug('Creating Royal Stallion profile');
                    const result = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Royal Stallion Stables',
                        description: 'Premium horse stables for elite horses',
                        location: {
                            state: 'Maharashtra',
                            city: 'Mumbai',
                            pincode: '400001'
                        },
                        contactDetails: {
                            phone: '9876543210',
                            email: 'royal@seller.com',
                            whatsapp: '9876543210'
                        }
                    }, testData.royalToken);

                    if (!result.success) {
                        throw new Error('Failed to create Royal Stallion profile');
                    }
                    testData.royalSellerToken = result.token;
                    testData.royalSellerId = result.seller._id;
                }
            },
            {
                name: 'Create Razorpay Order for Royal Stallion',
                run: async () => {
                    const result = await makeRequest('POST', '/sellers/subscribe/create-order', {
                        package: 'Royal Stallion',
                        duration: 30,
                        amount: 9999
                    }, testData.royalSellerToken);

                    if (!result.success || !result.order) {
                        throw new Error('Failed to create Razorpay order for Royal Stallion');
                    }
                    testData.royalOrderId = result.order.id;
                }
            },
            {
                name: 'Verify Royal Stallion Payment',
                run: async () => {
                    const result = await makeRequest('POST', '/sellers/subscribe/verify-payment', {
                        razorpay_order_id: testData.royalOrderId,
                        razorpay_payment_id: 'test_royal_pay_' + Date.now(),
                        razorpay_signature: 'test_signature',
                        package: 'Royal Stallion',
                        duration: 30,
                        amount: 9999
                    }, testData.royalSellerToken);

                    if (!result.success || !result.subscription) {
                        throw new Error('Failed to verify Royal Stallion payment');
                    }

                    // Verify Royal Stallion features
                    const features = result.subscription.features;
                    const expectedFeatures = SUBSCRIPTION_FEATURES['Royal Stallion'];
                    
                    if (features.maxPhotos !== expectedFeatures.maxPhotos ||
                        features.maxListings !== expectedFeatures.maxListings ||
                        features.listingDuration !== expectedFeatures.listingDuration ||
                        features.verificationLevel !== expectedFeatures.verificationLevel ||
                        features.virtualStableTour !== expectedFeatures.virtualStableTour ||
                        features.analytics !== expectedFeatures.analytics ||
                        features.homepageSpotlight !== expectedFeatures.homepageSpotlight ||
                        features.priorityPlacement !== expectedFeatures.priorityPlacement ||
                        features.searchPlacement !== expectedFeatures.searchPlacement ||
                        features.socialMediaSharing !== expectedFeatures.socialMediaSharing ||
                        features.seriousBuyerAccess !== expectedFeatures.seriousBuyerAccess) {
                        throw new Error('Royal Stallion features not properly set');
                    }
                }
            }
        ]
    },
    {
        name: 'Gallop Subscription Journey',
        tests: [
            {
                name: 'Register Gallop Seller',
                run: async () => {
                    debug('Registering Gallop seller');
                    const result = await makeRequest('POST', '/auth/register', {
                        name: 'Gallop Seller',
                        email: 'gallop@seller.com',
                        password: 'gallop123',
                        role: 'user'
                    });

                    if (!result.success || !result.token) {
                        throw new Error('Failed to register Gallop seller');
                    }
                    testData.gallopToken = result.token;
                }
            },
            {
                name: 'Create Gallop Profile',
                run: async () => {
                    debug('Creating Gallop profile');
                    const result = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Gallop Stables',
                        description: 'Professional horse stables',
                        location: {
                            state: 'Maharashtra',
                            city: 'Pune',
                            pincode: '411001'
                        },
                        contactDetails: {
                            phone: '9876543211',
                            email: 'gallop@seller.com',
                            whatsapp: '9876543211'
                        }
                    }, testData.gallopToken);

                    if (!result.success) {
                        throw new Error('Failed to create Gallop profile');
                    }
                    testData.gallopSellerToken = result.token;
                    testData.gallopSellerId = result.seller._id;
                }
            },
            {
                name: 'Create Razorpay Order for Gallop',
                run: async () => {
                    const result = await makeRequest('POST', '/sellers/subscribe/create-order', {
                        package: 'Gallop',
                        duration: 30,
                        amount: 4999
                    }, testData.gallopSellerToken);

                    if (!result.success || !result.order) {
                        throw new Error('Failed to create Razorpay order for Gallop');
                    }
                    testData.gallopOrderId = result.order.id;
                }
            },
            {
                name: 'Verify Gallop Payment',
                run: async () => {
                    const result = await makeRequest('POST', '/sellers/subscribe/verify-payment', {
                        razorpay_order_id: testData.gallopOrderId,
                        razorpay_payment_id: 'test_gallop_pay_' + Date.now(),
                        razorpay_signature: 'test_signature',
                        package: 'Gallop',
                        duration: 30,
                        amount: 4999
                    }, testData.gallopSellerToken);

                    if (!result.success || !result.subscription) {
                        throw new Error('Failed to verify Gallop payment');
                    }

                    // Verify Gallop features
                    const features = result.subscription.features;
                    const expectedFeatures = SUBSCRIPTION_FEATURES['Gallop'];
                    
                    if (features.maxPhotos !== expectedFeatures.maxPhotos ||
                        features.maxListings !== expectedFeatures.maxListings ||
                        features.listingDuration !== expectedFeatures.listingDuration ||
                        features.verificationLevel !== expectedFeatures.verificationLevel ||
                        features.virtualStableTour !== expectedFeatures.virtualStableTour ||
                        features.analytics !== expectedFeatures.analytics ||
                        features.homepageSpotlight !== expectedFeatures.homepageSpotlight ||
                        features.priorityPlacement !== expectedFeatures.priorityPlacement ||
                        features.searchPlacement !== expectedFeatures.searchPlacement ||
                        features.socialMediaSharing !== expectedFeatures.socialMediaSharing ||
                        features.seriousBuyerAccess !== expectedFeatures.seriousBuyerAccess) {
                        throw new Error('Gallop features not properly set');
                    }
                }
            }
        ]
    },
    {
        name: 'Trot Subscription Journey',
        tests: [
            {
                name: 'Register Trot Seller',
                run: async () => {
                    debug('Registering Trot seller');
                    const result = await makeRequest('POST', '/auth/register', {
                        name: 'Trot Seller',
                        email: 'trot@seller.com',
                        password: 'trot123',
                        role: 'user'
                    });

                    if (!result.success || !result.token) {
                        throw new Error('Failed to register Trot seller');
                    }
                    testData.trotToken = result.token;
                }
            },
            {
                name: 'Create Trot Profile',
                run: async () => {
                    debug('Creating Trot profile');
                    const result = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Trot Stables',
                        description: 'Basic horse stables',
                        location: {
                            state: 'Maharashtra',
                            city: 'Nashik',
                            pincode: '422001'
                        },
                        contactDetails: {
                            phone: '9876543212',
                            email: 'trot@seller.com',
                            whatsapp: '9876543212'
                        }
                    }, testData.trotToken);

                    if (!result.success) {
                        throw new Error('Failed to create Trot profile');
                    }
                    testData.trotSellerToken = result.token;
                    testData.trotSellerId = result.seller._id;
                }
            },
            {
                name: 'Create Razorpay Order for Trot',
                run: async () => {
                    const result = await makeRequest('POST', '/sellers/subscribe/create-order', {
                        package: 'Trot',
                        duration: 30,
                        amount: 1999
                    }, testData.trotSellerToken);

                    if (!result.success || !result.order) {
                        throw new Error('Failed to create Razorpay order for Trot');
                    }
                    testData.trotOrderId = result.order.id;
                }
            },
            {
                name: 'Verify Trot Payment',
                run: async () => {
                    const result = await makeRequest('POST', '/sellers/subscribe/verify-payment', {
                        razorpay_order_id: testData.trotOrderId,
                        razorpay_payment_id: 'test_trot_pay_' + Date.now(),
                        razorpay_signature: 'test_signature',
                        package: 'Trot',
                        duration: 30,
                        amount: 1999
                    }, testData.trotSellerToken);

                    if (!result.success || !result.subscription) {
                        throw new Error('Failed to verify Trot payment');
                    }

                    // Verify Trot features
                    const features = result.subscription.features;
                    const expectedFeatures = SUBSCRIPTION_FEATURES['Trot'];
                    
                    if (features.maxPhotos !== expectedFeatures.maxPhotos ||
                        features.maxListings !== expectedFeatures.maxListings ||
                        features.listingDuration !== expectedFeatures.listingDuration ||
                        features.verificationLevel !== expectedFeatures.verificationLevel ||
                        features.virtualStableTour !== expectedFeatures.virtualStableTour ||
                        features.analytics !== expectedFeatures.analytics ||
                        features.homepageSpotlight !== expectedFeatures.homepageSpotlight ||
                        features.priorityPlacement !== expectedFeatures.priorityPlacement ||
                        features.searchPlacement !== expectedFeatures.searchPlacement ||
                        features.socialMediaSharing !== expectedFeatures.socialMediaSharing ||
                        features.seriousBuyerAccess !== expectedFeatures.seriousBuyerAccess) {
                        throw new Error('Trot features not properly set');
                    }
                }
            }
        ]
    },
    {
        name: 'Subscription Feature Verification',
        tests: [
            {
                name: 'Verify Royal Stallion Features',
                run: async () => {
                    const result = await makeRequest('GET', '/sellers/subscription', null, testData.royalSellerToken);
                    if (!result.success || !result.subscription) {
                        throw new Error('Failed to get Royal Stallion subscription');
                    }

                    const features = result.subscription.features;
                    if (features.maxListings !== 9999 ||
                        features.maxPhotos !== 20 ||
                        features.listingDuration !== 90 ||
                        !features.virtualStableTour ||
                        !features.analytics ||
                        features.homepageSpotlight !== 5 ||
                        !features.priorityPlacement ||
                        features.searchPlacement !== 'premium' ||
                        !features.socialMediaSharing ||
                        !features.seriousBuyerAccess) {
                        throw new Error('Invalid Royal Stallion features');
                    }
                }
            },
            {
                name: 'Verify Gallop Features',
                run: async () => {
                    const result = await makeRequest('GET', '/sellers/subscription', null, testData.gallopSellerToken);
                    if (!result.success || !result.subscription) {
                        throw new Error('Failed to get Gallop subscription');
                    }

                    const features = result.subscription.features;
                    if (features.maxListings !== 10 ||
                        features.maxPhotos !== 10 ||
                        features.listingDuration !== 60 ||
                        features.virtualStableTour !== false ||
                        !features.analytics ||
                        features.homepageSpotlight !== 2 ||
                        features.priorityPlacement !== false ||
                        features.searchPlacement !== 'basic' ||
                        !features.socialMediaSharing ||
                        features.seriousBuyerAccess !== false) {
                        throw new Error('Invalid Gallop features');
                    }
                }
            },
            {
                name: 'Verify Trot Features',
                run: async () => {
                    const result = await makeRequest('GET', '/sellers/subscription', null, testData.trotSellerToken);
                    if (!result.success || !result.subscription) {
                        throw new Error('Failed to get Trot subscription');
                    }

                    const features = result.subscription.features;
                    if (features.maxListings !== 5 ||
                        features.maxPhotos !== 5 ||
                        features.listingDuration !== 30 ||
                        features.virtualStableTour !== false ||
                        features.analytics !== false ||
                        features.homepageSpotlight !== 0 ||
                        features.priorityPlacement !== false ||
                        features.searchPlacement !== 'basic' ||
                        features.socialMediaSharing !== false ||
                        features.seriousBuyerAccess !== false) {
                        throw new Error('Invalid Trot features');
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