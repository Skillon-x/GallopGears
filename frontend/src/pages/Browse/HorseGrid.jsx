import React from 'react';
import HorseCard from '../../components/common/HorseCard';

const HorseGrid = ({ horses, loading, onFavorite }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white/80 backdrop-blur-sm rounded-xl border border-white p-4">
            <div className="bg-gray-200 rounded-xl aspect-[4/3]" />
            <div className="mt-4 space-y-4">
              <div className="h-6 bg-gray-200 rounded-full w-2/3" />
              <div className="h-8 bg-gray-200 rounded-full w-1/3" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 bg-gray-200 rounded-full w-1/2" />
                <div className="h-6 bg-gray-200 rounded-full w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!horses?.length) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 max-w-lg mx-auto border border-white">
          <p className="text-tertiary text-lg font-medium">No horses found matching your criteria.</p>
          <p className="text-tertiary/60 mt-2">Try adjusting your filters or search terms.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {horses.map(horse => (
        <HorseCard
          key={horse._id}
          horse={horse}
          onFavorite={onFavorite}
        />
      ))}
    </div>
  );
};

export default HorseGrid;