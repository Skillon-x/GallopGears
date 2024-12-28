import React, { useState, useEffect } from 'react';
import { Building2, FileText, MapPin, Phone, AlertCircle } from 'lucide-react';

const SellerProfileForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    state: '',
    city: '',
    pincode: '',
    phone: '',
    whatsapp: '',
    gstNumber: '',
    panNumber: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [debouncedFormData, setDebouncedFormData] = useState({
    businessName: '',
    description: '',
    state: '',
    city: '',
    pincode: '',
    phone: '',
    whatsapp: '',
    gstNumber: '',
    panNumber: ''
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
      case 'businessName':
        if (!value) return 'Business name is required';
        if (value.length < 2) return 'Business name must be at least 2 characters';
        if (!/^[a-zA-Z0-9\s\-&.]+$/.test(value)) return 'Business name can only contain letters, numbers, spaces, and basic punctuation';
        break;
      case 'description':
        if (value && value.length < 20) return 'Description must be at least 20 characters';
        break;
      case 'state':
        if (!value) return 'State is required';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'State name can only contain letters';
        break;
      case 'city':
        if (!value) return 'City is required';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'City name can only contain letters';
        break;
      case 'pincode':
        if (!value) return 'Pincode is required';
        if (!/^\d{6}$/.test(value)) return 'Please enter a valid 6-digit pincode';
        break;
      case 'phone':
        if (!value) return 'Phone number is required';
        if (!/^[6-9]\d{9}$/.test(value)) return 'Please enter a valid 10-digit mobile number';
        break;
      case 'whatsapp':
        if (value && !/^[6-9]\d{9}$/.test(value)) return 'Please enter a valid 10-digit WhatsApp number';
        break;
      case 'gstNumber':
        if (value && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(value)) 
          return 'Please enter a valid GST number';
        break;
      case 'panNumber':
        if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) 
          return 'Please enter a valid PAN number';
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
      case 'businessName':
        sanitizedValue = sanitizedValue.slice(0, 100);
        break;
      case 'description':
        sanitizedValue = sanitizedValue.slice(0, 500);
        break;
      case 'state':
      case 'city':
        sanitizedValue = sanitizedValue.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
        break;
      case 'pincode':
        sanitizedValue = sanitizedValue.replace(/\D/g, '').slice(0, 6);
        break;
      case 'phone':
      case 'whatsapp':
        sanitizedValue = sanitizedValue.replace(/\D/g, '').slice(0, 10);
        break;
      case 'gstNumber':
        sanitizedValue = sanitizedValue.toUpperCase().slice(0, 15);
        break;
      case 'panNumber':
        sanitizedValue = sanitizedValue.toUpperCase().slice(0, 10);
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
      {/* Business Information */}
      <div className="space-y-6">
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-tertiary mb-2">
            Business Name
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Building2 className={`h-5 w-5 transition-colors duration-200 ${
                validationErrors.businessName 
                  ? 'text-red-500' 
                  : formData.businessName 
                    ? 'text-green-500' 
                    : 'text-tertiary/50'
              }`} />
            </div>
            <input
              id="businessName"
              name="businessName"
              type="text"
              value={formData.businessName}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 border transition-all duration-200 ${
                validationErrors.businessName 
                  ? 'border-red-500 bg-red-50/50 focus:border-red-500' 
                  : formData.businessName 
                    ? 'border-green-500 bg-green-50/50 focus:border-green-500' 
                    : 'border-gray-200 focus:border-primary'
              } rounded-lg text-tertiary focus:outline-none focus:ring-2 ${
                validationErrors.businessName
                  ? 'focus:ring-red-100'
                  : formData.businessName
                    ? 'focus:ring-green-100'
                    : 'focus:ring-primary/20'
              }`}
              placeholder="Enter your business name"
              required
            />
          </div>
          {validationErrors.businessName && (
            <div className="mt-1.5 flex items-start gap-1.5">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-500">{validationErrors.businessName}</p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-tertiary mb-2">
            Business Description
          </label>
          <div className="relative">
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-2.5 border transition-all duration-200 ${
                validationErrors.description 
                  ? 'border-red-500 bg-red-50/50 focus:border-red-500' 
                  : formData.description 
                    ? 'border-green-500 bg-green-50/50 focus:border-green-500' 
                    : 'border-gray-200 focus:border-primary'
              } rounded-lg text-tertiary focus:outline-none focus:ring-2 ${
                validationErrors.description
                  ? 'focus:ring-red-100'
                  : formData.description
                    ? 'focus:ring-green-100'
                    : 'focus:ring-primary/20'
              }`}
              placeholder="Describe your business (optional)"
            />
          </div>
          {validationErrors.description && (
            <div className="mt-1.5 flex items-start gap-1.5">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-500">{validationErrors.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Location Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-tertiary mb-2">
            State
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <MapPin className={`h-5 w-5 transition-colors duration-200 ${
                validationErrors.state 
                  ? 'text-red-500' 
                  : formData.state 
                    ? 'text-green-500' 
                    : 'text-tertiary/50'
              }`} />
            </div>
            <input
              id="state"
              name="state"
              type="text"
              value={formData.state}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 border transition-all duration-200 ${
                validationErrors.state 
                  ? 'border-red-500 bg-red-50/50 focus:border-red-500' 
                  : formData.state 
                    ? 'border-green-500 bg-green-50/50 focus:border-green-500' 
                    : 'border-gray-200 focus:border-primary'
              } rounded-lg text-tertiary focus:outline-none focus:ring-2 ${
                validationErrors.state
                  ? 'focus:ring-red-100'
                  : formData.state
                    ? 'focus:ring-green-100'
                    : 'focus:ring-primary/20'
              }`}
              placeholder="Enter state"
              required
            />
          </div>
          {validationErrors.state && (
            <div className="mt-1.5 flex items-start gap-1.5">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-500">{validationErrors.state}</p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-tertiary mb-2">
            City
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <MapPin className={`h-5 w-5 transition-colors duration-200 ${
                validationErrors.city 
                  ? 'text-red-500' 
                  : formData.city 
                    ? 'text-green-500' 
                    : 'text-tertiary/50'
              }`} />
            </div>
            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 border transition-all duration-200 ${
                validationErrors.city 
                  ? 'border-red-500 bg-red-50/50 focus:border-red-500' 
                  : formData.city 
                    ? 'border-green-500 bg-green-50/50 focus:border-green-500' 
                    : 'border-gray-200 focus:border-primary'
              } rounded-lg text-tertiary focus:outline-none focus:ring-2 ${
                validationErrors.city
                  ? 'focus:ring-red-100'
                  : formData.city
                    ? 'focus:ring-green-100'
                    : 'focus:ring-primary/20'
              }`}
              placeholder="Enter city"
              required
            />
          </div>
          {validationErrors.city && (
            <div className="mt-1.5 flex items-start gap-1.5">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-500">{validationErrors.city}</p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="pincode" className="block text-sm font-medium text-tertiary mb-2">
            Pincode
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <MapPin className={`h-5 w-5 transition-colors duration-200 ${
                validationErrors.pincode 
                  ? 'text-red-500' 
                  : formData.pincode 
                    ? 'text-green-500' 
                    : 'text-tertiary/50'
              }`} />
            </div>
            <input
              id="pincode"
              name="pincode"
              type="text"
              value={formData.pincode}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 border transition-all duration-200 ${
                validationErrors.pincode 
                  ? 'border-red-500 bg-red-50/50 focus:border-red-500' 
                  : formData.pincode 
                    ? 'border-green-500 bg-green-50/50 focus:border-green-500' 
                    : 'border-gray-200 focus:border-primary'
              } rounded-lg text-tertiary focus:outline-none focus:ring-2 ${
                validationErrors.pincode
                  ? 'focus:ring-red-100'
                  : formData.pincode
                    ? 'focus:ring-green-100'
                    : 'focus:ring-primary/20'
              }`}
              placeholder="Enter pincode"
              required
            />
          </div>
          {validationErrors.pincode && (
            <div className="mt-1.5 flex items-start gap-1.5">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-500">{validationErrors.pincode}</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              placeholder="Enter phone number"
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
          <label htmlFor="whatsapp" className="block text-sm font-medium text-tertiary mb-2">
            WhatsApp Number (Optional)
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Phone className={`h-5 w-5 transition-colors duration-200 ${
                validationErrors.whatsapp 
                  ? 'text-red-500' 
                  : formData.whatsapp 
                    ? 'text-green-500' 
                    : 'text-tertiary/50'
              }`} />
            </div>
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              value={formData.whatsapp}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 border transition-all duration-200 ${
                validationErrors.whatsapp 
                  ? 'border-red-500 bg-red-50/50 focus:border-red-500' 
                  : formData.whatsapp 
                    ? 'border-green-500 bg-green-50/50 focus:border-green-500' 
                    : 'border-gray-200 focus:border-primary'
              } rounded-lg text-tertiary focus:outline-none focus:ring-2 ${
                validationErrors.whatsapp
                  ? 'focus:ring-red-100'
                  : formData.whatsapp
                    ? 'focus:ring-green-100'
                    : 'focus:ring-primary/20'
              }`}
              placeholder="Enter WhatsApp number"
            />
          </div>
          {validationErrors.whatsapp && (
            <div className="mt-1.5 flex items-start gap-1.5">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-500">{validationErrors.whatsapp}</p>
            </div>
          )}
        </div>
      </div>

      {/* Business Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="gstNumber" className="block text-sm font-medium text-tertiary mb-2">
            GST Number (Optional)
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <FileText className={`h-5 w-5 transition-colors duration-200 ${
                validationErrors.gstNumber 
                  ? 'text-red-500' 
                  : formData.gstNumber 
                    ? 'text-green-500' 
                    : 'text-tertiary/50'
              }`} />
            </div>
            <input
              id="gstNumber"
              name="gstNumber"
              type="text"
              value={formData.gstNumber}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 border transition-all duration-200 ${
                validationErrors.gstNumber 
                  ? 'border-red-500 bg-red-50/50 focus:border-red-500' 
                  : formData.gstNumber 
                    ? 'border-green-500 bg-green-50/50 focus:border-green-500' 
                    : 'border-gray-200 focus:border-primary'
              } rounded-lg text-tertiary focus:outline-none focus:ring-2 ${
                validationErrors.gstNumber
                  ? 'focus:ring-red-100'
                  : formData.gstNumber
                    ? 'focus:ring-green-100'
                    : 'focus:ring-primary/20'
              }`}
              placeholder="Enter GST number"
            />
          </div>
          {validationErrors.gstNumber && (
            <div className="mt-1.5 flex items-start gap-1.5">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-500">{validationErrors.gstNumber}</p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="panNumber" className="block text-sm font-medium text-tertiary mb-2">
            PAN Number (Optional)
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <FileText className={`h-5 w-5 transition-colors duration-200 ${
                validationErrors.panNumber 
                  ? 'text-red-500' 
                  : formData.panNumber 
                    ? 'text-green-500' 
                    : 'text-tertiary/50'
              }`} />
            </div>
            <input
              id="panNumber"
              name="panNumber"
              type="text"
              value={formData.panNumber}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 border transition-all duration-200 ${
                validationErrors.panNumber 
                  ? 'border-red-500 bg-red-50/50 focus:border-red-500' 
                  : formData.panNumber 
                    ? 'border-green-500 bg-green-50/50 focus:border-green-500' 
                    : 'border-gray-200 focus:border-primary'
              } rounded-lg text-tertiary focus:outline-none focus:ring-2 ${
                validationErrors.panNumber
                  ? 'focus:ring-red-100'
                  : formData.panNumber
                    ? 'focus:ring-green-100'
                    : 'focus:ring-primary/20'
              }`}
              placeholder="Enter PAN number"
            />
          </div>
          {validationErrors.panNumber && (
            <div className="mt-1.5 flex items-start gap-1.5">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-500">{validationErrors.panNumber}</p>
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

export default SellerProfileForm; 