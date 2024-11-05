import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { registerUser, updateUser } from '../services/authService';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [fullname, setFullname] = useState('');
  const [designation, setDesignation] = useState('');
  const [approver, setApprover] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [fullnameError, setFullnameError] = useState('');
  const [designationError, setDesignationError] = useState('');
  const [roleError, setRoleError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state && location.state.user;

  useEffect(() => {
    if (isEditing) {
      const { user } = location.state;
      setUsername(user.username);
      setRole(user.role);
      setFullname(user.fullname);
      setDesignation(user.designation);
      setApprover(user.approver);
    }
  }, [isEditing, location.state]);

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) return `Password must be at least ${minLength} characters long.`;
    if (!hasUpperCase) return 'Password must contain at least one uppercase letter.';
    if (!hasLowerCase) return 'Password must contain at least one lowercase letter.';
    if (!hasNumber) return 'Password must contain at least one number.';
    if (!hasSpecialChar) return 'Password must contain at least one special character.';
    return '';
  };

  const validateFields = () => {
    let isValid = true;
    setUsernameError('');
    setFullnameError('');
    setRoleError('');
    setDesignationError('');
    setPasswordError('');

    if (!username || username.trim() === '') {
      setUsernameError('Username is required.');
      isValid = false;
    }

    if ((!password || password.trim() === '') && !isEditing) {
      setPasswordError('Password is required.');
      isValid = false;
    }

    if (!fullname || fullname.trim() === '') {
      setFullnameError('Full name is required.');
      isValid = false;
    }

    if (!role) {
      setRoleError('Role is required.');
      isValid = false;
    }

    if (!designation || designation.trim() === '') {
      setDesignationError('Designation is required.');
      isValid = false;
    }

    return isValid;
  };

  const handleUsernameBlur = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!username || username.trim() === '') {
      setUsernameError('Username is required.');
    } else if (!emailPattern.test(username)) {
      setUsernameError('Please enter a valid email address.');
    } else {
      setUsernameError('');
    }
  };

  const handlePasswordBlur = () => {
    if ((!password || password.trim() === '') && !isEditing) {
      setPasswordError('Password is required.');
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleFullnameBlur = () => {
    if (!fullname || fullname.trim() === '') {
      setFullnameError('Full name is required.');
    } else {
      setFullnameError('');
    }
  };

  const handleRoleBlur = () => {
    if (!role) {
      setRoleError('Role is required.');
    } else {
      setRoleError('');
    }
  };

  const handleDesignationBlur = () => {
    if (!designation || designation.trim() === '') {
      setDesignationError('Designation is required.');
    } else {
      setDesignationError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateFields()) {
      setLoading(false);
      return;
    }

    if (password) {
      const passwordValidationError = validatePassword(password);
      if (passwordValidationError) {
        setPasswordError(passwordValidationError);
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match.');
        setLoading(false);
        return;
      }
    }

    try {
      const payload = { username, role, fullname, designation, approver };
      if (password) payload.password = password;

      if (isEditing) {
        await updateUser(location.state.user.id, payload);
      } else {
        await registerUser(payload);
      }
      navigate('/manage-users');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card style={{ width: '35rem', padding: '15px', borderRadius: '8px' }}>
        <Card.Body>
          <Card.Title className="text-center">{isEditing ? 'Edit User' : 'Add User'}</Card.Title>
          {error && <p className="text-danger text-center">{error}</p>}

          <Form onSubmit={handleSubmit} style={{ fontSize: '0.9rem' }}>
            <Form.Group controlId="formBasicUsername" className="mb-3">
              <Form.Label>Username <span style={{ color: 'red' }}>*</span></Form.Label>
              <Form.Control
                size="sm"
                type="text"
                placeholder="Enter email address"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={handleUsernameBlur}
                readOnly={isEditing}
              />
              {usernameError && <p className="text-danger">{usernameError}</p>}
            </Form.Group>

            <Form.Group controlId="formBasicPassword" className="mb-3">
              <Form.Label>{isEditing ? 'New Password (optional)' : 'Password'} <span style={{ color: 'red' }}>*</span></Form.Label>
              <Form.Control
                size="sm"
                type="password"
                placeholder={isEditing ? 'Enter new password (optional)' : 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handlePasswordBlur}
              />
              {passwordError && <p className="text-danger">{passwordError}</p>}
            </Form.Group>

            <Form.Group controlId="formConfirmPassword" className="mb-3">
              <Form.Label>Confirm Password <span style={{ color: 'red' }}>*</span></Form.Label>
              <Form.Control
                size="sm"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={handleConfirmPasswordBlur}
              />
              {confirmPasswordError && <p className="text-danger">{confirmPasswordError}</p>}
            </Form.Group>

            <Form.Group controlId="formBasicFullname" className="mb-3">
              <Form.Label>Full Name <span style={{ color: 'red' }}>*</span></Form.Label>
              <Form.Control
                size="sm"
                type="text"
                placeholder="Enter Full Name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                onBlur={handleFullnameBlur}
              />
              {fullnameError && <p className="text-danger">{fullnameError}</p>}
            </Form.Group>

            <Form.Group controlId="formBasicRole" className="mb-3">
              <Form.Label>Role <span style={{ color: 'red' }}>*</span></Form.Label>
              <Form.Control
                size="sm"
                as="select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onBlur={handleRoleBlur}
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="support">Support</option>
                <option value="user">User</option>
              </Form.Control>
              {roleError && <p className="text-danger">{roleError}</p>}
            </Form.Group>

            <Form.Group controlId="formBasicDesignation" className="mb-3">
              <Form.Label>Designation <span style={{ color: 'red' }}>*</span></Form.Label>
              <Form.Control
                size="sm"
                type="text"
                placeholder="Enter Designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                onBlur={handleDesignationBlur}
              />
              {designationError && <p className="text-danger">{designationError}</p>}
            </Form.Group>

            <Form.Group controlId="formBasicApprover" className="mb-3">
              <Form.Check
                type="checkbox"
                label="Approver"
                checked={approver}
                onChange={(e) => setApprover(e.target.checked)}
              />
            </Form.Group>

            <div className="text-center">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />{' '}
                    Loading...
                  </>
                ) : isEditing ? 'Update User' : 'Register'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Signup;
