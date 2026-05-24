import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';

const StatsCard = ({ title, value, icon }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        },
        cursor: 'pointer'
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {React.cloneElement(icon, { 
            sx: { 
              fontSize: 40, 
              color: theme.palette.primary.main,
              mr: 2
            }
          })}
          <Typography variant="h6" color="textSecondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatsCard; 