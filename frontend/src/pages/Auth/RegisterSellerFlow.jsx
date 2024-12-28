import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RegisterForm from '../../components/RegisterForm';
import SellerProfileForm from '../../components/SellerProfileForm';
import api from '../../services/api';
import { AlertCircle } from 'lucide-react';

const steps = ['Register Account', 'Create Seller Profile', 'Choose Subscription'];

const RegisterSellerFlow = () => {
    const navigate = useNavigate();
    const { login, user, isAuthenticated, checkAuth } = useAuth();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.log('RegisterSellerFlow mounted/updated');
        console.log('Current state:', {
            isAuthenticated,
            user,
            activeStep,
            userData
        });

        const fetchUserProfile = async () => {
            if (isAuthenticated && !user?.isSeller) {
                try {
                    console.log('Fetching user profile...');
                    const response = await api.auth.getProfile();
                    console.log('User profile response:', response);
                    if (response?.data?.user) {
                        console.log('Setting active step and user data');
                        // Set registration intent and step if coming from registration
                        const currentPath = window.location.pathname;
                        if (currentPath === '/register/seller') {
                            console.log('Setting registration intent and step 1');
                            localStorage.setItem('sellerRegistrationIntent', 'true');
                            localStorage.setItem('registrationStep', '1');
                            setActiveStep(1);
                        } else if (currentPath === '/pricing' && response.data.user.role === 'pending_seller') {
                            console.log('Setting registration step 2');
                            localStorage.setItem('sellerRegistrationIntent', 'true');
                            localStorage.setItem('registrationStep', '2');
                            setActiveStep(2);
                        }
                        setUserData(response.data.user);
                    }
                } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                    setError('Failed to fetch user profile. Please try again.');
                }
            }
        };

        fetchUserProfile();

        // Cleanup function
        return () => {
            // Clear registration intent if user completes or leaves flow
            if (user?.isSeller || (!isAuthenticated && activeStep === 0)) {
                localStorage.removeItem('sellerRegistrationIntent');
                localStorage.removeItem('registrationStep');
            }
        };
    }, [isAuthenticated, user, activeStep]);

    useEffect(() => {
        console.log('Navigation check - Current step:', activeStep);
        if (activeStep === 2) {
            console.log('Step is 2, should navigate to subscription');
        }
    }, [activeStep]);

    const handleUserRegistration = async (formData) => {
        setLoading(true);
        setError(null);
        try {
            // Set registration intent in both server and localStorage
            const registerResponse = await api.auth.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'user',
                registrationStep: 1,
                isSellerRegistration: true,
                registrationTimestamp: new Date()
            });

            if (registerResponse.data?.success) {
                console.log('User registered successfully, token:', registerResponse.data.token);
                const loginSuccess = await login(formData.email, formData.password);

                if (loginSuccess) {
                    // Set localStorage as backup
                    localStorage.setItem('sellerRegistrationIntent', 'true');
                    localStorage.setItem('registrationStep', '1');
                    localStorage.setItem('registrationTimestamp', new Date().toISOString());

                    const profileResponse = await api.auth.getProfile();
                    if (profileResponse?.data?.user) {
                        console.log('User profile after login:', profileResponse.data.user);
                        setUserData(profileResponse.data.user);
                        setActiveStep(1);
                        navigate('/register/seller', { replace: true });
                    } else {
                        throw new Error('Failed to get user profile');
                    }
                } else {
                    throw new Error('Login failed after registration');
                }
            }
        } catch (error) {
            console.error('Registration failed:', error);
            setError(error.response?.data?.message || error.message || 'Registration failed. Please try again.');
            // Clear registration intent on failure
            localStorage.removeItem('sellerRegistrationIntent');
            localStorage.removeItem('registrationStep');
            localStorage.removeItem('registrationTimestamp');
        } finally {
            setLoading(false);
        }
    };

    const handleSellerProfileCreation = async (formData) => {
        setLoading(true);
        setError(null);
        try {
            console.log('Step 1: Starting seller profile creation');
            console.log('User data available:', userData);
            console.log('Form data received:', formData);

            // Update registration step in both server and localStorage
            localStorage.setItem('registrationStep', '2');
            localStorage.setItem('registrationTimestamp', new Date().toISOString());

            const sellerProfileData = {
                businessName: formData.businessName,
                description: formData.description,
                location: {
                    state: formData.state,
                    city: formData.city,
                    pincode: formData.pincode
                },
                contactDetails: {
                    phone: formData.phone,
                    email: userData?.email,
                    whatsapp: formData.whatsapp || formData.phone
                },
                businessDocuments: {
                    ...(formData.gstNumber && { gst: formData.gstNumber }),
                    ...(formData.panNumber && { pan: formData.panNumber })
                },
                registrationStep: 2,
                role: 'pending_seller',
                registrationTimestamp: new Date()
            };

            console.log('Step 2: Sending seller profile data to server:', sellerProfileData);
            const response = await api.sellers.createProfile(sellerProfileData);
            console.log('Step 3: Server response from profile creation:', response);

            if (response?.data?.success) {
                console.log('Step 4: Seller profile created successfully');

                try {
                    console.log('Step 5: Fetching updated user profile');
                    const updatedProfile = await api.auth.getProfile();
                    console.log('Step 6: Updated user profile received:', updatedProfile);

                    if (updatedProfile?.data?.user) {
                        console.log('Step 7: Setting user data and updating step');
                        setUserData(updatedProfile.data.user);
                        await checkAuth(true);
                        setActiveStep(2);
                        navigate('/pricing', { 
                            replace: true,
                            state: { 
                                fromRegistration: true,
                                userData: updatedProfile.data.user 
                            }
                        });
                    } else {
                        throw new Error('Updated user profile is missing');
                    }
                } catch (profileError) {
                    console.error('Error fetching updated profile:', profileError);
                    throw new Error('Failed to get updated user profile');
                }
            } else {
                throw new Error('Seller profile creation did not return success');
            }
        } catch (error) {
            console.error('Seller profile creation failed:', error);
            console.error('Full error object:', error);
            console.error('Error response:', error.response?.data);
            setError(error.response?.data?.message || error.message || 'Failed to create seller profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return <RegisterForm onSubmit={handleUserRegistration} />;
            case 1:
                return <SellerProfileForm onSubmit={handleSellerProfileCreation} />;
            default:
                return null;
        }
    };

    if (isAuthenticated && user?.isSeller) {
        navigate('/seller/dashboard');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-accent/30 via-white to-primary/30 py-20 md:py-24 px-4 md:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-2xl overflow-hidden border border-white">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary via-accent to-primary p-8 md:p-10 text-white">
                        <h1 className="text-2xl md:text-3xl font-bold text-center">
                            Become a Seller
                        </h1>
                        <p className="text-white/90 mt-2">
                            Join our marketplace and start selling your horses
                        </p>
                    </div>

                    {/* Stepper */}
                    <div className="px-8 md:px-10 py-12">
                        <div className="flex justify-between mb-12 relative">
                            {steps.map((label, index) => (
                                <div key={label} className="flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 
                                        shadow-lg transition-all duration-300 text-base font-medium relative z-10
                                        ${index === activeStep 
                                            ? 'bg-primary text-white scale-110 shadow-primary/30' 
                                            : index < activeStep 
                                                ? 'bg-accent text-white shadow-accent/30'
                                                : 'bg-white text-tertiary border border-gray-200'
                                        }`}
                                    >
                                        {index + 1}
                                    </div>
                                    <div className="text-sm text-center">
                                        <span className={`
                                            ${index <= activeStep 
                                                ? 'text-primary font-medium' 
                                                : 'text-tertiary/50'
                                            }
                                            transition-colors duration-300
                                        `}>
                                            {label}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`hidden sm:block absolute left-0 w-full h-0.5 top-5 -z-0
                                            ${index < activeStep 
                                                ? 'bg-accent' 
                                                : 'bg-gray-200'
                                            }
                                            transition-colors duration-300
                                        `} 
                                        style={{ left: '50%' }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-8 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl flex items-start space-x-2">
                                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Form Content */}
                        <div className="relative max-w-2xl mx-auto">
                            {loading ? (
                                <div className="flex justify-center items-center py-16">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                                </div>
                            ) : (
                                <div className="transition-all duration-300">
                                    {renderStepContent(activeStep)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-12 text-center">
                    <div className="backdrop-blur-sm bg-white/80 rounded-xl py-5 px-8 inline-block shadow-lg border border-white/50">
                        <p className="text-gray-700">
                            Need help? Contact our support team at{' '}
                            <a href="mailto:support@gallopinggears.com" className="text-primary hover:text-accent transition-colors font-medium">
                                support@gallopinggears.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterSellerFlow; 