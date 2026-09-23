import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1B2A3D',
      light: '#243648',
      dark: '#111D2B',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#8b7355',
      light: '#a0896b',
      dark: '#6b563f',
      contrastText: '#ffffff'
    },
    accent: {
      main: '#C9A961',
      light: '#D4B97A',
      dark: '#A88A4C',
      contrastText: '#ffffff'
    },
    background: {
      default: '#F8F6F3',
      paper: '#ffffff'
    },
    text: {
      primary: '#1B2A3D',
      secondary: '#5A6C7D'
    },
    grey: {
      50: '#F8F6F3',
      100: '#F2EFEB',
      200: '#EDE9E3',
      300: '#E8E4DF',
      400: '#D5D0C9',
      500: '#8A96A3',
      600: '#5A6C7D',
      700: '#2C3E50',
      800: '#1B2A3D',
      900: '#111D2B'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
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
      fontFamily: '"Inter", sans-serif',
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
          boxShadow: '0 2px 12px rgba(27, 42, 61, 0.06)',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(27, 42, 61, 0.1)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid #E8E4DF'
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
          background: 'linear-gradient(135deg, #1B2A3D 0%, #243648 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #243648 0%, #1B2A3D 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(27, 42, 61, 0.3)'
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
                borderColor: '#C9A961'
              }
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#C9A961',
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
          boxShadow: '0 2px 12px rgba(27, 42, 61, 0.08)'
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