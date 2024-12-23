import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  ChevronLeft,
  Send,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import MainNavigation from './MainNavigation';
import { useAuth } from '../../context/AuthContext';

const EnquiryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [horse, setHorse] = useState(null);
  const [formData, setFormData] = useState({
    message: '',
    contactPreference: 'email',
    phone: user?.phone || '',
    email: user?.email || '',
    availableTime: 'anytime'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/enquire/${id}` } });
      return;
    }
    fetchHorseDetails();
  }, [id, isAuthenticated]);

  const fetchHorseDetails = async () => {
    try {
      setLoading(true);
      const response = await api.horses.getDetails(id);
      if (response?.data?.success) {
        setHorse(response.data.horse);
      } else {
        throw new Error('Failed to fetch horse details');
      }
    } catch (err) {
      setError('Failed to load horse details. Please try again.');
      console.error('Error fetching horse details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await api.inquiries.create({
        horse: id,
        ...formData
      });

      if (response?.data?.success) {
        navigate('/inquiries', { 
          state: { 
            success: true, 
            message: 'Your inquiry has been sent successfully!' 
          }
        });
      } else {
        throw new Error(response?.data?.message || 'Failed to send inquiry');
      }
    } catch (err) {
      setError(err.message || 'Failed to send inquiry. Please try again.');
      console.error('Error sending inquiry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavigation />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-32 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !horse) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavigation />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error || 'Horse not found'}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(`/horses/${id}`)}
            className="flex items-center text-tertiary hover:text-primary mb-6"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to listing
          </button>

          {/* Horse Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex gap-4">
              <img
                src={horse.images?.[0]?.url || '/placeholder-horse.jpg'}
                alt={horse.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div>
                <h2 className="font-semibold text-tertiary">{horse.name}</h2>
                <p className="text-primary font-medium">₹{horse.price?.toLocaleString()}</p>
                <p className="text-sm text-tertiary/70">Listed by {horse.seller?.businessName}</p>
              </div>
            </div>
          </div>

          {/* Enquiry Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-tertiary mb-6">Send Enquiry</h1>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-tertiary mb-2">
                  Your Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="I am interested in this horse and would like to know more about..."
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              {/* Contact Preference */}
              <div>
                <label className="block text-sm font-medium text-tertiary mb-2">
                  Preferred Contact Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange({ target: { name: 'contactPreference', value: 'email' } })}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                      formData.contactPreference === 'email'
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'border-gray-200 text-tertiary hover:border-primary hover:text-primary'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange({ target: { name: 'contactPreference', value: 'phone' } })}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                      formData.contactPreference === 'phone'
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'border-gray-200 text-tertiary hover:border-primary hover:text-primary'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    <span>Phone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange({ target: { name: 'contactPreference', value: 'both' } })}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                      formData.contactPreference === 'both'
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'border-gray-200 text-tertiary hover:border-primary hover:text-primary'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Both</span>
                  </button>
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tertiary mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required={['phone', 'both'].includes(formData.contactPreference)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-tertiary mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required={['email', 'both'].includes(formData.contactPreference)}
                  />
                </div>
              </div>

              {/* Available Time */}
              <div>
                <label className="block text-sm font-medium text-tertiary mb-2">
                  Best Time to Contact
                </label>
                <select
                  name="availableTime"
                  value={formData.availableTime}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="anytime">Anytime</option>
                  <option value="morning">Morning (9 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                  <option value="evening">Evening (5 PM - 9 PM)</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full flex items-center justify-center space-x-2 py-3 bg-primary text-white rounded-lg transition-colors ${
                  submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'
                }`}
              >
                <Send className="w-5 h-5" />
                <span>{submitting ? 'Sending...' : 'Send Enquiry'}</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnquiryForm; 