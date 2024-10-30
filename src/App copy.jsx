import React, { useState, useEffect } from 'react';
import { Container, Row } from 'react-bootstrap';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'; // Import Navigate for redirection
import SideBar from './components/SideBar';
import TopBar from './components/TopBar';
import Footer from './components/Footer';
import Home from './components/Home';
import Signup from './components/Signup';
import Settings from './components/Settings';
import Signin from './components/Signin';
import UsersManage from './components/UsersManage';
import TicketCreate from './components/tickets/TicketCreate';
import TicketEdit from './components/tickets/TicketEdit';
import TicketsList from './components/tickets/TicketsList';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import './App.css';
import { logoutUser } from './services/authService';
import api, { setAuthToken } from './services/api';
import Dashboard from './components/Dashboard';
import UserProfile from './components/UserProfile';
import UserActivityLog from './components/UserActivityLog';
import Breadcrumb from './components/Breadcrumb';


function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Initially set to false
  const location = useLocation();
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const token = localStorage.getItem('authToken');
    setUserRole(localStorage.getItem('userRole'));
    setUserName(localStorage.getItem('userName'))
    setUserId(localStorage.getItem('userId'))

    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // This function will be called when token refresh fails
  const handleAuthFailure = () => {
    setIsAuthenticated(false); // Mark user as unauthenticated
    // Optionally, you can also force redirect to the login page
    window.location.href = '/signin';
  };

  // Pass the auth failure handler to the API
  api.defaults.authFailureCallback = handleAuthFailure;

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setUserId(user.id);
    setUserName(user.username);
    setUserRole(user.role);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userName', user.username);
    localStorage.setItem('userId', user.id);
  };

  const handleSignOut = () => {
    try {
      logoutUser();
    } catch (err) {
      console(err);
    }
    setIsAuthenticated(false);
    setUserName('');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };


  const hideNavAndSidebar = location.pathname === '/signin';
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <Container fluid style={{ height: '100vh', padding: 0 }}>
      <Row style={{ height: '100%', margin: 0 }}>
        {/* Sidebar */}
        {!hideNavAndSidebar && (
          <div
            style={{
              position: 'fixed',
              // left: isSidebarOpen ? '0' : '-200px',
              width: isSidebarOpen ? '200px' : '0px',
              transition: 'left 0.3s ease, width 0.3s ease',
              zIndex: 1000,
              height: '100vh',
              backgroundColor: '#343a40',
              color: '#fff',
              overflow: 'hidden',
              opacity: isSidebarOpen ? '10' : '0',
            }}
          >
            <SideBar isOpen={isSidebarOpen} userRole={userRole} />
          </div>
        )}

        {/* Main Content */}
        <div
          style={{
            marginLeft: isSidebarOpen && !hideNavAndSidebar ? '200px' : '0',
            transition: 'margin-left 0.3s ease',
            padding: 0,
            height: '100vh',
            width: isSidebarOpen && !hideNavAndSidebar ? 'calc(100% - 200px)' : '100%',
            display: 'flex',
            flexDirection: 'column',

          }}
        >
          {/* TopBar - Sticky */}
          {!hideNavAndSidebar && (
            // <div
            //   style={{
            //     position: 'fixed',
            //     top: 0,
            //     left: isSidebarOpen ? '200px' : '0',
            //     width: isSidebarOpen ? 'calc(100% - 200px)' : '100%',
            //     zIndex: 1050,
            //   }}
            // >

            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1050,
                width: '100%',
              }}
            >
              <TopBar isAuthenticated={isAuthenticated} onSignOut={handleSignOut} userName={userName} userRole={userRole} />
            </div>
          )}

          <div
            style={{
              position: 'fixed',
              top: !hideNavAndSidebar ? '50px' : '0',
              left: isSidebarOpen && !hideNavAndSidebar ? '200px' : '0',
              width: isSidebarOpen && !hideNavAndSidebar ? 'calc(100% - 200px)' : '100%',
              zIndex: 1030,
              padding: '5px',
            }}
          >
            <Breadcrumb />
          </div>

          {/* Main Content Area */}
          <div
            style={{
              flex: '1 0 auto',
              padding: '20px',
              marginTop: !hideNavAndSidebar ? '56px' : '0',
              marginBottom: '60px',
              paddingBottom: '60px',
              overflowY: 'auto',
            }}
          >

            <Routes>
              {/* Protected Routes */}
              <Route
                path="/"
                element={isAuthenticated ? <Dashboard /> : (
                  console.log("Redirecting to signin due to not authenticated"),
                  <Navigate to="/signin" replace />
                )}
              />
              <Route
                path="/create-ticket"
                element={isAuthenticated ? <TicketCreate currentUser={userName} isEditMode={false} /> : <Navigate to="/signin" replace />}
              />

              <Route
                path="/edit-ticket"
                element={isAuthenticated ? <TicketEdit currentUserId={userId} userRole={userRole} /> : <Navigate to="/signin" replace />}
              />
              <Route
                path="/tickets"
                element={isAuthenticated ? <TicketsList currentUser={userName} userRole={userRole} /> : <Navigate to="/signin" replace />}
              />
              <Route
                path="/manage-users"
                element={
                  isAuthenticated
                    ? userRole === 'admin'
                      ? <UsersManage currentUser={userName} userRole={userRole} />
                      : <Home /> // Redirect non-admin users to dashboard or another page
                    : <Navigate to="/signin" state={{ from: location }} replace /> // Redirect to signin if not authenticated
                }
              />
              <Route
                path="/settings"
                element={isAuthenticated ? <Settings /> : <Navigate to="/signin" replace />}
              />

              <Route path="/signup" element={isAuthenticated ? <Signup /> : <Navigate to="/signin" replace />} />
              {/* <Route path="/signup"  element={<Signup /> } /> */}

              {/* Public Routes */}
              <Route path="/signin" element={<Signin setIsAuthenticated={setIsAuthenticated} onLoginSuccess={handleLoginSuccess} />} />

              {/* User Profile Route - New */}
              <Route
                path="/profile/:id"
                element={isAuthenticated ? <UserProfile /> : <Navigate to="/signin" replace />}
              />

              {/* User Activity Log Route - New */}
              <Route
                path="/activity/:id"
                element={isAuthenticated ? <UserActivityLog /> : <Navigate to="/signin" replace />}
              />
            </Routes>
          </div>


        </div>

      </Row>

      {/* Sidebar Toggle Button */}
      {!hideNavAndSidebar && (
        <button
          onClick={toggleSidebar}
          className="btn toggle-button"
          style={{
            position: 'fixed',
            top: '10px',
            left: '0',
            bottom: '0',
            zIndex: 1100,
            background: 'none',
            border: 'none',
            color: isSidebarOpen ? '#fff' : '#333',
            fontSize: '15px',
            cursor: 'pointer',
            paddingLeft: '0px'

          }}
        >
          {isSidebarOpen ? <FaAngleLeft /> : <FaAngleRight />}
        </button>
      )}

      {/* Footer - Sticky */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          zIndex: 1000,
        }}
      >
        <Footer />
      </div>
    </Container>

  );
}

export default App;
