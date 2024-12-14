const axios = require('axios');
const crypto = require('crypto');

// Configuration
const API_URL = 'http://localhost:5000/api';
let orderData = null;
let paymentData = null;

// Simulate the entire payment flow
async function simulatePaymentFlow() {
    try {
        console.log('🚀 Starting payment simulation...\n');

        // Step 1: Register a test user and get token
        console.log('Step 1: Registering test user...');
        const authResponse = await axios.post(`${API_URL}/auth/register`, {
            name: 'Payment Test User',
            email: `test${Date.now()}@example.com`,
            password: 'test123',
            role: 'user'
        });
        const token = authResponse.data.token;
        console.log('✅ User registered successfully\n');

        // Step 2: Create a payment order
        console.log('Step 2: Creating payment order...');
        const orderResponse = await axios.post(
            `${API_URL}/payments/create`,
            {
                amount: 999,
                currency: 'INR',
                notes: {
                    type: 'subscription',
                    package: 'premium'
                }
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        orderData = orderResponse.data;
        console.log('✅ Payment order created:', orderData.order.id, '\n');

        // Step 3: Simulate payment success
        console.log('Step 3: Simulating payment...');
        const paymentId = 'pay_' + Date.now();
        const orderId = orderData.order.id;
        
        // Generate signature as Razorpay would
        const signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(orderId + '|' + paymentId)
            .digest('hex');

        // Verify payment
        console.log('Step 4: Verifying payment...');
        const verifyResponse = await axios.post(
            `${API_URL}/payments/verify`,
            {
                razorpay_payment_id: paymentId,
                razorpay_order_id: orderId,
                razorpay_signature: signature
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        paymentData = verifyResponse.data;
        console.log('✅ Payment verified successfully\n');

        // Step 5: Get transaction details
        console.log('Step 5: Getting transaction details...');
        const transactionResponse = await axios.get(
            `${API_URL}/transactions/${paymentData.transaction._id}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        console.log('✅ Transaction details:', transactionResponse.data.transaction, '\n');

        console.log('🎉 Payment simulation completed successfully!');
        console.log('Summary:');
        console.log('- Order ID:', orderData.order.id);
        console.log('- Payment ID:', paymentId);
        console.log('- Amount:', orderData.order.amount/100, 'INR');
        console.log('- Status:', paymentData.transaction.status);

    } catch (error) {
        console.error('❌ Error in payment simulation:', error.response?.data || error.message);
    }
}

// Run the simulation
simulatePaymentFlow(); 