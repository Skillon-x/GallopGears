import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';

const BrowseCategories = ({ breeds = [] }) => {
  // Default categories if no breeds are available
  const defaultCategories = [
    {
      title: "Racing Horses",
      description: "Champion thoroughbreds and racing prospects",
      image: "/images/categories/racing.jpg"
    },
    {
      title: "Show Horses",
      description: "Award-winning show horses and performers",
      image: "/images/categories/show.jpg"
    },
    {
      title: "Breeding Horses",
      description: "Premium breeding stock and bloodlines",
      image: "/images/categories/breeding.jpg"
    },
    {
      title: "Trail Horses",
      description: "Well-trained companions for trail riding",
      image: "/images/categories/trail.jpg"
    },
    {
      title: "Polo Ponies",
      description: "Athletic polo ponies and prospects",
      image: "/images/categories/polo.jpg"
    },
    {
      title: "Sport Horses",
      description: "Versatile athletes for various disciplines",
      image: "/images/categories/sport.jpg"
    }
  ];

  // Use breeds if available, otherwise use default categories
  const categories = breeds.length > 0 
    ? breeds.map(breed => ({
        title: breed.name,
        description: breed.description || `Browse ${breed.name} horses`,
        image: breed.image || "/images/categories/default.jpg",
        count: breed.count || 0
      }))
    : defaultCategories;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-tertiary mb-4">
            Browse by Category
          </h2>
          <p className="text-tertiary/70">
            Discover the perfect horse for your needs from our diverse categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Link 
              key={index}
              to={`/browse?breed=${encodeURIComponent(category.title.toLowerCase())}`}
              className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {category.title}
                    </h3>
                    <p className="text-secondary text-sm mb-2">
                      {category.description}
                    </p>
                    <div className="flex justify-between items-center">
                      {category.count !== undefined && (
                        <span className="text-white/80 text-sm">
                          {category.count} Listings
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link 
            to="/browse"
            className="inline-flex items-center text-primary hover:text-accent font-semibold transition-colors"
          >
            View All Categories
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BrowseCategories;