const validateSubscription = (subscription) => {
    // Validate subscription package
    const validPackages = ['Royal Stallion', 'Gallop', 'Trot'];
    if (!validPackages.includes(subscription.package)) {
        throw new Error('Invalid subscription package');
    }

    // Validate subscription status
    const validStatuses = ['active', 'expired', 'cancelled'];
    if (!validStatuses.includes(subscription.status)) {
        throw new Error('Invalid subscription status');
    }

    // Validate dates
    if (!(subscription.startDate instanceof Date)) {
        throw new Error('Invalid start date');
    }

    if (!(subscription.endDate instanceof Date)) {
        throw new Error('Invalid end date');
    }

    if (subscription.endDate < subscription.startDate) {
        throw new Error('End date cannot be before start date');
    }

    return true;
};

module.exports = {
    validateSubscription
}; 