import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MainNavigation from './MainNavigation';
import HorseGrid from './HorseGrid';
import FilterSidebar from './FilterSidebar';
import { api } from '../../services/api';
import { Search, ChevronRight, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Default filter values
const DEFAULT_FILTERS = {
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
  maxPrice: '',
  search: '',
  trainingLevel: '',
  discipline: '',
  temperament: ''
};

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [allHorses, setAllHorses] = useState([]); // Store all horses
  const [filteredHorses, setFilteredHorses] = useState([]); // Store filtered horses
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({
    totalHorses: 0,
    totalSellers: 0,
    totalBreeds: 0,
    successRate: 98
  });
  
  // Initialize filters from URL or defaults
  const getInitialFilters = () => {
    const initialFilters = { ...DEFAULT_FILTERS };
    for (const [key, value] of searchParams.entries()) {
      if (key in DEFAULT_FILTERS) {
        initialFilters[key] = value;
      }
    }
    return initialFilters;
  };

  const [filters, setFilters] = useState(getInitialFilters);

  // Extract unique breeds from horses data
  const breeds = useMemo(() => {
    const uniqueBreeds = new Set(allHorses.map(horse => horse.breed).filter(Boolean));
    return Array.from(uniqueBreeds).map(breed => ({
      _id: breed,
      name: breed
    }));
  }, [allHorses]);

  // Update URL when filters change
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== DEFAULT_FILTERS[key]) {
        newSearchParams.set(key, value);
      }
    });
    setSearchParams(newSearchParams);
  }, [filters, setSearchParams]);

  // Fetch initial stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.home.getData();
        if (response?.data?.success) {
          setStats({
            totalHorses: response.data.data.stats.horses || 0,
            totalSellers: response.data.data.stats.sellers || 0,
            totalBreeds: response.data.data.stats.breeds || 0,
            successRate: 98
          });
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Fetch initial favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await api.users.getFavorites();
        if (response?.data?.success) {
          const favoriteIds = response.data.favorites.map(horse => horse._id);
          setFavorites(favoriteIds);
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
      }
    };

    fetchFavorites();
  }, [isAuthenticated]);

  // Apply all filters including search
  const applyFilters = useCallback((horses, currentFilters) => {
    return horses.filter(horse => {
      // Search filter
      if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        const searchMatch = 
          horse.name?.toLowerCase().includes(searchTerm) ||
          horse.breed?.toLowerCase().includes(searchTerm) ||
          horse.location?.city?.toLowerCase().includes(searchTerm) ||
          horse.location?.state?.toLowerCase().includes(searchTerm) ||
          horse.specifications?.discipline?.some(d => d.toLowerCase().includes(searchTerm));
        
        if (!searchMatch) return false;
      }

      // Training Level filter
      if (currentFilters.trainingLevel && 
          horse.specifications?.training !== currentFilters.trainingLevel) {
        return false;
      }

      // Discipline filter
      if (currentFilters.discipline && 
          !horse.specifications?.discipline?.includes(currentFilters.discipline)) {
        return false;
      }

      // Temperament filter
      if (currentFilters.temperament && 
          horse.specifications?.temperament !== currentFilters.temperament) {
        return false;
      }

      // Breed filter
      if (currentFilters.breed && horse.breed !== currentFilters.breed) {
        return false;
      }

      // Age filter
      if (currentFilters.minAge && horse.age?.years < parseInt(currentFilters.minAge)) {
        return false;
      }
      if (currentFilters.maxAge && horse.age?.years > parseInt(currentFilters.maxAge)) {
        return false;
      }

      // Height filter
      if (currentFilters.minHeight && horse.height < parseFloat(currentFilters.minHeight)) {
        return false;
      }
      if (currentFilters.maxHeight && horse.height > parseFloat(currentFilters.maxHeight)) {
        return false;
      }

      // Price filter
      if (currentFilters.minPrice && horse.price < parseInt(currentFilters.minPrice)) {
        return false;
      }
      if (currentFilters.maxPrice && horse.price > parseInt(currentFilters.maxPrice)) {
        return false;
      }

      // Location filter
      if (currentFilters.location) {
        const locationTerm = currentFilters.location.toLowerCase();
        const locationMatch = 
          horse.location?.city?.toLowerCase().includes(locationTerm) ||
          horse.location?.state?.toLowerCase().includes(locationTerm);
        
        if (!locationMatch) return false;
      }

      return true;
    });
  }, []);

  // Sort filtered horses
  const sortHorses = useCallback((horses, sort) => {
    const sortedHorses = [...horses];
    switch (sort) {
      case 'price_asc':
        return sortedHorses.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price_desc':
        return sortedHorses.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'views':
        return sortedHorses.sort((a, b) => (b.views || 0) - (a.views || 0));
      case 'newest':
      default:
        return sortedHorses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, []);

  // Fetch horses and apply initial filters
  useEffect(() => {
    const fetchHorses = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.horses.search();
        if (response?.data?.success) {
          // Mark favorited horses
          const horsesWithFavorites = response.data.horses.map(horse => ({
            ...horse,
            isFavorited: favorites.includes(horse._id)
          }));
          setAllHorses(horsesWithFavorites);
          const filtered = applyFilters(horsesWithFavorites, filters);
          const sorted = sortHorses(filtered, filters.sort);
          setFilteredHorses(sorted);
        } else {
          throw new Error('Failed to fetch horses');
        }
      } catch (err) {
        console.error('Error fetching horses:', err);
        setError('Failed to load horses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHorses();
  }, [favorites]); // Add favorites as dependency

  // Apply filters when they change
  useEffect(() => {
    const filtered = applyFilters(allHorses, filters);
    const sorted = sortHorses(filtered, filters.sort);
    setFilteredHorses(sorted);
  }, [filters, allHorses, applyFilters, sortHorses]);

  const handleFavorite = useCallback(async (id) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/browse' } });
      return;
    }

    try {
      const response = await api.horses.toggleFavorite(id);
      if (response?.data?.success) {
        // Update favorites list
        setFavorites(prev => 
          prev.includes(id) 
            ? prev.filter(fId => fId !== id)
            : [...prev, id]
        );

        // Update horse in both allHorses and filteredHorses
        const updateHorses = horses => 
          horses.map(horse => 
            horse._id === id 
              ? { ...horse, isFavorited: !horse.isFavorited }
              : horse
          );

        setAllHorses(updateHorses);
        setFilteredHorses(updateHorses);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  }, [isAuthenticated, navigate]);

  const handleApplyFilters = useCallback((newFilters) => {
    window.scrollTo(0, 0);
    setFilters(prev => {
      // Validate numeric fields
      const validated = { ...prev, ...newFilters };
      if (validated.minAge && validated.maxAge) {
        if (parseInt(validated.minAge) > parseInt(validated.maxAge)) {
          [validated.minAge, validated.maxAge] = [validated.maxAge, validated.minAge];
        }
      }
      if (validated.minHeight && validated.maxHeight) {
        if (parseFloat(validated.minHeight) > parseFloat(validated.maxHeight)) {
          [validated.minHeight, validated.maxHeight] = [validated.maxHeight, validated.minHeight];
        }
      }
      if (validated.minPrice && validated.maxPrice) {
        if (parseInt(validated.minPrice) > parseInt(validated.maxPrice)) {
          [validated.minPrice, validated.maxPrice] = [validated.maxPrice, validated.minPrice];
        }
      }
      return validated;
    });
    setShowMobileFilters(false);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setShowMobileFilters(false);
  }, []);

  const handleSearch = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/30 via-white to-primary/30">
      <MainNavigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-tertiary/95 via-primary/90 to-accent/95 pt-20 md:pt-32">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb - Hide on Mobile */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-white/70 mb-8">
              <span className="hover:text-white transition-colors">Home</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">Browse</span>
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
              Find Your Perfect Horse
            </h1>
            <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8">
              Discover a wide selection of horses for sale and loan across the country
            </p>
            
            {/* Search Bar with Filter Button for Mobile */}
            <div className="relative backdrop-blur-sm flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search horses by name, breed, or location..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 text-base md:text-lg"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
              </div>
              
              {/* Mobile Filter Button - Show at top */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-3 md:py-4 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                aria-label="Show Filters"
              >
                <Filter className="w-5 h-5" />
                <span className="text-sm font-medium">Filters</span>
              </button>
            </div>

            {/* Quick Stats - Responsive Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8 md:mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20">
                <div className="text-xl md:text-2xl font-bold text-white mb-1">{stats.totalHorses}+</div>
                <div className="text-xs md:text-sm text-white/70">Listed Horses</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20">
                <div className="text-xl md:text-2xl font-bold text-white mb-1">{stats.totalSellers}+</div>
                <div className="text-xs md:text-sm text-white/70">Verified Sellers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20">
                <div className="text-xl md:text-2xl font-bold text-white mb-1">{stats.totalBreeds}+</div>
                <div className="text-xs md:text-sm text-white/70">Horse Breeds</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20">
                <div className="text-xl md:text-2xl font-bold text-white mb-1">{stats.successRate}%</div>
                <div className="text-xs md:text-sm text-white/70">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid with Filter */}
      <div className="py-6 md:py-12 bg-gradient-to-br from-accent/30 via-white to-primary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-2xl overflow-hidden border border-white">
              <div className="p-4 md:p-8">
                <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                  {/* Active Filters - Mobile Only */}
                  <div className="lg:hidden">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-tertiary">
                        {filteredHorses.length} Horses Found
                      </h2>
                      <button
                        onClick={handleClearFilters}
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>

                  {/* Filters */}
                  <FilterSidebar 
                    filters={filters}
                    breeds={breeds}
                    onApplyFilters={handleApplyFilters}
                    onClearFilters={handleClearFilters}
                    isOpen={showMobileFilters}
                    onClose={() => setShowMobileFilters(false)}
                  />
                  
                  {/* Main Content */}
                  <div className="flex-1">
                    {error ? (
                      <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 p-4 md:p-6 rounded-xl">
                        <p className="font-medium">{error}</p>
                      </div>
                    ) : (
                      <HorseGrid 
                        horses={filteredHorses}
                        loading={loading}
                        onFavorite={handleFavorite}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Help Text - Responsive */}
            <div className="mt-6 md:mt-8 text-center px-4">
              <div className="backdrop-blur-sm bg-white/80 rounded-xl py-4 md:py-5 px-6 md:px-8 inline-block shadow-lg border border-white/50">
                <p className="text-gray-700 text-sm md:text-base">
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