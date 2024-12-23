import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const RecentHorses = ({ horses = [] }) => {
    return (
        <section className="py-16 bg-secondary/5">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-tertiary">Recently Added</h2>
                    <Link 
                        to="/browse?sort=newest" 
                        className="text-primary hover:text-accent flex items-center"
                    >
                        View All
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                {/* Horses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {horses.map(horse => (
                        <Link 
                            key={horse._id}
                            to={`/horses/${horse._id}`}
                            className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                        >
                            {/* Image */}
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src={horse.images[0]?.url || '/images/placeholder-horse.jpg'}
                                    alt={horse.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                    <p className="text-white font-semibold">{horse.name}</p>
                                    <p className="text-white/90 text-sm">
                                        {horse.breed} • {horse.age.years} years
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-primary font-bold">
                                        ₹{horse.price.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-tertiary/70">
                                        {horse.location.city}
                                    </p>
                                </div>
                                <p className="text-sm text-tertiary/70 mt-2">
                                    Listed by {horse.seller?.businessName}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* No Horses Message */}
                {horses.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-tertiary">No recent horses available.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default RecentHorses; 