import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartIcon, MapPinIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const HorseCard = ({ horse, onFavorite }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/horses/${horse.id}`);
    };

    return (
        <motion.div
            className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5 }}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={horse.images[0] || '/placeholder-horse.jpg'}
                    alt={horse.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Favorite Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onFavorite && onFavorite(horse);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all duration-200"
                >
                    {horse.isFavorite ? (
                        <HeartIconSolid className="h-6 w-6 text-red-500" />
                    ) : (
                        <HeartIcon className="h-6 w-6 text-gray-600" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 truncate">
                        {horse.name}
                    </h3>
                    <div className="flex items-center text-primary font-semibold">
                        <CurrencyRupeeIcon className="h-5 w-5 mr-1" />
                        <span>{new Intl.NumberFormat('en-IN').format(horse.price)}</span>
                    </div>
                </div>

                <div className="flex items-center text-gray-600 mb-2">
                    <MapPinIcon className="h-5 w-5 mr-1" />
                    <span className="text-sm">
                        {horse.location.city}, {horse.location.state}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {horse.breed}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {horse.age.years} years
                    </span>
                    {horse.specifications.training && (
                        <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                            {horse.specifications.training}
                        </span>
                    )}
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {horse.description}
                </p>

                <button
                    onClick={handleClick}
                    className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200"
                >
                    View Details
                </button>
            </div>

            {/* Status Badge */}
            {horse.status && (
                <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        horse.status === 'sold' ? 'bg-red-500 text-white' :
                        horse.status === 'featured' ? 'bg-yellow-500 text-white' :
                        'bg-green-500 text-white'
                    }`}>
                        {horse.status.charAt(0).toUpperCase() + horse.status.slice(1)}
                    </span>
                </div>
            )}
        </motion.div>
    );
};

export default HorseCard; 