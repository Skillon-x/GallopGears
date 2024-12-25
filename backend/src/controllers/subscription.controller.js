const Seller = require('../models/Seller');
const Payment = require('../models/Payment');

// @desc    Update subscription package
// @route   PUT /api/subscription/package
// @access  Private (Seller)
exports.updateSubscriptionPackage = async (req, res) => {
    try {
        const { package } = req.body;

        // Validate package
        const validPackages = ['Basic', 'Premium', 'Royal Stallion'];
        if (!validPackages.includes(package)) {
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

        seller.subscription = {
            package,
            updatedAt: Date.now(),
            status: 'pending_payment'
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

// @desc    Verify subscription payment
// @route   POST /api/subscription/verify-payment
// @access  Private (Seller)
exports.verifySubscriptionPayment = async (req, res) => {
    try {
        const { paymentId, amount } = req.body;

        const seller = await Seller.findById(req.seller._id);
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        // Create payment record
        const payment = await Payment.create({
            seller: seller._id,
            amount,
            paymentId,
            type: 'subscription',
            status: 'success'
        });

        // Update subscription status
        seller.subscription.status = 'active';
        seller.subscription.lastPayment = payment._id;
        await seller.save();

        res.json({
            success: true,
            message: 'Payment verified and subscription activated',
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
            .populate('subscription.lastPayment');

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
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