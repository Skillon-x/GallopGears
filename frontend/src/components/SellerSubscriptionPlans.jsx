const handleSelectPlan = async (plan) => {
  try {
    setLoading(true);
    if (plan.name === 'Free') {
      // For Free plan, directly create subscription without payment
      const response = await api.sellers.subscribe({
        package: plan.name,
        duration: 7,
        paymentMethod: 'free'
      });
      if (response.success) {
        toast.success('Successfully subscribed to Free plan');
        navigate('/seller/dashboard');
      }
    } else {
      // For paid plans, create order first
      const response = await api.sellers.createSubscriptionOrder({
        package: plan.name,
        duration: plan.duration
      });
      if (response.success) {
        setOrderDetails(response.data);
        setShowPaymentModal(true);
      }
    }
  } catch (error) {
    console.error('Subscription error:', error);
    toast.error(error.message || 'Failed to process subscription');
  } finally {
    setLoading(false);
  }
}; 