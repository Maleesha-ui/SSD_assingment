import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2c3e50',
      light: '#34495e',
      dark: '#1a252f',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#8b7355',
      light: '#a0896b',
      dark: '#6b563f',
      contrastText: '#ffffff'
    },
    accent: {
      main: '#c9a961',
      light: '#d4b97a',
      dark: '#a88a4c',
      contrastText: '#ffffff'
    },
    background: {
      default: '#faf9f6',
      paper: '#ffffff'
    },
    text: {
      primary: '#2c3e50',
      secondary: '#5a6c7d'
    },
    grey: {
      50: '#f8f9fa',
      100: '#e9ecef',
      200: '#dee2e6',
      300: '#ced4da',
      400: '#adb5bd',
      500: '#6c757d',
      600: '#495057',
      700: '#343a40',
      800: '#212529',
      900: '#0d1117'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      fontSize: '3.5rem',
      lineHeight: 1.2
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      fontSize: '2.75rem',
      lineHeight: 1.3
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
      fontSize: '2.25rem',
      lineHeight: 1.4
    },
    h4: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
      fontSize: '1.75rem',
      lineHeight: 1.4
    },
    h5: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
      fontSize: '1.5rem',
      lineHeight: 1.5
    },
    h6: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.6
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
      fontWeight: 400
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      fontWeight: 400
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '1rem'
    }
  },
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: 'hidden'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '1rem',
          fontWeight: 500,
          transition: 'all 0.3s ease',
          boxShadow: 'none'
        },
        contained: {
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(44, 62, 80, 0.3)'
          }
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.3s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#8b7355'
              }
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#8b7355',
                borderWidth: 2
              }
            }
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
        }
      }
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: '1400px'
        }
      }
    }
  },
  shape: {
    borderRadius: 12
  }
});

export default theme;