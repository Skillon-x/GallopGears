import React, { useState } from 'react';
import { Building2, Phone, MapPin, FileText, AlertCircle } from 'lucide-react';

const SellerProfileForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    phone: '',
    whatsapp: '',
    state: '',
    city: '',
    pincode: '',
    gstNumber: '',
    panNumber: '',
  });

  const [validation, setValidation] = useState({
    phone: true,
    pincode: true,
    gstNumber: true,
    panNumber: true,
  });

  const validateField = (name, value) => {
    switch (name) {
      case 'phone':
        return /^[0-9]{10}$/.test(value);
      case 'pincode':
        return /^[0-9]{6}$/.test(value);
      case 'gstNumber':
        return value ? /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value) : true;
      case 'panNumber':
        return value ? /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value) : true;
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

    if (['phone', 'pincode', 'gstNumber', 'panNumber'].includes(name)) {
      setValidation(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submission - current form data:', formData);

    // Check for required fields
    const requiredFields = {
      businessName: 'Business Name',
      description: 'Business Description',
      phone: 'Phone Number',
      state: 'State',
      city: 'City',
      pincode: 'Pincode'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !formData[key])
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return;
    }

    // Validate required fields
    const validations = {
      phone: validateField('phone', formData.phone),
      pincode: validateField('pincode', formData.pincode),
      gstNumber: formData.gstNumber ? validateField('gstNumber', formData.gstNumber) : true,
      panNumber: formData.panNumber ? validateField('panNumber', formData.panNumber) : true,
    };

    setValidation(validations);

    if (Object.values(validations).every(Boolean)) {
      console.log('Form validation passed, submitting data:', formData);
      onSubmit(formData);
    } else {
      console.error('Form validation failed:', validations);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Business Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-tertiary">
          Business Information
        </h3>

        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-tertiary mb-2">
            Business Name
          </label>
          <div className="relative">
            <input
              id="businessName"
              name="businessName"
              type="text"
              value={formData.businessName}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Enter your business name"
              required
            />
            <Building2 className="h-5 w-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-tertiary mb-2">
            Business Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Describe your business"
            required
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-tertiary">
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-tertiary mb-2">
              Phone Number
            </label>
            <div className="relative">
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  !validation.phone && formData.phone !== '' ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Enter phone number"
                required
              />
              <Phone className="h-5 w-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
              {!validation.phone && formData.phone !== '' && (
                <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Please enter a valid 10-digit phone number
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-tertiary mb-2">
              WhatsApp Number (Optional)
            </label>
            <div className="relative">
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter WhatsApp number"
              />
              <Phone className="h-5 w-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-tertiary">
          Location
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-tertiary mb-2">
              State
            </label>
            <div className="relative">
              <input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter state"
                required
              />
              <MapPin className="h-5 w-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-tertiary mb-2">
              City
            </label>
            <div className="relative">
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter city"
                required
              />
              <MapPin className="h-5 w-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label htmlFor="pincode" className="block text-sm font-medium text-tertiary mb-2">
              Pincode
            </label>
            <div className="relative">
              <input
                id="pincode"
                name="pincode"
                type="text"
                value={formData.pincode}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  !validation.pincode && formData.pincode !== '' ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Enter pincode"
                required
              />
              <MapPin className="h-5 w-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
              {!validation.pincode && formData.pincode !== '' && (
                <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Please enter a valid 6-digit pincode
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Business Documents */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-tertiary">
          Business Documents
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="gstNumber" className="block text-sm font-medium text-tertiary mb-2">
              GST Number (Optional)
            </label>
            <div className="relative">
              <input
                id="gstNumber"
                name="gstNumber"
                type="text"
                value={formData.gstNumber}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  !validation.gstNumber && formData.gstNumber !== '' ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Enter GST number"
              />
              <FileText className="h-5 w-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
              {!validation.gstNumber && formData.gstNumber !== '' && (
                <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Please enter a valid GST number
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="panNumber" className="block text-sm font-medium text-tertiary mb-2">
              PAN Number (Optional)
            </label>
            <div className="relative">
              <input
                id="panNumber"
                name="panNumber"
                type="text"
                value={formData.panNumber}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  !validation.panNumber && formData.panNumber !== '' ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Enter PAN number"
              />
              <FileText className="h-5 w-5 text-tertiary/50 absolute left-3 top-1/2 -translate-y-1/2" />
              {!validation.panNumber && formData.panNumber !== '' && (
                <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Please enter a valid PAN number
                </div>
              )}
            </div>
          </div>
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

export default SellerProfileForm; 