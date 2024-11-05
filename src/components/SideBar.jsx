import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTachometerAlt, FaTicketAlt, FaUsers, FaCog } from 'react-icons/fa';
import './Sidebar.css';  

const SideBar = ({ isOpen, userRole }) => {
  return (
    <div
      className={`sidebar ${isOpen ? 'open' : 'closed'}`}
      style={{
        width: isOpen ? '180px' : '0',
        transition: 'width 0.3s ease',
        borderRight: '1px solid #ddd',
        height: '100vh',
        overflowX: 'hidden',
        overflowY: 'auto',
        whiteSpace: 'nowrap',
        paddingTop: '15px'
      }}
    >
      {isOpen && (
        <Nav className="flex-column" style={{ marginTop: '50px', padding: '0 10px' }}>
          <Nav.Link as={Link} to="/" className="d-flex align-items-center">
            <FaTachometerAlt className="me-2" />
            Dashboard
          </Nav.Link>
          <Nav.Link as={Link} to="/tickets" className="d-flex align-items-center">
            <FaTicketAlt className="me-2" />
            Tickets
          </Nav.Link>
          {userRole === 'admin' && (
            <Nav.Link as={Link} to="/manage-users" className="d-flex align-items-center">
              <FaUsers className="me-2" />
              Users
            </Nav.Link>
          )}

          <Nav.Link as={Link} to="/settings" className="d-flex align-items-center" style={{ marginTop: 'auto' }}>
            <FaCog className="me-2" />
            Settings
          </Nav.Link>
        </Nav>
      )}
    </div>
  );
};

export default SideBar;
