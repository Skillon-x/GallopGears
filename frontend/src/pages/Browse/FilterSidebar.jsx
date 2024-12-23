import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { api } from '../../services/api';

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/10 last:border-0 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-tertiary hover:text-primary transition-colors"
      >
        <h3 className="font-semibold">{title}</h3>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="mt-4 space-y-3">{children}</div>}
    </div>
  );
};

const FilterSidebar = ({ filters, onApplyFilters, onClearFilters, isOpen, onClose }) => {
  const [breeds, setBreeds] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    fetchBreeds();
  }, []);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const fetchBreeds = async () => {
    try {
      const response = await api.horses.getCategories();
      if (response?.data?.success) {
        setBreeds(response.data.categories);
      }
    } catch (err) {
      console.error('Error fetching breeds:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose?.();
  };

  const handleClear = () => {
    onClearFilters();
    onClose?.();
  };

  const Sidebar = () => (
    <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-2xl border border-white overflow-hidden">
      {/* Mobile Header */}
      <div className="flex items-center justify-between md:hidden p-6 border-b border-white/10">
        <h2 className="text-lg font-semibold text-tertiary">Filters</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-tertiary" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Sort */}
        <FilterSection title="Sort">
          <select
            name="sort"
            value={localFilters.sort}
            onChange={handleInputChange}
            className="w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary border-white/20"
          >
            <option value="newest">Newest Listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="views">Most Viewed</option>
          </select>
        </FilterSection>

        {/* Location */}
        <FilterSection title="Location">
          <input 
            type="text"
            name="location"
            value={localFilters.location}
            onChange={handleInputChange}
            placeholder="Enter city or state..."
            className="w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary border-white/20"
          />
          <select
            name="radius"
            value={localFilters.radius}
            onChange={handleInputChange}
            className="w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary border-white/20 mt-2"
          >
            <option value="50">Within 50 km</option>
            <option value="100">Within 100 km</option>
            <option value="200">Within 200 km</option>
            <option value="500">Within 500 km</option>
          </select>
        </FilterSection>

        {/* Sale Type */}
        <FilterSection title="Sale Type">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLocalFilters(prev => ({ ...prev, saleType: 'sale' }))}
              className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                localFilters.saleType === 'sale'
                  ? 'bg-primary text-white border-primary'
                  : 'border-white/20 text-tertiary hover:border-primary hover:text-primary'
              }`}
            >
              For Sale
            </button>
            <button
              type="button"
              onClick={() => setLocalFilters(prev => ({ ...prev, saleType: 'loan' }))}
              className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                localFilters.saleType === 'loan'
                  ? 'bg-primary text-white border-primary'
                  : 'border-white/20 text-tertiary hover:border-primary hover:text-primary'
              }`}
            >
              For Loan
            </button>
          </div>
        </FilterSection>

        {/* Age Range */}
        <FilterSection title="Age (years)">
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="number"
              name="minAge"
              value={localFilters.minAge}
              onChange={handleInputChange}
              placeholder="Min"
              min="0"
              className="w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary border-white/20"
            />
            <input 
              type="number"
              name="maxAge"
              value={localFilters.maxAge}
              onChange={handleInputChange}
              placeholder="Max"
              min="0"
              className="w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary border-white/20"
            />
          </div>
        </FilterSection>

        {/* Height */}
        <FilterSection title="Height (hands)">
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="number"
              name="minHeight"
              value={localFilters.minHeight}
              onChange={handleInputChange}
              placeholder="Min"
              step="0.1"
              min="10"
              className="w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary border-white/20"
            />
            <input 
              type="number"
              name="maxHeight"
              value={localFilters.maxHeight}
              onChange={handleInputChange}
              placeholder="Max"
              step="0.1"
              min="10"
              className="w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary border-white/20"
            />
          </div>
        </FilterSection>

        {/* Breed */}
        <FilterSection title="Breed">
          <select
            name="breed"
            value={localFilters.breed}
            onChange={handleInputChange}
            className="w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary border-white/20"
          >
            <option value="">All Breeds</option>
            {breeds.map(breed => (
              <option key={breed._id} value={breed._id}>
                {breed.name}
              </option>
            ))}
          </select>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price (₹)">
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="number"
              name="minPrice"
              value={localFilters.minPrice}
              onChange={handleInputChange}
              placeholder="Min"
              min="0"
              className="w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary border-white/20"
            />
            <input 
              type="number"
              name="maxPrice"
              value={localFilters.maxPrice}
              onChange={handleInputChange}
              placeholder="Max"
              min="0"
              className="w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary border-white/20"
            />
          </div>
        </FilterSection>

        {/* Action Buttons */}
        <div className="space-y-3 pt-6 border-t border-white/10">
          <button 
            onClick={handleApply}
            className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Apply Filters
          </button>
          
          <button 
            onClick={handleClear}
            className="w-full text-tertiary hover:text-primary transition-colors font-medium"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50">
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-gradient-to-br from-accent/30 via-white to-primary/30 overflow-y-auto">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80 flex-shrink-0">
        <div className="sticky top-24">
          <Sidebar />
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;