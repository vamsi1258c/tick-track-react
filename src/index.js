import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { SnackbarProvider } from './components/Snackbar';

const theme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            fontSize: '0.85rem',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiSelect-select': {
            fontSize: '0.85rem',
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            fontSize: '0.85rem',
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiFormLabel-root': {
            fontSize: '0.85rem',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderWidth: '1px',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: '1px',
            borderColor: '#1976d2',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '.quill': {
          '& .ql-container': {
            fontSize: '0.8rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            minHeight: '120px',
            transition: 'border-color 0.3s',
          },
          '& .ql-container.ql-snow': {
            border: 'none',
            borderRadius: '4px',
          },
          '& .ql-toolbar': {
            border: '1px solid #ced4da',
            borderBottom: 'none',
            borderRadius: '4px 4px 0 0',
          },
          '& .ql-editor': {
            padding: '12px',
            minHeight: '120px',
            maxHeight: '300px',
            overflowY: 'auto',
          },
        },
      },
    },
  },
  typography: {
    fontSize: 12,
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

reportWebVitals();
