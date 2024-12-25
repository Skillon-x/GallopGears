const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
    updateSubscriptionPackage,
    verifySubscriptionPayment,
    getSubscriptionDetails
} = require('../controllers/subscription.controller');

// Protected routes
router.use(protect);
router.use(authorize('seller'));

router.get('/', getSubscriptionDetails);
router.put('/package', updateSubscriptionPackage);
router.post('/verify-payment', verifySubscriptionPayment);

module.exports = router; 