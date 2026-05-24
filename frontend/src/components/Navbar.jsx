import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Button, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#424242',
  boxShadow: 'none',
  borderBottom: '1px solid #616161',
  padding: theme.spacing(0, 2)
}));

const NavLink = styled(Link)(({ theme }) => ({
  color: '#e0e0e0',
  textDecoration: 'none',
  fontWeight: 300,
  fontSize: '1rem',
  padding: theme.spacing(1, 2),
  transition: 'all 0.3s ease',
  '&:hover': {
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  }
}));

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <StyledAppBar position="static">
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        padding: '0 !important'
      }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h4" 
            component={Link} 
            to="/" 
            sx={{ 
              textDecoration: 'none',
              color: 'white',
              fontWeight: 300,
              letterSpacing: 1,
              '&:hover': {
                color: '#e0e0e0'
              }
            }}
          >
            Eternal Rest
          </Typography>
        </Box>

        {/* Navigation Links - Desktop */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/packages">Packages</NavLink>
            
            <NavLink to="/about-us">About Us</NavLink>
            <NavLink to="/funeral-procedures">Funeral Procedures</NavLink>
            <NavLink to="/contact-us">Contact Us</NavLink>
            
            <Button
              component={Link}
              to="/login"
              startIcon={<AccountCircle />}
              sx={{
                color: '#e0e0e0',
                marginLeft: 2,
                fontWeight: 300,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Account
            </Button>
          </Box>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <Button
            color="inherit"
            aria-label="menu"
            sx={{ 
              color: '#e0e0e0',
              minWidth: 'auto',
              padding: '8px'
            }}
          >
            <MenuIcon />
          </Button>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;