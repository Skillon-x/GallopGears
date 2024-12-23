import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Eye } from 'lucide-react';
import api from '../../../services/api';
const ListingCard = ({ listing, onDelete }) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    navigate(`/seller/listings/edit/${listing._id}`);
  };

  const handleView = () => {
    navigate(`/horses/${listing._id}`);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this listing? This action cannot be undone.'
    );

    if (confirmDelete) {
      try {
        setIsDeleting(true);
        await api.horses.delete(listing._id);
      } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div 
        className="cursor-pointer"
        onClick={handleView}
      >
        <img 
          src={listing.images[0]?.url || '/placeholder-horse.jpg'} 
          alt={listing.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-tertiary">{listing.name}</h3>
          <p className="text-tertiary/70 text-sm mt-1">{listing.breed}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-primary font-bold">₹{listing.price.toLocaleString()}</span>
            <span className={`text-sm ${
              listing.listingStatus === 'active' ? 'text-green-600' : 'text-orange-600'
            }`}>
              {listing.listingStatus.charAt(0).toUpperCase() + listing.listingStatus.slice(1)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 p-4 pt-0">
        <button 
          onClick={handleEdit}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`flex-1 flex items-center justify-center px-3 py-2 ${
            isDeleting 
              ? 'bg-red-50 text-red-300 cursor-not-allowed'
              : 'bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer'
          } rounded-lg transition-colors`}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
        <button 
          onClick={handleView}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-tertiary rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Eye className="w-4 h-4 mr-2" />
          View
        </button>
      </div>
    </div>
  );
};

export default ListingCard; 