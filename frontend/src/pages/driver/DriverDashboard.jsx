import React from 'react';
import { Box, Grid, Paper, Typography, useTheme, Button } from '@mui/material';
import {
  LocalShipping as DeliveryIcon,
  Assignment as OrderIcon,
  Timeline as RouteIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, 
          ${theme.palette.primary.dark} 0%, 
          ${theme.palette.primary.main} 100%)`,
      }}
    >
     
      <Box 
        sx={{ 
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DeliveryIcon sx={{ fontSize: 40, color: 'white' }} />
          <Box>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              Driver Dashboard
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Welcome, {user?.name}!
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            bgcolor: 'white',
            color: theme.palette.primary.main,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
            },
            py: 1.5,
            px: 3,
            borderRadius: 2,
            fontWeight: 'bold'
          }}
        >
          Logout
        </Button>
      </Box>

   
      <Box 
        sx={{ 
          flex: 1,
          overflow: 'auto',
          p: 4,
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 4,
                height: '100%',
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }
              }}
            >
              <DeliveryIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Current Deliveries
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Manage your active delivery assignments and track progress
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 4,
                height: '100%',
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }
              }}
            >
              <RouteIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Route Planning
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                View and optimize your delivery routes for maximum efficiency
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 4,
                height: '100%',
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }
              }}
            >
              <ProfileIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Profile
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                View and update your profile information and settings
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DriverDashboard; 