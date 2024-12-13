import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Divider,
  Box,
  useMediaQuery,
  Drawer
} from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { getLoggedInUserId } from '../utils/global'

// Import MUI icons
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import TagIcon from '@mui/icons-material/Tag'
import PersonIcon from '@mui/icons-material/Person'
import ListAltIcon from '@mui/icons-material/ListAlt'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MenuIcon from '@mui/icons-material/Menu' // For hamburger menu

const TopBar = ({ isAuthenticated, onSignOut, userName, userRole }) => {
  const navigate = useNavigate()
  const [anchorElProfile, setAnchorElProfile] = useState(null)
  const [anchorElDropdown, setAnchorElDropdown] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false) // Drawer state
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm')) // Check if screen is small

  // Function to handle sign out
  const handleSignOut = () => {
    onSignOut() // Call the sign-out function passed from the parent
    navigate('/signin') // Redirect to Sign In page
  }

  // Open profile menu
  const handleProfileMenuClick = (event) => {
    setAnchorElProfile(event.currentTarget)
  }

  // Close profile menu
  const handleProfileMenuClose = () => {
    setAnchorElProfile(null)
  }

  // Open dropdown menu
  const handleDropdownMenuClick = (event) => {
    setAnchorElDropdown(event.currentTarget)
  }

  // Close dropdown menu
  const handleDropdownMenuClose = () => {
    setAnchorElDropdown(null)
  }

  // Toggle Drawer open/close
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  return (
    <AppBar
      position="sticky"
      color="primary"
      sx={{ zIndex: 1050, boxShadow: 3, height: '55px' }}
    >
      <Toolbar
        sx={{
          height: '48px',
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0 16px'
        }}
      >
        {/* Left side: Logo, Title, and Create Ticket button */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/logo_1.webp"
            alt="TickTrack Logo"
            style={{ height: '28px', marginRight: '8px' }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: '600', color: 'white', fontSize: '16px' }}
          >
            TickTrack
          </Typography>

          {/* Create Ticket button with distinct styling */}
          {isAuthenticated && !isSmallScreen && (
            <Button
              component={Link}
              to="/create-ticket"
              sx={{
                marginLeft: 12,
                color: 'white',
                fontSize: '14px',
                padding: '4px 5px',
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0'
                }
              }}
              variant="contained" // Use "contained" style to stand out
            >
              Create Ticket
            </Button>
          )}

          {/* More (Dropdown) button with down arrow for large screens */}
          {!isSmallScreen && (
            <IconButton
              aria-controls="menu-dropdown"
              aria-haspopup="true"
              onClick={handleDropdownMenuClick}
              sx={{
                marginLeft: 5,
                color: 'white',
                fontSize: '14px',
                padding: '4px 8px',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: '#1565c0' // Add hover effect for consistency
                }
              }}
            >
              More <ExpandMoreIcon />
            </IconButton>
          )}
          <Menu
            id="menu-dropdown"
            anchorEl={anchorElDropdown}
            open={Boolean(anchorElDropdown)}
            onClose={handleDropdownMenuClose}
          >
            <MenuItem onClick={handleDropdownMenuClose}>Action</MenuItem>
            <MenuItem onClick={handleDropdownMenuClose}>
              Another action
            </MenuItem>
            <MenuItem onClick={handleDropdownMenuClose}>Something</MenuItem>
            <Divider />
            <MenuItem onClick={handleDropdownMenuClose}>
              Separated link
            </MenuItem>
          </Menu>
        </Box>

        {/* Right side: Profile section */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isSmallScreen ? (
            <IconButton onClick={toggleDrawer} color="inherit">
              <MenuIcon />
            </IconButton>
          ) : (
            isAuthenticated && (
              <>
                {/* Profile Icon Button with Tooltip */}
                <IconButton
                  onClick={handleProfileMenuClick}
                  color="inherit"
                  sx={{ padding: 1 }}
                  aria-label="user profile"
                >
                  <Typography sx={{ fontWeight: 'bold', marginRight: 1 }}>
                    {userName}
                  </Typography>
                  <Avatar sx={{ width: 24, height: 24 }}>
                    <AccountCircleIcon style={{ fontSize: '20px' }} />
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorElProfile}
                  open={Boolean(anchorElProfile)}
                  onClose={handleProfileMenuClose}
                  MenuListProps={{
                    'aria-labelledby': 'user-avatar-menu'
                  }}
                >
                  {/* User Role */}
                  <MenuItem disabled>
                    <TagIcon style={{ marginRight: '8px' }} /> {userRole}
                  </MenuItem>
                  <Divider />
                  {/* Profile and Activity Log Links */}
                  <MenuItem
                    component={Link}
                    to={`/profile/${getLoggedInUserId()}`}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <PersonIcon style={{ marginRight: '8px' }} /> View Profile
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to={`/activity/${getLoggedInUserId()}`}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <ListAltIcon style={{ marginRight: '8px' }} /> View Activity
                    Log
                  </MenuItem>
                  <Divider />
                  {/* Sign Out */}
                  <MenuItem
                    onClick={handleSignOut}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <ExitToAppIcon style={{ marginRight: '8px' }} /> Sign Out
                  </MenuItem>
                </Menu>
              </>
            )
          )}
        </Box>

        {/* Drawer for small screens */}
        <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
          <Box sx={{ width: 250, padding: 2 }}>
            {/* Add your menu items here for mobile view */}
            {isAuthenticated ? (
              <>
                <Button
                  component={Link}
                  to={`/profile/${getLoggedInUserId()}`}
                  sx={{ marginBottom: 2 }}
                >
                  View Profile
                </Button>
                <Button
                  component={Link}
                  to={`/activity/${getLoggedInUserId()}`}
                  sx={{ marginBottom: 2 }}
                >
                  View Activity Log
                </Button>
                <Button onClick={handleSignOut}>Sign Out</Button>
              </>
            ) : (
              <>
                <Button component={Link} to="/signin" sx={{ marginBottom: 2 }}>
                  Sign In
                </Button>
                <Button component={Link} to="/signup">
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  )
}

export default TopBar
