import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import api from '../services/api';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTickets();
    fetchFaqs();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.support.getTickets();
      if (response.data?.tickets) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const fetchFaqs = async () => {
    try {
      const response = await api.support.getFaqs();
      if (response.data?.faqs) {
        setFaqs(response.data.faqs);
      }
    } catch (error) {
      console.error('Error loading FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      const response = await api.support.createTicket(newTicket);
      if (response.data?.ticket) {
        setSuccess('Support ticket created successfully');
        setTickets(prev => [response.data.ticket, ...prev]);
        setNewTicket({
          subject: '',
          category: 'technical',
          priority: 'medium',
          description: ''
        });
      }
    } catch (error) {
      setError('Failed to create support ticket');
      console.error('Error creating ticket:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'primary';
      case 'in_progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading support...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* New Ticket Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom color="secondary">
              Create Support Ticket
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <form onSubmit={handleTicketSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                      label="Category"
                      required
                    >
                      <MenuItem value="technical">Technical</MenuItem>
                      <MenuItem value="account">Account</MenuItem>
                      <MenuItem value="billing">Billing</MenuItem>
                      <MenuItem value="general">General</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                      label="Priority"
                      required
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Submit Ticket
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Existing Tickets */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom color="secondary">
              Your Tickets
            </Typography>
            <List>
              {tickets.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                  No support tickets yet
                </Typography>
              ) : (
                tickets.map((ticket) => (
                  <ListItem
                    key={ticket._id}
                    sx={{
                      mb: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1">{ticket.subject}</Typography>
                          <Chip
                            size="small"
                            label={ticket.status}
                            color={getStatusColor(ticket.status)}
                          />
                          <Chip
                            size="small"
                            label={ticket.priority}
                            color={getPriorityColor(ticket.priority)}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {ticket.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                            Created: {new Date(ticket.createdAt).toLocaleDateString()}
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

        {/* FAQs */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom color="secondary">
              Frequently Asked Questions
            </Typography>
            {faqs.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                No FAQs available
              </Typography>
            ) : (
              faqs.map((faq) => (
                <Accordion key={faq._id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Support; 