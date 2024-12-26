import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Heart, Star, Shield, Award } from 'lucide-react';

const HorseCard = ({ horse, onFavorite }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/horses/${horse._id}`);
  };

  const formatAge = (age) => {
    if (!age) return 'N/A';
    const { years, months } = age;
    if (years && months) {
      return `${years}y ${months}m`;
    } else if (years) {
      return `${years}y`;
    } else if (months) {
      return `${months}m`;
    }
    return 'N/A';
  };

  return (
    <div 
      className="group bg-white/80 backdrop-blur-sm rounded-xl border border-white hover:border-primary/20 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={handleClick}
    >
      <div className="relative aspect-[4/3]">
        <img
          src={horse.images?.[0]?.url || '/placeholder-horse.jpg'}
          alt={horse.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(horse._id);
          }}
          className={`absolute top-3 right-3 p-3 rounded-full backdrop-blur-sm ${
            horse.isFavorited
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-black/20 text-white hover:bg-black/30'
          } transition-all duration-300 transform hover:scale-110`}
        >
          <Heart className={`w-5 h-5 ${horse.isFavorited ? 'fill-current' : ''}`} />
        </button>
        
        {/* Status Badges */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-2">
          {horse.isVerified && (
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/90 text-white backdrop-blur-sm flex items-center shadow-lg">
              <Shield className="w-3 h-3 mr-1.5" />
              Verified
            </span>
          )}
          {horse.isFeatured && (
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-accent/90 text-white backdrop-blur-sm flex items-center shadow-lg">
              <Star className="w-3 h-3 mr-1.5" />
              Featured
            </span>
          )}
          {horse.isPremium && (
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary/90 text-white backdrop-blur-sm flex items-center shadow-lg">
              <Award className="w-3 h-3 mr-1.5" />
              Premium
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-tertiary text-lg group-hover:text-primary transition-colors">
              {horse.name}
            </h3>
            <p className="text-primary font-bold text-xl mt-1">
              ₹{horse.price?.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-tertiary/70">{formatAge(horse.age)}</p>
            <p className="text-sm font-medium text-tertiary/70">{horse.height} hands</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-tertiary/70">
            <MapPin className="w-4 h-4 mr-1.5" />
            {horse.location?.city}, {horse.location?.state}
          </div>
          <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-secondary/50 text-tertiary backdrop-blur-sm border border-secondary">
            {horse.breed}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HorseCard; 