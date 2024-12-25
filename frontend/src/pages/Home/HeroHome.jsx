import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';


const HeroHome = ({ stats }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="relative min-h-screen pt-16">
      {/* Background with Overlay */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/hero-bg.jpg')`,
        }}>
        <div className="absolute inset-0 bg-gradient-to-br from-tertiary/95 via-primary/90 to-accent/95" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-32 lg:pt-38 lg:pb-44">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main Text */}
          
          <motion.h1 initial={{ opacity: 0, y: -100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        viewport={{ once: true }} className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your Premier Horse Trading Marketplace
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        viewport={{ once: true }} className="text-lg md:text-xl text-secondary mb-12">
            Connect with trusted sellers, find your perfect horse, or list your equine companion with confidence.
          </motion.p>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link 
              to="/seller/dashboard" 
              className="group flex items-center justify-center px-8 py-4 bg-primary hover:bg-accent text-white rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <PlusCircle className="w-6 h-6 mr-2" />
              Sell Your Horse
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/browse" 
              className="group flex items-center justify-center px-8 py-4 bg-white hover:bg-secondary text-primary rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Search className="w-6 h-6 mr-2" />
              Browse Horses
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white max-w-2xl mx-auto">
            <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold mb-1">{stats.horses}</div>
              <div className="text-sm text-secondary">Listed Horses</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold mb-1">{stats.sellers}</div>
              <div className="text-sm text-secondary">Verified Sellers</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold mb-1">{stats.breeds || 0}</div>
              <div className="text-sm text-secondary">Horse Breeds</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold mb-1">98%</div>
              <div className="text-sm text-secondary">Success Rate</div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-8">
            <div className="text-secondary flex items-center">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-2">
                <span className="w-2 h-2 bg-accent rounded-full"></span>
              </div>
              Verified Sellers
            </div>
            <div className="text-secondary flex items-center">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-2">
                <span className="w-2 h-2 bg-accent rounded-full"></span>
              </div>
              Secure Payments
            </div>
            <div className="text-secondary flex items-center">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-2">
                <span className="w-2 h-2 bg-accent rounded-full"></span>
              </div>
              Expert Support
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full text-white" viewBox="0 0 1440 120" fill="currentColor" preserveAspectRatio="none">
          <path d="M0,32L60,42.7C120,53,240,75,360,80C480,85,600,75,720,58.7C840,43,960,21,1080,16C1200,11,1320,21,1380,26.7L1440,32L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroHome;