import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, ChevronRight } from 'lucide-react';

const FeaturedSellers = ({ sellers = [] }) => {
    return (
        <section className="py-16">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-tertiary">Featured Sellers</h2>
                    <Link 
                        to="/sellers" 
                        className="text-primary hover:text-accent flex items-center"
                    >
                        View All Sellers
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                {/* Sellers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sellers.map(seller => (
                        <Link
                            key={seller._id}
                            to={`/sellers/${seller._id}`}
                            className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                        >
                            {/* Cover Image */}
                            <div className="relative aspect-[16/9] overflow-hidden">
                                <img
                                    src={seller.images?.cover || '/placeholder-stable.jpg'}
                                    alt={seller.businessName}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {/* Premium Badge */}
                                {seller.subscription?.plan === 'premium' && (
                                    <div className="absolute top-2 right-2 bg-accent text-white px-2 py-1 rounded-full text-xs flex items-center">
                                        <Star className="w-3 h-3 mr-1" />
                                        Premium Seller
                                    </div>
                                )}
                            </div>

                            {/* Profile Image */}
                            <div className="relative px-4">
                                <div className="absolute -top-8 w-16 h-16 rounded-full border-4 border-white overflow-hidden">
                                    <img
                                        src={seller.images?.profile || '/placeholder-profile.jpg'}
                                        alt={seller.businessName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 pt-10">
                                <h3 className="font-bold text-tertiary mb-2">
                                    {seller.businessName}
                                </h3>
                                <div className="flex items-center text-sm text-tertiary/70 mb-3">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {seller.location.city}, {seller.location.state}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 /10 pt-3">
                                    <div>
                                        <p className="text-primary font-semibold">
                                            {seller.stats?.totalListings || 0}
                                        </p>
                                        <p className="text-xs text-tertiary/70">Listings</p>
                                    </div>
                                    <div>
                                        <p className="text-primary font-semibold">
                                            {seller.stats?.totalSales || 0}
                                        </p>
                                        <p className="text-xs text-tertiary/70">Sales</p>
                                    </div>
                                    <div>
                                        <p className="text-primary font-semibold">
                                            {seller.stats?.rating || '4.5'}★
                                        </p>
                                        <p className="text-xs text-tertiary/70">Rating</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedSellers; 