import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle } from 'lucide-react';

const RegisterForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState({
    email: true,
    password: true,
    confirmPassword: true,
  });

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'password':
        return value.length >= 6;
      case 'confirmPassword':
        return value === formData.password;
      default:
        return true;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (['email', 'password', 'confirmPassword'].includes(name)) {
      setValidation(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const validations = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
    };

    setValidation(validations);

    if (Object.values(validations).every(Boolean)) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-tertiary mb-2">
          Full Name
        </label>
        <div className="relative">
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Enter your full name"
            required
          />
          <User className="h-5 w-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-tertiary mb-2">
          Email Address
        </label>
        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              !validation.email && formData.email !== '' ? 'border-red-300' : 'border-gray-200'
            }`}
            placeholder="Enter your email"
            required
          />
          <Mail className="h-5 w-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
          {!validation.email && formData.email !== '' && (
            <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Please enter a valid email address
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-tertiary mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            className={`w-full pl-10 pr-12 py-2 border rounded-lg text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              !validation.password && formData.password !== '' ? 'border-red-300' : 'border-gray-200'
            }`}
            placeholder="Create a password"
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
          {!validation.password && formData.password !== '' && (
            <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Password must be at least 6 characters long
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-tertiary mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              !validation.confirmPassword && formData.confirmPassword !== '' ? 'border-red-300' : 'border-gray-200'
            }`}
            placeholder="Confirm your password"
            required
          />
          <Lock className="h-5 w-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
          {!validation.confirmPassword && formData.confirmPassword !== '' && (
            <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Passwords do not match
            </div>
          )}
        </div>
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