import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Heart, AlertCircle } from 'lucide-react';
import HorseCard from '../../components/common/HorseCard';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.users.getFavorites();
      if (response?.data?.success) {
        setFavorites(response.data.favorites.map(horse => ({
          ...horse,
          isFavorited: true
        })));
      }
    } catch (err) {
      setError('Failed to load favorites. Please try again.');
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (horseId) => {
    try {
      const response = await api.horses.toggleFavorite(horseId);
      if (response?.data?.success) {
        setFavorites(prev => prev.filter(horse => horse._id !== horseId));
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
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
                <Heart className="w-8 h-8" />
                Your Favorite Horses
              </h2>
              <p className="text-white/90 mt-2">
                Manage your collection of favorite horses
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-xl h-64"></div>
                  </div>
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                <p className="text-gray-500 mb-6">Start adding horses to your favorites to see them here</p>
                <Link
                  to="/browse"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                >
                  Browse Horses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map(horse => (
                  <HorseCard
                    key={horse._id}
                    horse={horse}
                    onFavorite={handleFavorite}
                  />
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

export default Favorites; 