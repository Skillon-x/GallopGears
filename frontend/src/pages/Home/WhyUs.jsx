import React from 'react';
import { Shield, Star, Clock, Users, CheckCircle, HeartHandshake } from 'lucide-react';
import { Link } from 'react-router-dom';

const WhyUs = ({ stats }) => {
  const features = [
    {
      icon: Shield,
      title: "Verified Sellers",
      description: "Every seller undergoes thorough verification. Your safety is our priority.",
      stats: `${stats.sellers} Verified`,
    },
    {
      icon: Star,
      title: "Premium Listings",
      description: "Access to high-quality horses from reputable breeders and sellers.",
      stats: `${stats.horses} Horses`,
    },
    {
      icon: Clock,
      title: "Quick Process",
      description: "Streamlined buying and selling process with expert support.",
      stats: "24/7 Support",
    },
    {
      icon: HeartHandshake,
      title: "Secure Transactions",
      description: "Safe and transparent payment process with buyer protection.",
      stats: "100% Secure",
    }
  ];

  return (
    <section className="py-16 bg-secondary/30">
      {/* Main Content */}
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-tertiary mb-4">
            Why Choose GallopingGears?
          </h2>
          <p className="text-tertiary/80">
            Your trusted partner in the equestrian world, providing a secure and efficient marketplace for all your horse-related needs.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="relative group"
            >
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 h-full border border-primary/10">
                {/* Icon */}
                <div className="mb-4">
                  <div className="inline-block p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <feature.icon className="w-6 h-6" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-tertiary mb-2">
                  {feature.title}
                </h3>
                <p className="text-tertiary/70 mb-4">
                  {feature.description}
                </p>

                {/* Stats */}
                <div className="text-primary font-semibold">
                  {feature.stats}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 bg-white rounded-xl p-8 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-tertiary">Active Community</h4>
              <p className="text-tertiary/70">{stats.sellers} Active Sellers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-tertiary">Success Rate</h4>
              <p className="text-tertiary/70">98% Satisfaction</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-tertiary">Horse Breeds</h4>
              <p className="text-tertiary/70">{stats.breeds} Breeds Available</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Link 
            to="/register"
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent transition-colors duration-300"
          >
            Join Our Community
          </Link>
          <p className="mt-4 text-tertiary/60 text-sm">
            Join thousands of satisfied users in the premier horse trading marketplace
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;