import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, Mail, Phone, MapPin, Bell, Store, DollarSign, MessageSquare } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { toast } from 'react-hot-toast';
import AlertModal from '../../components/AlertModal';

const SettingsSection = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-6">
      <h2 className="text-lg font-semibold text-tertiary mb-4">{title}</h2>
      {children}
    </div>
  </div>
);

const NotificationSettings = () => {
  const [preferences, setPreferences] = useState({
    priceDrops: true,
    newListings: true,
    inquiryResponses: true,
    marketUpdates: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await api.users.alerts();
      if (response.data?.success && response.data?.alertPreferences) {
        setPreferences(response.data.alertPreferences);
        setError(null);
      }
    } catch (err) {
      setError('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (key) => {
    try {
      const newPreferences = { ...preferences, [key]: !preferences[key] };
      const response = await api.users.updateAlerts(newPreferences);
      if (response.data?.success) {
        setPreferences(newPreferences);
        setError(null);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError('Failed to update preferences');
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {success && (
        <div className="p-4 bg-green-50 text-green-600 text-sm rounded-xl">
          Notification preferences updated successfully
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-medium text-tertiary">Inquiry Notifications</h3>
            <p className="text-sm text-tertiary/70">Get notified about new inquiries and responses</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.inquiryResponses}
            onChange={() => handlePreferenceChange('inquiryResponses')}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
        <div className="flex items-center space-x-3">
          <Store className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-medium text-tertiary">Market Updates</h3>
            <p className="text-sm text-tertiary/70">Receive updates about market trends and opportunities</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.marketUpdates}
            onChange={() => handlePreferenceChange('marketUpdates')}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
        <div className="flex items-center space-x-3">
          <DollarSign className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-medium text-tertiary">Payment Notifications</h3>
            <p className="text-sm text-tertiary/70">Get notified about payments and subscription updates</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.priceDrops}
            onChange={() => handlePreferenceChange('priceDrops')}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
    </div>
  );
};

const Settings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    businessName: '',
    description: '',
    location: {
      state: '',
      city: '',
      pincode: ''
    },
    contactDetails: {
      email: '',
      phone: '',
      whatsapp: ''
    }
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    newInquiries: true,
    paymentUpdates: true,
    marketingEmails: false
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchSettings();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const fetchSettings = async () => {
    try {
      const profileRes = await api.sellers.getProfile();
      
      if (profileRes?.data?.success && profileRes?.data?.seller) {
        const seller = profileRes.data.seller;
        setProfile({
          businessName: seller.businessName || '',
          description: seller.description || '',
          location: {
            state: seller.location?.state || '',
            city: seller.location?.city || '',
            pincode: seller.location?.pincode || ''
          },
          contactDetails: {
            email: seller.contactDetails?.email || '',
            phone: seller.contactDetails?.phone || '',
            whatsapp: seller.contactDetails?.whatsapp || ''
          }
        });
      }
      
      setLoading(false);
    } catch (err) {
      setError(err?.message || 'Failed to load settings');
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.sellers.updateProfile(profile);
      if (response?.data?.success) {
        setError(null);
        setShowSuccessModal(true);
      }
    } catch (err) {
      setError(err?.message || 'Failed to update profile');
      toast.error('Failed to update profile');
    }
  };

  const handleNotificationUpdate = async (key) => {
    if (!notifications || !key) return;
    
    const updatedNotifications = {
      ...notifications,
      [key]: !notifications[key]
    };
    try {
      const response = await api.sellers.updateNotificationSettings(updatedNotifications);
      if (response?.data?.success) {
        setNotifications(updatedNotifications);
        toast.success('Notification settings updated');
      }
    } catch (err) {
      setError(err?.message || 'Failed to update notification settings');
      toast.error('Failed to update notification settings');
    }
  };

  const toggleSidebar = (value) => {
    setIsSidebarOpen(value ?? !isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 w-full lg:ml-64 min-h-screen pb-24">
          <div className="pt-24 px-4 lg:px-8 mb-8">
            <div className="max-w-7xl mx-auto">
              <DashboardHeader toggleSidebar={toggleSidebar} />
              <div className="space-y-6 mt-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                    <div className="space-y-4">
                      <div className="h-10 bg-gray-200 rounded" />
                      <div className="h-10 bg-gray-200 rounded" />
                      <div className="h-10 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 w-full lg:ml-64 min-h-screen pb-24">
          <div className="pt-24 px-4 lg:px-8 mb-8">
            <div className="max-w-7xl mx-auto">
              <DashboardHeader toggleSidebar={toggleSidebar} />
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mt-8">
                {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 w-full lg:ml-64 min-h-screen pb-24">
        <div className="pt-24 px-4 lg:px-8 mb-8">
          <div className="max-w-7xl mx-auto">
            <DashboardHeader toggleSidebar={toggleSidebar} />
            <div className="space-y-8 mt-8">
              <h1 className="text-2xl font-bold text-tertiary">Settings</h1>

              <SettingsSection title="Profile Information">
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-tertiary">Business Name</label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Store className="h-5 w-5 text-tertiary/40" />
                        </div>
                        <input
                          type="text"
                          value={profile?.businessName || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, businessName: e.target.value }))}
                          className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-tertiary">Email</label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-tertiary/40" />
                        </div>
                        <input
                          type="email"
                          value={profile?.contactDetails?.email || ''}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            contactDetails: { ...(prev?.contactDetails || {}), email: e.target.value }
                          }))}
                          className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-tertiary">Phone</label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-tertiary/40" />
                        </div>
                        <input
                          type="tel"
                          value={profile?.contactDetails?.phone || ''}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            contactDetails: { ...(prev?.contactDetails || {}), phone: e.target.value }
                          }))}
                          className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-tertiary">WhatsApp (Optional)</label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-tertiary/40" />
                        </div>
                        <input
                          type="tel"
                          value={profile?.contactDetails?.whatsapp || ''}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            contactDetails: { ...(prev?.contactDetails || {}), whatsapp: e.target.value }
                          }))}
                          className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-tertiary">Description</label>
                      <div className="mt-1">
                        <textarea
                          value={profile?.description || ''}
                          onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-tertiary">State</label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-tertiary/40" />
                        </div>
                        <input
                          type="text"
                          value={profile?.location?.state || ''}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            location: { ...(prev?.location || {}), state: e.target.value }
                          }))}
                          className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-tertiary">City</label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-tertiary/40" />
                        </div>
                        <input
                          type="text"
                          value={profile?.location?.city || ''}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            location: { ...(prev?.location || {}), city: e.target.value }
                          }))}
                          className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-tertiary">Pincode</label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-tertiary/40" />
                        </div>
                        <input
                          type="text"
                          value={profile?.location?.pincode || ''}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            location: { ...(prev?.location || {}), pincode: e.target.value }
                          }))}
                          className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </SettingsSection>

              <SettingsSection title="Notification Preferences">
                <NotificationSettings />
              </SettingsSection>
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Profile Updated"
        message="Your profile has been successfully updated!"
        type="success"
        showCancel={false}
        autoClose={true}
        autoCloseDelay={2000}
      />
    </div>
  );
};

export default Settings; 