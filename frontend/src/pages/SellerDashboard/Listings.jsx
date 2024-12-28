import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import ListingCard from './components/ListingCard';

const Listings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    fetchListings();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.sellers.getListings();
      
      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Failed to fetch listings');
      }
      
      setListings(response.data.listings || []);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(err.message || 'Failed to fetch listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeleteError(null);
      const response = await api.sellers.deleteListing(id);
      
      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Failed to delete listing');
      }

      // Update listings state after successful deletion
      setListings(prevListings => prevListings.filter(listing => listing._id !== id));

      // Show success message (optional)
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
      successMessage.textContent = 'Listing deleted successfully';
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);

    } catch (err) {
      console.error('Error deleting listing:', err);
      setDeleteError(err.message || 'Failed to delete listing. Please try again.');
      throw err; // Re-throw to be handled by the ListingCard component
    }
  };

  const handleAddNew = () => {
    navigate('/seller/listings/new');
  };

  const content = loading ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
          <div className="h-48 bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-8 bg-gray-200 rounded" />
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
        <h1 className="text-2xl font-bold text-tertiary">My Listings</h1>
      </div>

      {deleteError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {deleteError}
        </div>
      )}

      {listings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-tertiary">No Listings Yet</h3>
          <p className="text-tertiary/70 mt-2">Create your first listing to start selling.</p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors mt-4"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <ListingCard
              key={listing._id}
              listing={listing}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="pb-[500px]">
        <DashboardSidebar isOpen={isSidebarOpen} toggleSidebar={setIsSidebarOpen} />
        <div className="lg:pl-64">
          <div className="p-8 pt-24">
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

export default Listings; 