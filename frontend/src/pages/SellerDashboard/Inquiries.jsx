import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';

const InquiryCard = ({ inquiry }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!inquiry) {
    return null;
  }

  const horseName = inquiry?.horse?.name || 'Horse details unavailable';
  const buyerName = inquiry?.buyer?.name || 'Buyer details unavailable';
  const status = inquiry?.status || 'pending';
  const message = inquiry?.message || 'No message provided';
  const reply = inquiry?.reply;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-tertiary">{horseName}</h3>
            <p className="text-tertiary/70 text-sm mt-1">From: {buyerName}</p>
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
            <span>Message</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </button>
          
          {isExpanded && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-tertiary">{message}</p>
              {reply && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-tertiary">Your Reply:</p>
                  <p className="text-tertiary mt-1">{reply}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {!reply && (
          <div className="mt-4">
            <textarea
              placeholder="Write your reply..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows="3"
            />
            <button className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              Send Reply
            </button>
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await api.sellers.getInquiries();
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
    <div className="bg-red-50 text-red-600 p-4 rounded-lg">
      {error}
    </div>
  ) : (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-tertiary">Inquiries</h1>
        <div className="flex gap-2">
          <select className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="all">All Inquiries</option>
            <option value="pending">Pending</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-tertiary">No Inquiries Yet</h3>
          <p className="text-tertiary/70 mt-2">When buyers inquire about your listings, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map(inquiry => (
            <InquiryCard key={inquiry._id} inquiry={inquiry} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="pb-[500px]"> {/* Space for footer */}
        <DashboardSidebar isOpen={isSidebarOpen} toggleSidebar={setIsSidebarOpen} />
        <div className="lg:pl-64">
          <div className="p-8 pt-24"> {/* Increased top padding for navbar */}
            <DashboardHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="mt-8">
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inquiries; 