import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    CheckCircle,
    Shield,
    Clock,
    ArrowRight,
    Users,
    Headphones,
    Check,
    Award,
    UserPlus,
    AlertCircle
} from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';


// Add Razorpay script
const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

// Add subscription features constants
const SUBSCRIPTION_FEATURES = {
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

const defaultPlans = [
    {
        id: 'trot',
        name: 'Trot',
        price: 1999,
        period: '30 days',
        features: [
            'Up to 5 horse listings',
            'Basic verification level',
            'Up to 5 photos per listing',
            '30-day listing duration',
            'Basic search placement',
            'Basic seller badge',
            'Standard support'
        ],
        recommended: false,
    },
    {
        id: 'gallop',
        name: 'Gallop',
        price: 4999,
        period: '30 days',
        features: [
            'Up to 10 horse listings',
            'Basic verification level',
            'Up to 10 photos per listing',
            '60-day listing duration',
            'Priority search placement',
            'Verified seller badge',
            'Analytics dashboard',
            'Homepage spotlight (2 slots)',
            'Social media sharing',
            'Priority support'
        ],
        recommended: true,
    },
    {
        id: 'royal-stallion',
        name: 'Royal Stallion',
        price: 9999,
        period: '30 days',
        features: [
            'Unlimited horse listings',
            'Premium verification level',
            'Up to 20 photos per listing',
            '90-day listing duration',
            'Premium search placement',
            'Top Seller & Premium Stable badges',
            'Advanced analytics dashboard',
            'Homepage spotlight (5 slots)',
            'Virtual stable tour',
            'Featured listing boosts',
            'Social media promotion',
            'Serious buyer access',
            'Premium support'
        ],
        recommended: false,
    }
];

const SellerSubscriptionPlans = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, checkAuth } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [plans, setPlans] = useState(defaultPlans);
    const { 
        fromRegistration = false, 
        userData = null 
      } = location.state || {};

    useEffect(() => {
        console.log('User data:', userData);
        const fetchPlans = async () => {
            try {
                console.log('Fetching subscription plans...');
                const response = await api.sellers.getPlans();
                console.log('Plans response:', response);
                if (response?.data?.plans) {
                    const formattedPlans = response.data.plans.map(plan => {
                        const features = [];
                        const planFeatures = SUBSCRIPTION_FEATURES[plan.name];
                        
                        if (planFeatures) {
                            // Add listing features
                            features.push(`Up to ${planFeatures.maxListings === 9999 ? 'unlimited' : planFeatures.maxListings} horse listings`);
                            features.push(`Up to ${planFeatures.maxPhotos} photos per listing`);
                            features.push(`${planFeatures.listingDuration}-day listing duration`);
                            
                            // Add verification and placement features
                            features.push(`${planFeatures.verificationLevel.charAt(0).toUpperCase() + planFeatures.verificationLevel.slice(1)} verification level`);
                            features.push(`${planFeatures.searchPlacement.charAt(0).toUpperCase() + planFeatures.searchPlacement.slice(1)} search placement`);
                            
                            // Add badges
                            if (planFeatures.badges && planFeatures.badges.length > 0) {
                                features.push(planFeatures.badges.join(' & '));
                            }
                            
                            // Add analytics
                            if (planFeatures.analytics) {
                                features.push(plan.name === 'Royal Stallion' ? 'Advanced analytics dashboard' : 'Analytics dashboard');
                            }
                            
                            // Add homepage spotlight
                            if (planFeatures.homepageSpotlight > 0) {
                                features.push(`Homepage spotlight (${planFeatures.homepageSpotlight} slots)`);
                            }
                            
                            // Add virtual stable tour
                            if (planFeatures.virtualStableTour) {
                                features.push('Virtual stable tour');
                            }
                            
                            // Add featured listing boosts
                            if (planFeatures.featuredListingBoosts.count > 0) {
                                features.push('Featured listing boosts');
                            }
                            
                            // Add social media
                            if (planFeatures.socialMediaSharing) {
                                features.push('Social media promotion');
                            }
                            
                            // Add serious buyer access
                            if (planFeatures.seriousBuyerAccess) {
                                features.push('Serious buyer access');
                            }
                            
                            // Add support level
                            features.push(plan.name === 'Royal Stallion' ? 'Premium support' : 
                                        plan.name === 'Gallop' ? 'Priority support' : 
                                        'Standard support');
                        }

                        return {
                            id: plan.name.toLowerCase().replace(' ', '-'),
                            name: plan.name,
                            price: plan.name === 'Royal Stallion' ? 9999 :
                                   plan.name === 'Gallop' ? 4999 :
                                   plan.name === 'Trot' ? 1999 : 0,
                            period: '30 days',
                            features: features,
                            recommended: plan.name === 'Gallop'
                        };
                    });
                    setPlans(formattedPlans);
                } else {
                    // If no plans from API, use default plans
                    console.log('Using default plans');
                    setPlans(defaultPlans);
                }
            } catch (error) {
                console.error('Failed to fetch plans:', error);
                setError('Failed to load subscription plans. Please try again.');
                // Use default plans as fallback
                setPlans(defaultPlans);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const verifySubscriptionFeatures = (subscription, planName) => {
        const expectedFeatures = SUBSCRIPTION_FEATURES[planName];
        const features = subscription.features;

        // Verify all features match expected values
        const isValid =
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
            features.seriousBuyerAccess === expectedFeatures.seriousBuyerAccess;

        if (!isValid) {
            throw new Error('Subscription features not properly updated');
        }

        return true;
    }

    const handleSelectPlan = async (plan) => {
        try {
            setLoading(true);
            setError(null);

            // Create subscription order
            console.log('Creating subscription order for:', plan.name);
            const orderResponse = await api.sellers.createSubscriptionOrder({
                package: plan.name,
                duration: 30,
                amount: plan.price
            });

            console.log('Order Response:', orderResponse);

            if (!orderResponse?.data?.success || !orderResponse?.data?.order?.id) {
                throw new Error('Failed to create subscription order');
            }

            // Load Razorpay
            const razorpayLoaded = await loadRazorpay();
            if (!razorpayLoaded) {
                throw new Error('Failed to load payment gateway. Please try again.');
            }

            // Get Razorpay key
            const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
            if (!razorpayKeyId) {
                throw new Error('Payment configuration missing. Please contact support.');
            }

            // Initialize Razorpay options
            const options = {
                key: razorpayKeyId,
                amount: plan.price,
                currency: "INR",
                name: "Galloping Gears",
                description: `${plan.name} Subscription - ${plan.period}`,
                order_id: orderResponse.data.order.id,
                handler: async function (response) {
                    try {
                        console.log('Payment successful, verifying...');
                        
                        // Verify payment
                        const verifyResponse = await api.sellers.verifySubscriptionPayment({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            package: plan.name,
                            duration: 30,
                            amount: plan.price
                        });

                        console.log('Verification response:', verifyResponse);

                        if (!verifyResponse?.data?.success) {
                            throw new Error('Payment verification failed');
                        }

                        // Verify subscription features
                        const subscription = verifyResponse.data.subscription;
                        if (!verifySubscriptionFeatures(subscription, plan.name)) {
                            throw new Error('Subscription features verification failed');
                        }

                        // Force auth refresh to update user state with new subscription
                        await checkAuth(true);

                        // Navigate to dashboard on success
                        navigate('/seller/dashboard', {
                            state: {
                                subscriptionSuccess: true,
                                plan: plan,
                                subscription: subscription
                            }
                        });
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        setError(error.message || 'Payment verification failed. Please contact support.');
                        setLoading(false);
                    }
                },
                modal: {
                    ondismiss: function() {
                        setLoading(false);
                    }
                }
            };

            // Open Razorpay
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error('Subscription error:', error);
            setError(error.message || 'Failed to process subscription. Please try again.');
            setLoading(false);
        }
    };

    // Update the plan display to show features from the API
    const renderFeatures = (features) => {
        const featureList = [];

        if (features.maxListings) {
            featureList.push(features.maxListings);
        }
        if (features.maxPhotos) {
            featureList.push(features.maxPhotos);
        }
        if (features.listingDuration) {
            featureList.push(features.listingDuration);
        }
        if (features.verificationLevel !== 'none') {
            featureList.push(features.verificationLevel);
        }
        if (features.virtualStableTour !== 'Not included') {
            featureList.push('Virtual Stable Tour');
        }
        if (features.analytics !== 'Not included') {
            featureList.push(features.analytics);
        }
        if (features.homepageSpotlight !== 'Not included') {
            featureList.push(features.homepageSpotlight);
        }
        if (features.featuredListingBoosts.count !== 'Not included') {
            featureList.push(`${features.featuredListingBoosts.count}`);
        }
        if (features.priorityPlacement !== 'Standard placement') {
            featureList.push('Priority Placement');
        }
        if (features.badges && features.badges.length > 0) {
            featureList.push(...features.badges);
        }
        if (features.searchPlacement !== 'none') {
            featureList.push(`${features.searchPlacement}`);
        }
        if (features.socialMediaSharing !== 'Not included') {
            featureList.push('Social Media Promotion');
        }
        if (features.seriousBuyerAccess !== 'Not included') {
            featureList.push('Serious Buyer Access');
        }

        return featureList;
    };

    const handlePlanAction = (plan) => {
        if (!isAuthenticated) {
            // If not authenticated, redirect to seller registration
            navigate('/register/seller', { 
                state: { 
                    selectedPlan: plan.name,
                    returnUrl: '/pricing'
                }
            });
        } else if (user?.role === 'seller') {
            // If already a seller, handle subscription
            handleSelectPlan(plan);
        } else {
            // If authenticated but not a seller, redirect to seller registration
            navigate('/register/seller', {
                state: {
                    selectedPlan: plan.name,
                    returnUrl: '/pricing'
                }
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-accent/30 via-white to-primary/30 py-20 md:py-24 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-accent/30 via-white to-primary/30 py-20 md:py-24 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-2xl overflow-hidden border border-white/50 p-8">
                        <div className="text-red-600 mb-4 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-accent/30 via-white to-primary/30">
            {/* Hero Section */}
            <div className="pt-20 md:pt-24">
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-3xl md:text-4xl font-bold text-tertiary mb-4">
                            Choose Your Perfect Plan
                        </h1>
                        <p className="text-lg text-tertiary/70 mb-8">
                            Get started with the perfect plan for your business. Unlock premium features and grow your equestrian business.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <div className="flex items-center space-x-2 backdrop-blur-sm bg-white/80 px-4 py-2 rounded-lg border border-white/50">
                                <CheckCircle className="w-5 h-5 text-primary" />
                                <span className="text-sm text-tertiary">Cancel Anytime</span>
                            </div>
                            <div className="flex items-center space-x-2 backdrop-blur-sm bg-white/80 px-4 py-2 rounded-lg border border-white/50">
                                <Shield className="w-5 h-5 text-primary" />
                                <span className="text-sm text-tertiary">Secure Payment</span>
                            </div>
                            <div className="flex items-center space-x-2 backdrop-blur-sm bg-white/80 px-4 py-2 rounded-lg border border-white/50">
                                <Clock className="w-5 h-5 text-primary" />
                                <span className="text-sm text-tertiary">24/7 Support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative backdrop-blur-sm bg-white/90 rounded-2xl shadow-xl overflow-hidden border transition-all duration-300 hover:scale-105 ${
                                plan.recommended 
                                    ? 'border-primary shadow-primary/20' 
                                    : 'border-white'
                            }`}
                        >
                            {plan.recommended && (
                                <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                                    Recommended
                                </div>
                            )}
                            
                            {/* Plan Header */}
                            <div className="p-6 md:p-8 bg-gradient-to-br from-primary/5 to-transparent">
                                <h3 className="text-xl font-bold text-tertiary mb-4">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-primary">₹{plan.price.toLocaleString('en-IN')}</span>
                                    <span className="text-tertiary/70">/{plan.period}</span>
                                </div>
                                <p className="mt-2 text-sm text-tertiary/70">
                                    {plan.name === 'Royal Stallion' 
                                        ? 'Perfect for professional sellers'
                                        : plan.name === 'Gallop'
                                        ? 'Great for growing businesses'
                                        : 'Best for getting started'}
                                </p>
                            </div>

                            {/* Features List */}
                            <div className="p-6 md:p-8 border-t border-gray-100">
                                <ul className="space-y-4">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                            <span className="text-sm text-tertiary">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Action Button */}
                            <div className="p-6 md:p-8 bg-gray-50/50">
                                <button
                                    onClick={() => handlePlanAction(plan)}
                                    disabled={loading}
                                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-base font-medium transition-all duration-200
                                        ${plan.recommended 
                                            ? 'bg-primary text-white hover:bg-accent' 
                                            : 'bg-white text-primary border-2 border-primary hover:bg-primary/5'
                                        }
                                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            {!isAuthenticated || user?.role !== 'seller' ? (
                                                <>
                                                    <UserPlus className="w-5 h-5" />
                                                    <span>Get Started</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ArrowRight className="w-5 h-5" />
                                                    <span>Subscribe</span>
                                                </>
                                            )}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto mt-24">
                    <h2 className="text-2xl font-bold text-tertiary text-center mb-8">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        <div className="backdrop-blur-sm bg-white/90 rounded-xl p-6 border border-white/50">
                            <h3 className="font-semibold text-tertiary">What payment methods do you accept?</h3>
                            <p className="mt-2 text-tertiary/70">We accept all major credit cards, debit cards, and UPI payments through our secure payment gateway.</p>
                        </div>
                        <div className="backdrop-blur-sm bg-white/90 rounded-xl p-6 border border-white/50">
                            <h3 className="font-semibold text-tertiary">Can I upgrade my plan later?</h3>
                            <p className="mt-2 text-tertiary/70">Yes, you can upgrade your plan at any time. The price difference will be prorated for the remaining period.</p>
                        </div>
                        <div className="backdrop-blur-sm bg-white/90 rounded-xl p-6 border border-white/50">
                            <h3 className="font-semibold text-tertiary">What happens when my subscription ends?</h3>
                            <p className="mt-2 text-tertiary/70">Your listings will become inactive until you renew your subscription. You can reactivate them by renewing your plan.</p>
                        </div>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-24">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="backdrop-blur-sm bg-white/90 rounded-xl p-6 border border-white/50 text-center hover:shadow-lg transition-shadow">
                            <Shield className="w-8 h-8 text-primary mx-auto mb-4" />
                            <h3 className="font-semibold text-tertiary">Secure Payments</h3>
                            <p className="mt-2 text-sm text-tertiary/70">Your transactions are secure and encrypted</p>
                        </div>
                        <div className="backdrop-blur-sm bg-white/90 rounded-xl p-6 border border-white/50 text-center hover:shadow-lg transition-shadow">
                            <Users className="w-8 h-8 text-primary mx-auto mb-4" />
                            <h3 className="font-semibold text-tertiary">10,000+ Sellers</h3>
                            <p className="mt-2 text-sm text-tertiary/70">Join our growing community</p>
                        </div>
                        <div className="backdrop-blur-sm bg-white/90 rounded-xl p-6 border border-white/50 text-center hover:shadow-lg transition-shadow">
                            <Headphones className="w-8 h-8 text-primary mx-auto mb-4" />
                            <h3 className="font-semibold text-tertiary">24/7 Support</h3>
                            <p className="mt-2 text-sm text-tertiary/70">We're here to help you succeed</p>
                        </div>
                        <div className="backdrop-blur-sm bg-white/90 rounded-xl p-6 border border-white/50 text-center hover:shadow-lg transition-shadow">
                            <Award className="w-8 h-8 text-primary mx-auto mb-4" />
                            <h3 className="font-semibold text-tertiary">Premium Features</h3>
                            <p className="mt-2 text-sm text-tertiary/70">Access exclusive seller tools</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerSubscriptionPlans; 