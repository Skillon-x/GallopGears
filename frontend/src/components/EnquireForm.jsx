import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Calendar, Phone, AlertCircle, Loader } from 'lucide-react';
import api from '../services/api';

const EnquireForm = ({ horseId, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [horseDetails, setHorseDetails] = useState(null);
  const [formData, setFormData] = useState({
    message: '',
    contactPreference: 'phone',
    phone: '',
    preferredDate: ''
  });

  useEffect(() => {
    const fetchHorseDetails = async () => {
      try {
        setInitialLoading(true);
        setError(null);
        const response = await api.horses.getDetails(horseId);
        
        if (response?.data?.success) {
          setHorseDetails(response.data.horse);
        } else if (response?.success && response?.horse) {
          setHorseDetails(response.horse);
        } else {
          throw new Error('Horse not found or no longer available');
        }
      } catch (err) {
        console.error('Failed to fetch horse details:', err);
        setError(err.message || 'Failed to load horse details. Please try again.');
        setHorseDetails(null);
      } finally {
        setInitialLoading(false);
      }
    };

    if (horseId) {
      fetchHorseDetails();
    } else {
      setError('Invalid horse ID');
      setInitialLoading(false);
    }
  }, [horseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/inquire/${horseId}` } });
      return;
    }

    if (!user || user.role !== 'user') {
      setError('Only buyers can send inquiries. Please login with a buyer account.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Sending inquiry with data:', {
        horse: horseId,
        message: formData.message,
        contactPreference: formData.contactPreference,
        phone: formData.phone,
        preferredDate: formData.preferredDate
      });

      const response = await api.inquiries.create({
        horse: horseId,
        message: formData.message,
        contactPreference: formData.contactPreference,
        phone: formData.phone,
        preferredDate: formData.preferredDate
      });

      console.log('Inquiry creation response:', response);

      if (response?.data?.success) {
        if (onSuccess) {
          onSuccess(response.data.inquiry);
        } else {
          navigate('/inquiries');
        }
      } else if (response?.success) {
        // Handle old response format
        if (onSuccess) {
          onSuccess(response.inquiry);
        } else {
          navigate('/inquiries');
        }
      } else {
        const errorMessage = response?.data?.message || response?.message || 'Failed to send inquiry';
        console.error('Inquiry creation failed:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Failed to create inquiry:', err);
      // Extract the most meaningful error message
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send inquiry. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user && user.role !== 'user') {
    return (
      <div className="bg-yellow-50 text-yellow-700 p-6 rounded-lg flex flex-col items-center">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="font-medium">Unauthorized Access</p>
        <p className="text-sm mt-2 text-center">
          Only buyers can send inquiries. Please login with a buyer account.
        </p>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-tertiary">Loading horse details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl flex items-start space-x-2">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!horseDetails) {
    return (
      <div className="mb-6 p-4 bg-yellow-50/80 backdrop-blur-sm border border-yellow-200 rounded-xl flex items-start space-x-2">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-yellow-600">Horse Not Found</p>
          <p className="text-sm text-yellow-600 mt-1">This horse listing may have been removed or is no longer available.</p>
          <button
            onClick={onCancel}
            className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Horse Details Summary */}
      <div className="bg-secondary/5 backdrop-blur-sm border border-secondary/10 p-4 rounded-xl">
        <h3 className="font-semibold text-tertiary mb-2">{horseDetails.name}</h3>
        <p className="text-sm text-tertiary/70">
          {horseDetails.breed} • {horseDetails.age.years} years • {horseDetails.location.city}
        </p>
        <p className="text-primary font-semibold mt-1">₹{horseDetails.price.toLocaleString()}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-tertiary mb-2">
          Message to Seller
        </label>
        <div className="relative">
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="I am interested in this horse. Please provide more details."
            required
          />
          <MessageSquare className="w-5 h-5 text-tertiary/50 absolute left-3 top-3" />
        </div>
      </div>

      {/* Contact Preference */}
      <div>
        <label className="block text-sm font-medium text-tertiary mb-2">
          Preferred Contact Method
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="contactPreference"
              value="phone"
              checked={formData.contactPreference === 'phone'}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary/20 border-gray-300"
            />
            <span className="ml-2 text-tertiary">Phone Call</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="contactPreference"
              value="whatsapp"
              checked={formData.contactPreference === 'whatsapp'}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary/20 border-gray-300"
            />
            <span className="ml-2 text-tertiary">WhatsApp</span>
          </label>
        </div>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-tertiary mb-2">
          Contact Number
        </label>
        <div className="relative">
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Your phone number"
            required
          />
          <Phone className="w-5 h-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Preferred Date */}
      <div>
        <label htmlFor="preferredDate" className="block text-sm font-medium text-tertiary mb-2">
          Preferred Visit Date
        </label>
        <div className="relative">
          <input
            type="date"
            id="preferredDate"
            name="preferredDate"
            value={formData.preferredDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
          <Calendar className="w-5 h-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-200 text-tertiary rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Sending...</span>
            </>
          ) : (
            'Send Inquiry'
          )}
        </button>
      </div>
    </form>
  );
};

export default EnquireForm; 