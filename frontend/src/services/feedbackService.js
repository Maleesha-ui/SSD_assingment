// src/services/feedbackService.js
import api from './api';

export const submitFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/feedback', feedbackData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to submit feedback';
  }
};

export const getUserFeedback = async () => {
  try {
    const response = await api.get('/feedback/user');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch feedback';
  }
};

// Admin functions
export const getAllFeedback = async () => {
  try {
    const response = await api.get('/feedback');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch feedback';
  }
};

export const updateFeedbackStatus = async (id, status) => {
  try {
    const response = await api.put(`/feedback/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update feedback status';
  }
};