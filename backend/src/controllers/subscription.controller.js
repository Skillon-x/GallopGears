const Seller = require('../models/Seller');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const { SUBSCRIPTION_FEATURES } = require('../models/Subscription');

// Helper to get plan priority (higher number = higher tier)
const getPlanPriority = (plan) => {
    switch (plan) {
        case 'Royal Stallion': return 3;
        case 'Gallop': return 2;
        case 'Trot': return 1;
        case 'Free': return 0;
        default: return -1;
    }
};

// @desc    Update subscription package
// @route   PUT /api/subscription/package
// @access  Private (Seller)
exports.updateSubscriptionPackage = async (req, res) => {
    try {
        const { package: newPackage, queuePlan = false } = req.body;

        // Validate package
        const validPackages = ['Free', 'Royal Stallion', 'Gallop', 'Trot'];
        if (!validPackages.includes(newPackage)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription package'
            });
        }

        const seller = await Seller.findById(req.seller._id);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        const currentPlan = seller.subscription?.plan;
        const currentPriority = getPlanPriority(currentPlan);
        const newPriority = getPlanPriority(newPackage);

        // Only allow upgrading to higher tier plans
        if (newPriority <= currentPriority && currentPlan !== null) {
            return res.status(400).json({
                success: false,
                message: 'Can only upgrade to a higher tier plan'
            });
        }

        // If queuePlan is true and there's an active subscription, queue the new plan
        if (queuePlan && seller.subscription?.status === 'active') {
            seller.subscription.queuePlan(newPackage);
            seller.markModified('subscription.queuedPlans');
            await seller.save();

            return res.json({
                success: true,
                message: 'Plan queued for activation after current subscription ends',
                subscription: seller.subscription
            });
        }

        // For immediate activation
        seller.subscription = {
            plan: newPackage,
            status: 'pending_payment',
            startDate: new Date(),
            endDate: new Date(Date.now() + (newPackage === 'Free' ? 7 : 30) * 24 * 60 * 60 * 1000),
            features: SUBSCRIPTION_FEATURES[newPackage]
        };

        await seller.save();

        res.json({
            success: true,
            message: 'Subscription package updated',
            subscription: seller.subscription
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get subscription details
// @route   GET /api/subscription
// @access  Private (Seller)
exports.getSubscriptionDetails = async (req, res) => {
    try {
        const seller = await Seller.findById(req.seller._id)
            .populate('subscription.lastPayment')
            .populate('subscription.queuedPlans.transaction');

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        // Check if current plan has expired and there's a queued plan
        if (seller.subscription?.status === 'active' && 
            seller.subscription.endDate < new Date() && 
            seller.subscription.queuedPlans?.length > 0) {
            
            // Activate the next queued plan
            seller.subscription.activateNextPlan();
            seller.markModified('subscription');
            await seller.save();
        }

        res.json({
            success: true,
            subscription: seller.subscription
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Verify subscription payment
// @route   POST /api/subscription/verify-payment
// @access  Private (Seller)
exports.verifySubscriptionPayment = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            package: packageName,
            duration,
            amount
        } = req.body;

        // Verify payment signature
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // Create transaction record
        const transaction = await Transaction.create({
            seller: req.seller._id,
            type: 'subscription',
            amount,
            status: 'completed',
            paymentMethod: 'razorpay',
            razorpayDetails: {
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                signature: razorpay_signature
            },
            subscriptionDetails: {
                package: packageName,
                duration: duration || 30
            }
        });

        // Update seller subscription
        const seller = await Seller.findById(req.seller._id);
        
        // If current subscription is active, queue the new plan
        if (seller.subscription?.status === 'active' && 
            seller.subscription.endDate > new Date()) {
            
            seller.subscription.queuePlan(packageName, transaction._id);
            seller.markModified('subscription.queuedPlans');
        } else {
            // Immediate activation
            seller.subscription = {
                plan: packageName,
                status: 'active',
                startDate: new Date(),
                endDate: new Date(Date.now() + (packageName === 'Free' ? 7 : 30) * 24 * 60 * 60 * 1000),
                features: SUBSCRIPTION_FEATURES[packageName],
                lastPayment: transaction._id
            };
        }

        await seller.save();

        res.json({
            success: true,
            subscription: seller.subscription,
            transaction
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}; 