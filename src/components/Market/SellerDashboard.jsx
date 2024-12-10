import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  PlusIcon,
  EnvelopeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import AddHorseForm from './AddHorseForm';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddHorseForm, setShowAddHorseForm] = useState(false);
  const [editingHorse, setEditingHorse] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // First fetch listings
      const listingsRes = await axios.get(
        `http://localhost:5000/api/horses/seller/${user.id}`, 
        { withCredentials: true }
      );
      setListings(listingsRes.data);

      // Then try to fetch messages, but don't break if it fails
      try {
        const messagesRes = await axios.get(
          `http://localhost:5000/api/messages/seller/${user.id}`,
          { withCredentials: true }
        );
        setMessages(messagesRes.data || []);
      } catch (messageError) {
        console.log('No messages found or messages not available');
        setMessages([]); // Set empty array for messages if fetch fails
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHorse = async (horseId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await axios.delete(`http://localhost:5000/api/horses/${horseId}`, { withCredentials: true });
        setListings(listings.filter(horse => horse._id !== horseId));
      } catch (error) {
        console.error('Error deleting horse:', error);
        setError('Failed to delete listing');
      }
    }
  };

  const handleMarkMessageRead = async (messageId) => {
    try {
      await axios.put(`http://localhost:5000/api/messages/${messageId}/read`, {}, { withCredentials: true });
      setMessages(messages.map(msg => 
        msg._id === messageId ? { ...msg, read: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
        <button
          onClick={() => setShowAddHorseForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add New Horse</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'listings'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Listings
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'messages'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Messages
            </button>
          </nav>
        </div>

        {activeTab === 'listings' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((horse) => (
                <div key={horse._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={horse.images?.[0] || 'https://via.placeholder.com/400x300?text=Horse+Image'}
                      alt={horse.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{horse.name}</h3>
                    <p className="text-gray-600">{horse.breed}</p>
                    <p className="text-primary-600 font-semibold mt-2">
                      ${horse.price.toLocaleString()}
                    </p>
                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingHorse(horse)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteHorse(horse._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {listings.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No listings yet. Add your first horse!
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`p-4 rounded-lg ${
                  message.read ? 'bg-gray-50' : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      From: {message.senderEmail}
                    </p>
                    <p className="text-sm text-gray-500">
                      Re: {message.horseName}
                    </p>
                  </div>
                  {!message.read && (
                    <button
                      onClick={() => handleMarkMessageRead(message._id)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-gray-700">{message.message}</p>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No messages yet.
              </div>
            )}
          </div>
        )}
      </div>

      {(showAddHorseForm || editingHorse) && (
        <AddHorseForm
          horse={editingHorse}
          onClose={() => {
            setShowAddHorseForm(false);
            setEditingHorse(null);
          }}
          onSuccess={() => {
            fetchData();
            setShowAddHorseForm(false);
            setEditingHorse(null);
          }}
        />
      )}
    </div>
  );
};

export default SellerDashboard; 