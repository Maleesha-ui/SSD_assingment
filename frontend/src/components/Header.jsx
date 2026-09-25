import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Divider,
  Avatar,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';

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
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = (user && token)
    ? [
        { to: '/', label: 'Home' },
        { to: '/packages', label: 'Packages' },
        { to: '/about-us', label: 'About Us' },
        { to: '/funeral-procedures', label: 'Procedures' },
        { to: '/contact-us', label: 'Contact' }
      ]
    : [
        { to: '/', label: 'Home' }
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
        {user && token ? (
          <Box sx={{ px: 2 }}>
            <Box 
              component={Link}
              to={user?.role === 'admin' ? '/admin' : '/dashboard'}
              onClick={handleDrawerToggle}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                p: 1.5, 
                mb: 1.5, 
                backgroundColor: 'rgba(201, 169, 97, 0.1)', 
                borderRadius: 2,
                textDecoration: 'none',
              }}
            >
              <Avatar
                src={user?.avatar || ''}
                alt={user?.name || 'User'}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: '2px solid #C9A961',
                  backgroundColor: '#1B2A3D',
                  color: '#C9A961',
                  fontWeight: 600,
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1B2A3D', noWrap: true }}>
                  {user?.name || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#5A6C7D', textTransform: 'capitalize' }}>
                  {user?.role || 'Customer'} • Dashboard
                </Typography>
              </Box>
            </Box>

            <ListItem
              button
              onClick={() => {
                handleDrawerToggle();
                handleLogout();
              }}
              sx={{
                borderRadius: 2,
                backgroundColor: '#C53030',
                border: '1px solid #C53030',
                color: '#FFFFFF',
                '&:hover': {
                  backgroundColor: '#A82828',
                  borderColor: '#A82828',
                  color: '#FFFFFF',
                },
              }}
            >
              <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
              <ListItemText
                primary="Logout"
                sx={{ '& .MuiTypography-root': { fontWeight: 600 } }}
              />
            </ListItem>
          </Box>
        ) : (
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
        )}
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
              
              {user && token ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 2 }}>
                  <Tooltip title={`${user?.name || 'User'} (${user?.role || 'Customer'}) - Dashboard`}>
                    <Avatar
                      src={user?.avatar || ''}
                      alt={user?.name || 'User Avatar'}
                      component={Link}
                      to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        border: '2px solid #C9A961',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(201, 169, 97, 0.35)',
                        backgroundColor: '#1B2A3D',
                        color: '#C9A961',
                        fontWeight: 600,
                        fontSize: '1rem',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.08)',
                          boxShadow: '0 4px 14px rgba(201, 169, 97, 0.5)',
                        },
                      }}
                    >
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                  </Tooltip>

                  <Button
                    onClick={handleLogout}
                    startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      color: '#FFFFFF',
                      backgroundColor: '#C53030',
                      fontWeight: 600,
                      borderRadius: '50px',
                      padding: '7px 20px',
                      border: '1.5px solid #C53030',
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(197, 48, 48, 0.25)',
                      '&:hover': {
                        backgroundColor: '#A82828',
                        color: '#FFFFFF',
                        borderColor: '#A82828',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 14px rgba(197, 48, 48, 0.4)',
                      },
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  startIcon={<AccountCircle />}
                  sx={{
                    color: '#FFFFFF',
                    backgroundColor: '#C9A961',
                    marginLeft: 2,
                    fontWeight: 600,
                    borderRadius: '50px',
                    padding: '8px 24px',
                    border: '2px solid #C9A961',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(201, 169, 97, 0.25)',
                    '&:hover': {
                      backgroundColor: '#B5954D',
                      color: 'white',
                      borderColor: '#B5954D',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 15px rgba(201, 169, 97, 0.45)'
                    }
                  }}
                >
                  Account
                </Button>
              )}
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