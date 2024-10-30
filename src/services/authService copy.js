import api from './api';
import { setAuthToken } from './api';
import { createActivityLog } from './activityLog';
import { getLoggedInUserId } from '../utils/global';


export const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    createActivityLog({ 
      "action": `Created user: ${userData.username}`, 
      "user_id": getLoggedInUserId() 
    })
    return response;
  } catch (error) {
    console.log(error);
    throw error.response.data
  }
};


export const loginUser = async (userData) => {
  try {
    const response = await api.post('/login', userData);

    if (response.status === 200) {
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      setAuthToken(access_token);
    }
    return response;
  } catch (error) {
    throw error;
  }
};


export const logoutUser = async () => {
  try {
    await api.post('/logout');
    localStorage.removeItem('authToken');
    setAuthToken();
  } catch (error) {
    throw error.response.data;
  }
};

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
    return response;
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw error.response.data;
  }
};
