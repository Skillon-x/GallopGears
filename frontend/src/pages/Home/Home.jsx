import React, { useState, useEffect } from 'react';
import api from '../../services/api';

// Components
import HeroHome from './HeroHome';
import FeaturedHorsesHome from './FeaturedHorsesHome';
import RecentHorses from './RecentHorses';
import FeaturedSellers from './FeaturedSellers';
import WhyUs from './WhyUs';
import BrowseCategories from './BrowseCategories';
import CTASection from './CTASection';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [homeData, setHomeData] = useState({
    featured: {
      horses: [],
      sellers: []
    },
    recent: {
      horses: []
    },
    categories: {
      breeds: []
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <HeroHome stats={homeData.stats} />
      <FeaturedHorsesHome 
        horses={homeData.featured.horses} 
        breeds={homeData.categories.breeds} 
      />
      <RecentHorses horses={homeData.recent.horses} />
      {/* <BrowseCategories breeds={homeData.categories.breeds} /> */}
      {/* <FeaturedSellers sellers={homeData.featured.sellers} /> */}
      <WhyUs stats={homeData.stats} />
      <CTASection />
    </div>
  );
};

export default Home;