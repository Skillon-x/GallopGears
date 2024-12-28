import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Clock, 
  Award, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ArrowUpCircle,
  Calendar
} from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import { toast } from 'react-toastify';
import AlertModal from '../../components/AlertModal';


const loadRazorpay = () => {
  return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
  });
};


const SUBSCRIPTION_FEATURES = {
  'Free': {
    maxPhotos: 1,
    maxListings: 1,
    listingDuration: 7,
    verificationLevel: 'basic',
    virtualStableTour: false,
    analytics: false,
    homepageSpotlight: 0,
    featuredListingBoosts: {
      count: 0,
      duration: 0
    },
    priorityPlacement: false,
    badges: ['Free User'],
    searchPlacement: 'basic',
    socialMediaSharing: false,
    seriousBuyerAccess: false
  },
  'Royal Stallion': {
    maxPhotos: 20,
    maxListings: 9999,
    listingDuration: 90,
    verificationLevel: 'premium',
    virtualStableTour: true,
    analytics: true,
    homepageSpotlight: 5,
    featuredListingBoosts: {
      count: 3,
      duration: 7
    },
    priorityPlacement: true,
    badges: ['Top Seller', 'Premium Stable'],
    searchPlacement: 'premium',
    socialMediaSharing: true,
    seriousBuyerAccess: true
  },
  'Gallop': {
    maxPhotos: 10,
    maxListings: 10,
    listingDuration: 60,
    verificationLevel: 'basic',
    virtualStableTour: false,
    analytics: true,
    homepageSpotlight: 2,
    featuredListingBoosts: {
      count: 1,
      duration: 5
    },
    priorityPlacement: false,
    badges: ['Verified Seller'],
    searchPlacement: 'basic',
    socialMediaSharing: true,
    seriousBuyerAccess: false
  },
  'Trot': {
    maxPhotos: 5,
    maxListings: 5,
    listingDuration: 30,
    verificationLevel: 'basic',
    virtualStableTour: false,
    analytics: false,
    homepageSpotlight: 0,
    featuredListingBoosts: {
      count: 0,
      duration: 0
    },
    priorityPlacement: false,
    badges: ['Basic Seller'],
    searchPlacement: 'basic',
    socialMediaSharing: false,
    seriousBuyerAccess: false
  }
};

const PLAN_PRICES = {
  'Royal Stallion': 9999,
  'Gallop': 4999,
  'Trot': 1999,
  'Free': 0
};

const PLAN_DESCRIPTIONS = {
  'Royal Stallion': 'Premium Plan',
  'Gallop': 'Standard Plan',
  'Trot': 'Basic Plan',
  'Free': 'Free Plan'
};

