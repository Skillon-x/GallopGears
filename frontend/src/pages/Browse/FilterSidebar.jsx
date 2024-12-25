import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { debounce } from 'lodash';

const DISCIPLINES = [
  'Dressage',
  'Show Jumping',
  'Eventing',
  'Trail Riding',
  'Racing',
  'Western',
  'Endurance'
];

const TRAINING_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Professional'
];

const TEMPERAMENTS = [
  'Gentle',
  'Spirited',
  'Calm',
  'Energetic',
  'Well-trained'
];

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

const FilterSidebar = ({ filters, breeds = [], onApplyFilters, onClearFilters, isOpen, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [errors, setErrors] = useState({});
  const isDesktop = window.innerWidth >= 1024; // lg breakpoint
  const debouncedApply = useRef(null);
  const scrollRef = useRef(null);

  // Initialize debounced apply function
  useEffect(() => {
    debouncedApply.current = debounce((newFilters) => {
      if (isDesktop) {
        onApplyFilters(newFilters);
      }
    }, 1000); // Increased debounce time to 1 second

    return () => {
      debouncedApply.current?.cancel();
    };
  }, [onApplyFilters, isDesktop]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const validateFilters = useCallback((newFilters) => {
    const newErrors = {};
    
    // Validate age range
    if (newFilters.minAge && newFilters.maxAge) {
      if (parseInt(newFilters.minAge) < 0) {
        newErrors.minAge = 'Age cannot be negative';
      }
      if (parseInt(newFilters.maxAge) > 40) {
        newErrors.maxAge = 'Maximum age is 40 years';
      }
    }

    // Validate height range
    if (newFilters.minHeight && newFilters.maxHeight) {
      if (parseFloat(newFilters.minHeight) < 10) {
        newErrors.minHeight = 'Minimum height is 10 hands';
      }
      if (parseFloat(newFilters.maxHeight) > 20) {
        newErrors.maxHeight = 'Maximum height is 20 hands';
      }
    }

    // Validate price range
    if (newFilters.minPrice && newFilters.maxPrice) {
      if (parseInt(newFilters.minPrice) < 0) {
        newErrors.minPrice = 'Price cannot be negative';
      }
      if (parseInt(newFilters.maxPrice) > 10000000) {
        newErrors.maxPrice = 'Maximum price is ₹1,00,00,000';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    const currentScroll = scrollRef.current?.scrollTop || 0;
    
    setLocalFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      validateFilters(newFilters);
      
      // Only trigger debounced apply on desktop for non-numeric inputs
      if (isDesktop && !['minPrice', 'maxPrice', 'minAge', 'maxAge', 'minHeight', 'maxHeight'].includes(name)) {
        debouncedApply.current?.(newFilters);
      }
      
      return newFilters;
    });

    // Restore scroll position after state update
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = currentScroll;
      }
    });
  }, [validateFilters, isDesktop]);

  const handleApply = useCallback(() => {
    if (validateFilters(localFilters)) {
      // Cancel any pending debounced updates
      debouncedApply.current?.cancel();
      onApplyFilters(localFilters);
      onClose?.();
    }
  }, [localFilters, onApplyFilters, onClose, validateFilters]);

  const handleClear = useCallback(() => {
    // Cancel any pending debounced updates
    debouncedApply.current?.cancel();
    onClearFilters();
    setErrors({});
    onClose?.();
  }, [onClearFilters, onClose]);

  const renderFilterContent = () => (
    <div className="space-y-6">
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
                onClick={() => handleInputChange({ target: { name: 'saleType', value: 'sale' } })}
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
                onClick={() => handleInputChange({ target: { name: 'saleType', value: 'loan' } })}
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
              <div>
                <input 
                  type="number"
                  name="minAge"
                  value={localFilters.minAge}
                  onChange={handleInputChange}
                  placeholder="Min"
                  min="0"
                  max="40"
                  className={`w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary ${
                    errors.minAge ? 'border-red-500' : 'border-white/20'
                  }`}
                />
                {errors.minAge && (
                  <p className="text-red-500 text-xs mt-1">{errors.minAge}</p>
                )}
              </div>
              <div>
                <input 
                  type="number"
                  name="maxAge"
                  value={localFilters.maxAge}
                  onChange={handleInputChange}
                  placeholder="Max"
                  min="0"
                  max="40"
                  className={`w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary ${
                    errors.maxAge ? 'border-red-500' : 'border-white/20'
                  }`}
                />
                {errors.maxAge && (
                  <p className="text-red-500 text-xs mt-1">{errors.maxAge}</p>
                )}
              </div>
            </div>
          </FilterSection>

          {/* Height */}
          <FilterSection title="Height (hands)">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input 
                  type="number"
                  name="minHeight"
                  value={localFilters.minHeight}
                  onChange={handleInputChange}
                  placeholder="Min"
                  step="0.1"
                  min="10"
                  max="20"
                  className={`w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary ${
                    errors.minHeight ? 'border-red-500' : 'border-white/20'
                  }`}
                />
                {errors.minHeight && (
                  <p className="text-red-500 text-xs mt-1">{errors.minHeight}</p>
                )}
              </div>
              <div>
                <input 
                  type="number"
                  name="maxHeight"
                  value={localFilters.maxHeight}
                  onChange={handleInputChange}
                  placeholder="Max"
                  step="0.1"
                  min="10"
                  max="20"
                  className={`w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary ${
                    errors.maxHeight ? 'border-red-500' : 'border-white/20'
                  }`}
                />
                {errors.maxHeight && (
                  <p className="text-red-500 text-xs mt-1">{errors.maxHeight}</p>
                )}
              </div>
            </div>
          </FilterSection>

          {/* Training Level */}
          <FilterSection title="Training Level">
            <select
              name="trainingLevel"
              value={localFilters.trainingLevel}
              onChange={handleInputChange}
              className="w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary border-white/20"
            >
              <option value="">All Levels</option>
              {TRAINING_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </FilterSection>

          {/* Discipline */}
          <FilterSection title="Discipline">
            <select
              name="discipline"
              value={localFilters.discipline}
              onChange={handleInputChange}
              className="w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary border-white/20"
            >
              <option value="">All Disciplines</option>
              {DISCIPLINES.map(discipline => (
                <option key={discipline} value={discipline}>{discipline}</option>
              ))}
            </select>
          </FilterSection>

          {/* Temperament */}
          <FilterSection title="Temperament">
            <select
              name="temperament"
              value={localFilters.temperament}
              onChange={handleInputChange}
              className="w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary border-white/20"
            >
              <option value="">All Temperaments</option>
              {TEMPERAMENTS.map(temperament => (
                <option key={temperament} value={temperament}>{temperament}</option>
              ))}
            </select>
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
              <div>
                <input 
                  type="number"
                  name="minPrice"
                  value={localFilters.minPrice}
                  onChange={handleInputChange}
                  placeholder="Min"
                  min="0"
                  className={`w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary ${
                    errors.minPrice ? 'border-red-500' : 'border-white/20'
                  }`}
                />
                {errors.minPrice && (
                  <p className="text-red-500 text-xs mt-1">{errors.minPrice}</p>
                )}
              </div>
              <div>
                <input 
                  type="number"
                  name="maxPrice"
                  value={localFilters.maxPrice}
                  onChange={handleInputChange}
                  placeholder="Max"
                  min="0"
                  className={`w-full p-2.5 border rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-tertiary ${
                    errors.maxPrice ? 'border-red-500' : 'border-white/20'
                  }`}
                />
                {errors.maxPrice && (
                  <p className="text-red-500 text-xs mt-1">{errors.maxPrice}</p>
                )}
              </div>
            </div>
          </FilterSection>

          {/* Action Buttons */}
          <div className="space-y-3 mt-6">
            <button 
              onClick={handleApply}
              disabled={Object.keys(errors).length > 0}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 sticky top-24 max-h-[calc(100vh-8rem)] overflow-hidden rounded-xl">
        <div className="backdrop-blur-sm bg-white/90 rounded-xl shadow-lg border border-white">
          <div className="overflow-y-auto max-h-[calc(100vh-12rem)]" ref={scrollRef}>
            <div className="p-4">
              {renderFilterContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md">
            <div className="h-full flex flex-col bg-white/90 backdrop-blur-sm shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-white/90 z-10">
                <h2 className="text-lg font-semibold text-tertiary">Filters</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-tertiary" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto" ref={scrollRef}>
                <div className="p-4">
                  {renderFilterContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSidebar;