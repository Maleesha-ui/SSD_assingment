import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from '../Navbar';

const DashboardLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* <Navbar /> */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', py: 3 }}>
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout; 