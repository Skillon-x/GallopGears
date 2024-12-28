import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertModal from './AlertModal';

const ALLOWED_PATHS = ['/register/seller', '/pricing', '/login', '/register'];
const REGISTRATION_EXPIRY_HOURS = 24;

const IncompleteRegistrationGuard = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  // Check if registration is expired
  const isRegistrationExpired = () => {
    const registrationTimestamp = user?.registrationTimestamp || localStorage.getItem('registrationTimestamp');
    if (!registrationTimestamp) return true;
    
    const hours = (Date.now() - new Date(registrationTimestamp).getTime()) / (1000 * 60 * 60);
    return hours > REGISTRATION_EXPIRY_HOURS;
  };

  useEffect(() => {
    if (loading) {
      console.log('Auth loading, waiting...');
      return;
    }

    console.log('Full user object:', user);

    // Check registration state from server first, then localStorage
    const hasServerRegistrationIntent = 
      user?.isSellerRegistration || 
      user?.registrationStep > 0 || 
      user?.role === 'pending_seller';

    const hasLocalRegistrationIntent = 
      !hasServerRegistrationIntent && 
      localStorage.getItem('sellerRegistrationIntent') === 'true' && 
      !isRegistrationExpired();
    
    // Get registration step from server or localStorage
    const serverStep = user?.registrationStep;
    const localStep = hasLocalRegistrationIntent ? parseInt(localStorage.getItem('registrationStep')) : null;
    const currentStep = serverStep || (hasLocalRegistrationIntent ? localStep : null);

    console.log('Guard Check:', {
      isAuthenticated,
      hasServerRegistrationIntent,
      hasLocalRegistrationIntent,
      serverStep,
      localStep,
      currentStep,
      user,
      path: location.pathname,
      role: user?.role,
      isExpired: isRegistrationExpired()
    });

    // Early return for non-authenticated, complete sellers, or admins
    if (!isAuthenticated || (user && (user.role === 'seller' || user.role === 'admin'))) {
      console.log('Early return - not authenticated, complete seller, or admin');
      return;
    }

    // Check if user is in seller registration flow
    const isInSellerRegistration = user && (
      hasServerRegistrationIntent || 
      (hasLocalRegistrationIntent && !isRegistrationExpired())
    );

    console.log('Registration status:', { 
      isInSellerRegistration, 
      pathname: location.pathname,
      currentStep,
      role: user?.role
    });

    // If in registration and trying to access non-allowed path
    if (isInSellerRegistration && !ALLOWED_PATHS.includes(location.pathname)) {
      console.log('Blocking access:', {
        role: user.role,
        currentStep,
        currentPath: location.pathname
      });
      
      // Force redirect based on step
      if (currentStep === 1 || user?.role === 'user') {
        navigate('/register/seller', { replace: true });
      } else if (currentStep === 2 || user?.role === 'pending_seller') {
        navigate('/pricing', { replace: true });
      }
      setShowModal(true);
    }

    // Clear expired registration from localStorage
    if (isRegistrationExpired() && !hasServerRegistrationIntent) {
      localStorage.removeItem('sellerRegistrationIntent');
      localStorage.removeItem('registrationStep');
      localStorage.removeItem('registrationTimestamp');
    }
  }, [isAuthenticated, user, location.pathname, navigate, loading]);

  const handleModalConfirm = () => {
    setShowModal(false);
    if (user?.role === 'user' || user?.registrationStep === 1) {
      navigate('/register/seller', { replace: true });
    } else if (user?.role === 'pending_seller' || user?.registrationStep === 2) {
      navigate('/pricing', { replace: true });
    }
  };

  // Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Block access if in registration
  const hasServerRegistrationIntent = 
    user?.isSellerRegistration || 
    user?.registrationStep > 0 || 
    user?.role === 'pending_seller';

  const hasLocalRegistrationIntent = 
    !hasServerRegistrationIntent && 
    localStorage.getItem('sellerRegistrationIntent') === 'true' && 
    !isRegistrationExpired();

  if (isAuthenticated && user && 
      (hasServerRegistrationIntent || hasLocalRegistrationIntent) && 
      user.role !== 'seller' && 
      user.role !== 'admin' && 
      !ALLOWED_PATHS.includes(location.pathname)) {
    return (
      <AlertModal
        isOpen={true}
        onClose={() => {}}
        title="Complete Your Registration"
        message={
          user?.role === 'user' || user?.registrationStep === 1
            ? "Please complete your business profile to continue."
            : user?.role === 'pending_seller' || user?.registrationStep === 2
              ? "Please select a subscription plan to complete your registration."
              : "Please complete your seller registration before accessing other parts of the website."
        }
        type="warning"
        confirmText="Continue Registration"
        onConfirm={handleModalConfirm}
        showCancel={false}
      />
    );
  }

  return children;
};

export default IncompleteRegistrationGuard; 