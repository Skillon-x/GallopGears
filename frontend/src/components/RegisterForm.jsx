import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle } from 'lucide-react';

const RegisterForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [debouncedFormData, setDebouncedFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

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

  const validateInput = (name, value) => {
    switch (name) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (value && value.length < 6) {
          return 'Password must be at least 6 characters long';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value.trim();
    
    // Apply specific validation rules
    switch (name) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    
    Object.keys(formData).forEach(field => {
      const error = validateInput(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
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
        <label htmlFor="password" className="block text-sm font-medium text-tertiary mb-2">
          Password
        </label>
        <div className="relative flex items-center">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Lock className={`h-5 w-5 transition-colors duration-200 ${
              validationErrors.password 
                ? 'text-red-500' 
                : formData.password 
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
                : formData.password 
                  ? 'border-green-500 bg-green-50/50 focus:border-green-500' 
                  : 'border-gray-200 focus:border-primary'
            } rounded-lg text-tertiary focus:outline-none focus:ring-2 ${
              validationErrors.password
                ? 'focus:ring-red-100'
                : formData.password
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
                : formData.confirmPassword 
                  ? 'border-green-500 bg-green-50/50 focus:border-green-500' 
                  : 'border-gray-200 focus:border-primary'
            } rounded-lg text-tertiary focus:outline-none focus:ring-2 ${
              validationErrors.confirmPassword
                ? 'focus:ring-red-100'
                : formData.confirmPassword
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

      <button
        type="submit"
        className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-accent transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        Continue
      </button>
    </form>
  );
};

export default RegisterForm; 