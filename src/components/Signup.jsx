import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Grid,
  CardHeader
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { registerUser, updateUser } from '../services/authService';
import { useSnackbar } from './Snackbar';

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
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const { showSnackbar } = useSnackbar();


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
    setConfirmPasswordError('');

    if (!username || username.trim() === '') {
      setUsernameError('Username is required.');
      isValid = false;
    } else if (!emailRegex.test(username)) {
      setUsernameError('Invalid email format.');
      isValid = false;
    }

    if ((!password || password.trim() === '') && !isEditing) {
      setPasswordError('Password is required.');
      isValid = false;
    }

    if ((!confirmPassword || confirmPassword.trim() === '') && !isEditing) {
      setConfirmPasswordError('Confirm password is required.');
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
        showSnackbar('Updated user '+username);
      } else {
        await registerUser(payload);
        showSnackbar('Created user '+username);
      }
      navigate('/manage-users');
    } catch (err) {
      setError(err.message);
      showSnackbar('Failed to create/update user '+username, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Card variant="contained" sx={{ mt: 0, p: '3px 4px', borderRadius: 1 }}>
        <CardHeader
          title={isEditing ? 'Edit User' : 'Add User'}
          titleTypographyProps={{
            align: 'center',
            variant: 'h5',
            fontWeight: 'bold',
            color: 'primary.main',
          }}
          sx={{ p: 0.3, bgcolor: '#f5f5f5', textAlign: 'center' }}
        />
        <CardContent>
          {error && <Typography color="error" align="center">{error}</Typography>}

          <form onSubmit={handleSubmit}>
            {/* Full Name and Username in one row */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Username"
                  fullWidth
                  margin="normal"
                  size="small"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameError('');
                  }}
                  onBlur={() => !username && setUsernameError('Username is required.')}
                  helperText={usernameError}
                  error={Boolean(usernameError)}
                  disabled={isEditing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  fullWidth
                  margin="normal"
                  size="small"
                  value={fullname}
                  onChange={(e) => {
                    setFullname(e.target.value);
                    setFullnameError('');
                  }}
                  onBlur={() => !fullname && setFullnameError('Full name is required.')}
                  helperText={fullnameError}
                  error={Boolean(fullnameError)}
                />
              </Grid>
            </Grid>

            {/* Password and Confirm Password in one row */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={isEditing ? 'New Password (optional)' : 'Password'}
                  type="password"
                  fullWidth
                  margin="normal"
                  size="small"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  onBlur={() => password && setPasswordError(validatePassword(password))}
                  helperText={passwordError}
                  error={Boolean(passwordError)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  size="small"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmPasswordError('');
                  }}
                  onBlur={() =>
                    confirmPassword && setConfirmPasswordError(password !== confirmPassword ? 'Passwords do not match.' : '')
                  }
                  helperText={confirmPasswordError}
                  error={Boolean(confirmPasswordError)}
                />
              </Grid>
            </Grid>

            {/* Role and Designation in one row */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" error={Boolean(roleError)}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      setRoleError('');
                    }}
                    onBlur={() => !role && setRoleError('Role is required.')}
                    label="Role"
                    size="small"
                    sx={{ height: '40px' }}
                  >
                    <MenuItem value="">Select Role</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="support">Support</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                  </Select>
                  <FormHelperText>{roleError}</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Designation"
                  fullWidth
                  margin="normal"
                  size="small"
                  value={designation}
                  onChange={(e) => {
                    setDesignation(e.target.value);
                    setDesignationError('');
                  }}
                  onBlur={() => !designation && setDesignationError('Designation is required.')}
                  helperText={designationError}
                  error={Boolean(designationError)}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Checkbox
                  checked={approver}
                  onChange={(e) => setApprover(e.target.checked)}
                  sx={{ '&.Mui-checked': { color: 'primary.main' } }}
                />
              }
              label="Is Approver?"
              sx={{ mt: 1, mb: 2 }}
            />

            <Grid container justifyContent="left" spacing={2}>
              <Grid item>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  {isEditing ? 'Update' : 'Submit'}
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" onClick={() => navigate('/manage-users')}>
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>

  );
};

export default Signup;
