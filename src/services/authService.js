import api from './api';
import { setAuthToken } from './api';
import { createActivityLog } from './activityLog';
import { getLoggedInUserId } from '../utils/global';

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    createActivityLog({ 
      "action": `Created user: ${userData.username}`, 
      "user_id": getLoggedInUserId() 
    });
    return response;
  } catch (error) {
    console.error("Failed to register user:", error);
    throw error.response.data;
  }
};

// Login user
export const loginUser = async (userData) => {
  try {
    const response = await api.post('/login', userData);

    if (response.status === 200) {
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      setAuthToken(access_token);
      
      // Log login activity
      createActivityLog({ 
        "action": "User logged in", 
        "user_id": response.data.user.id
      });
    }

    return response;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    // Log logout activity
    await createActivityLog({ 
      "action": `User logged out`, 
      "user_id": getLoggedInUserId() 
    });

    await api.post('/logout');
    localStorage.removeItem('authToken');
    localStorage.clear();
    setAuthToken();
  } catch (error) {
    console.error("Logout failed:", error);
    throw error.response.data;
  }
};

// Fetch users
export const fetchUsers = async () => {
  try {
    const response = await api.get('/user');
    return response;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error.response.data;
  }
};

// Update user details
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/user/${userId}`, userData);

    // Log user update activity
    createActivityLog({ 
      "action": `Updated user: ${userData.username}`, 
      "user_id": getLoggedInUserId() 
    });

    return response;
  } catch (error) {
    console.error("Failed to update user:", error);
    throw error.response.data;
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/user/${userId}`);

    // Log user deletion activity
    createActivityLog({ 
      "action": `Deleted user with ID: ${userId}`, 
      "user_id": getLoggedInUserId() 
    });

    return response;
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw error.response.data;
  }
};
