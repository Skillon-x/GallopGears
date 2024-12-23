import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const RazorpayPayment = ({ packageName, duration, amount, onSuccess, onError }) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);

    const initializePayment = async () => {
        try {
            setLoading(true);

            // Create order
            const orderResponse = await axios.post('/api/sellers/subscribe/create-order', {
                package: packageName,
                duration,
                amount
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!orderResponse.data.success || !orderResponse.data.order) {
                throw new Error('Failed to create order');
            }

            const order = orderResponse.data.order;

            // Initialize Razorpay
            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: 'INR',
                name: 'Galloping Gears',
                description: `${packageName} Subscription for ${duration} days`,
                order_id: order.id,
                handler: async (response) => {
                    try {
                        // Verify payment
                        const verifyResponse = await axios.post('/api/sellers/subscribe/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            package: packageName,
                            duration
                        }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        if (verifyResponse.data.success) {
                            toast.success('Payment successful!');
                            onSuccess(verifyResponse.data);
                        } else {
                            throw new Error('Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        toast.error('Payment verification failed');
                        onError(error);
                    }
                },
                prefill: {
                    name: 'Seller Name', // You can pass the seller's name here
                    email: 'seller@example.com', // You can pass the seller's email here
                    contact: '9999999999' // You can pass the seller's phone here
                },
                theme: {
                    color: '#3399cc'
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Payment initialization error:', error);
            toast.error('Failed to initialize payment');
            onError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={initializePayment}
            disabled={loading}
            className="btn btn-primary"
        >
            {loading ? 'Processing...' : `Subscribe to ${packageName}`}
        </button>
    );
};

export default RazorpayPayment; 