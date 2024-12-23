import React from 'react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/api/placeholder/1920/1080')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-accent/95" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Join the Premier Horse Trading Community?
          </h2>
          <p className="text-lg md:text-xl mb-8 text-white/90">
            List your horses, connect with buyers, and become part of a trusted marketplace where quality meets opportunity.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-primary hover:bg-secondary px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started Now
            </Link>
            <Link
              to="/about"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
            >
              Learn More
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-8">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-2">
                <span className="w-2 h-2 bg-secondary rounded-full"></span>
              </div>
              <span className="text-white/90">Secure Platform</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-2">
                <span className="w-2 h-2 bg-secondary rounded-full"></span>
              </div>
              <span className="text-white/90">24/7 Support</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-2">
                <span className="w-2 h-2 bg-secondary rounded-full"></span>
              </div>
              <span className="text-white/90">Money-Back Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;