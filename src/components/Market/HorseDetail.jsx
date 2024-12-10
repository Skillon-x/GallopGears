import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  CurrencyDollarIcon, 
  CalendarIcon,
  TagIcon,
  MapPinIcon,
  ArrowsUpDownIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import ImageGallery from './ImageGallery';
import ContactForm from './ContactForm';

const HorseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [horse, setHorse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchHorseDetails();
  }, [id]);

  const fetchHorseDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/horses/${id}`);
      setHorse(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching horse details:', error);
      setError('Failed to load horse details');
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      await axios.post(`http://localhost:5000/api/horses/${id}/favorite`);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !horse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Horse not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-gray-600 hover:text-gray-800 flex items-center"
      >
        ← Back to listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <ImageGallery images={horse.images || []} />
          
          <button
            onClick={toggleFavorite}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isFavorite 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <HeartIcon className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            <span>{isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}</span>
          </button>
        </div>

        {/* Horse Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{horse.name}</h1>
            <div className="flex items-center space-x-2 text-lg text-primary-600 font-semibold">
              <CurrencyDollarIcon className="h-6 w-6" />
              <span>${horse.price.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <TagIcon className="h-5 w-5" />
              <span>{horse.breed}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <CalendarIcon className="h-5 w-5" />
              <span>{horse.age} years old</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPinIcon className="h-5 w-5" />
              <span>{horse.location || 'Location not specified'}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <ArrowsUpDownIcon className="h-5 w-5" />
              <span>{horse.height || 'Height not specified'} hands</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">About {horse.name}</h2>
            <p className="text-gray-600 whitespace-pre-line">{horse.description}</p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Training & Discipline</h2>
            <div className="space-y-4">
              {horse.discipline && (
                <div className="flex items-start space-x-2">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-gray-600 mt-1" />
                  <div>
                    <span className="font-medium">Discipline:</span>
                    <p className="text-gray-600">{horse.discipline}</p>
                  </div>
                </div>
              )}
              {horse.training && (
                <div className="flex items-start space-x-2">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-gray-600 mt-1" />
                  <div>
                    <span className="font-medium">Training Level:</span>
                    <p className="text-gray-600">{horse.training}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Health & Care</h2>
            <p className="text-gray-600">{horse.health || 'Health information not provided'}</p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-gray-600" />
                <span className="text-gray-600">Listed by {horse.seller?.email}</span>
              </div>
              <button
                onClick={() => setShowContactForm(true)}
                className="btn-primary"
              >
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactForm
          horseId={id}
          horseName={horse.name}
          sellerEmail={horse.seller?.email}
          onClose={() => setShowContactForm(false)}
        />
      )}
    </div>
  );
};

export default HorseDetail; 