import React, { useState, useEffect } from 'react';
import api from '../../services/api';

// Components
import HeroHome from './HeroHome';
import FeaturedHorsesHome from './FeaturedHorsesHome';
import RecentHorses from './RecentHorses';
import WhyUs from './WhyUs';
import CTASection from './CTASection';

// Loading skeleton component
const HomeSkeleton = () => (
  <div className="animate-pulse">
    {/* Hero Section Skeleton */}
    <div className="relative min-h-[600px] bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 mb-12">
      <div className="max-w-7xl mx-auto px-4 py-32">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="h-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg w-3/4 mx-auto" />
          <div className="h-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg w-2/3 mx-auto" />
          <div className="flex justify-center gap-4 mt-8">
            <div className="h-12 w-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg" />
            <div className="h-12 w-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg" />
          </div>
        </div>
      </div>
    </div>

    {/* Featured Horses Section Skeleton */}
    <div className="max-w-7xl mx-auto px-4 mb-16">
      <div className="h-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg w-48 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5" />
            <div className="p-4 space-y-3 bg-white">
              <div className="h-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg w-3/4" />
              <div className="h-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg w-1/2" />
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg w-24" />
                <div className="h-8 w-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Recent Horses Section Skeleton */}
    <div className="max-w-7xl mx-auto px-4 mb-16">
      <div className="h-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg w-48 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5" />
            <div className="p-4 space-y-3 bg-white">
              <div className="h-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg w-3/4" />
              <div className="h-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Why Us Section Skeleton */}
    <div className="max-w-7xl mx-auto px-4 mb-16">
      <div className="h-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg w-48 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6 rounded-xl bg-white border border-gray-100">
            <div className="h-12 w-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl mb-4" />
            <div className="h-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg w-3/4 mb-3" />
            <div className="h-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg w-full" />
          </div>
        ))}
      </div>
    </div>

    {/* CTA Section Skeleton */}
    <div className="max-w-7xl mx-auto px-4 mb-16">
      <div className="rounded-xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 p-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="h-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg w-3/4 mx-auto" />
          <div className="h-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg w-2/3 mx-auto" />
          <div className="h-12 w-40 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg mx-auto" />
        </div>
      </div>
    </div>
  </div>
);

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [homeData, setHomeData] = useState({
    featured: {
      horses: [],
    },
    recent: {
      horses: []
    },
    stats: {
      horses: 0,
      sellers: 0,
      breeds: 0
    }
  });

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const response = await api.home.getData();
        if (response?.data?.success) {
          setHomeData(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch home data:', err);
        setError('Failed to load home data');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return <HomeSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-lg transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <HeroHome stats={homeData.stats} />
      <FeaturedHorsesHome 
        horses={homeData.featured.horses} 
        breeds={homeData.categories.breeds} 
      />
      <RecentHorses horses={homeData.recent.horses} />
      <WhyUs stats={homeData.stats} />
      <CTASection />
    </div>
  );
};

export default Home;