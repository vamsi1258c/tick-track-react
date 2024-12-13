import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import './Sidebar.css';

const SideBar = ({ isOpen, userRole }) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isOpen ? 180 : 0,
        transition: 'width 0.3s ease',
        borderRight: '1px solid #ddd',
        height: '100vh',
        overflowX: 'hidden',
        overflowY: 'auto',
        whiteSpace: 'nowrap',
        backgroundColor: '#f5f5f5',
        '& .MuiDrawer-paper': {
          width: isOpen ? 180 : 0,
          transition: 'width 0.3s ease',
          borderRight: '1px solid #ddd',
          backgroundColor: '#f5f5f5',
          paddingTop: 5,
        },
      }}
      open={isOpen}
    >
      <Box
        sx={{
          display: 'flex',
          marginTop: 2,
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Main Navigation */}
        <List sx={{ marginTop: 2, marginLeft: 2, padding: 0 }}>
          {/* Dashboard */}
          <ListItem
            button
            component={NavLink}
            to="/"
            exact
            className="sidebar-link"
            activeClassName="active"
          >
            <ListItemIcon className="sidebar-icon">
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" className="sidebar-text" />
          </ListItem>

          {/* Tickets */}
          <ListItem
            button
            component={NavLink}
            to="/tickets"
            className="sidebar-link"
            activeClassName="active"
          >
            <ListItemIcon className="sidebar-icon">
              <LocalOfferIcon />
            </ListItemIcon>
            <ListItemText primary="Tickets" className="sidebar-text" />
          </ListItem>

          {/* Admin-only Users link */}
          {userRole === 'admin' && (
            <ListItem
              button
              component={NavLink}
              to="/manage-users"
              className="sidebar-link"
              activeClassName="active"
            >
              <ListItemIcon className="sidebar-icon">
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Users" className="sidebar-text" />
            </ListItem>
          )}
        </List>

        {/* Divider */}
        <Divider sx={{ backgroundColor: '#ddd', marginTop: 2 }} />

        {/* Settings at the bottom */}
        <List sx={{ marginTop: 'auto', padding: 0 }}>
          <ListItem
            button
            component={NavLink}
            to="/settings"
            className="sidebar-link"
            activeClassName="active"
          >
            <ListItemIcon className="sidebar-icon">
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" className="sidebar-text" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default SideBar;
