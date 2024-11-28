import api from './api';
import { createActivityLog } from './activityLog';  
import { getLoggedInUserId } from '../utils/global';  

// Fetch all configuration entries
export const fetchConfigMaster = async () => {
  try {
    const response = await api.get('/configmaster');  
    return response;
  } catch (error) {
    console.log('Error fetching config master:', error);
    throw error.response?.data || 'An error occurred while fetching config master';
  }
};

// Fetch a single configuration entry by ID
export const fetchConfigMasterById = async (configId) => {
  try {
    const response = await api.get(`/configmaster/${configId}`);  
    return response;
  } catch (error) {
    console.log('Error fetching config master entry:', error);
    throw error.response?.data || 'An error occurred while fetching the config master entry';
  }
};

// Create a new configuration entry
export const createConfigMaster = async (configData) => {
  try {
    console.log(configData);
    const response = await api.post('/configmaster', configData);

    // Log config entry creation activity
    createActivityLog({ 
      "action": `Created config entry`, 
      "user_id": getLoggedInUserId(),
      "config_id": response.data.id
    });

    return response;
  } catch (error) {
    console.log(error);
    throw error.response?.data || 'An error occurred while creating the config entry';
  }
};

// Update an existing configuration entry
export const updateConfigMaster = async (configId, configData) => {
  try {
    const response = await api.put(`/configmaster/${configId}`, configData);

    // Log config entry update activity
    createActivityLog({ 
      "action": `Updated config entry`, 
      "user_id": getLoggedInUserId(),
    });

    return response;
  } catch (error) {
    console.log('Error updating config master entry:', error);
    throw error.response?.data || 'An error occurred while updating the config master entry';
  }
};

// Delete a configuration entry by ID
export const deleteConfigMaster = async (configId) => {
  try {
    const response = await api.delete(`/configmaster/${configId}`);  

    // Log config entry deletion activity
    createActivityLog({ 
      "action": `Deleted config entry with ID: ${configId}`, 
      "user_id": getLoggedInUserId()
    });

    return response;
  } catch (error) {
    console.log('Error deleting config master entry:', error);
    throw error.response?.data || 'An error occurred while deleting the config master entry';
  }
};
