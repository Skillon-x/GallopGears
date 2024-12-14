// Error handling middleware
const errorHandler = (err, req, res, next) => {
    // Log error for debugging
    console.error(err.stack);

    // Check if error has a status code, if not use 500
    const statusCode = err.statusCode || 500;

    // Send error response
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Not Found middleware
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Validation error handler
const validationErrorHandler = (err, req, res, next) => {
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: Object.values(err.errors).map(error => error.message)
        });
    }
    next(err);
};

// Database error handler
const databaseErrorHandler = (err, req, res, next) => {
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate field value entered'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Database Error'
        });
    }
    next(err);
};

// JWT error handler
const jwtErrorHandler = (err, req, res, next) => {
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }
    next(err);
};

// File upload error handler
const fileUploadErrorHandler = (err, req, res, next) => {
    if (err.name === 'MulterError') {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next(err);
};

module.exports = {
    errorHandler,
    notFound,
    asyncHandler,
    validationErrorHandler,
    databaseErrorHandler,
    jwtErrorHandler,
    fileUploadErrorHandler
}; 