import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, ChevronDown, Loader } from 'lucide-react';

// Price range options
const PRICE_RANGES = [
    { id: 'all', label: 'All Prices', value: 'all' },
    { id: 'under100k', label: 'Under ₹1,00,000', min: 0, max: 100000 },
    { id: '100k-300k', label: '₹1,00,000 - ₹3,00,000', min: 100000, max: 300000 },
    { id: 'above300k', label: 'Above ₹3,00,000', min: 300000, max: Infinity }
];

const FeaturedHorsesHome = ({ horses = [], breeds = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBreed, setSelectedBreed] = useState('');
    const [selectedPrice, setSelectedPrice] = useState('all');
    const [favorites, setFavorites] = useState([]);

    const toggleFavorite = async (horseId) => {
        try {
            if (favorites.includes(horseId)) {
                setFavorites(prev => prev.filter(id => id !== horseId));
            } else {
                setFavorites(prev => [...prev, horseId]);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const filteredHorses = horses.filter(horse => {
        const matchesSearch = horse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            horse.breed.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesBreed = !selectedBreed || selectedBreed === 'All Breeds' ||
            horse.breed === selectedBreed;
        
        const selectedPriceRange = PRICE_RANGES.find(range => range.value === selectedPrice);
        const matchesPrice = selectedPrice === 'all' || (
            horse.price >= selectedPriceRange.min && 
            horse.price <= selectedPriceRange.max
        );

        return matchesSearch && matchesBreed && matchesPrice;
    });

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
                        {breeds.map(breed => (
                            <option key={breed._id} value={breed.name}>{breed.name}</option>
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

                {/* Horse Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredHorses.map(horse => (
                        <div key={horse._id} className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-shadow">
                            {/* Image Container */}
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src={horse.images[0]?.url || '/images/placeholder-horse.jpg'}
                                    alt={horse.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {horse.featured?.active && (
                                    <span className="absolute top-2 right-2 bg-accent text-white px-2 py-1 rounded-full text-xs">
                                        Featured
                                    </span>
                                )}
                                <button
                                    onClick={() => toggleFavorite(horse._id)}
                                    className="absolute top-2 left-2 p-1.5 rounded-full bg-white shadow-md hover:bg-secondary transition-colors"
                                >
                                    <Heart
                                        className={`h-5 w-5 ${favorites.includes(horse._id)
                                                ? 'fill-accent text-accent'
                                                : 'text-tertiary'
                                            }`}
                                    />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-tertiary">{horse.name}</h3>
                                    <p className="text-lg font-bold text-primary">
                                        ₹{horse.price.toLocaleString()}
                                    </p>
                                </div>
                                <p className="text-sm text-tertiary/80 mb-3">
                                    {horse.breed} • {horse.age.years} years • {horse.location.city}
                                </p>
                                <p className="text-sm text-tertiary/70 mb-4">
                                    Listed by {horse.seller?.businessName}
                                </p>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Link 
                                        to={`/horses/${horse._id}`}
                                        className="flex-1 bg-accent hover:bg-primary text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-center"
                                    >
                                        View Details
                                    </Link>
                                    <Link 
                                        to={`/inquire/${horse._id}`}
                                        className="flex-1 border border-tertiary text-tertiary hover:bg-secondary px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-center"
                                    >
                                        Inquire
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Results */}
                {filteredHorses.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-tertiary">No horses found matching your criteria.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedHorsesHome;