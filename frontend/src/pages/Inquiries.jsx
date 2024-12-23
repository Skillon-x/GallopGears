import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import api from '../services/api';

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newInquiry, setNewInquiry] = useState({
    horse: '',
    message: '',
    contactPreference: 'email'
  });

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await api.inquiries.getList();
      if (response.data?.inquiries) {
        setInquiries(response.data.inquiries);
      }
    } catch (error) {
      setError('Failed to load inquiries');
      console.error('Error loading inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInquiry = async (e) => {
    e.preventDefault();
    try {
      const response = await api.inquiries.create(newInquiry);
      if (response.data?.inquiry) {
        setInquiries(prev => [response.data.inquiry, ...prev]);
        setDialogOpen(false);
        setNewInquiry({
          horse: '',
          message: '',
          contactPreference: 'email'
        });
      }
    } catch (error) {
      setError('Failed to create inquiry');
      console.error('Error creating inquiry:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'responded':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleInquiryClick = async (inquiry) => {
    try {
      const response = await api.inquiries.getDetails(inquiry._id);
      if (response.data?.inquiry) {
        setSelectedInquiry(response.data.inquiry);
      }
    } catch (error) {
      console.error('Error loading inquiry details:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading inquiries...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" color="secondary">
          Horse Inquiries
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setDialogOpen(true)}
        >
          New Inquiry
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={4}>
        {/* Inquiries List */}
        <Grid item xs={12} md={selectedInquiry ? 7 : 12}>
          <Paper sx={{ p: 3 }}>
            <List>
              {inquiries.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                  No inquiries yet
                </Typography>
              ) : (
                inquiries.map((inquiry) => (
                  <ListItem
                    key={inquiry._id}
                    sx={{
                      mb: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => handleInquiryClick(inquiry)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1">
                            {inquiry.horse?.name || 'Horse Name'}
                          </Typography>
                          <Chip
                            size="small"
                            label={inquiry.status}
                            color={getStatusColor(inquiry.status)}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {inquiry.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                            Created: {new Date(inquiry.createdAt).toLocaleDateString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        {/* Inquiry Details */}
        {selectedInquiry && (
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
              <Typography variant="h6" gutterBottom>
                Inquiry Details
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Horse
                </Typography>
                <Typography variant="body1">
                  {selectedInquiry.horse?.name || 'Horse Name'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={selectedInquiry.status}
                  color={getStatusColor(selectedInquiry.status)}
                  size="small"
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Message
                </Typography>
                <Typography variant="body1">
                  {selectedInquiry.message}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Contact Preference
                </Typography>
                <Typography variant="body1">
                  {selectedInquiry.contactPreference}
                </Typography>
              </Box>
              {selectedInquiry.response && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Seller Response
                  </Typography>
                  <Typography variant="body1">
                    {selectedInquiry.response}
                  </Typography>
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" display="block">
                Created: {new Date(selectedInquiry.createdAt).toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* New Inquiry Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Inquiry</DialogTitle>
        <form onSubmit={handleCreateInquiry}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Horse ID"
                  value={newInquiry.horse}
                  onChange={(e) => setNewInquiry(prev => ({ ...prev, horse: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Message"
                  value={newInquiry.message}
                  onChange={(e) => setNewInquiry(prev => ({ ...prev, message: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Contact Preference</InputLabel>
                  <Select
                    value={newInquiry.contactPreference}
                    onChange={(e) => setNewInquiry(prev => ({ ...prev, contactPreference: e.target.value }))}
                    label="Contact Preference"
                    required
                  >
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="phone">Phone</MenuItem>
                    <MenuItem value="whatsapp">WhatsApp</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Submit Inquiry
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Inquiries; 