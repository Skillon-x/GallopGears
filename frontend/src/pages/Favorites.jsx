import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Alert,
} from '@mui/material';
import api from '../services/api';
import HorseCard from '../components/HorseCard';
import HorseDetailsModal from '../components/HorseDetailsModal';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.users.getFavorites();
      if (response.data?.favorites) {
        setFavorites(response.data.favorites);
      }
    } catch (error) {
      setError('Failed to load favorites');
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (horseId) => {
    try {
      await api.horses.removeFromFavorites(horseId);
      // Remove from local state
      setFavorites(prev => prev.filter(horse => horse._id !== horseId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
      setError('Failed to remove from favorites');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading favorites...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom color="secondary">
        My Favorite Horses
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {favorites.length === 0 ? (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            You haven't added any horses to your favorites yet.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Browse horses and click the heart icon to add them to your favorites.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {favorites.map((horse) => (
            <Grid item xs={12} sm={6} md={4} key={horse._id}>
              <HorseCard
                horse={horse}
                onClick={() => {
                  setSelectedHorse(horse);
                  setModalOpen(true);
                }}
                onFavorite={() => handleRemoveFromFavorites(horse._id)}
                isFavorited={true}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <HorseDetailsModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedHorse(null);
        }}
        horse={selectedHorse}
      />
    </Container>
  );
};

export default Favorites; 