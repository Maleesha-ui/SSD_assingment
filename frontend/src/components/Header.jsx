import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  useTheme, 
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  padding: theme.spacing(0, 2),
  transition: 'all 0.3s ease'
}));

const NavLink = styled(Link)(({ theme, active }) => ({
  color: active ? '#8b7355' : '#2c3e50',
  textDecoration: 'none',
  fontWeight: active ? 600 : 400,
  fontSize: '1rem',
  padding: theme.spacing(1, 2),
  borderRadius: 8,
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    color: '#8b7355',
    backgroundColor: 'rgba(139, 115, 85, 0.08)'
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: active ? '60%' : '0',
    height: '2px',
    backgroundColor: '#8b7355',
    transform: 'translateX(-50%)',
    transition: 'width 0.3s ease'
  }
}));

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/packages', label: 'Packages' },
    { to: '/about-us', label: 'About Us' },
    { to: '/funeral-procedures', label: 'Funeral Procedures' },
    { to: '/contact-us', label: 'Contact Us' }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, mb: 2 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontFamily: '"Playfair Display", serif',
            fontWeight: 600,
            color: '#2c3e50'
          }}
        >
          Eternal Rest
        </Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ color: '#2c3e50' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ pt: 2 }}>
        {navLinks.map((link) => (
          <ListItem 
            button 
            key={link.to}
            component={Link}
            to={link.to}
            onClick={handleDrawerToggle}
            sx={{
              mx: 2,
              my: 1,
              borderRadius: 2,
              backgroundColor: location.pathname === link.to ? 'rgba(139, 115, 85, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(139, 115, 85, 0.08)'
              }
            }}
          >
            <ListItemText 
              primary={link.label}
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: location.pathname === link.to ? 600 : 400,
                  color: location.pathname === link.to ? '#8b7355' : '#2c3e50'
                }
              }}
            />
          </ListItem>
        ))}
        <Divider sx={{ my: 2 }} />
        <ListItem 
          button 
          component={Link}
          to="/login"
          onClick={handleDrawerToggle}
          sx={{
            mx: 2,
            my: 1,
            borderRadius: 2,
            backgroundColor: 'rgba(44, 62, 80, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(44, 62, 80, 0.12)'
            }
          }}
        >
          <ListItemText 
            primary="Account"
            sx={{
              '& .MuiTypography-root': {
                fontWeight: 500,
                color: '#2c3e50'
              }
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <StyledAppBar position="sticky">
        <Toolbar sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto',
          padding: '0 !important',
          height: 80
        }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h4" 
              component={Link} 
              to="/" 
              sx={{ 
                fontFamily: '"Playfair Display", serif',
                textDecoration: 'none',
                color: '#2c3e50',
                fontWeight: 600,
                letterSpacing: 0.5,
                '&:hover': {
                  color: '#8b7355'
                }
              }}
            >
              Eternal Rest
            </Typography>
          </Box>

          {/* Navigation Links - Desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navLinks.map((link) => (
                <NavLink 
                  key={link.to} 
                  to={link.to}
                  active={location.pathname === link.to ? 1 : 0}
                >
                  {link.label}
                </NavLink>
              ))}
              
              <Button
                component={Link}
                to="/login"
                startIcon={<AccountCircle />}
                sx={{
                  color: '#2c3e50',
                  marginLeft: 2,
                  fontWeight: 500,
                  borderRadius: 8,
                  padding: '8px 20px',
                  border: '2px solid #2c3e50',
                  '&:hover': {
                    backgroundColor: '#2c3e50',
                    color: 'white',
                    borderColor: '#2c3e50'
                  }
                }}
              >
                Account
              </Button>
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                color: '#2c3e50',
                ml: 2
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </StyledAppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Header;