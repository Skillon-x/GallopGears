import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MessageSquare, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const InquiryCard = ({ inquiry }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!inquiry) {
    return null;
  }

  const horseName = inquiry?.horse?.name || 'Horse details unavailable';
  const sellerName = inquiry?.seller?.businessName || inquiry?.seller?.name || 'Seller details unavailable';
  const status = inquiry?.status || 'pending';
  const message = inquiry?.message || 'No message provided';
  const reply = inquiry?.reply;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-tertiary">{horseName}</h3>
            <p className="text-tertiary/70 text-sm mt-1">To: {sellerName}</p>
          </div>
          <span className={`text-sm px-2 py-1 rounded-full ${
            status === 'pending' ? 'bg-orange-100 text-orange-600' :
            status === 'replied' ? 'bg-green-100 text-green-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        
        <div className="mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-tertiary/70 hover:text-tertiary"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            <span>Message & Reply</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </button>
          
          {isExpanded && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-tertiary">Your Message:</p>
                <p className="text-tertiary mt-1">{message}</p>
              </div>
              {reply && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-tertiary">Seller's Reply:</p>
                  <p className="text-tertiary mt-1">{reply}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Additional horse details when expanded */}
        {isExpanded && inquiry?.horse && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-tertiary">Price</p>
                <p className="text-tertiary">₹{inquiry.horse.price?.toLocaleString() || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-tertiary">Location</p>
                <p className="text-tertiary">{inquiry.horse.location?.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-tertiary">Breed</p>
                <p className="text-tertiary">{inquiry.horse.breed || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-tertiary">Age</p>
                <p className="text-tertiary">{inquiry.horse.age?.years || 'N/A'} years</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await api.inquiries.getMine();
      if (response?.data?.success) {
        setInquiries(response.data.inquiries || []);
      } else {
        throw new Error('Failed to fetch inquiries');
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    if (filter === 'all') return true;
    return inquiry.status === filter;
  });

  const content = loading ? (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  ) : error ? (
    <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start space-x-2">
      <AlertCircle className="h-5 w-5 mt-0.5" />
      <span>{error}</span>
    </div>
  ) : (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-tertiary">My Inquiries</h1>
        <div className="flex gap-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Inquiries</option>
            <option value="pending">Pending</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      {filteredInquiries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-tertiary">No Inquiries Yet</h3>
          <p className="text-tertiary/70 mt-2">
            {filter === 'all' 
              ? "You haven't made any inquiries yet. Browse horses and reach out to sellers!"
              : `No ${filter} inquiries found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map(inquiry => (
            <InquiryCard key={inquiry._id} inquiry={inquiry} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {content}
      </div>
    </div>
  );
};

export default Inquiries; 