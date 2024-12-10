import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const Market = () => {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    breed: '',
    minPrice: '',
    maxPrice: '',
    discipline: '',
    location: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHorses();
  }, []);

  const fetchHorses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/horses');
      setHorses(response.data);
    } catch (error) {
      console.error('Error fetching horses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHorses = horses.filter(horse => {
    const matchesSearch = horse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         horse.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBreed = !filters.breed || horse.breed === filters.breed;
    const matchesDiscipline = !filters.discipline || horse.discipline === filters.discipline;
    const matchesLocation = !filters.location || horse.location.includes(filters.location);
    const matchesPrice = (!filters.minPrice || horse.price >= Number(filters.minPrice)) &&
                        (!filters.maxPrice || horse.price <= Number(filters.maxPrice));

    return matchesSearch && matchesBreed && matchesDiscipline && matchesLocation && matchesPrice;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-4xl font-bold mb-4">Find Your Perfect Horse</h1>
        <p className="text-lg mb-6">Browse through our curated selection of quality horses</p>
        
        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <input
            type="text"
            placeholder="Search by name, breed, or discipline..."
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-white text-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          <span>Filters</span>
          <ChevronDownIcon className={`h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <select
              className="input-field"
              value={filters.breed}
              onChange={(e) => setFilters({ ...filters, breed: e.target.value })}
            >
              <option value="">All Breeds</option>
              {/* Add breed options */}
            </select>

            <select
              className="input-field"
              value={filters.discipline}
              onChange={(e) => setFilters({ ...filters, discipline: e.target.value })}
            >
              <option value="">All Disciplines</option>
              {/* Add discipline options */}
            </select>

            <input
              type="text"
              placeholder="Location"
              className="input-field"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />

            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min Price"
                className="input-field w-1/2"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <input
                type="number"
                placeholder="Max Price"
                className="input-field w-1/2"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Horse Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHorses.map((horse) => (
          <Link
            key={horse._id}
            to={`/horses/${horse._id}`}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
              <div className="relative h-64">
                <img
                  src={horse.images?.[0] || 'https://via.placeholder.com/400x300?text=Horse+Image'}
                  alt={horse.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-xl font-semibold text-white">{horse.name}</h3>
                  <p className="text-white/90">{horse.breed}</p>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">{horse.age} years old</span>
                  <span className="flex items-center text-primary-600 font-semibold">
                    <CurrencyDollarIcon className="h-5 w-5 mr-1" />
                    {horse.price.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-500">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>{horse.location}</span>
                </div>

                {horse.discipline && (
                  <div className="mt-2">
                    <span className="inline-block bg-gray-100 px-2 py-1 rounded-full text-sm text-gray-600">
                      {horse.discipline}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredHorses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No horses found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Market;