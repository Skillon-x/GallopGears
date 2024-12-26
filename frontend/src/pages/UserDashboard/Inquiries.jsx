import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { 
  MessageSquare, 
  AlertCircle, 
  Clock, 
  ChevronRight,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';

const InquiryCard = ({ inquiry }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/90';
      case 'accepted':
        return 'bg-green-500/90';
      case 'rejected':
        return 'bg-red-500/90';
      default:
        return 'bg-gray-500/90';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3 mr-1.5" />;
      case 'accepted':
        return <CheckCircle className="w-3 h-3 mr-1.5" />;
      case 'rejected':
        return <XCircle className="w-3 h-3 mr-1.5" />;
      default:
        return null;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white hover:border-primary/20 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-tertiary text-lg">
              {inquiry.horse?.name || 'Horse Name Not Available'}
            </h3>
            <p className="text-primary font-bold mt-1">
              ₹{inquiry.horse?.price?.toLocaleString() || 'Price Not Available'}
            </p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium text-white backdrop-blur-sm flex items-center shadow-lg ${getStatusColor(inquiry.status)}`}>
            {getStatusIcon(inquiry.status)}
            {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center text-sm text-tertiary/70">
            <User className="w-4 h-4 mr-2" />
            <span>Seller: {inquiry.seller?.businessName || 'Not Available'}</span>
          </div>
          <div className="flex items-center text-sm text-tertiary/70">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Inquired on: {formatDate(inquiry.createdAt)}</span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-tertiary/70 line-clamp-2">
              {inquiry.message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <Link
            to={`/horses/${inquiry.horse?._id}`}
            className="text-sm text-primary hover:text-accent flex items-center transition-colors"
          >
            View Horse <ExternalLink className="w-4 h-4 ml-1" />
          </Link>
          <Link
            to={`/inquiries/${inquiry._id}`}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            View Details <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await api.users.getInquiries();
      if (response?.data?.success) {
        setInquiries(response.data.inquiries);
      }
    } catch (err) {
      setError('Failed to load inquiries. Please try again.');
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/30 via-white to-primary/30 py-20 md:py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-2xl overflow-hidden border border-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary via-accent to-primary p-8 md:p-10 text-white">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-3">
                <MessageSquare className="w-8 h-8" />
                Your Inquiries
              </h2>
              <p className="text-white/90 mt-2">
                Track and manage your horse inquiries
              </p>
            </div>
          </div>

          <div className="p-8 md:p-10">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white p-6">
                      <div className="h-6 bg-gray-200 rounded-full w-2/3 mb-4" />
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded-full w-1/2" />
                        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                        <div className="h-20 bg-gray-200 rounded-lg w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
                <p className="text-gray-500 mb-6">Start browsing horses and make inquiries to see them here</p>
                <Link
                  to="/browse"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                >
                  Browse Horses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inquiries.map(inquiry => (
                  <InquiryCard key={inquiry._id} inquiry={inquiry} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-12 text-center">
          <div className="backdrop-blur-sm bg-white/80 rounded-xl py-5 px-8 inline-block shadow-lg border border-white/50">
            <p className="text-gray-700">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@gallopinggears.com" className="text-primary hover:text-accent transition-colors font-medium">
                support@gallopinggears.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inquiries;