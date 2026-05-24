import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Button, 
  Tab, 
  Tabs,
  useTheme,
  TextField,
  Grid,
  Divider
} from '@mui/material';
import { 
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as AddressIcon,
  History as HistoryIcon,
  Feedback as FeedbackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import FeedbackForm from './FeedbackForm';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';


const ProfilePage = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [feedbackHistory, setFeedbackHistory] = useState([]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      
      // Fetch feedback history
      fetchFeedbackHistory();
    }
  }, [user]);

  const fetchFeedbackHistory = async () => {
    try {
      const response = await api.get('/feedback/my-feedback'); // Changed endpoint
      setFeedbackHistory(response.data);
    } catch (error) {
      console.error('Error fetching feedback history:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await api.put('/users/update-profile', profileData); 
      if(response.status == 200){
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Profile Updated successfully',
          timer: 2000,
          showConfirmButton: false
        });
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      const response = await api.post('/feedback/submit-feedback', feedbackData);
      if(response.status == 201){
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Feedback added successfully',
          timer: 2000,
          showConfirmButton: false
        });
      }
      fetchFeedbackHistory(); 
      console.log('Feedback submitted successfully:', response.data);
    } catch (error) {
      console.error('Error submitting feedback:', error);

    }
  };

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will permanently delete your account. This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete my account!'
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete('/users/delete-account');
        
        if (response.status === 200) {
          Swal.fire(
            'Deleted!',
            'Your account has been deleted successfully.',
            'success'
          );
          logout();
          navigate('/');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        Swal.fire(
          'Error!',
          'There was an error deleting your account. Please try again.',
          'error'
        );
      }
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      bgcolor: theme.palette.grey[100],
      p: 4,
      overflow: 'auto'
    }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: theme.palette.primary.main }}>
        My Profile
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ 
                width: 120, 
                height: 120, 
                bgcolor: theme.palette.primary.main,
                fontSize: 48,
                mb: 2
              }}>
                {user?.name?.charAt(0).toUpperCase() || <PersonIcon fontSize="large" />}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.role || 'Customer'}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmailIcon color="primary" sx={{ mr: 2 }} />
              <Typography>{user?.email || 'No email provided'}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhoneIcon color="primary" sx={{ mr: 2 }} />
              <Typography>{user?.phone || 'No phone provided'}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AddressIcon color="primary" sx={{ mr: 2 }} />
              <Typography>{user?.address || 'No address provided'}</Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ mb: 3 }}
            >
              <Tab label="Personal Information" icon={<PersonIcon />} />
              <Tab label="Feedback" icon={<FeedbackIcon />} />
              <Tab label="Activity History" icon={<HistoryIcon />} />
            </Tabs>
            
            {activeTab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Personal Information
                  </Typography>
                  {isEditing ? (
                    <Button 
                      variant="contained" 
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                    >
                      Save Changes
                    </Button>
                  ) : (
                    <Button 
                      variant="outlined" 
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={profileData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      sx={{ mb: 2 }}
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {activeTab === 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button 
                  variant="contained" 
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteAccount}
                  sx={{ mt: 2 }}
                >
                  Delete Account
                </Button>
              </Box>
            )}
            
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Provide Feedback
                </Typography>
                <FeedbackForm onSubmit={handleFeedbackSubmit} />
                
                {feedbackHistory.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Your Feedback History
                    </Typography>
                    {feedbackHistory.map((feedback, index) => (
                      <Paper key={index} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {feedback.serviceType || 'General Feedback'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Submitted on: {new Date(feedback.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography>{feedback.message}</Typography>
                        {feedback.rating && (
                          <Typography sx={{ mt: 1 }}>
                            Rating: {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Box>
                )}
              </Box>
            )}
            
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Your Activity History
                </Typography>
                <Typography>Order history and other activities will appear here.</Typography>
                {/* You can implement order history listing here */}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;