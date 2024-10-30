// import React, { useState, useEffect } from 'react';
// import { Form, Button, Card, Container } from 'react-bootstrap';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { registerUser, updateUser } from '../services/authService';

// const Signup = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [role, setRole] = useState('');
//   const [fullname, setFullname] = useState('');
//   const [designation, setDesignation] = useState('');  // New designation state
//   const [approver, setApprover] = useState(false);    // New approver flag state
//   const [error, setError] = useState('');
//   const [passwordError, setPasswordError] = useState('');
//   const navigate = useNavigate();
//   const location = useLocation();
//   const isEditing = location.state && location.state.user;

//   useEffect(() => {
//     if (isEditing) {
//       const { user } = location.state;
//       setUsername(user.username);
//       setRole(user.role);
//       setFullname(user.fullname);
//       setDesignation(user.designation); // Set initial designation
//       setApprover(user.approver);       // Set initial approver flag
//     }
//   }, [isEditing, location.state]);

//   // Password validation function
//   const validatePassword = (password) => {
//     const minLength = 8;
//     const hasUpperCase = /[A-Z]/.test(password);
//     const hasLowerCase = /[a-z]/.test(password);
//     const hasNumber = /\d/.test(password);
//     const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

//     if (password.length < minLength) return `Password must be at least ${minLength} characters long.`;
//     if (!hasUpperCase) return 'Password must contain at least one uppercase letter.';
//     if (!hasLowerCase) return 'Password must contain at least one lowercase letter.';
//     if (!hasNumber) return 'Password must contain at least one number.';
//     if (!hasSpecialChar) return 'Password must contain at least one special character.';
//     return '';
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setPasswordError('');

//     if (password) {
//       const passwordValidationError = validatePassword(password);
//       if (passwordValidationError) {
//         setPasswordError(passwordValidationError);
//         return;
//       }
//       if (password !== confirmPassword) {
//         setError('Passwords do not match');
//         return;
//       }
//     }

//     try {
//       const payload = { username, role, fullname, designation, approver }; // Include new fields in payload
//       if (password) payload.password = password;

//       if (isEditing) {
//         await updateUser(location.state.user.id, payload);
//       } else {
//         await registerUser(payload);
//       }
//       navigate('/manage-users');
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <Container className="d-flex justify-content-center align-items-center min-vh-100">
//       <Card style={{ width: '30rem', padding: '20px', borderRadius: '10px' }}>
//         <Card.Body>
//           <Card.Title className="text-center">{isEditing ? 'Edit User' : 'Add User'}</Card.Title>
//           {error && <p className="text-danger text-center">{error}</p>}
//           {passwordError && <p className="text-danger text-center">{passwordError}</p>}
//           <Form onSubmit={handleSubmit}>
//             <Form.Group controlId="formBasicUsername" className="mb-3">
//               <Form.Label>Username</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter email address"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 required
//                 readOnly={isEditing}
//               />
//             </Form.Group>

//             <Form.Group controlId="formBasicPassword" className="mb-3">
//               <Form.Label>{isEditing ? 'New Password (optional)' : 'Password'}</Form.Label>
//               <Form.Control
//                 type="password"
//                 placeholder={isEditing ? 'Enter new password (optional)' : 'Password'}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required={!isEditing}
//               />
//             </Form.Group>

//             <Form.Group controlId="formConfirmPassword" className="mb-3">
//               <Form.Label>Confirm Password</Form.Label>
//               <Form.Control
//                 type="password"
//                 placeholder="Confirm Password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 required={!!password}
//               />
//             </Form.Group>

//             <Form.Group controlId="formBasicFullname" className="mb-3">
//               <Form.Label>Full Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter Full Name"
//                 value={fullname}
//                 onChange={(e) => setFullname(e.target.value)}
//                 required
//               />
//             </Form.Group>

//             <Form.Group controlId="formBasicRole" className="mb-3">
//               <Form.Label>Role</Form.Label>
//               <Form.Control
//                 as="select"
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 required
                
