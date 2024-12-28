const handleSelectPlan = async (plan) => {
    try {
        setLoading(true);
        const { isUpgrade, currentPlan, remainingDays } = location.state || {};

        // For Free plan, directly subscribe
        if (plan.name === 'Free') {
            const response = await api.sellers.subscribe({
                package: 'Free',
                duration: 7,
                amount: 0,
                paymentMethod: 'free'
            });

            if (!response?.data?.success) {
                throw new Error('Failed to activate Free plan');
            }

            toast.success('Free plan activated successfully!');
            navigate('/seller/dashboard');
            return;
        }

        // For paid plans, create order first
        const orderResponse = await api.sellers.createSubscriptionOrder({
            package: plan.name,
            duration: 30,
            amount: plan.name === 'Royal Stallion' ? 9999 :
                    plan.name === 'Gallop' ? 4999 : 1999,
            queuePlan: isUpgrade && remainingDays > 0
        });

        if (!orderResponse?.data?.success || !orderResponse?.data?.order?.id) {
            throw new Error('Failed to create subscription order');
        }

        // Load Razorpay
        const razorpayLoaded = await loadRazorpay();
        if (!razorpayLoaded) {
            throw new Error('Failed to load payment gateway');
        }

        // Initialize Razorpay options
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: orderResponse.data.order.amount,
            currency: "INR",
            name: "Galloping Gears",
            description: `${plan.name} Subscription${isUpgrade ? ' Upgrade' : ''} - 30 days`,
            order_id: orderResponse.data.order.id,
            handler: async function (response) {
                try {
                    // Verify payment
                    const verifyResponse = await api.sellers.verifySubscriptionPayment({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        package: plan.name,
                        duration: 30,
                        amount: orderResponse.data.order.amount,
                        queuePlan: isUpgrade && remainingDays > 0
                    });

                    if (!verifyResponse?.data?.success) {
                        throw new Error('Payment verification failed');
                    }

                    // Verify subscription features
                    const newSubscription = verifyResponse.data.subscription;
                    const expectedFeatures = SUBSCRIPTION_FEATURES[plan.name];
                    
                    if (!verifySubscriptionFeatures(newSubscription.features, expectedFeatures)) {
                        throw new Error('Subscription features verification failed');
                    }

                    toast.success(isUpgrade && remainingDays > 0 
                        ? 'Plan upgrade queued successfully! It will activate after your current plan expires.'
                        : 'Subscription activated successfully!');
                    navigate('/seller/dashboard');
                } catch (error) {
                    console.error('Payment verification failed:', error);
                    toast.error(error.message || 'Payment verification failed');
                }
            },
            modal: {
                ondismiss: function () {
                    toast.error('Payment cancelled');
                }
            }
        };

        // Open Razorpay
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    } catch (error) {
        console.error('Subscription error:', error);
        toast.error(error.message || 'Failed to process subscription');
    } finally {
        setLoading(false);
    }
}; 