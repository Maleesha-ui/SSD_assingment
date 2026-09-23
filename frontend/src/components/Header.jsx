import React, { useState, useEffect } from 'react';
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

const StyledAppBar = styled(AppBar)(({ theme, scrolled }) => ({
  backgroundColor: scrolled ? 'rgba(27, 42, 61, 0.97)' : 'rgba(255, 255, 255, 0.97)',
  backdropFilter: 'blur(12px)',
  boxShadow: scrolled ? '0 4px 20px rgba(27, 42, 61, 0.15)' : '0 2px 12px rgba(27, 42, 61, 0.06)',
  borderBottom: scrolled ? 'none' : '1px solid rgba(27, 42, 61, 0.06)',
  padding: theme.spacing(0, 2),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
}));

const NavLink = styled(Link)(({ theme, active, scrolled }) => ({
  color: scrolled 
    ? (active ? '#C9A961' : 'rgba(255, 255, 255, 0.9)') 
    : (active ? '#C9A961' : '#1B2A3D'),
  textDecoration: 'none',
  fontWeight: active ? 600 : 500,
  fontSize: '0.95rem',
  padding: theme.spacing(1, 2),
  borderRadius: 8,
  transition: 'all 0.3s ease',
  position: 'relative',
  letterSpacing: '0.3px',
  '&:hover': {
    color: '#C9A961',
    backgroundColor: scrolled ? 'rgba(201, 169, 97, 0.1)' : 'rgba(201, 169, 97, 0.08)'
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: active ? '60%' : '0',
    height: '2px',
    backgroundColor: '#C9A961',
    transform: 'translateX(-50%)',
    transition: 'width 0.3s ease'
  }
}));

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/packages', label: 'Packages' },
    { to: '/about-us', label: 'About Us' },
    { to: '/funeral-procedures', label: 'Procedures' },
    { to: '/contact-us', label: 'Contact' }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ width: 300, pt: 2, height: '100%', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F6F3 100%)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, mb: 2 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontFamily: '"Playfair Display", serif',
            fontWeight: 600,
            color: '#1B2A3D'
          }}
        >
          Eternal Rest
        </Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ color: '#1B2A3D' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: '#E8E4DF' }} />
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
              my: 0.5,
              borderRadius: 2,
              backgroundColor: location.pathname === link.to ? 'rgba(201, 169, 97, 0.1)' : 'transparent',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(201, 169, 97, 0.08)'
              }
            }}
          >
            <ListItemText 
              primary={link.label}
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: location.pathname === link.to ? 600 : 400,
                  color: location.pathname === link.to ? '#C9A961' : '#1B2A3D',
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '1.05rem'
                }
              }}
            />
          </ListItem>
        ))}
        <Divider sx={{ my: 2, borderColor: '#E8E4DF' }} />
        <ListItem 
          button 
          component={Link}
          to="/login"
          onClick={handleDrawerToggle}
          sx={{
            mx: 2,
            my: 1,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1B2A3D 0%, #243648 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #243648 0%, #1B2A3D 100%)',
            }
          }}
        >
          <ListItemText 
            primary="Account"
            sx={{
              '& .MuiTypography-root': {
                fontWeight: 500,
                color: '#FFFFFF',
                textAlign: 'center'
              }
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <StyledAppBar position="sticky" scrolled={scrolled ? 1 : 0}>
        <Toolbar sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto',
          padding: '0 !important',
          height: 72
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
                color: scrolled ? '#FFFFFF' : '#1B2A3D',
                fontWeight: 700,
                letterSpacing: 0.5,
                fontSize: { xs: '1.4rem', md: '1.6rem' },
                transition: 'all 0.3s ease',
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {navLinks.map((link) => (
                <NavLink 
                  key={link.to} 
                  to={link.to}
                  active={location.pathname === link.to ? 1 : 0}
                  scrolled={scrolled ? 1 : 0}
                >
                  {link.label}
                </NavLink>
              ))}
              
              <Button
                component={Link}
                to="/login"
                startIcon={<AccountCircle />}
                sx={{
                  color: scrolled ? '#FFFFFF' : '#1B2A3D',
                  marginLeft: 2,
                  fontWeight: 500,
                  borderRadius: '50px',
                  padding: '8px 24px',
                  border: `2px solid ${scrolled ? 'rgba(201, 169, 97, 0.6)' : '#1B2A3D'}`,
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#C9A961',
                    color: 'white',
                    borderColor: '#C9A961',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 15px rgba(201, 169, 97, 0.3)'
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
                color: scrolled ? '#FFFFFF' : '#1B2A3D',
                ml: 2,
                '&:hover': {
                  color: '#C9A961'
                }
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
            width: 300,
            backgroundColor: '#FFFFFF',
            borderLeft: '1px solid #E8E4DF'
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Header;