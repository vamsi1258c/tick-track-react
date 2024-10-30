import React from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate replaces useHistory in v6
import './TopBar.css'; // Importing custom CSS
import { FaUserCircle, FaSignOutAlt, FaUserTag, FaUser, FaListAlt } from 'react-icons/fa';
import { getLoggedInUserId } from '../utils/global';

const TopBar = ({ isAuthenticated, onSignOut, userName, userRole }) => {
    const navigate = useNavigate(); // useNavigate hook for navigation

    // Function to handle sign out
    const handleSignOut = () => {
        onSignOut(); // Call the sign-out function passed from the parent
        navigate('/signin'); // Redirect to Sign In page
    };

    return (
        <Navbar collapseOnSelect expand="md" className="bg-light sticky-top custom-navbar" style={{ zIndex: 1050 }}>
            <Container style={{padding:'0px'}}>
                <Navbar.Brand className="me-auto" href="/" style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                    <img
                        src="/logo_1.webp"   
                        alt="TickTrack Logo"
                        style={{ height: '30px', marginRight: '8px' }}  // Adjust size and spacing as needed
                    />
                    TickTrack</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        {isAuthenticated && (
                            <Nav.Link as={Link} to="/create-ticket">Create Ticket</Nav.Link>
                        )}
                        <NavDropdown title="Dropdown" id="collapsible-nav-dropdown">
                            <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                        </NavDropdown>

                    </Nav>
                    <Nav className="ms-auto user-menu">
                        {isAuthenticated ? (
                            <NavDropdown
                                title={
                                    <span>
                                        {userName} <FaUserCircle style={{ fontSize: '24px' }} />
                                    </span>
                                }
                                id="user-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item disabled><FaUserTag /> {userRole}</NavDropdown.Item> {/* Display user's role */}
                                <NavDropdown.Divider />

                                {/* Link to User Profile */}
                                <NavDropdown.Item as={Link} to={`/profile/${getLoggedInUserId()}`}>
                                    <FaUser /> View Profile
                                </NavDropdown.Item>

                                {/* Link to Activity Log */}
                                <NavDropdown.Item as={Link} to={`/activity/${getLoggedInUserId()}`}>
                                    <FaListAlt /> View Activity Log
                                </NavDropdown.Item>

                                <NavDropdown.Divider />

                                {/* Sign Out functionality */}
                                <NavDropdown.Item onClick={handleSignOut}>
                                    <FaSignOutAlt /> Sign Out
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/signin">Sign In</Nav.Link>
                                <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
                            </>
                        )}
                    </Nav>

                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default TopBar;


