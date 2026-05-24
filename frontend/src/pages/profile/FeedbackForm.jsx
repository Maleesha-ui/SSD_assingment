// src/pages/profile/FeedbackForm.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

const serviceTypes = [
  'Funeral Arrangement',
  'Transportation',
  'Floral Services',
  'Catering',
  'General Feedback'
];

const FeedbackForm = ({ onSubmit }) => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState({
    serviceType: '',
    message: '',
    rating: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      serviceType: feedback.serviceType,
      message: feedback.message,
      rating: feedback.rating || undefined // Send undefined if no rating
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Service Type</InputLabel>
        <Select
          name="serviceType"
          value={feedback.serviceType}
          onChange={handleChange}
          label="Service Type"
          required
        >
          {serviceTypes.map((type) => (
            <MenuItem key={type} value={type}>{type}</MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <TextField
        fullWidth
        label="Your Feedback"
        name="message"
        value={feedback.message}
        onChange={handleChange}
        multiline
        rows={4}
        required
        sx={{ mb: 3 }}
      />
      
      <Box sx={{ mb: 3 }}>
        <Typography component="legend" sx={{ mb: 1 }}>
          Rating (optional)
        </Typography>
        <Rating
          name="rating"
          value={Number(feedback.rating)}
          onChange={(event, newValue) => {
            setFeedback(prev => ({ ...prev, rating: newValue }));
          }}
        />
      </Box>
      
      <Button
        type="submit"
        variant="contained"
        startIcon={<SendIcon />}
        sx={{
          bgcolor: theme.palette.primary.main,
          '&:hover': {
            bgcolor: theme.palette.primary.dark
          }
        }}
      >
        Submit Feedback
      </Button>
    </Box>
  );
};

export default FeedbackForm;