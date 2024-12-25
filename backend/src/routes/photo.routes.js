const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
    uploadPhotos,
    deletePhoto,
    reorderPhotos
} = require('../controllers/photo.controller');

// All routes require authentication and seller role
router.use(protect);
router.use(authorize('seller'));

// Upload photos
router.post('/upload/:horseId', uploadPhotos);

// Delete photo
router.delete('/:horseId/:photoId', deletePhoto);

// Reorder photos
router.put('/:horseId/reorder', reorderPhotos);

module.exports = router; 