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

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [listingsRes, messagesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/horses/seller/${user.id}`),
        axios.get(`http://localhost:5000/api/messages/seller/${user.email}`)
      ]);
      setListings(listingsRes.data);
      setMessages(messagesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHorse = async (horseId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await axios.delete(`http://localhost:5000/api/horses/${horseId}`);
        setListings(listings.filter(horse => horse._id !== horseId));
      } catch (error) {
        console.error('Error deleting horse:', error);
      }
    }
  };

  const handleMarkMessageRead = async (messageId) => {
    try {
      await axios.patch(`http://localhost:5000/api/messages/${messageId}`, {
        status: 'read'
      });
      setMessages(messages.map(msg => 
        msg._id === messageId ? { ...msg, status: 'read' } : msg
      ));
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        <button
          onClick={() => setShowAddHorseForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add New Horse</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'listings'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'messages'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Messages ({messages.filter(m => m.status === 'unread').length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'listings' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(horse => (
            <div key={horse._id} className="card">
              <img
                src={horse.images?.[0] || 'https://via.placeholder.com/400x300?text=Horse+Image'}
                alt={horse.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">{horse.name}</h3>
              <p className="text-gray-600 mb-4">{horse.breed} • {horse.age} years</p>
              <div className="flex justify-between items-center">
                <span className="text-primary-600 font-semibold">
                  ${horse.price.toLocaleString()}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingHorse(horse)}
                    className="p-2 text-gray-600 hover:text-gray-800"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteHorse(horse._id)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {listings.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No listings yet. Add your first horse!
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message._id}
              className={`card ${message.status === 'unread' ? 'border-l-4 border-primary-600' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{message.name}</h3>
                  <p className="text-gray-600">{message.email}</p>
                  {message.phone && (
                    <p className="text-gray-600">{message.phone}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                  {message.status === 'unread' && (
                    <button
                      onClick={() => handleMarkMessageRead(message._id)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-4 text-gray-700 whitespace-pre-line">
                {message.message}
              </p>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No messages yet.
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Horse Form Modal */}
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