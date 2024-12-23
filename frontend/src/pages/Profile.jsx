import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  Divider,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, isSeller } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: {
      state: '',
      city: '',
      pincode: ''
    },
    preferences: {
      breeds: [],
      priceRange: {
        min: 0,
        max: 0
      },
      purposes: []
    }
  });

  const [sellerProfile, setSellerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Available options
  const breedOptions = ['Thoroughbred', 'Arabian', 'Mustang', 'Quarter Horse'];
  const purposeOptions = ['Racing', 'Show Jumping', 'Dressage', 'Trail Riding'];

  useEffect(() => {
    fetchProfile();
  }, [isSeller]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      if (isSeller) {
        // If user is a seller, fetch seller profile from /sellers/me
        const sellerResponse = await api.sellers.getProfile();
        if (sellerResponse.data?.seller) {
          setSellerProfile(sellerResponse.data.seller);
          // Set basic profile info from seller data
          setProfile({
            name: user?.name || '',
            email: sellerResponse.data.seller.contactDetails.email,
            phone: sellerResponse.data.seller.contactDetails.phone,
            location: sellerResponse.data.seller.location,
            preferences: {
              breeds: [],
              priceRange: { min: 0, max: 0 },
              purposes: []
            }
          });
        }
      } else {
        // If regular user, fetch user profile
        const userResponse = await api.users.getProfile();
        if (userResponse.data?.user) {
          setProfile(userResponse.data.user);
        }
      }
    } catch (error) {
      setError('Failed to load profile');
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isSeller) {
        // If seller, update through seller profile endpoint
        const response = await api.sellers.updateProfile({
          contactDetails: {
            ...sellerProfile.contactDetails,
            phone: profile.phone
          },
          location: profile.location
        });
        if (response.data?.seller) {
          setSellerProfile(response.data.seller);
          setProfile(prev => ({
            ...prev,
            phone: response.data.seller.contactDetails.phone,
            location: response.data.seller.location
          }));
          setSuccess('Profile updated successfully!');
        }
      } else {
        // If regular user, update through user profile endpoint
        const response = await api.users.updateProfile(profile);
        if (response.data?.user) {
          setProfile(response.data.user);
          setSuccess('Profile updated successfully!');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleSellerProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.sellers.updateProfile(sellerProfile);
      if (response.data?.seller) {
        setSellerProfile(response.data.seller);
        // Update basic profile info as well
        setProfile(prev => ({
          ...prev,
          phone: response.data.seller.contactDetails.phone,
          location: response.data.seller.location
        }));
        setSuccess('Seller profile updated successfully!');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update seller profile');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* User Profile Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom color="primary">
          {isSeller ? 'Basic Profile' : 'User Profile'}
        </Typography>
        <form onSubmit={handleUserProfileUpdate}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                disabled={isSeller} // Name should be updated through seller profile for sellers
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={profile.email}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Location</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={profile.location.state}
                onChange={(e) => setProfile({
                  ...profile,
                  location: { ...profile.location, state: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={profile.location.city}
                onChange={(e) => setProfile({
                  ...profile,
                  location: { ...profile.location, city: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Pincode"
                value={profile.location.pincode}
                onChange={(e) => setProfile({
                  ...profile,
                  location: { ...profile.location, pincode: e.target.value }
                })}
              />
            </Grid>

            {/* Preferences - Only show for regular users */}
            {!isSeller && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Preferences</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Preferred Breeds</InputLabel>
                    <Select
                      multiple
                      value={profile.preferences.breeds}
                      onChange={(e) => setProfile({
                        ...profile,
                        preferences: { ...profile.preferences, breeds: e.target.value }
                      })}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {breedOptions.map((breed) => (
                        <MenuItem key={breed} value={breed}>
                          {breed}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Preferred Purposes</InputLabel>
                    <Select
                      multiple
                      value={profile.preferences.purposes}
                      onChange={(e) => setProfile({
                        ...profile,
                        preferences: { ...profile.preferences, purposes: e.target.value }
                      })}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      {purposeOptions.map((purpose) => (
                        <MenuItem key={purpose} value={purpose}>
                          {purpose}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Update Profile
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Seller Profile Section */}
      {isSeller && sellerProfile && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom color="primary">
            Business Profile
          </Typography>
          <form onSubmit={handleSellerProfileUpdate}>
            <Grid container spacing={3}>
              {/* Business Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Business Information</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Business Name"
                  value={sellerProfile.businessName}
                  onChange={(e) => setSellerProfile({
                    ...sellerProfile,
                    businessName: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Description"
                  value={sellerProfile.description}
                  onChange={(e) => setSellerProfile({
                    ...sellerProfile,
                    description: e.target.value
                  })}
                  multiline
                  rows={2}
                />
              </Grid>

              {/* Contact Details */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Contact Details</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={sellerProfile.contactDetails.phone}
                  onChange={(e) => setSellerProfile({
                    ...sellerProfile,
                    contactDetails: { ...sellerProfile.contactDetails, phone: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Email"
                  value={sellerProfile.contactDetails.email}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="WhatsApp"
                  value={sellerProfile.contactDetails.whatsapp}
                  onChange={(e) => setSellerProfile({
                    ...sellerProfile,
                    contactDetails: { ...sellerProfile.contactDetails, whatsapp: e.target.value }
                  })}
                />
              </Grid>

              {/* Location */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Business Location</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={sellerProfile.location.state}
                  onChange={(e) => setSellerProfile({
                    ...sellerProfile,
                    location: { ...sellerProfile.location, state: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={sellerProfile.location.city}
                  onChange={(e) => setSellerProfile({
                    ...sellerProfile,
                    location: { ...sellerProfile.location, city: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Pincode"
                  value={sellerProfile.location.pincode}
                  onChange={(e) => setSellerProfile({
                    ...sellerProfile,
                    location: { ...sellerProfile.location, pincode: e.target.value }
                  })}
                />
              </Grid>

              {/* Business Documents */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Business Documents</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GST Number"
                  value={sellerProfile.businessDocuments.gst}
                  onChange={(e) => setSellerProfile({
                    ...sellerProfile,
                    businessDocuments: { ...sellerProfile.businessDocuments, gst: e.target.value }
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PAN Number"
                  value={sellerProfile.businessDocuments.pan}
                  onChange={(e) => setSellerProfile({
                    ...sellerProfile,
                    businessDocuments: { ...sellerProfile.businessDocuments, pan: e.target.value }
                  })}
                />
              </Grid>

              {/* Subscription Info */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Subscription</Typography>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">Plan</Typography>
                      <Typography variant="body1">{sellerProfile.subscription.plan}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip
                        label={sellerProfile.subscription.status}
                        color={sellerProfile.subscription.status === 'active' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">Start Date</Typography>
                      <Typography variant="body1">
                        {new Date(sellerProfile.subscription.startDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">Expires At</Typography>
                      <Typography variant="body1">
                        {new Date(sellerProfile.subscription.expiresAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Statistics */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Statistics</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">Total Listings</Typography>
                    <Typography variant="h6">{sellerProfile.statistics.totalListings}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">Active Listings</Typography>
                    <Typography variant="h6">{sellerProfile.statistics.activeListings}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">Total Sales</Typography>
                    <Typography variant="h6">{sellerProfile.statistics.totalSales}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">Rating</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={sellerProfile.rating.average} precision={0.5} readOnly />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({sellerProfile.rating.count})
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Update Business Profile
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}
    </Container>
  );
};

export default Profile; 