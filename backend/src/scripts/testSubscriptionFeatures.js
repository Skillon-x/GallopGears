const dotenv = require('dotenv');
const { log, makeRequest, runTests } = require('./test.utils');

dotenv.config();

let testData = {
    sellerToken: '',
    royalSellerToken: '',
    gallopSellerToken: '',
    trotSellerToken: '',
    freeSellerToken: '',
    userToken: ''
};

// Test configuration
const config = {
    royalSeller: {
        email: 'royal@test.com',
        password: 'seller123',
        name: 'Royal Stables',
        role: 'user'
    },
    gallopSeller: {
        email: 'gallop@test.com',
        password: 'seller123',
        name: 'Gallop Stables',
        role: 'user'
    },
    trotSeller: {
        email: 'trot@test.com',
        password: 'seller123',
        name: 'Trot Stables',
        role: 'user'
    },
    freeSeller: {
        email: 'free@test.com',
        password: 'seller123',
        name: 'Free Stables',
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
        name: 'User Registration and Profile Creation',
        tests: [
            {
                name: 'Register Royal Stallion Seller',
                run: async () => {
                    // Register as user first
                    const userResult = await makeRequest('POST', '/auth/register', config.royalSeller);
                    testData.royalSellerToken = userResult.token;

                    // Create seller profile with required fields
                    const sellerResult = await makeRequest('POST', '/sellers/profile', {
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
                        }
                    }, userResult.token);

                    // Verify subscription is inactive
                    if (!sellerResult.seller.subscription || 
                        sellerResult.seller.subscription.status !== 'inactive' || 
                        sellerResult.seller.subscription.plan !== null) {
                        throw new Error('Initial subscription should be inactive with no plan type');
                    }
                }
            },
            {
                name: 'Register Gallop Seller',
                run: async () => {
                    const userResult = await makeRequest('POST', '/auth/register', config.gallopSeller);
                    testData.gallopSellerToken = userResult.token;

                    const sellerResult = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Gallop Stables',
                        description: 'Standard horse stables',
                        location: {
                            state: 'Karnataka',
                            city: 'Bangalore',
                            pincode: '560001'
                        },
                        contactDetails: {
                            phone: '9876543211',
                            email: 'gallop@test.com',
                            whatsapp: '9876543211'
                        }
                    }, userResult.token);

                    // Verify subscription is inactive
                    if (!sellerResult.seller.subscription || 
                        sellerResult.seller.subscription.status !== 'inactive' || 
                        sellerResult.seller.subscription.plan !== null) {
                        throw new Error('Initial subscription should be inactive with no plan type');
                    }
                }
            },
            {
                name: 'Register Trot Seller',
                run: async () => {
                    const userResult = await makeRequest('POST', '/auth/register', config.trotSeller);
                    testData.trotSellerToken = userResult.token;

                    const sellerResult = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Trot Stables',
                        description: 'Basic horse stables',
                        location: {
                            state: 'Tamil Nadu',
                            city: 'Chennai',
                            pincode: '600001'
                        },
                        contactDetails: {
                            phone: '9876543212',
                            email: 'trot@test.com',
                            whatsapp: '9876543212'
                        }
                    }, userResult.token);

                    // Verify subscription is inactive
                    if (!sellerResult.seller.subscription || 
                        sellerResult.seller.subscription.status !== 'inactive' || 
                        sellerResult.seller.subscription.plan !== null) {
                        throw new Error('Initial subscription should be inactive with no plan type');
                    }
                }
            },
            {
                name: 'Register Regular User',
                run: async () => {
                    const result = await makeRequest('POST', '/auth/register', config.user);
                    testData.userToken = result.token;
                }
            },
            {
                name: 'Register Free Plan Seller',
                run: async () => {
                    // Register as user first
                    const userResult = await makeRequest('POST', '/auth/register', config.freeSeller);
                    testData.freeSellerToken = userResult.token;

                    // Create seller profile with required fields
                    const sellerResult = await makeRequest('POST', '/sellers/profile', {
                        businessName: 'Free Stables',
                        description: 'Basic horse stables',
                        location: {
                            state: 'Gujarat',
                            city: 'Ahmedabad',
                            pincode: '380001'
                        },
                        contactDetails: {
                            phone: '9876543213',
                            email: 'free@test.com',
                            whatsapp: '9876543213'
                        }
                    }, userResult.token);

                    // Verify subscription is inactive
                    if (!sellerResult.seller.subscription || 
                        sellerResult.seller.subscription.status !== 'inactive' || 
                        sellerResult.seller.subscription.plan !== null) {
                        throw new Error('Initial subscription should be inactive with no plan type');
                    }
                }
            }
        ]
    },
    {
        name: 'Subscription Plans',
        tests: [
            {
                name: 'Get Available Plans',
                run: async () => {
                    const result = await makeRequest('GET', '/sellers/plans');
                    if (!result.success || !Array.isArray(result.plans)) {
                        throw new Error('Invalid subscription plans response');
                    }
                }
            },
            {
                name: 'Subscribe to Royal Stallion Plan',
                run: async () => {
                    // First create order
                    const orderResult = await makeRequest('POST', '/sellers/subscribe/create-order', {
                        package: 'Royal Stallion',
                        duration: 30,
                        amount: 9999
                    }, testData.royalSellerToken);

                    if (!orderResult.success || !orderResult.order) {
                        throw new Error('Failed to create Razorpay order');
                    }

                    // Simulate successful payment
                    const paymentResult = await makeRequest('POST', '/sellers/subscribe/verify-payment', {
                        razorpay_order_id: orderResult.order.id,
                        razorpay_payment_id: 'pay_' + Math.random().toString(36).substr(2, 9),
                        razorpay_signature: 'test_signature',
                        package: 'Royal Stallion',
                        duration: 30,
                        amount: 9999
                    }, testData.royalSellerToken);

                    if (!paymentResult.success || !paymentResult.subscription || !paymentResult.transaction) {
                        throw new Error('Failed to verify Royal Stallion plan payment');
                    }

                    // Verify subscription is now active
                    const subResult = await makeRequest('GET', '/sellers/subscription', null, testData.royalSellerToken);
                    if (!subResult.success || 
                        !subResult.subscription || 
                        subResult.subscription.status !== 'active' || 
                        subResult.subscription.plan !== 'Royal Stallion') {
                        throw new Error('Subscription should be active with Royal Stallion plan');
                    }
                }
            },
            {
                name: 'Subscribe to Gallop Plan',
                run: async () => {
                    // First create order
                    const orderResult = await makeRequest('POST', '/sellers/subscribe/create-order', {
                        package: 'Gallop',
                        duration: 30,
                        amount: 4999
                    }, testData.gallopSellerToken);

                    if (!orderResult.success || !orderResult.order) {
                        throw new Error('Failed to create Razorpay order');
                    }

                    // Simulate successful payment
                    const paymentResult = await makeRequest('POST', '/sellers/subscribe/verify-payment', {
                        razorpay_order_id: orderResult.order.id,
                        razorpay_payment_id: 'pay_' + Math.random().toString(36).substr(2, 9),
                        razorpay_signature: 'test_signature',
                        package: 'Gallop',
                        duration: 30,
                        amount: 4999
                    }, testData.gallopSellerToken);

                    if (!paymentResult.success || !paymentResult.subscription || !paymentResult.transaction) {
                        throw new Error('Failed to verify Gallop plan payment');
                    }

                    // Verify subscription is now active
                    const subResult = await makeRequest('GET', '/sellers/subscription', null, testData.gallopSellerToken);
                    if (!subResult.success || 
                        !subResult.subscription || 
                        subResult.subscription.status !== 'active' || 
                        subResult.subscription.plan !== 'Gallop') {
                        throw new Error('Subscription should be active with Gallop plan');
                    }
                }
            },
            {
                name: 'Subscribe to Trot Plan',
                run: async () => {
                    // First create order
                    const orderResult = await makeRequest('POST', '/sellers/subscribe/create-order', {
                        package: 'Trot',
                        duration: 30,
                        amount: 1999
                    }, testData.trotSellerToken);

                    if (!orderResult.success || !orderResult.order) {
                        throw new Error('Failed to create Razorpay order');
                    }

                    // Simulate successful payment
                    const paymentResult = await makeRequest('POST', '/sellers/subscribe/verify-payment', {
                        razorpay_order_id: orderResult.order.id,
                        razorpay_payment_id: 'pay_' + Math.random().toString(36).substr(2, 9),
                        razorpay_signature: 'test_signature',
                        package: 'Trot',
                        duration: 30,
                        amount: 1999
                    }, testData.trotSellerToken);

                    if (!paymentResult.success || !paymentResult.subscription || !paymentResult.transaction) {
                        throw new Error('Failed to verify Trot plan payment');
                    }

                    // Verify subscription is now active
                    const subResult = await makeRequest('GET', '/sellers/subscription', null, testData.trotSellerToken);
                    if (!subResult.success || 
                        !subResult.subscription || 
                        subResult.subscription.status !== 'active' || 
                        subResult.subscription.plan !== 'Trot') {
                        throw new Error('Subscription should be active with Trot plan');
                    }
                }
            },
            {
                name: 'Subscribe to Free Plan',
                run: async () => {
                    // First verify the plan exists in available plans
                    const plansResult = await makeRequest('GET', '/sellers/plans');
                    const freePlan = plansResult.plans.find(p => p.name === 'Free');
                    if (!freePlan) {
                        throw new Error('Free plan not found in available plans');
                    }

                    // For Free plan, directly subscribe without payment
                    const subscriptionResult = await makeRequest('POST', '/sellers/subscribe', {
                        package: 'Free',
                        duration: 7,
                        amount: 0
                    }, testData.freeSellerToken);

                    if (!subscriptionResult.success || !subscriptionResult.subscription) {
                        throw new Error('Failed to activate Free plan');
                    }

                    // Verify subscription details
                    const subResult = await makeRequest('GET', '/sellers/subscription', null, testData.freeSellerToken);
                    if (!subResult.success || 
                        !subResult.subscription || 
                        subResult.subscription.status !== 'active' || 
                        subResult.subscription.plan !== 'Free' ||
                        !subResult.subscription.startDate ||
                        !subResult.subscription.endDate) {
                        throw new Error('Subscription details are incorrect');
                    }

                    // Verify subscription duration (7 days)
                    const startDate = new Date(subResult.subscription.startDate);
                    const endDate = new Date(subResult.subscription.endDate);
                    const durationInDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
                    if (durationInDays !== 7) {
                        throw new Error(`Incorrect subscription duration: ${durationInDays} days instead of 7 days`);
                    }

                    // Verify transaction was created
                    if (!subscriptionResult.transaction || 
                        subscriptionResult.transaction.amount !== 0 ||
                        subscriptionResult.transaction.status !== 'completed' ||
                        subscriptionResult.transaction.subscriptionDetails.duration !== 7) {
                        throw new Error('Transaction details are incorrect');
                    }
                }
            }
        ]
    },
    {
        name: 'Subscription Features',
        tests: [
            {
                name: 'Verify Royal Stallion Features',
                run: async () => {
                    const result = await makeRequest('GET', '/sellers/subscription', null, testData.royalSellerToken);
                    if (!result.success || !result.subscription) {
                        throw new Error('Failed to get Royal Stallion subscription');
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
                }
            },
            {
                name: 'Verify Trot Features',
                run: async () => {
                    const result = await makeRequest('GET', '/sellers/subscription', null, testData.trotSellerToken);
                    if (!result.success || !result.subscription) {
                        throw new Error('Failed to get Trot subscription');
                    }
                }
            },
            {
                name: 'Verify Free Plan Features',
                run: async () => {
                    const result = await makeRequest('GET', '/sellers/subscription', null, testData.freeSellerToken);
                    if (!result.success || !result.subscription) {
                        throw new Error('Failed to get Free plan subscription');
                    }

                    // Verify subscription status and type
                    if (result.subscription.status !== 'active' || 
                        result.subscription.plan !== 'Free') {
                        throw new Error('Subscription status or type is incorrect');
                    }

                    // Verify specific Free plan features
                    const features = result.subscription.features;
                    
                    // Core features
                    if (features.maxPhotos !== 1) throw new Error('Incorrect photo limit');
                    if (features.maxListings !== 1) throw new Error('Incorrect listing limit');
                    if (features.listingDuration !== 7) throw new Error('Incorrect listing duration');
                    if (features.verificationLevel !== 'basic') throw new Error('Incorrect verification level');
                    
                    // Premium features should be disabled
                    if (features.virtualStableTour !== false) throw new Error('Virtual stable tour should be disabled');
                    if (features.analytics !== false) throw new Error('Analytics should be disabled');
                    if (features.homepageSpotlight !== 0) throw new Error('Homepage spotlight should be 0');
                    if (features.featuredListingBoosts.count !== 0) throw new Error('Featured listing boosts count should be 0');
                    if (features.featuredListingBoosts.duration !== 0) throw new Error('Featured listing boosts duration should be 0');
                    if (features.priorityPlacement !== false) throw new Error('Priority placement should be disabled');
                    
                    // Basic features
                    if (features.searchPlacement !== 'basic') throw new Error('Incorrect search placement');
                    if (features.socialMediaSharing !== false) throw new Error('Social media sharing should be disabled');
                    if (features.seriousBuyerAccess !== false) throw new Error('Serious buyer access should be disabled');
                    
                    // Verify badges
                    if (!Array.isArray(features.badges) || 
                        features.badges.length !== 1 || 
                        !features.badges.includes('Free User')) {
                        throw new Error('Incorrect badges');
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