//               >
//                 <option value="">Select Role</option>
//                 <option value="admin">Admin</option>
//                 <option value="support">Support</option>
//                 <option value="user">User</option>
//               </Form.Control>
//             </Form.Group>

//             <Form.Group controlId="formBasicDesignation" className="mb-3">
//               <Form.Label>Designation</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter Designation"
//                 value={designation}
               
//                 onChange={(e) => setDesignation(e.target.value)}
//               />
//             </Form.Group>

//             <Form.Group controlId="formApproverFlag" className="mb-3">
//               <Form.Check
//                 type="checkbox"
//                 label="Approver"
//                 checked={approver}
//                  size="sm"
//                 onChange={(e) => setApprover(e.target.checked)}
//               />
//             </Form.Group>

//             <Button variant="primary" type="submit" className="me-1">
//               {isEditing ? 'Update' : 'Add'}
//             </Button>
//             <Button variant="secondary" onClick={() => navigate(-1)}>
//               Cancel
//             </Button>
//           </Form>
//         </Card.Body>
//       </Card>
//     </Container>
//   );
// };

// export default Signup;
import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container } from 'react-bootstrap';
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
  const [passwordError, setPasswordError] = useState('');
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

    if (!username) {
      setUsernameError('Username is required.');
      isValid = false;
    }

    if (!fullname) {
      setFullnameError('Full name is required.');
      isValid = false;
    }

    if (!role) {
      setRoleError('Role is required.');
      isValid = false;
    }

    if (!designation) {
      setRoleError('Designation is required.');
      isValid = false;
    }

    return isValid;
  };

  // Real-time validation for input fields
  const handleUsernameBlur = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression for email validation
    if (!username) {
        setUsernameError('Username is required.');
    } else if (!emailPattern.test(username)) {
        setUsernameError('Please enter a valid email address.');
    } else {
        setUsernameError('');
    }
};

const handlePasswordBlur = () => {
  if (!password && !isEditing) {
    setPasswordError('Password is required.');
  } else {
    setPasswordError('');
  }
};


  const handleFullnameBlur = () => {
    if (!fullname) {
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
    if (!designation) {
      setDesignationError('Designation is required.');
    } else {
      setDesignationError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    if (!validateFields()) {
      return; // Prevent submission if there are validation errors
    }

    if (password) {
      const passwordValidationError = validatePassword(password);
      if (passwordValidationError) {
        setPasswordError(passwordValidationError);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
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
                onBlur={handleUsernameBlur} // Add onBlur event
                required
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
                required={!isEditing}
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
                required={!!password}
              />
            </Form.Group>

            <Form.Group controlId="formBasicFullname" className="mb-3">
              <Form.Label>Full Name <span style={{ color: 'red' }}>*</span></Form.Label>
              <Form.Control
                size="sm"
                type="text"
                placeholder="Enter Full Name"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                onBlur={handleFullnameBlur} // Add onBlur event
                required
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
                required
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="support">Support</option>
                <option value="user">User</option>
              </Form.Control>
              {roleError && <p className="text-danger">{roleError}</p>}
            </Form.Group>

            <Form.Group controlId="formBasicDesignation" className="mb-3">
              <Form.Label>Designation</Form.Label>
              <Form.Control
                size="sm"
                type="text"
                placeholder="Enter Designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                onBlur={handleDesignationBlur} 
                required
              > 
              </Form.Control> 
              {designationError && <p className="text-danger">{designationError}</p>}
            </Form.Group>

            <Form.Group controlId="formApproverFlag" className="mb-4">
              <Form.Check
                type="checkbox"
                label="Is Approver?"
                checked={approver}
                onChange={(e) => setApprover(e.target.checked)}
              />
            </Form.Group>

            <Button variant="primary" size="sm" type="submit" className="me-3">
              {isEditing ? 'Update' : 'Add'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Signup;