const SubscriptionProgress = ({ subscription }) => {
  const calculateProgress = () => {
    if (!subscription?.startDate || !subscription?.endDate) return 0;
    const start = new Date(subscription.startDate);
    const end = new Date(subscription.endDate);
    const now = new Date();
    const total = end - start;
    const elapsed = now - start;
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  };

  const getProgressColor = (progress) => {
    if (progress > 85) return 'bg-red-500';
    if (progress > 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const progress = calculateProgress();
  const progressColor = getProgressColor(progress);

  return (
    <div className="mt-4">
      <div className="flex justify-between text-sm text-tertiary/70 mb-1">
        <span>{Math.round(progress)}% Complete</span>
        <span>{subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const getPlanPriority = (plan) => {
    switch (plan) {
        case 'Royal Stallion': return 3;
        case 'Gallop': return 2;
        case 'Trot': return 1;
        case 'Free': return 0;
        default: return -1;
    }
};

const formatPrice = (price) => {
  return `₹${(price).toFixed(2)}`;
};

const UpgradeOptions = ({ currentPlan, onUpgrade }) => {
  const upgradePaths = {
    'Free': ['Trot', 'Gallop', 'Royal Stallion'],
    'Trot': ['Gallop', 'Royal Stallion'],
    'Gallop': ['Royal Stallion'],
    'Royal Stallion': []
  };

  const planPrices = {
    'Royal Stallion': 9999,
    'Gallop': 4999,
    'Trot': 1999,
    'Free': 0
  };

  const getUpgradePlans = () => {
    return (upgradePaths[currentPlan] || []).map(planName => {
      const features = SUBSCRIPTION_FEATURES[planName];
      if (!features) {
        console.error(`Features not found for plan: ${planName}`);
        return null;
      }
      return {
        name: planName,
        features,
        price: planPrices[planName]
      };
    }).filter(Boolean);
  };

  const upgradePlans = getUpgradePlans();

  if (upgradePlans.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="font-medium text-tertiary mb-4 flex items-center gap-2">
        <ArrowUpCircle className="w-5 h-5 text-primary" />
        Available Upgrades
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {upgradePlans.map((plan) => (
          <div key={plan.name} className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h5 className="font-semibold text-tertiary">{plan.name}</h5>
                <span className="text-lg font-bold text-primary">{formatPrice(plan.price)}</span>
              </div>
              <p className="text-sm text-tertiary/70 mt-1">
                {PLAN_DESCRIPTIONS[plan.name]}
              </p>
            </div>

            {/* Features */}
            <div className="p-4 flex-grow">
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-tertiary">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{plan.features.maxListings} Listings</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-tertiary">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{plan.features.maxPhotos} Photos per listing</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-tertiary">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{plan.features.listingDuration} days duration</span>
                </li>
                {plan.features.virtualStableTour && (
                  <li className="flex items-center gap-2 text-sm text-tertiary">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Virtual Stable Tour</span>
                  </li>
                )}
                {plan.features.analytics && (
                  <li className="flex items-center gap-2 text-sm text-tertiary">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Analytics Dashboard</span>
                  </li>
                )}
                {plan.features.priorityPlacement && (
                  <li className="flex items-center gap-2 text-sm text-tertiary">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Priority Placement</span>
                  </li>
                )}
                {plan.features.socialMediaSharing && (
                  <li className="flex items-center gap-2 text-sm text-tertiary">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Social Media Sharing</span>
                  </li>
                )}
                {plan.features.seriousBuyerAccess && (
                  <li className="flex items-center gap-2 text-sm text-tertiary">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Serious Buyer Access</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Action - Fixed to bottom */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
              <button
                onClick={() => onUpgrade(plan)}
                className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <ArrowUpCircle className="w-4 h-4" />
                Upgrade Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const QueuedPlansCard = ({ queuedPlans }) => {
  if (!queuedPlans?.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-tertiary flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          Queued Plans
        </h3>
        <div className="space-y-4">
          {queuedPlans.map((plan, index) => (
            <div key={index} className="border-l-4 border-primary pl-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-tertiary">{plan.plan}</h4>
                  <p className="text-sm text-tertiary/70">
                    {PLAN_DESCRIPTIONS[plan.plan]} • {formatPrice(PLAN_PRICES[plan.plan])}
                  </p>
                  <div className="mt-2 text-sm text-tertiary/70">
                    <p>Starts: {new Date(plan.startDate).toLocaleDateString()}</p>
                    <p>Ends: {new Date(plan.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {index === 0 ? 'Next Plan' : `Queue Position: ${index + 1}`}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {plan.features.maxListings} Listings
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {plan.features.maxPhotos} Photos
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SubscriptionCard = ({ subscription, onRenew }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [selectedUpgrade, setSelectedUpgrade] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!subscription?.endDate) return '';
      
      const now = new Date();
      const end = new Date(subscription.endDate);
      const diff = end - now;
      
      if (diff <= 0) return 'Expired';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      return `${days}d ${hours}h remaining`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000 * 60); // Update every minute
    
    return () => clearInterval(timer);
  }, [subscription?.endDate]);

  useEffect(() => {
    if (!subscription?.endDate) return;
    
    const end = new Date(subscription.endDate);
    const now = new Date();
    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 3 && daysLeft > 0) {
      toast.warning(
        `Your subscription will expire in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Renew now to avoid service interruption.`,
        {
          autoClose: false,
          toastId: 'subscription-expiry'
        }
      );
    } else if (daysLeft <= 0) {
      toast.error('Your subscription has expired. Renew now to restore your services.', {
        autoClose: false,
        toastId: 'subscription-expired'
      });
    }
  }, [subscription?.endDate]);

  const getStatusColor = () => {
    if (!subscription) return 'bg-gray-100 text-gray-600';
    switch (subscription.status) {
      case 'active':
        return 'bg-green-100 text-green-600';
      case 'expired':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-orange-100 text-orange-600';
    }
  };

  const handleRenewal = async () => {
    try {
      if (!subscription?.plan) return;

      // For Free plan, directly renew
      if (subscription.plan === 'Free') {
        const response = await api.sellers.subscribe({
          package: 'Free',
          duration: 7,
          amount: 0,
          paymentMethod: 'free'
        });

        if (!response?.data?.success) {
          throw new Error('Failed to renew Free plan');
        }

        toast.success('Free plan renewed successfully!');
        onRenew();
        return;
      }

      // Get plan price
      const planPrice = subscription.plan === 'Royal Stallion' ? 9999 :
                       subscription.plan === 'Gallop' ? 4999 : 1999;

      // For paid plans, create order first
      const orderResponse = await api.sellers.createSubscriptionOrder({
        package: subscription.plan,
        duration: 30,
        amount: planPrice
      });

      if (!orderResponse?.data?.success || !orderResponse?.data?.order?.id) {
        throw new Error('Failed to create subscription order');
      }

      // Load Razorpay
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Initialize Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.data.order.amount,
        currency: "INR",
        name: "Galloping Gears",
        description: `${subscription.plan} Subscription Renewal - 30 days`,
        order_id: orderResponse.data.order.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await api.sellers.verifySubscriptionPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              package: subscription.plan,
              duration: 30,
              amount: orderResponse.data.order.amount
            });

            if (!verifyResponse?.data?.success) {
              throw new Error('Payment verification failed');
            }

            // Verify subscription features
            const newSubscription = verifyResponse.data.subscription;
            const expectedFeatures = SUBSCRIPTION_FEATURES[subscription.plan];
            
            if (!verifySubscriptionFeatures(newSubscription.features, expectedFeatures)) {
              throw new Error('Subscription features verification failed');
            }

            toast.success('Subscription renewed successfully!');
            onRenew();
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error(error.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled');
          }
        },
        prefill: {
          name: subscription?.seller?.name || '',
          email: subscription?.seller?.email || ''
        },
        theme: {
          color: "#2563eb"
        }
      };

      // Open Razorpay
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Renewal error:', error);
      toast.error(error.message || 'Failed to process renewal');
    }
  };

  const handleUpgrade = async (plan) => {
    try {
      const remainingDays = Math.ceil((new Date(subscription?.endDate) - new Date()) / (1000 * 60 * 60 * 24));
      
      // For paid plans, create order first
      const orderResponse = await api.sellers.createSubscriptionOrder({
        package: plan.name,
        duration: 30,
        amount: plan.price,
        queuePlan: remainingDays > 0
      });

      if (!orderResponse?.data?.success || !orderResponse?.data?.order?.id) {
        throw new Error('Failed to create subscription order');
      }

      // Load Razorpay
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Initialize Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.data.order.amount,
        currency: "INR",
        name: "Galloping Gears",
        description: `${plan.name} Subscription${remainingDays > 0 ? ' Upgrade' : ''} - 30 days`,
        order_id: orderResponse.data.order.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await api.sellers.verifySubscriptionPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              package: plan.name,
              duration: 30,
              amount: orderResponse.data.order.amount,
              queuePlan: remainingDays > 0
            });

            if (!verifyResponse?.data?.success) {
              throw new Error('Payment verification failed');
            }

            // Verify subscription features
            const newSubscription = verifyResponse.data.subscription;
            const expectedFeatures = SUBSCRIPTION_FEATURES[plan.name];
            
            if (!verifySubscriptionFeatures(newSubscription.features, expectedFeatures)) {
              throw new Error('Subscription features verification failed');
            }

            toast.success(remainingDays > 0 
              ? 'Plan upgrade queued successfully! It will activate after your current plan expires.'
              : 'Subscription upgraded successfully!');
            onRenew(); // Refresh subscription data
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error(error.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled');
          }
        },
        prefill: {
          name: subscription?.seller?.name || '',
          email: subscription?.seller?.email || ''
        },
        theme: {
          color: "#2563eb"
        }
      };

      // Open Razorpay
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error(error.message || 'Failed to process upgrade');
    }
  };

  const upgradePaths = {
    'Free': ['Trot', 'Gallop', 'Royal Stallion'],
    'Trot': ['Gallop', 'Royal Stallion'],
    'Gallop': ['Royal Stallion'],
    'Royal Stallion': []
  };

  const hasUpgradeOptions = subscription?.plan && upgradePaths[subscription.plan]?.length > 0;

  const handleUpgradeClick = (plan) => {
    setSelectedUpgrade(plan);
    setShowUpgradeModal(true);
  };

  const handleUpgradeConfirm = async () => {
    try {
      setIsProcessing(true);
      await handleUpgrade(selectedUpgrade);
    } finally {
      setIsProcessing(false);
      setShowUpgradeModal(false);
    }
  };

  const handleRenewalClick = () => {
    setShowRenewalModal(true);
  };

  const handleRenewalConfirm = async () => {
    try {
      setIsProcessing(true);
      await handleRenewal();
    } finally {
      setIsProcessing(false);
      setShowRenewalModal(false);
    }
  };

  return (
    <>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-tertiary">
                {subscription?.plan || 'No Active Plan'}
            </h3>
            <p className="text-tertiary/70 text-sm mt-1">
                {PLAN_DESCRIPTIONS[subscription?.plan]} • {timeLeft || 'Not subscribed'}
            </p>
          </div>
          <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor()}`}>
                {subscription?.status?.charAt(0).toUpperCase() + subscription?.status?.slice(1) || 'Inactive'}
              </span>
              {subscription?.plan && subscription?.plan !== 'Free' && (
                <p className="text-sm text-tertiary/70 mt-2">
                  {formatPrice(PLAN_PRICES[subscription.plan])} / month
                </p>
              )}
            </div>
          </div>

          <SubscriptionProgress subscription={subscription} />

          {subscription?.status === 'active' && (
            <UpgradeOptions 
              currentPlan={subscription.plan}
              onUpgrade={handleUpgrade}
            />
          )}

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-tertiary">Plan Features:</h4>
              <div className="flex gap-2">
                {subscription?.status === 'active' && (
                  <>
                    <button
                      onClick={handleRenewalClick}
                      className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Renew Early
                    </button>
                    {hasUpgradeOptions && (
                      <button
                        onClick={() => handleUpgradeClick({ name: upgradePaths[subscription.plan][0] })}
                        className="text-sm bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1"
                      >
                        <ArrowUpCircle className="w-4 h-4" />
                        Upgrade Plan
        </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {subscription?.features && (
              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{subscription.features.maxListings} Listings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{subscription.features.maxPhotos} Photos per listing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{subscription.features.listingDuration} days listing duration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{subscription.features.verificationLevel} verification</span>
                  </div>
                  {subscription.features.virtualStableTour && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Virtual Stable Tour</span>
                    </div>
                  )}
                  {subscription.features.analytics && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Analytics Dashboard</span>
                    </div>
                  )}
            </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Confirmation Modal */}
      <AlertModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Confirm Plan Upgrade"
        message={
          selectedUpgrade ? 
          `Are you sure you want to upgrade to the ${selectedUpgrade.name} plan? ${
            Math.ceil((new Date(subscription?.endDate) - new Date()) / (1000 * 60 * 60 * 24)) > 0 
            ? "Your new plan will be queued and will activate after your current plan expires." 
            : "The upgrade will take effect immediately."
          }` : ''
        }
        type="confirm"
        confirmText="Upgrade Plan"
        onConfirm={handleUpgradeConfirm}
        isLoading={isProcessing}
      />

      {/* Renewal Confirmation Modal */}
      <AlertModal
        isOpen={showRenewalModal}
        onClose={() => setShowRenewalModal(false)}
        title="Confirm Plan Renewal"
        message={`Are you sure you want to renew your ${subscription?.plan} plan for another ${subscription?.plan === 'Free' ? '7' : '30'} days?`}
        type="confirm"
        confirmText="Renew Plan"
        onConfirm={handleRenewalConfirm}
        isLoading={isProcessing}
      />
    </>
  );
};

const SubscriptionHistory = ({ history }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-tertiary mb-4">Subscription History</h3>
        {history.length === 0 ? (
          <p className="text-tertiary/70">No subscription history available.</p>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-3 border-b last:border-0">
                <div>
                  <p className="font-medium text-tertiary">{item.plan}</p>
                  <p className="text-sm text-tertiary/70">
                    {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  item.status === 'completed' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TransactionHistory = ({ transactions }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-tertiary mb-4">Transaction History</h3>
        {transactions.length === 0 ? (
          <p className="text-tertiary/70">No transactions available.</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction._id} className="flex justify-between items-center py-3 border-b last:border-0">
                <div>
                  <p className="font-medium text-tertiary">
                    {transaction.type === 'subscription' ? 
                      `${transaction.subscriptionDetails?.package} Subscription` : 
                      transaction.type}
                  </p>
                  <p className="text-sm text-tertiary/70">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-tertiary">₹{transaction.amount.toLocaleString()}</p>
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-600' :
                    transaction.status === 'failed' ? 'bg-red-100 text-red-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const verifySubscriptionFeatures = (features, expectedFeatures) => {
  return (
    features.maxPhotos === expectedFeatures.maxPhotos &&
    features.maxListings === expectedFeatures.maxListings &&
    features.listingDuration === expectedFeatures.listingDuration &&
    features.verificationLevel === expectedFeatures.verificationLevel &&
    features.virtualStableTour === expectedFeatures.virtualStableTour &&
    features.analytics === expectedFeatures.analytics &&
    features.homepageSpotlight === expectedFeatures.homepageSpotlight &&
    features.featuredListingBoosts.count === expectedFeatures.featuredListingBoosts.count &&
    features.featuredListingBoosts.duration === expectedFeatures.featuredListingBoosts.duration &&
    features.priorityPlacement === expectedFeatures.priorityPlacement &&
    features.searchPlacement === expectedFeatures.searchPlacement &&
    features.socialMediaSharing === expectedFeatures.socialMediaSharing &&
    features.seriousBuyerAccess === expectedFeatures.seriousBuyerAccess
  );
};

const Payments = () => {
  const [subscription, setSubscription] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showQuickRenewalModal, setShowQuickRenewalModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching subscription and transaction data...');
      const [subscriptionResponse, transactionsResponse] = await Promise.all([
        api.sellers.getSubscription(),
        api.sellers.getPaymentHistory()
      ]);

      console.log('Subscription response:', subscriptionResponse);
      console.log('Transactions response:', transactionsResponse);

      if (subscriptionResponse.data?.success) {
        setSubscription(subscriptionResponse.data.subscription);
      } else {
        console.warn('Invalid subscription response format:', subscriptionResponse);
      }

      if (transactionsResponse.data?.success) {
        console.log('Setting transactions:', transactionsResponse.data.transactions);
        setTransactions(transactionsResponse.data.transactions);
      } else {
        console.warn('Invalid transactions response format:', transactionsResponse);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load subscription data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRenewSubscription = () => {
    navigate('/seller/subscription-plans');
  };

  const handleQuickRenewal = async () => {
    try {
      const currentPlan = subscription?.plan;
      if (!currentPlan) return;

      // For Free plan, directly renew
      if (currentPlan === 'Free') {
        const response = await api.sellers.subscribe({
          package: 'Free',
          duration: 7,
          amount: 0,
          paymentMethod: 'free'
        });

        if (!response?.data?.success) {
          throw new Error('Failed to renew Free plan');
        }

        toast.success('Free plan renewed successfully!');
        fetchData();
        return;
      }

      // Get plan price
      const planPrice = currentPlan === 'Royal Stallion' ? 9999 :
                       currentPlan === 'Gallop' ? 4999 : 1999;

      // For paid plans, create order first
      const orderResponse = await api.sellers.createSubscriptionOrder({
        package: currentPlan,
        duration: 30,
        amount: planPrice
      });

      if (!orderResponse?.data?.success || !orderResponse?.data?.order?.id) {
        throw new Error('Failed to create subscription order');
      }

      // Load Razorpay
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Initialize Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.data.order.amount,
        currency: "INR",
        name: "Galloping Gears",
        description: `${currentPlan} Subscription Renewal - 30 days`,
        order_id: orderResponse.data.order.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await api.sellers.verifySubscriptionPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              package: currentPlan,
              duration: 30,
              amount: orderResponse.data.order.amount
            });

            if (!verifyResponse?.data?.success) {
              throw new Error('Payment verification failed');
            }

            // Verify subscription features
            const newSubscription = verifyResponse.data.subscription;
            const expectedFeatures = SUBSCRIPTION_FEATURES[currentPlan];
            
            if (!verifySubscriptionFeatures(newSubscription.features, expectedFeatures)) {
              throw new Error('Subscription features verification failed');
            }

            toast.success('Subscription renewed successfully!');
            fetchData();
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error(error.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled');
          }
        },
        prefill: {
          name: subscription?.seller?.name || '',
          email: subscription?.seller?.email || ''
        },
        theme: {
          color: "#2563eb"
        }
      };

      // Open Razorpay
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast.error('Failed to process renewal. Please try again.');
    }
  };

  const handleQuickRenewalClick = () => {
    setShowQuickRenewalModal(true);
  };

  const handleQuickRenewalConfirm = async () => {
    try {
      setIsProcessing(true);
      await handleQuickRenewal();
    } finally {
      setIsProcessing(false);
      setShowQuickRenewalModal(false);
    }
  };

  const content = loading ? (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
    </div>
  ) : error ? (
    <div className="bg-red-50 text-red-600 p-4 rounded-lg">
      {error}
    </div>
  ) : (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-tertiary">Subscription Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-primary/10 rounded-lg">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-tertiary/70">Current Plan</p>
              <p className="text-lg sm:text-xl font-bold text-tertiary">
                {subscription?.plan || 'No Plan'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-tertiary/70">Status</p>
              <p className="text-lg sm:text-xl font-bold text-tertiary">
                {subscription?.status?.charAt(0).toUpperCase() + subscription?.status?.slice(1) || 'Inactive'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-tertiary/70">Next Payment</p>
              <p className="text-lg sm:text-xl font-bold text-tertiary">
                {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}
              </p>
              {subscription?.status === 'active' && (
                <button
                  onClick={handleQuickRenewalClick}
                  className="mt-2 text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  <ArrowRight className="w-4 h-4" />
                  Quick Renew
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <SubscriptionCard 
        subscription={subscription} 
        onRenew={handleQuickRenewal}
      />
      
      {(!subscription || subscription.status === 'expired') && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleRenewSubscription}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span>{subscription ? 'Renew Subscription' : 'Get Started'}</span>
          </button>
        </div>
      )}

      <TransactionHistory transactions={transactions} />
      {subscription?.queuedPlans?.length > 0 && (
        <QueuedPlansCard queuedPlans={subscription.queuedPlans} />
      )}

      {/* Quick Renewal Modal */}
      <AlertModal
        isOpen={showQuickRenewalModal}
        onClose={() => setShowQuickRenewalModal(false)}
        title="Confirm Quick Renewal"
        message={`Are you sure you want to renew your ${subscription?.plan} subscription?`}
        confirmText="Renew"
        onConfirm={handleQuickRenewalConfirm}
        isProcessing={isProcessing}
        type="info"
      />
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="pb-[500px]">
        <DashboardSidebar isOpen={isSidebarOpen} toggleSidebar={setIsSidebarOpen} />
        <div className="lg:pl-64">
          <div className="p-4 sm:p-6 lg:p-8 pt-24 sm:pt-26 lg:pt-24">
            <DashboardHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="mt-6 sm:mt-8">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments; 