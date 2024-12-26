import React, { useState, useEffect } from 'react'
import { Box, Grid, IconButton } from '@mui/material'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor } from './store/store'
import SideBar from './components/SideBar'
import TopBar from './components/TopBar'
import Footer from './components/Footer'
import Home from './components/Home'
import Signup from './components/Signup'
import Settings from './components/Settings'
import Signin from './components/Signin'
import SessionExpired from './components/SessionExpired'
import UsersManage from './components/UsersManage'
import TicketCreate from './components/tickets/TicketCreate'
import TicketEdit from './components/tickets/TicketEdit'
import TicketView from './components/tickets/TicketView'
import TicketsList from './components/tickets/TicketsList'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import './App.css'
import { logoutUser } from './services/authService'
import api, { setAuthToken } from './services/api'
import Dashboard from './components/Dashboard'
import UserProfile from './components/UserProfile'
import UserActivityLog from './components/UserActivityLog'
import Breadcrumb from './components/Breadcrumb'
import useIdleTimeout from './hooks/useIdleTimeout'
import { useDispatch, useSelector } from 'react-redux'
import { setUser, setTokens, clearTokens } from './store/appSlice'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)

  const dispatch = useDispatch()
  const userId = useSelector((state) => state.app.userId)
  const userRole = useSelector((state) => state.app.userRole)
  const isAuthenticated = Boolean(userId)

  const handleSessionTimeout = () => {
    window.location.href = '/session-expired'
  }

  // Trigger session timeout after 30 minutes of inactivity
  useIdleTimeout(handleSessionTimeout, 1800000)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const refreshToken = localStorage.getItem('refreshToken')
    const userId = localStorage.getItem('userId')
    const userName = localStorage.getItem('userName')
    const userRole = localStorage.getItem('userRole')

    if (token) {
      setAuthToken(token)
      dispatch(setTokens({ authToken: token, refreshToken }))
      dispatch(setUser({ id: userId, username: userName, role: userRole }))
    }
    setIsLoading(false)
  }, [dispatch])

  const handleAuthFailure = () => {
    dispatch(setUser({ id: null, username: '', role: '' }))
    dispatch(clearTokens())
    window.location.href = '/signin'
  }

  api.defaults.authFailureCallback = handleAuthFailure

  const handleLoginSuccess = (user) => {
    dispatch(setUser(user))
    localStorage.setItem('userId', user.id)
    localStorage.setItem('userName', user.username)
    localStorage.setItem('userRole', user.role)
  }

  const handleSignOut = () => {
    try {
      logoutUser()
    } catch (err) {
      console.error(err)
    }
    dispatch(setUser({ id: null, username: '', role: '' }))
    dispatch(clearTokens())
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const hideNavAndSidebar =
    location.pathname === '/signin' || location.pathname === '/session-expired'

  if (isLoading) {
    return <div>Loading...</div>
  }

  const getBreadcrumbTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard'
      case '/create-ticket':
        return 'Create Ticket'
      case '/edit-ticket':
        return 'Edit Ticket'
      case '/view-ticket':
        return 'View Ticket'
      case '/tickets':
        return 'Tickets View'
      case '/manage-users':
        return 'Manage Users'
      case '/settings':
        return 'Settings'
      case '/signup':
        return 'Add Users'
      case `/profile/${userId}`:
        return 'User Profile'
      case `/activity/${userId}`:
        return 'User Activity Log'
      default:
        return 'NODISPLAY'
    }
  }

  return (
    <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Grid container sx={{ flexGrow: 1 }}>
          {!hideNavAndSidebar && (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                width: isSidebarOpen ? '200px' : '20px',
                transition: 'left 0.3s ease, width 0.3s ease',
                zIndex: 1000,
                height: '100vh',
                color: '#fff',
                overflow: 'auto',
                opacity: isSidebarOpen ? 1 : 0
              }}
            >
              <SideBar isOpen={isSidebarOpen} userRole={userRole} />
            </Box>
          )}

          <Box
            sx={{
              marginLeft:
                isSidebarOpen && !hideNavAndSidebar ? '200px' : '20px',
              transition: 'margin-left 0.3s ease',
              padding: 0,
              height: '100vh',
              width:
                isSidebarOpen && !hideNavAndSidebar
                  ? 'calc(100% - 200px)'
                  : '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {!hideNavAndSidebar && (
              <Box
                sx={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 1050,
                  width: '100%',
                  height: '45px'
                }}
              >
                <TopBar
                  isAuthenticated={isAuthenticated}
                  onSignOut={handleSignOut}
                />
              </Box>
            )}

            <Box
              sx={{
                position: 'fixed',
                top: '45px',
                left: isSidebarOpen && !hideNavAndSidebar ? '200px' : '5px',
                width:
                  isSidebarOpen && !hideNavAndSidebar
                    ? 'calc(100% - 200px)'
                    : '100%',
                zIndex: 1030,
                marginTop: 0,
                marginLeft: isSidebarOpen ? '0px' : '20px',
                marginBottom: 8
              }}
            >
              <Breadcrumb title={getBreadcrumbTitle()} />
            </Box>

            <Box
              sx={{
                flex: '1 0 auto',
                padding: '10px 10px 5px 10px',
                marginTop: !hideNavAndSidebar ? '65px' : '0',
                marginBottom: 0
              }}
            >
              <Routes>
                {/* Protected Routes */}
                <Route
                  path="/"
                  element={
                    isAuthenticated ? (
                      <Dashboard />
                    ) : (
                      <Navigate to="/signin" replace />
                    )
                  }
                />
                <Route
                  path="/create-ticket"
                  element={
                    isAuthenticated ? (
                      <TicketCreate isEditMode={false} />
                    ) : (
                      <Navigate to="/signin" replace />
                    )
                  }
                />
                <Route
                  path="/edit-ticket"
                  element={
                    isAuthenticated ? (
                      <TicketEdit />
                    ) : (
                      <Navigate to="/signin" replace />
                    )
                  }
                />
                <Route
                  path="/view-ticket"
                  element={
                    isAuthenticated ? (
                      <TicketView />
                    ) : (
                      <Navigate to="/signin" replace />
                    )
                  }
                />
                <Route
                  path="/tickets"
                  element={
                    isAuthenticated ? (
                      <TicketsList />
                    ) : (
                      <Navigate to="/signin" replace />
                    )
                  }
                />
                <Route
                  path="/manage-users"
                  element={
                    isAuthenticated ? (
                      userRole === 'admin' ? (
                        <UsersManage />
                      ) : (
                        <Home />
                      )
                    ) : (
                      <Navigate
                        to="/signin"
                        state={{ from: location }}
                        replace
                      />
                    )
                  }
                />
                <Route
                  path="/settings"
                  element={
                    isAuthenticated && userRole === 'admin' ? (
                      <Settings />
                    ) : (
                      <Navigate to="/signin" replace />
                    )
                  }
                />
                <Route
                  path="/signup"
                  element={
                    isAuthenticated ? (
                      <Signup />
                    ) : (
                      <Navigate to="/signin" replace />
                    )
                  }
                />

                {/* Public Routes */}
                <Route
                  path="/signin"
                  element={<Signin onLoginSuccess={handleLoginSuccess} />}
                />

                <Route path="/session-expired" element={<SessionExpired />} />

                {/* User Profile Route */}
                <Route
                  path="/profile/:id"
                  element={
                    isAuthenticated ? (
                      <UserProfile />
                    ) : (
                      <Navigate to="/signin" replace />
                    )
                  }
                />

                {/* User Activity Log Route */}
                <Route
                  path="/activity/:id"
                  element={
                    isAuthenticated ? (
                      <UserActivityLog />
                    ) : (
                      <Navigate to="/signin" replace />
                    )
                  }
                />
              </Routes>
            </Box>
            <Footer sx={{ marginTop: 'auto' }} />
          </Box>
        </Grid>

        {/* Sidebar Toggle Button */}
        {!hideNavAndSidebar && (
          <IconButton
            onClick={toggleSidebar}
            sx={{
              position: 'fixed',
              top: '10px',
              left: '0',
              bottom: '0',
              zIndex: 1100,
              background: 'none',
              border: 'none',
              color: 'primary.main',
              fontSize: '15px',
              cursor: 'pointer',
              paddingLeft: '0px'
            }}
          >
            {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        )}
      </Box>
    </PersistGate>
  )
}

export default App
