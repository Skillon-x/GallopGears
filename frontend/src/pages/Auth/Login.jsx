import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  AlertCircle,
  Store,
  User,
  Info
} from 'lucide-react';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Input sanitization
  const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '');
  };

  const handleEmailChange = (e) => {
    const sanitizedEmail = sanitizeInput(e.target.value);
    setEmail(sanitizedEmail);
  };

  const handlePasswordChange = (e) => {
    const sanitizedPassword = sanitizeInput(e.target.value);
    if (sanitizedPassword.length <= 50) { // Maximum length check
      setPassword(sanitizedPassword);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate email
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Save email if remember me is checked
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        // Redirect to the intended page or default
        const from = location.state?.from?.pathname || '/';
        navigate(from);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/30 via-white to-primary/30 py-20 md:py-24 px-4 md:px-8">
      <div className="max-w-md mx-auto">
        <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-2xl overflow-hidden border border-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary via-accent to-primary p-8 md:p-10 text-white">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold">
                Welcome back!
              </h2>
              <p className="text-white/90 mt-2">
                Login to continue your journey
              </p>
            </div>
          </div>

          <div className="p-8 md:p-10">
            {/* Info Message */}
            <div className="mb-6 p-4 bg-primary/5 backdrop-blur-sm border border-primary/10 rounded-xl flex items-start space-x-3">
              <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-tertiary">
                Your account type (buyer or seller) will be automatically detected upon login. If you're a seller, you'll be redirected to your seller dashboard.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-tertiary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    maxLength={100}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter your email"
                    required
                  />
                  <Mail className="h-5 w-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-tertiary mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    minLength={8}
                    maxLength={50}
                    className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter your password"
                    required
                  />
                  <Lock className="h-5 w-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-tertiary/70" />
                    ) : (
                      <Eye className="h-4 w-4 text-tertiary/70" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary/20 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-tertiary">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:text-accent"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>

            {/* Registration Links */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-tertiary">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-primary hover:text-accent font-medium"
                >
                  Register now
                </Link>
              </p>
              <p className="text-tertiary text-sm">
                Want to sell horses?{' '}
                <Link
                  to="/register/seller"
                  className="text-primary hover:text-accent font-medium"
                >
                  Become a seller
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 