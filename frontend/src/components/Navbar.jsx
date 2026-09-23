import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Button, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#1B2A3D',
  boxShadow: '0 4px 20px rgba(27, 42, 61, 0.15)',
  borderBottom: '1px solid rgba(201, 169, 97, 0.25)',
  padding: theme.spacing(0.5, 2)
}));

const NavLink = styled(Link)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.85)',
  textDecoration: 'none',
  fontWeight: 400,
  fontSize: '0.95rem',
  padding: theme.spacing(1, 2),
  borderRadius: '50px',
  transition: 'all 0.25s ease',
  '&:hover': {
    color: '#ffffff',
    backgroundColor: 'rgba(201, 169, 97, 0.2)'
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
              color: '#ffffff',
              fontFamily: '"Playfair Display", serif',
              fontWeight: 600,
              letterSpacing: 1,
              '&:hover': {
                color: '#C9A961'
              }
            }}
          >
            Eternal Rest
          </Typography>
        </Box>

        {/* Navigation Links - Desktop */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/packages">Packages</NavLink>
            <NavLink to="/about-us">About Us</NavLink>
            <NavLink to="/funeral-procedures">Funeral Procedures</NavLink>
            <NavLink to="/contact-us">Contact Us</NavLink>
            
            <Button
              component={Link}
              to="/login"
              startIcon={<AccountCircle sx={{ color: '#C9A961' }} />}
              sx={{
                color: '#ffffff',
                marginLeft: 2,
                fontWeight: 500,
                borderRadius: '50px',
                border: '1px solid rgba(201, 169, 97, 0.4)',
                padding: '6px 18px',
                '&:hover': {
                  backgroundColor: 'rgba(201, 169, 97, 0.2)',
                  borderColor: '#C9A961'
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
              color: '#C9A961',
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