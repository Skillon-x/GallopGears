import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { isAuthenticated, user, loading, hasActiveSubscription } = useAuth();
    const location = useLocation();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Check if the route is a seller route
    const isSellerRoute = location.pathname.startsWith('/seller');

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // For seller routes, check if user is a seller
    if (isSellerRoute && user?.role !== 'seller') {
        console.log('User is not a seller, redirecting from:', location.pathname);
        return <Navigate to="/" replace />;
    }

    // For seller routes, check if seller has an active subscription
    if (isSellerRoute && user?.role === 'seller' && !hasActiveSubscription) {
        console.log('Seller has no active subscription, redirecting to pricing');
        return <Navigate to="/pricing" state={{ 
            message: 'Please subscribe to a plan to access seller features.',
            returnUrl: location.pathname 
        }} replace />;
    }

    // User is authenticated and has proper role and subscription, render the protected route
    return <Outlet />;
};

export default ProtectedRoute; 