import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '../services/api';
import HorseDetailsModal from '../components/HorseDetailsModal';
import HorseCard from '../components/HorseCard';

// Mock data for development (same as Home.jsx)
const mockHorses = [
  {
    _id: '1',
    name: 'Thunder',
    breed: 'Thoroughbred',
    price: 250000,
    images: [{
      url: 'https://images.unsplash.com/photo-1534773728080-33d31da27ae5',
      public_id: 'horse-1'
    }],
    description: 'A majestic Thoroughbred with exceptional racing heritage.',
    age: { years: 5, months: 3 },
    location: { city: 'Mumbai', state: 'Maharashtra' },
    specifications: {
      training: 'Advanced',
      discipline: ['Racing', 'Show Jumping'],
      temperament: 'Spirited',
      healthStatus: 'Excellent',
      vaccination: true,
      papers: true
    }
  },
  {
    _id: '2',
    name: 'Storm',
    breed: 'Arabian',
    price: 350000,
    images: [{
      url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a',
      public_id: 'horse-2'
    }],
    description: 'A beautiful Arabian horse with excellent bloodline.',
    age: { years: 4, months: 8 },
    location: { city: 'Pune', state: 'Maharashtra' },
    specifications: {
      training: 'Intermediate',
      discipline: ['Dressage', 'Show'],
      temperament: 'Gentle',
      healthStatus: 'Excellent',
      vaccination: true,
      papers: true
    }
  },
  {
    _id: '3',
    name: 'Spirit',
    breed: 'Mustang',
    price: 180000,
    images: [{
      url: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3',
      public_id: 'horse-3'
    }],
    description: 'A strong and resilient Mustang with a free spirit.',
    age: { years: 6, months: 2 },
    location: { city: 'Nashik', state: 'Maharashtra' },
    specifications: {
      training: 'Basic',
      discipline: ['Trail Riding'],
      temperament: 'Wild',
      healthStatus: 'Good',
      vaccination: true,
      papers: false
    }
  },
];

// Add debug logging
const DEBUG = true;

const debugLog = (message, data = null) => {
  if (DEBUG) {
    console.log(`[Browse Debug] ${message}`, data || '');
  }
};

const Browse = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [horses, setHorses] = useState(mockHorses);
  const [filteredHorses, setFilteredHorses] = useState(mockHorses);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    breed: queryParams.get('breed') || '',
    minPrice: '',
    maxPrice: '',
    location: '',
    training: '',
    discipline: '',
  });
  const [searchQuery, setSearchQuery] = useState(queryParams.get('q') || '');

  // Separate useEffect for initial load
  useEffect(() => {
    const fetchInitialHorses = async () => {
      debugLog('Fetching initial horses');
      try {
        const response = await api.horses.search({});
        debugLog('API Response:', response);
        if (response.data?.horses) {
          debugLog('Setting horses from API:', response.data.horses);
          setHorses(response.data.horses);
          setFilteredHorses(response.data.horses);
        }
      } catch (error) {
        console.error('Error fetching initial horses:', error);
        debugLog('Using mock data due to API error');
        setHorses(mockHorses);
        setFilteredHorses(mockHorses);
      }
    };

    fetchInitialHorses();
  }, []); // Only run on mount

  // Debounced effect for filter changes
  useEffect(() => {
    debugLog('Filter or search changed:', { filters, searchQuery });
    const debouncedSearch = setTimeout(async () => {
      try {
        // Only make API call if we have active filters
        if (Object.values(filters).some(value => value !== '')) {
          debugLog('Making API call with filters:', filters);
          const response = await api.horses.search(filters);
          debugLog('Filter API Response:', response);
          if (response.data?.horses) {
            setHorses(response.data.horses);
            setFilteredHorses(response.data.horses);
          }
        } else {
          debugLog('Applying local filtering');
          // If no filters, apply local filtering on the existing horses
          let filtered = horses;

          if (searchQuery) {
            filtered = filtered.filter(horse => 
              horse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              horse.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
              horse.location?.city.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }

          debugLog('Filtered results:', filtered);
          setFilteredHorses(filtered);
        }
      } catch (error) {
        console.error('Error applying filters:', error);
        debugLog('Error during filtering:', error);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(debouncedSearch);
  }, [filters, searchQuery, horses]);

  const handleSearch = (e) => {
    e.preventDefault();
    debugLog('Search submitted:', searchQuery);
    // Update URL with search params
    const params = new URLSearchParams(filters);
    if (searchQuery) params.set('q', searchQuery);
    navigate({ search: params.toString() });
  };

  const handleFilterChange = (name, value) => {
    debugLog('Filter changed:', { name, value });
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    debugLog('Clearing all filters');
    setFilters({
      breed: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      training: '',
      discipline: '',
    });
    setSearchQuery('');
    navigate({ search: '' });
  };

  const handleFavorite = async (horseId) => {
    debugLog('Adding to favorites:', horseId);
    try {
      await api.horses.addToFavorites(horseId);
      debugLog('Successfully added to favorites');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      debugLog('Error adding to favorites:', error);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Search and Filters */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom color="secondary">
            Browse Horses
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <form onSubmit={handleSearch}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search horses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </form>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Breed</InputLabel>
                <Select
                  value={filters.breed}
                  onChange={(e) => handleFilterChange('breed', e.target.value)}
                  label="Breed"
                >
                  <MenuItem value="">All Breeds</MenuItem>
                  <MenuItem value="Thoroughbred">Thoroughbred</MenuItem>
                  <MenuItem value="Arabian">Arabian</MenuItem>
                  <MenuItem value="Mustang">Mustang</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Training Level</InputLabel>
                <Select
                  value={filters.training}
                  onChange={(e) => handleFilterChange('training', e.target.value)}
                  label="Training Level"
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="Basic">Basic</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Discipline</InputLabel>
                <Select
                  value={filters.discipline}
                  onChange={(e) => handleFilterChange('discipline', e.target.value)}
                  label="Discipline"
                >
                  <MenuItem value="">All Disciplines</MenuItem>
                  <MenuItem value="Racing">Racing</MenuItem>
                  <MenuItem value="Show Jumping">Show Jumping</MenuItem>
                  <MenuItem value="Dressage">Dressage</MenuItem>
                  <MenuItem value="Trail Riding">Trail Riding</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearFilters}
                sx={{ height: '100%' }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Results */}
        <Box>
          <Typography variant="h6" gutterBottom color="text.secondary">
            {filteredHorses.length} horses found
          </Typography>
          <Grid container spacing={4}>
            {filteredHorses.map((horse) => (
              <Grid item xs={12} sm={6} md={4} key={horse._id}>
                <HorseCard
                  horse={horse}
                  onClick={() => {
                    setSelectedHorse(horse);
                    setModalOpen(true);
                  }}
                  onFavorite={handleFavorite}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Horse Details Modal */}
      <HorseDetailsModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedHorse(null);
        }}
        horse={selectedHorse}
      />
    </Box>
  );
};

export default Browse; 