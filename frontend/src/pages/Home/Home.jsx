import React, { useState, useEffect, Suspense } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBoundary from '../../components/common/ErrorBoundary';

// Lazy load components
const HeroHome = React.lazy(() => import('./HeroHome'));
const FeaturedHorsesHome = React.lazy(() => import('./FeaturedHorsesHome'));
const RecentHorses = React.lazy(() => import('./RecentHorses'));
const WhyUs = React.lazy(() => import('./WhyUs'));
const CTASection = React.lazy(() => import('./CTASection'));

// Loading skeleton component
const HomeSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-[600px] bg-gray-200 rounded-lg mb-8" /> {/* Hero skeleton */}
    <div className="max-w-7xl mx-auto px-4">
      <div className="h-8 bg-gray-200 w-48 mb-4" /> {/* Section title */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg" />
        ))}
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const response = await api.home.getData();

        if (response?.data?.success) {
          setHomeData(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch home data:', err);
        setError('Failed to load home data. Please try again later.');
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
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<HomeSkeleton />}>
        <div>
          <HeroHome stats={homeData.stats} />
          <FeaturedHorsesHome 
            horses={homeData.featured.horses} 
            breeds={homeData.featured.breeds} 
          />
          <RecentHorses horses={homeData.recent.horses} />
          <WhyUs stats={homeData.stats} />
          <CTASection />
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Home;