import { useState } from 'react';
import { 
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

const AdvancedSearch = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    minPrice: '',
    maxPrice: '',
    minAge: '',
    maxAge: '',
    breed: '',
    gender: '',
    discipline: '',
    location: '',
    minHeight: '',
    maxHeight: '',
    training: '',
    color: ''
  });

  const breeds = [
    'Arabian', 'Thoroughbred', 'Quarter Horse', 'Morgan',
    'Appaloosa', 'Paint Horse', 'Friesian', 'Andalusian', 'Other'
  ];

  const disciplines = [
    'Dressage', 'Show Jumping', 'Eventing', 'Western',
    'Trail', 'Racing', 'Endurance', 'Pleasure'
  ];

  const colors = [
    'Bay', 'Black', 'Chestnut', 'Grey', 'Palomino',
    'Pinto', 'Roan', 'White', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      minPrice: '',
      maxPrice: '',
      minAge: '',
      maxAge: '',
      breed: '',
      gender: '',
      discipline: '',
      location: '',
      minHeight: '',
      maxHeight: '',
      training: '',
      color: ''
    });
    onSearch({});
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleChange}
            placeholder="Search horses..."
            className="input-field pl-10"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range ($)</label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleChange}
                placeholder="Min"
                className="input-field w-1/2"
              />
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleChange}
                placeholder="Max"
                className="input-field w-1/2"
              />
            </div>
          </div>

          {/* Age Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age (years)</label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="minAge"
                value={filters.minAge}
                onChange={handleChange}
                placeholder="Min"
                className="input-field w-1/2"
              />
              <input
                type="number"
                name="maxAge"
                value={filters.maxAge}
                onChange={handleChange}
                placeholder="Max"
                className="input-field w-1/2"
              />
            </div>
          </div>

          {/* Height Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Height (hands)</label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="minHeight"
                value={filters.minHeight}
                onChange={handleChange}
                placeholder="Min"
                className="input-field w-1/2"
                step="0.1"
              />
              <input
                type="number"
                name="maxHeight"
                value={filters.maxHeight}
                onChange={handleChange}
                placeholder="Max"
                className="input-field w-1/2"
                step="0.1"
              />
            </div>
          </div>

          {/* Breed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
            <select
              name="breed"
              value={filters.breed}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">All Breeds</option>
              {breeds.map(breed => (
                <option key={breed} value={breed}>{breed}</option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              name="gender"
              value={filters.gender}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Discipline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discipline</label>
            <select
              name="discipline"
              value={filters.discipline}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">All Disciplines</option>
              {disciplines.map(discipline => (
                <option key={discipline} value={discipline}>{discipline}</option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <select
              name="color"
              value={filters.color}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">All Colors</option>
              {colors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleChange}
              placeholder="Enter location"
              className="input-field"
            />
          </div>

          {/* Training Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Training Level</label>
            <input
              type="text"
              name="training"
              value={filters.training}
              onChange={handleChange}
              placeholder="Enter training level"
              className="input-field"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Clear Filters
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center space-x-2"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            <span>Search</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdvancedSearch; 