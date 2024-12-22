const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    deleteSeller,
    getStats,
    getAnalytics,
    getDashboardActivities,
    getRecentDashboardActivities,
    getSellerDetails,
    getSellerListings,
    getSellerTransactions,
    getSellerActivityLogs,
    getSellerCommunicationHistory,
    toggleUserBlock,
    getBuyerDetails,
    getBuyerInquiryHistory,
    getBuyerReportHistory,
    getBuyerActivityLogs,
    getPendingApprovals,
    getReportedListings,
    getFeaturedListings,
    getExpiredListings,
    getDraftListings,
    updateListingVerification,
    updateSellerProfile,
    deleteListing,
    getAdminTransactions,
    getTransactionById,
    updateTransactionStatus,
    exportTransactions,
    getReports,
    getReport,
    updateReport,
    deleteReport
} = require('../controllers/admin.controller');

// User management routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/:id', protect, authorize('admin'), getUserById);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.delete('/sellers/:id', protect, authorize('admin'), deleteSeller);

// Analytics and stats routes
router.get('/dashboard/stats', protect, authorize('admin'), getStats);
router.get('/dashboard/activities', protect, authorize('admin'), getDashboardActivities);
router.get('/dashboard/activities/recent', protect, authorize('admin'), getRecentDashboardActivities);
router.get('/analytics', protect, authorize('admin'), getAnalytics);

// Seller management routes
router.get('/sellers/:id', protect, authorize('admin'), getSellerDetails);
router.put('/sellers/:id', protect, authorize('admin'), updateSellerProfile);
router.get('/sellers/:id/listings', protect, authorize('admin'), getSellerListings);
router.get('/sellers/:id/transactions', protect, authorize('admin'), getSellerTransactions);
router.get('/sellers/:id/activity', protect, authorize('admin'), getSellerActivityLogs);
router.get('/sellers/:id/communications', protect, authorize('admin'), getSellerCommunicationHistory);

// User actions
router.post('/users/:id/block', protect, authorize('admin'), toggleUserBlock);

// Buyer management routes
router.get('/buyers/:id', protect, authorize('admin'), getBuyerDetails);
router.get('/buyers/:id/inquiries', protect, authorize('admin'), getBuyerInquiryHistory);
router.get('/buyers/:id/reports', protect, authorize('admin'), getBuyerReportHistory);
router.get('/buyers/:id/activity', protect, authorize('admin'), getBuyerActivityLogs);

// Listing management routes
router.get('/listings/pending', protect, authorize('admin'), getPendingApprovals);
router.get('/listings/reported', protect, authorize('admin'), getReportedListings);
router.get('/listings/featured', protect, authorize('admin'), getFeaturedListings);
router.get('/listings/expired', protect, authorize('admin'), getExpiredListings);
router.get('/listings/draft', protect, authorize('admin'), getDraftListings);
router.put('/listings/:id/verify', protect, authorize('admin'), updateListingVerification);
router.delete('/listings/:id', protect, authorize('admin'), deleteListing);

// Transaction routes
router.get('/transactions', protect, authorize('admin'), getAdminTransactions);
router.get('/transactions/:id', protect, authorize('admin'), getTransactionById);
router.put('/transactions/:id/status', protect, authorize('admin'), updateTransactionStatus);
router.get('/transactions/export', protect, authorize('admin'), exportTransactions);

// Report routes
router.get('/reports', protect, authorize('admin'), getReports);
router.get('/reports/:id', protect, authorize('admin'), getReport);
router.put('/reports/:id', protect, authorize('admin'), updateReport);
router.delete('/reports/:id', protect, authorize('admin'), deleteReport);

module.exports = router; 