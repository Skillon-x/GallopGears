import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Mail, MessageSquare, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const InquiryCard = ({ inquiry }) => {
  if (!inquiry || !inquiry.horse) {
    console.log('Invalid inquiry data:', inquiry);
    return null;
  }

  // Safely access nested properties with optional chaining and defaults
  const horseName = inquiry.horse?.name || 'Horse details not available';
  const sellerName = inquiry.seller?.businessName || 'Seller details not available';
  const inquiryDate = inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Date not available';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-tertiary">{horseName}</h3>
          <p className="text-sm text-tertiary/70">Seller: {sellerName}</p>
        </div>
        <Badge status={inquiry.status || 'pending'} />
      </div>
      
      <p className="text-tertiary/70 text-sm mb-3">{inquiry.message || 'No message provided'}</p>
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-tertiary/60">
          {inquiry.contactPreference === 'phone' ? (
            <Phone className="w-4 h-4 inline-block mr-1" />
          ) : (
            <Mail className="w-4 h-4 inline-block mr-1" />
          )}
          {inquiry.contactPreference || 'Not specified'}
        </span>
        <span className="text-tertiary/60">{inquiryDate}</span>
      </div>

      {inquiry.response && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-tertiary mb-1">Seller Response:</p>
          <p className="text-sm text-tertiary/70">{inquiry.response.message}</p>
          <p className="text-xs text-tertiary/60 mt-1">
            Responded on: {inquiry.response.date ? new Date(inquiry.response.date).toLocaleDateString() : 'Date not available'}
          </p>
        </div>
      )}
    </div>
  );
};

const Badge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'responded':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
    </span>
  );
};

const Inquiries = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    // Check if user is authenticated and has the correct role
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/dashboard/inquiries' } });
      return;
    }

    if (!user || user.role !== 'user') {
      setError('Only buyers can view inquiries. Please login with a buyer account.');
      setLoading(false);
      return;
    }

    fetchInquiries();
  }, [isAuthenticated, user, navigate]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await api.inquiries.getList();
      console.log('Inquiries response:', response); // Debug log
      
      if (response?.success && Array.isArray(response.inquiries)) {
        // Filter out any invalid inquiries
        const validInquiries = response.inquiries.filter(inquiry => 
          inquiry && 
          inquiry.horse && 
          typeof inquiry.horse === 'object' && 
          inquiry.horse.name
        );
        setInquiries(validInquiries);
      } else if (response?.data?.inquiries && Array.isArray(response.data.inquiries)) {
        // Handle alternative response format
        const validInquiries = response.data.inquiries.filter(inquiry => 
          inquiry && 
          inquiry.horse && 
          typeof inquiry.horse === 'object' && 
          inquiry.horse.name
        );
        setInquiries(validInquiries);
      } else {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setError('Failed to load inquiries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show unauthorized message if user is not a buyer
  if (isAuthenticated && user && user.role !== 'user') {
    return (
      <div className="bg-yellow-50 text-yellow-700 p-6 rounded-lg flex flex-col items-center">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="font-medium">Unauthorized Access</p>
        <p className="text-sm mt-2 text-center">
          Only buyers can view inquiries. Please login with a buyer account.
        </p>
        <Link
          to="/"
          className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="w-8 h-8 text-primary animate-spin" />
        <p className="mt-4 text-tertiary">Loading inquiries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg flex flex-col items-center">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!inquiries || inquiries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 p-6 rounded-lg inline-block">
          <MessageSquare className="w-12 h-12 text-tertiary/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-tertiary mb-2">No Inquiries Yet</h3>
          <p className="text-tertiary/70">
            You haven't made any inquiries yet. Browse horses and send inquiries to get started.
          </p>
          <Link
            to="/browse"
            className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Horses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <InquiryCard 
          key={inquiry._id} 
          inquiry={inquiry}
          onClick={() => setSelectedInquiry(inquiry)}
        />
      ))}
    </div>
  );
};

export default Inquiries; 