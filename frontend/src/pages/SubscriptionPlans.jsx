import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RazorpayPayment from '../components/RazorpayPayment';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

const SubscriptionPlans = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const loadPlans = async () => {
            try {
                const response = await api.sellers.getPlans();
                console.log(response.data);
                if (response.data.success) {
                    console.log(response.data.plans);
                    setPlans(response.data.plans);
                }
            } catch (error) {
                console.error('Error loading plans:', error);
                toast.error('Failed to load subscription plans');
            } finally {
                setLoading(false);
            }
        };

        loadPlans();
    }, []);

    const handlePaymentSuccess = (data) => {
        toast.success('Subscription activated successfully!');
        navigate('/seller/dashboard');
    };

    const handlePaymentError = (error) => {
        console.error('Payment failed:', error);
        toast.error('Payment failed. Please try again.');
    };

    if (loading) {
        return <div className="text-center p-5">Loading plans...</div>;
    }

    return (
        <div className="container py-5">
            <h1 className="text-center mb-5">Choose Your Subscription Plan</h1>
            <div className="row justify-content-center">
                {plans.map((plan) => (
                    <div key={plan.id} className="col-md-4 mb-4">
                        <div className="card h-100">
                            <div className="card-header text-center">
                                <h3>{plan.name}</h3>
                                <h4 className="text-primary">₹{plan.price}</h4>
                            </div>
                            <div className="card-body">
                                <ul className="list-unstyled">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="mb-2">
                                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="card-footer text-center">
                                <RazorpayPayment
                                    packageName={plan.name}
                                    duration={30}
                                    amount={plan.price}
                                    onSuccess={handlePaymentSuccess}
                                    onError={handlePaymentError}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubscriptionPlans; 