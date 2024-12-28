import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  AlertCircle,
  User,
  Phone
} from 'lucide-react';

const Register = () => {
  
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    requirements: {
      length: false,
      upperCase: false,
      lowerCase: false,
      number: false,
      special: false
    }
  });
  const [debouncedFormData, setDebouncedFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Input validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number format
    return phoneRegex.test(phone);
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name);
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    return {
      isValid: hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough,
      errors: {
        upperCase: !hasUpperCase,
        lowerCase: !hasLowerCase,
        numbers: !hasNumbers,
        specialChar: !hasSpecialChar,
        length: !isLongEnough
      }
    };
  };

  // Input sanitization
  const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '');
  };

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 8,
      upperCase: /[A-Z]/.test(password),
      lowerCase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;

    return {
      score,
      requirements
    };
  };

  // Real-time input validation
  const validateInput = (name, value) => {
    switch (name) {
      case 'name':
        if (value && !validateName(value)) {
          return 'Name should only contain letters and spaces (2-50 characters)';
        }
        break;
      case 'email':
        if (value && !validateEmail(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (value && !validatePhone(value)) {
          return 'Please enter a valid 10-digit mobile number';
        }
        break;
      case 'password':
        const strength = calculatePasswordStrength(value);
        setPasswordStrength(strength);
        if (value && strength.score < 5) {
          return 'Password must meet all requirements';
        }
        break;
      case 'confirmPassword':
        if (value && value !== formData.password) {
          return 'Passwords do not match';
        }
        break;
      default:
        break;
    }
    return '';
  };

  // Effect for debounced validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedFormData(formData);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Effect for validation
  useEffect(() => {
    if (Object.keys(debouncedFormData).some(key => debouncedFormData[key])) {
      const newErrors = {};
      Object.keys(debouncedFormData).forEach(field => {
        const error = validateInput(field, debouncedFormData[field]);
        if (error) {
          newErrors[field] = error;
        }
      });
      setValidationErrors(newErrors);
    }
  }, [debouncedFormData]);

  // Effect for password strength
  useEffect(() => {
    if (debouncedFormData.password) {
      const strength = calculatePasswordStrength(debouncedFormData.password);
      setPasswordStrength(strength);
    }
  }, [debouncedFormData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = sanitizeInput(value);
    
    // Apply specific validation rules
    switch (name) {
      case 'phone':
        sanitizedValue = sanitizedValue.replace(/\D/g, '').slice(0, 10);
        break;
      case 'name':
        sanitizedValue = sanitizedValue.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
        break;
      case 'email':
        sanitizedValue = sanitizedValue.slice(0, 100);
        break;
      case 'password':
      case 'confirmPassword':
        sanitizedValue = sanitizedValue.slice(0, 50);
        break;
      default:
        break;
    }

    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!validateName(formData.name)) {
      errors.name = 'Please enter a valid name (2-50 characters, letters only)';
    }

    if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit mobile number';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = 'Password must contain uppercase, lowercase, number, special character and be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'user'
      });
      
      if (success) {
        navigate('/');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator component
  const PasswordStrengthIndicator = () => (
    <div className="mt-2 space-y-2">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded-full transition-colors ${
              passwordStrength.score >= level
                ? 'bg-primary'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="space-y-1 text-sm">
        <div className={`flex items-center gap-2 ${
          passwordStrength.requirements.length ? 'text-green-600' : 'text-gray-500'
        }`}>
          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
            passwordStrength.requirements.length ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {passwordStrength.requirements.length ? '✓' : '·'}
          </div>
          At least 8 characters
        </div>
        <div className={`flex items-center gap-2 ${
          passwordStrength.requirements.upperCase ? 'text-green-600' : 'text-gray-500'
        }`}>
          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
            passwordStrength.requirements.upperCase ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {passwordStrength.requirements.upperCase ? '✓' : '·'}
          </div>
          One uppercase letter
        </div>
        <div className={`flex items-center gap-2 ${
          passwordStrength.requirements.lowerCase ? 'text-green-600' : 'text-gray-500'
        }`}>
          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
            passwordStrength.requirements.lowerCase ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {passwordStrength.requirements.lowerCase ? '✓' : '·'}
          </div>
          One lowercase letter
        </div>
        <div className={`flex items-center gap-2 ${
          passwordStrength.requirements.number ? 'text-green-600' : 'text-gray-500'
        }`}>
          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
            passwordStrength.requirements.number ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {passwordStrength.requirements.number ? '✓' : '·'}
          </div>
          One number
        </div>
        <div className={`flex items-center gap-2 ${
          passwordStrength.requirements.special ? 'text-green-600' : 'text-gray-500'
        }`}>
          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
            passwordStrength.requirements.special ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {passwordStrength.requirements.special ? '✓' : '·'}
          </div>
          One special character
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/30 via-white to-primary/30 py-20 md:py-24 px-4 md:px-8">
      <div className="max-w-md mx-auto">
        <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-2xl overflow-hidden border border-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary via-accent to-primary p-8 md:p-10 text-white">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold">
                Create your account
              </h2>
              <p className="text-white/90 mt-2">
                Join our community and start your horse journey
              </p>
            </div>
          </div>

          <div className="p-8 md:p-10">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-tertiary mb-2">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <User className={`h-5 w-5 transition-colors duration-200 ${
                      validationErrors.name 
                        ? 'text-red-500' 
                        : formData.name 
                          ? 'text-green-500' 
                          : 'text-tertiary/50'
                    }`} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 border transition-all duration-200 ${
                      validationErrors.name 
                        ? 'border-red-500 bg-red-50/50 focus:border-red-500' 
                        : formData.name 
                          ? 'border-green-500 bg-green-50/50 focus:border-green-500' 
                          : 'border-gray-200 focus:border-primary'
                    } rounded-lg text-tertiary focus:outline-none focus:ring-2 ${
                      validationErrors.name
                        ? 'focus:ring-red-100'
                        : formData.name
                          ? 'focus:ring-green-100'
                          : 'focus:ring-primary/20'
                    }`}
                    placeholder="Enter your full name"
                    maxLength={50}
                    required
                  />
                </div>
                {validationErrors.name && (
                  <div className="mt-1.5 flex items-start gap-1.5">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-500">{validationErrors.name}</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-tertiary mb-2">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className={`h-5 w-5 transition-colors duration-200 ${
                      validationErrors.email 
                        ? 'text-red-500' 
                        : formData.email 
                          ? 'text-green-500' 
                          : 'text-tertiary/50'
                    }`} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 border transition-all duration-200 ${
                      validationErrors.email 
                        ? 'border-red-500 bg-red-50/50 focus:border-red-500' 
                        : formData.email 
                          ? 'border-green-500 bg-green-50/50 focus:border-green-500' 
                          : 'border-gray-200 focus:border-primary'
                    } rounded-lg text-tertiary focus:outline-none focus:ring-2 ${
                      validationErrors.email
                        ? 'focus:ring-red-100'
                        : formData.email
                          ? 'focus:ring-green-100'
                          : 'focus:ring-primary/20'
                    }`}
                    placeholder="Enter your email"
                    maxLength={100}
                    required
                  />
                </div>
                {validationErrors.email && (
                  <div className="mt-1.5 flex items-start gap-1.5">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-tertiary mb-2">
                  Phone Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Phone className={`h-5 w-5 transition-colors duration-200 ${
                      validationErrors.phone 
                        ? 'text-red-500' 
                        : formData.phone 
                          ? 'text-green-500' 
                          : 'text-tertiary/50'
                    }`} />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 border transition-all duration-200 ${
                      validationErrors.phone 
                        ? 'border-red-500 bg-red-50/50 focus:border-red-500' 
                        : formData.phone 
                          ? 'border-green-500 bg-green-50/50 focus:border-green-500' 
                          : 'border-gray-200 focus:border-primary'
                    } rounded-lg text-tertiary focus:outline-none focus:ring-2 ${
                      validationErrors.phone
                        ? 'focus:ring-red-100'
                        : formData.phone
                          ? 'focus:ring-green-100'
                          : 'focus:ring-primary/20'
                    }`}
                    placeholder="Enter your phone number"
                    maxLength={10}
                    required
                  />
                </div>
                {validationErrors.phone && (
                  <div className="mt-1.5 flex items-start gap-1.5">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-500">{validationErrors.phone}</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-tertiary mb-2">
                  Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className={`h-5 w-5 transition-colors duration-200 ${
                      validationErrors.password 
                        ? 'text-red-500' 
                        : passwordStrength.score === 5 
                          ? 'text-green-500' 
                          : 'text-tertiary/50'
                    }`} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-2.5 border transition-all duration-200 ${
                      validationErrors.password 
                        ? 'border-red-500 bg-red-50/50 focus:border-red-500' 
                        : passwordStrength.score === 5 
                          ? 'border-green-500 bg-green-50/50 focus:border-green-500' 
                          : 'border-gray-200 focus:border-primary'
                    } rounded-lg text-tertiary focus:outline-none focus:ring-2 ${
                      validationErrors.password
                        ? 'focus:ring-red-100'
                        : passwordStrength.score === 5
                          ? 'focus:ring-green-100'
                          : 'focus:ring-primary/20'
                    }`}
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-tertiary/70" />
                    ) : (
                      <Eye className="h-4 w-4 text-tertiary/70" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <div className="mt-1.5 flex items-start gap-1.5">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-500">{validationErrors.password}</p>
                  </div>
                )}
                <PasswordStrengthIndicator />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-tertiary mb-2">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className={`h-5 w-5 transition-colors duration-200 ${
                      validationErrors.confirmPassword 
                        ? 'text-red-500' 
                        : formData.confirmPassword 
                          ? 'text-green-500' 
                          : 'text-tertiary/50'
                    }`} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-2.5 border transition-all duration-200 ${
                      validationErrors.confirmPassword 
                        ? 'border-red-500 bg-red-50/50 focus:border-red-500' 
                        : formData.confirmPassword && !validationErrors.confirmPassword
                          ? 'border-green-500 bg-green-50/50 focus:border-green-500' 
                          : 'border-gray-200 focus:border-primary'
                    } rounded-lg text-tertiary focus:outline-none focus:ring-2 ${
                      validationErrors.confirmPassword
                        ? 'focus:ring-red-100'
                        : formData.confirmPassword && !validationErrors.confirmPassword
                          ? 'focus:ring-green-100'
                          : 'focus:ring-primary/20'
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
                {validationErrors.confirmPassword && (
                  <div className="mt-1.5 flex items-start gap-1.5">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary focus:ring-primary/20 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-tertiary">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:text-accent">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-primary hover:text-accent">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-accent transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-tertiary">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary hover:text-accent font-medium"
                >
                  Login here
                </Link>
              </p>
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

export default Register; 