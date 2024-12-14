// ... existing code ...
// Import routes
const verificationRoutes = require('./routes/verification.routes');
const photoRoutes = require('./routes/photo.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const visibilityRoutes = require('./routes/visibility.routes');

// ... existing code ...

// Mount routes
app.use('/api/verification', verificationRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/visibility', visibilityRoutes);

// ... existing code ... 