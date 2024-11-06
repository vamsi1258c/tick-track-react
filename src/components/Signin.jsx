import React, { useState } from 'react';
import { Form, Button, Container, Card } from 'react-bootstrap';
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
      <div style={{ width: '100%', textAlign: 'center', padding: '1rem', fontSize: '2rem', fontWeight: 'bold'}}>
        TickTrack
      </div>
      <Container className="d-flex justify-content-center align-items-center" style={{ overflow: 'hidden', minHeight: '70vh', padding: 0 }}>
        <Card style={{ width: '100%', maxWidth: '400px' }} className="p-4 shadow-sm">
          <Card.Body>
            <h2 className="text-center mb-4">Sign In</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formBasicEmail" className="mb-4">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');  
                    setError('');
                  }}
                  onBlur={() => handleBlur('email')}
                  required
                  size="sm"
                  className="shadow-sm"
                />
                {emailError && <p className="text-danger">{emailError}</p>}
              </Form.Group>

              <Form.Group controlId="formBasicPassword" className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(''); 
                    setError('');
                  }}
                  onBlur={() => handleBlur('password')}
                  required
                  size="sm"
                  className="shadow-sm"
                />
                {passwordError && <p className="text-danger">{passwordError}</p>}
              </Form.Group>

              {error && <p className="text-danger text-center">{error}</p>}

              <Button variant="primary" type="submit" className="w-100 mt-4" size="sm">
                Sign In
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default Signin;
