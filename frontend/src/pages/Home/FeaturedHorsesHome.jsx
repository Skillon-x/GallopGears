import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, ChevronDown, Loader } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import VirtualGrid from '../../components/common/VirtualGrid';

// Price range options with proper type checking
const PRICE_RANGES = [
    { id: 'all', label: 'All Prices', value: 'all', min: 0, max: Infinity },
    { id: 'under100k', label: 'Under ₹1,00,000', value: 'under100k', min: 0, max: 100000 },
    { id: '100k-300k', label: '₹1,00,000 - ₹3,00,000', value: '100k-300k', min: 100000, max: 300000 },
    { id: 'above300k', label: 'Above ₹3,00,000', value: 'above300k', min: 300000, max: Infinity }
];

const HorseCard = React.memo(({ horse, isFavorite, onToggleFavorite }) => (
    <Link 
        to={`/horses/${horse._id}`}
        className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
    >
        <div className="relative aspect-[4/3] overflow-hidden">
            <img
                src={horse.images?.[0]?.url || '/images/placeholder-horse.jpg'}
                alt={horse.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
            />
            <button
                onClick={(e) => {
                    e.preventDefault();
                    onToggleFavorite(horse._id);
                }}
                className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            >
                <Heart 
                    className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-white font-semibold">{horse.name}</p>
                <p className="text-white/90 text-sm">
                    {horse.breed} • {horse.age?.years || 0} years
                </p>
            </div>
        </div>
        <div className="p-4">
            <div className="flex justify-between items-center">
                <p className="text-primary font-bold">
                    ₹{horse.price?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-tertiary/70">
                    {horse.location?.city || 'Location N/A'}
                </p>
            </div>
        </div>
    </Link>
));

const FeaturedHorsesHome = ({ horses = [], breeds = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBreed, setSelectedBreed] = useState('');
    const [selectedPrice, setSelectedPrice] = useState('all');
    const [favorites, setFavorites] = useState([]);

    const debouncedSearch = useDebounce(searchTerm, 300);

    const toggleFavorite = useCallback(async (horseId) => {
        try {
            setFavorites(prev => 
                prev.includes(horseId) 
                    ? prev.filter(id => id !== horseId)
                    : [...prev, horseId]
            );
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    }, []);

    const filteredHorses = useMemo(() => {
        return horses.filter(horse => {
            // Safely handle undefined values in search
            const horseName = (horse.name || '').toLowerCase();
            const horseBreed = (horse.breed || '').toLowerCase();
            const searchQuery = debouncedSearch.toLowerCase();
            
            const matchesSearch = horseName.includes(searchQuery) ||
                horseBreed.includes(searchQuery);
            
            const matchesBreed = !selectedBreed || selectedBreed === 'All Breeds' ||
                horse.breed === selectedBreed;
            
            // Get the selected price range and safely handle price comparison
            const selectedPriceRange = PRICE_RANGES.find(range => range.value === selectedPrice) || PRICE_RANGES[0];
            const horsePrice = horse.price || 0;
            const matchesPrice = selectedPrice === 'all' || (
                horsePrice >= selectedPriceRange.min && 
                horsePrice <= selectedPriceRange.max
            );

            return matchesSearch && matchesBreed && matchesPrice;
        });
    }, [horses, debouncedSearch, selectedBreed, selectedPrice]);

    const renderHorseCard = useCallback(({ index, style }) => (
        <div key={filteredHorses[index]._id} style={style}>
            <HorseCard 
                horse={filteredHorses[index]}
                isFavorite={favorites.includes(filteredHorses[index]._id)}
                onToggleFavorite={toggleFavorite}
            />
        </div>
    ), [filteredHorses, favorites, toggleFavorite]);

    // Prepare breeds for select dropdown
    const availableBreeds = useMemo(() => {
        const uniqueBreeds = new Set(horses.map(horse => horse.breed).filter(Boolean));
        return Array.from(uniqueBreeds);
    }, [horses]);

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-tertiary">Featured Horses</h2>
                        <p className="text-tertiary/70 mt-1">
                            Discover our handpicked selection of premium horses
                        </p>
                    </div>
                    <div className="text-sm text-tertiary">
                        Showing {filteredHorses.length} of {horses.length} horses
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search horses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-secondary rounded-md focus:outline-none focus:border-primary"
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-tertiary" />
                    </div>

                    {/* Breed Filter */}
                    <select
                        value={selectedBreed}
                        onChange={(e) => setSelectedBreed(e.target.value)}
                        className="px-4 py-2 border border-secondary rounded-md focus:outline-none focus:border-primary min-w-[200px]"
                    >
                        <option value="All Breeds">All Breeds</option>
                        {availableBreeds.map(breed => (
                            <option key={breed} value={breed}>{breed}</option>
                        ))}
                    </select>

                    {/* Price Filter */}
                    <select
                        value={selectedPrice}
                        onChange={(e) => setSelectedPrice(e.target.value)}
                        className="px-4 py-2 border border-secondary rounded-md focus:outline-none focus:border-primary min-w-[200px]"
                    >
                        {PRICE_RANGES.map(range => (
                            <option key={range.id} value={range.value}>
                                {range.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Virtual Grid of Horses */}
                <VirtualGrid
                    itemCount={filteredHorses.length}
                    itemHeight={400}
                    columnCount={3}
                    gap={24}
                    renderItem={renderHorseCard}
                />
            </div>
        </section>
    );
};

export default React.memo(FeaturedHorsesHome);