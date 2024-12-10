export const auth = (req, res, next) => {
    // Simple session-based check
    if (!req.session?.userId) {
        return res.status(401).json({ error: 'Not authorized' });
    }
    next();
}; 