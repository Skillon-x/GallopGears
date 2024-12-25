const crypto = require('crypto');
const dotenv = require('dotenv');
const { log, makeRequest, runTests } = require('./test.utils');

dotenv.config();

let testData = {
    userToken: '',
    sellerToken: '',
    orderId: '',
    transactionId: '',
    paymentId: ''
};

// Test configuration
const config = {
    royalSeller: {
        email: 'royal@test.com',
        password: 'seller123',
        name: 'Royal Stables',
        role: 'user'
    },
    starterSeller: {
        email: 'starter@test.com',
        password: 'seller123',
        name: 'Starter Stables',
        role: 'user'
    }
};

// Test suites
const testSuites = [
    {
        name: 'Payment Integration Tests',
        tests: [
            {
                name: 'Register Test User',
                run: async () => {
                    const result = await makeRequest('POST', '/auth/register', {
                        name: 'Payment Test User',
                        email: 'payment@test.com',
                        password: 'test123',
                        role: 'user'
                    });
                    if (!result.success || !result.token) {
                        throw new Error('Failed to register test user');
                    }
                    testData.userToken = result.token;
                }
            },
            {
                name: 'Get Razorpay Key',
                run: async () => {
                    const result = await makeRequest('GET', '/payments/key');
                    if (!result.success || !result.key) {
                        throw new Error('Failed to get Razorpay key');
                    }
                }
            },
            {
                name: 'Create Payment Order',
                run: async () => {
                    const result = await makeRequest('POST', '/payments/create', {
                        amount: 9999,
                        currency: 'INR',
                        notes: {
                            type: 'subscription',
                            package: 'Royal Stallion'
                        }
                    }, testData.userToken);

                    if (!result.success || !result.order || !result.order.id) {
                        throw new Error('Failed to create payment order');
                    }

                    testData.orderId = result.order.id;
                    testData.transactionId = result.transaction;
                }
            },
            {
                name: 'Create Test Payment',
                run: async () => {
                    const result = await makeRequest('POST', '/payments/test', {
                        amount: 500,
                        currency: 'INR'
                    }, testData.userToken);

                    if (!result.success || !result.testData || !result.testData.order_id) {
                        throw new Error('Failed to create test payment');
                    }

                    // Store test payment data
                    testData.testOrderId = result.testData.order_id;
                }
            },
            {
                name: 'Verify Payment',
                run: async () => {
                    // Generate test payment data
                    const paymentId = 'pay_' + Date.now();
                    const orderId = testData.orderId;
                    const signature = require('crypto')
                        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                        .update(orderId + '|' + paymentId)
                        .digest('hex');

                    const result = await makeRequest('POST', '/payments/verify', {
                        razorpay_payment_id: paymentId,
                        razorpay_order_id: orderId,
                        razorpay_signature: signature
                    }, testData.userToken);

                    if (!result.success || !result.transaction) {
                        throw new Error('Failed to verify payment');
                    }

                    testData.paymentId = paymentId;
                }
            },
            {
                name: 'Get Payment Details',
                run: async () => {
                    // Skip in test environment as we can't fetch actual payment details
                    if (process.env.NODE_ENV === 'test') {
                        return;
                    }

                    const result = await makeRequest('GET', `/payments/${testData.paymentId}`, null, testData.userToken);
                    if (!result.success || !result.payment) {
                        throw new Error('Failed to get payment details');
                    }
                }
            },
            {
                name: 'Verify Transaction Status',
                run: async () => {
                    const result = await makeRequest('GET', `/transactions/${testData.transactionId}`, null, testData.userToken);
                    if (!result.success || !result.transaction || result.transaction.status !== 'completed') {
                        throw new Error('Transaction status not updated correctly');
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