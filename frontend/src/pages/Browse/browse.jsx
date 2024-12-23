import React, { useState, useEffect } from 'react';
import MainNavigation from './MainNavigation';
import HorseGrid from './HorseGrid';
import FilterSidebar from './FilterSidebar';
import { api } from '../../services/api';
import { Search, ChevronRight, Filter } from 'lucide-react';

const Browse = () => {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    sort: 'newest',
    location: '',
    radius: '50',
    saleType: 'sale',
    minAge: '',
    maxAge: '',
    minHeight: '',
    maxHeight: '',
    breed: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    fetchHorses();
  }, [filters]);

  const fetchHorses = async () => {
    try {
      setLoading(true);
      const response = await api.horses.search(filters);
      if (response?.data?.success) {
        setHorses(response.data.horses);
      } else {
        throw new Error('Failed to fetch horses');
      }
    } catch (err) {
      setError('Failed to load horses. Please try again.');
      console.error('Error fetching horses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (id) => {
    try {
      await api.horses.toggleFavorite(id);
      setHorses(prevHorses => 
        prevHorses.map(horse => 
          horse._id === id 
            ? { ...horse, isFavorited: !horse.isFavorited }
            : horse
        )
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setShowMobileFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      sort: 'newest',
      location: '',
      radius: '50',
      saleType: 'sale',
      minAge: '',
      maxAge: '',
      minHeight: '',
      maxHeight: '',
      breed: '',
      minPrice: '',
      maxPrice: ''
    });
    setShowMobileFilters(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/30 via-white to-primary/30">
      <MainNavigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-tertiary/95 via-primary/90 to-accent/95 pt-24 md:pt-32">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-white/70 mb-8">
              <span className="hover:text-white transition-colors">Home</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">Browse</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Find Your Perfect Horse
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Discover a wide selection of horses for sale and loan across the country
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl backdrop-blur-sm">
              <input
                type="text"
                placeholder="Search horses by name, breed, or location..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">5000+</div>
                <div className="text-sm text-white/70">Listed Horses</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">1000+</div>
                <div className="text-sm text-white/70">Verified Sellers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">15+</div>
                <div className="text-sm text-white/70">Horse Breeds</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold text-white mb-1">98%</div>
                <div className="text-sm text-white/70">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid with Filter */}
      <div className="py-8 md:py-12 bg-gradient-to-br from-accent/30 via-white to-primary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-2xl overflow-hidden border border-white">
              <div className="p-6 md:p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden fixed bottom-6 right-6 z-50 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                  >
                    <Filter className="w-6 h-6" />
                  </button>

                  {/* Filters */}
                  <FilterSidebar 
                    filters={filters}
                    onApplyFilters={handleApplyFilters}
                    onClearFilters={handleClearFilters}
                    isOpen={showMobileFilters}
                    onClose={() => setShowMobileFilters(false)}
                  />
                  
                  {/* Main Content */}
                  <div className="flex-1">
                    {error ? (
                      <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 p-6 rounded-xl">
                        <p className="font-medium">{error}</p>
                      </div>
                    ) : (
                      <HorseGrid 
                        horses={horses}
                        loading={loading}
                        onFavorite={handleFavorite}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-8 text-center">
              <div className="backdrop-blur-sm bg-white/80 rounded-xl py-5 px-8 inline-block shadow-lg border border-white/50">
                <p className="text-gray-700">
                  Need help finding the right horse? Contact our support team at{' '}
                  <a href="mailto:support@gallopinggears.com" className="text-primary hover:text-accent transition-colors font-medium">
                    support@gallopinggears.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;