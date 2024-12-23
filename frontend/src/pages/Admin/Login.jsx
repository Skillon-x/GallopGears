import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAdmin } = useAuth();
  const errorShown = useRef(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      errorShown.current = false;
      return;
    }

    if (isAdmin && location.pathname !== '/admin/dashboard') {
      navigate('/admin/dashboard');
      return;
    }

    if (!isAdmin && !errorShown.current) {
      setError('Access denied. Admin privileges required.');
      errorShown.current = true;
    }
  }, [user, isAdmin, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    errorShown.current = false;
    setLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-accent/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8">
        {/* Header with Icon */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-tertiary">
            Admin Portal
          </h2>
          <p className="text-tertiary/70 mt-2">
            Secure access to administration dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-tertiary mb-2">
              Email Address
            </label>
            <div className="relative group">
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-tertiary bg-white/70 backdrop-blur-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20
                         group-hover:border-primary/20 transition-colors duration-200"
                placeholder="Enter your email"
                required
              />
              <Mail className="h-5 w-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2 group-hover:text-primary/70 transition-colors duration-200" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-tertiary mb-2">
              Password
            </label>
            <div className="relative group">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-lg text-tertiary bg-white/70 backdrop-blur-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20
                         group-hover:border-primary/20 transition-colors duration-200"
                placeholder="Enter your password"
                required
              />
              <Lock className="h-5 w-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2 group-hover:text-primary/70 transition-colors duration-200" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-primary/10 rounded-lg transition-all duration-200"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-tertiary/70" />
                ) : (
                  <Eye className="h-4 w-4 text-tertiary/70" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 px-4 rounded-lg hover:bg-accent 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20
                     transition-all duration-200 flex items-center justify-center space-x-2 
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Login to Dashboard</span>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-tertiary/70">
            This is a secure area. Only authorized personnel allowed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 