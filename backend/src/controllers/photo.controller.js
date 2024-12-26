const cloudinary = require('cloudinary').v2;

// Configure cloudinary
cloudinary.config({
    cloud_name: 'dpscsbadx',
    api_key: '224559537953498',
    api_secret: 'FB9Q3VpOEOGvSgeNxM6dSV2Lv80'
});

const Seller = require('../models/Seller');
const Horse = require('../models/Horse');
const ActivityLog = require('../models/ActivityLog');

// Package-based photo limits
const PACKAGE_PHOTO_LIMITS = {
    'Royal Stallion': 20,
    'Gallop': 10,
    'Trot': 5,
    'Free': 1
};

// @desc    Upload photos
// @route   POST /api/photos/upload/:horseId
// @access  Private (Seller)
exports.uploadPhotos = async (req, res) => {
    try {
        const seller = await Seller.findOne({ user: req.user._id });
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        const horse = await Horse.findById(req.params.horseId);
        if (!horse) {
            return res.status(404).json({
                success: false,
                message: 'Horse listing not found'
            });
        }

        // Verify ownership
        if (horse.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to upload photos for this listing'
            });
        }

        // Validate photos array
        if (!req.body.photos || !Array.isArray(req.body.photos)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide photos array'
            });
        }

        // Check package limits
        const photoLimit = PACKAGE_PHOTO_LIMITS[seller.subscription.plan];
        if (!photoLimit) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription plan'
            });
        }

        const currentPhotoCount = horse.images ? horse.images.length : 0;
        if (currentPhotoCount + req.body.photos.length > photoLimit) {
            return res.status(400).json({
                success: false,
                message: `Cannot upload more than ${photoLimit} photos with current subscription plan`
            });
        }

        // Process and upload each photo
        const uploadedPhotos = [];
        for (const photo of req.body.photos) {
            if (!photo.content) {
                throw new Error('Each photo must have content');
            }

            // Upload to cloudinary
            const result = await cloudinary.uploader.upload(photo.content, {
                folder: 'horse-photos',
                resource_type: 'image'
            });

            uploadedPhotos.push({
                url: result.secure_url,
                public_id: result.public_id,
                thumbnail_url: result.secure_url.replace('/upload/', '/upload/w_200,h_200,c_fill/'),
                width: result.width,
                height: result.height,
                format: result.format
            });
        }

        // Update horse listing with new photos
        horse.images = [...(horse.images || []), ...uploadedPhotos];
        await horse.save();

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'listing_update',
            entityType: 'horse',
            entityId: horse._id,
            description: `Added ${uploadedPhotos.length} photos to horse listing ${horse.name}`,
            status: 'success'
        });

        res.status(200).json({
            success: true,
            images: uploadedPhotos
        });
    } catch (error) {
        console.error('Photo upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error uploading photos'
        });
    }
};

// @desc    Delete photo
// @route   DELETE /api/photos/:horseId/:photoId
// @access  Private (Seller)
exports.deletePhoto = async (req, res) => {
    try {
        const seller = await Seller.findOne({ user: req.user._id });
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        const horse = await Horse.findById(req.params.horseId);
        if (!horse) {
            return res.status(404).json({
                success: false,
                message: 'Horse listing not found'
            });
        }

        // Verify ownership
        if (horse.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete photos from this listing'
            });
        }

        // Find and remove photo
        const photoId = `horse-photos/${req.params.photoId}`;
        const photoIndex = horse.images.findIndex(img => img.public_id === photoId);
        if (photoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Photo not found'
            });
        }

        // Delete from cloudinary
        await cloudinary.uploader.destroy(photoId);

        // Remove from horse listing
        horse.images.splice(photoIndex, 1);
        await horse.save();

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'listing_update',
            entityType: 'horse',
            entityId: horse._id,
            description: `Deleted photo from horse listing ${horse.name}`,
            status: 'success'
        });

        res.json({
            success: true,
            message: 'Photo deleted successfully'
        });
    } catch (error) {
        console.error('Photo delete error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error deleting photo'
        });
    }
};

// @desc    Reorder photos
// @route   PUT /api/photos/:horseId/reorder
// @access  Private (Seller)
exports.reorderPhotos = async (req, res) => {
    try {
        const seller = await Seller.findOne({ user: req.user._id });
        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        const horse = await Horse.findById(req.params.horseId);
        if (!horse) {
            return res.status(404).json({
                success: false,
                message: 'Horse listing not found'
            });
        }

        // Verify ownership
        if (horse.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to reorder photos for this listing'
            });
        }

        // Validate photo IDs array
        if (!req.body.photoIds || !Array.isArray(req.body.photoIds)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide photoIds array'
            });
        }

        // Verify all photos exist
        const currentPhotoIds = horse.images.map(img => img.public_id);
        const allPhotosExist = req.body.photoIds.every(id => currentPhotoIds.includes(id));
        if (!allPhotosExist) {
            return res.status(400).json({
                success: false,
                message: 'Invalid photo IDs provided'
            });
        }

        // Reorder photos
        const reorderedPhotos = req.body.photoIds.map(id => 
            horse.images.find(img => img.public_id === id)
        );
        horse.images = reorderedPhotos;
        await horse.save();

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'listing_update',
            entityType: 'horse',
            entityId: horse._id,
            description: `Reordered photos for horse listing ${horse.name}`,
            status: 'success'
        });

        res.json({
            success: true,
            message: 'Photos reordered successfully',
            images: horse.images
        });
    } catch (error) {
        console.error('Photo reorder error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error reordering photos'
        });
    }
}; 