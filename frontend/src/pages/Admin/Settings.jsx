import React, { useState, useEffect } from 'react';
import { AlertCircle, Save } from 'lucide-react';
import api from '../../services/api';
import AdminLayout from '../../admin/AdminLayout';

const AdminSettings = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [settings, setSettings] = useState({
        siteName: '',
        siteDescription: '',
        contactEmail: '',
        supportPhone: '',
        commission: '',
        minListingPrice: '',
        maxListingPrice: '',
        maintenanceMode: false
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.admin.settings.getAll();
                if (response.data?.success) {
                    setSettings(response.data.settings);
                }
            } catch (err) {
                console.error('Failed to fetch settings:', err);
                setError('Failed to load settings. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            
            const response = await api.admin.settings.update(settings);
            if (response.data?.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            console.error('Failed to update settings:', err);
            setError('Failed to update settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (loading && !settings.siteName) {
        return (
            <AdminLayout title="Settings">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex items-center space-x-2 text-tertiary">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span>Loading settings...</span>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout 
            title="Site Settings"
            stats={{
                'Last Updated': new Date(settings.updatedAt).toLocaleDateString(),
                'Maintenance Mode': settings.maintenanceMode ? 'Active' : 'Inactive',
                'Commission Rate': `${settings.commission}%`,
                'Min. Price': `₹${settings.minListingPrice}`
            }}
        >
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center space-x-2 text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center space-x-2 text-green-600">
                            <AlertCircle className="w-5 h-5" />
                            <p>Settings updated successfully!</p>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Basic Settings */}
                    <div className="bg-white rounded-xl border border-secondary p-6 hover:shadow-lg transition-shadow">
                        <h2 className="text-lg font-semibold text-tertiary mb-4">Basic Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-tertiary mb-1">
                                    Site Name
                                </label>
                                <input
                                    type="text"
                                    name="siteName"
                                    value={settings.siteName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-secondary rounded-lg text-tertiary
                                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-tertiary mb-1">
                                    Site Description
                                </label>
                                <textarea
                                    name="siteDescription"
                                    value={settings.siteDescription}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-secondary rounded-lg text-tertiary
                                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Settings */}
                    <div className="bg-white rounded-xl border border-secondary p-6 hover:shadow-lg transition-shadow">
                        <h2 className="text-lg font-semibold text-tertiary mb-4">Contact Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-tertiary mb-1">
                                    Contact Email
                                </label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={settings.contactEmail}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-secondary rounded-lg text-tertiary
                                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-tertiary mb-1">
                                    Support Phone
                                </label>
                                <input
                                    type="tel"
                                    name="supportPhone"
                                    value={settings.supportPhone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-secondary rounded-lg text-tertiary
                                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Business Settings */}
                    <div className="bg-white rounded-xl border border-secondary p-6 hover:shadow-lg transition-shadow">
                        <h2 className="text-lg font-semibold text-tertiary mb-4">Business Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-tertiary mb-1">
                                    Commission Rate (%)
                                </label>
                                <input
                                    type="number"
                                    name="commission"
                                    value={settings.commission}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className="w-full px-4 py-2 border border-secondary rounded-lg text-tertiary
                                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-tertiary mb-1">
                                        Minimum Listing Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="minListingPrice"
                                        value={settings.minListingPrice}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-2 border border-secondary rounded-lg text-tertiary
                                                 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-tertiary mb-1">
                                        Maximum Listing Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        name="maxListingPrice"
                                        value={settings.maxListingPrice}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-2 border border-secondary rounded-lg text-tertiary
                                                 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="maintenanceMode"
                                    checked={settings.maintenanceMode}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-primary border-secondary rounded focus:ring-primary/20"
                                />
                                <label className="text-sm font-medium text-tertiary">
                                    Enable Maintenance Mode
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90
                                 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed
                                 transition-colors"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
};

export default AdminSettings; 