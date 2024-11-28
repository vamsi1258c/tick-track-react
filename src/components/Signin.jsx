import React, { useState } from 'react';
import { Container, Card, TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';

const Signin = ({ setIsAuthenticated, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleBlur = (field) => {
    if (field === 'email') {
      if (!email) {
        setEmailError('Email is required');
      } else if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address');
      }
    } else if (field === 'password' && !password) {
      setPasswordError('Password is required');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    try {
      const response = await loginUser({ username: email, password });
      if (response && response.status === 200) {
        setIsAuthenticated(true);
        onLoginSuccess(response.data.user);
        navigate('/');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err?.message);
    }
  };

  return (
    <>
      <Typography variant="h4" align="center" gutterBottom style={{ padding: '1rem', fontWeight: 'bold' }}>
        TickTrack
      </Typography>
      <Container maxWidth="xs" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <Card variant="outlined" style={{ padding: '2rem', width: '100%' }}>
          <Typography variant="h5" align="center" gutterBottom>
            Sign In
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              variant="outlined"
              size="small"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
                setError('');
              }}
              onBlur={() => handleBlur('email')}
              error={Boolean(emailError)}
              helperText={emailError}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              variant="outlined"
              size="small"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
                setError('');
              }}
              onBlur={() => handleBlur('password')}
              error={Boolean(passwordError)}
              helperText={passwordError}
            />
            {error && (
              <Typography color="error" align="center" variant="body2" style={{ marginTop: '1rem' }}>
                {error}
              </Typography>
            )}
            <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '1.5rem' }}>
              Sign In
            </Button>
          </form>
        </Card>
      </Container>
    </>
  );
};


export default Signin;
