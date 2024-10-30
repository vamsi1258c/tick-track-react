import api from './api';
import { createActivityLog } from './activityLog'; // Import createActivityLog function
import { getLoggedInUserId } from '../utils/global'; // Import to get the logged-in user ID

// Fetch all tickets
export const fetchTickets = async () => {
  try {
    const response = await api.get('/ticket');  
    return response;
  } catch (error) {
    console.log('Error fetching tickets:', error);
    throw error.response?.data || 'An error occurred while fetching tickets';
  }
};

// Fetch a single ticket by ID
export const fetchTicket = async (ticketId) => {
  try {
    const response = await api.get(`/ticket/${ticketId}`);  
    return response;
  } catch (error) {
    console.log('Error fetching ticket:', error);
    throw error.response?.data || 'An error occurred while fetching the ticket';
  }
};

// Create a new ticket
export const createTicket = async (ticketData) => {
  try {
    console.log(ticketData);
    const response = await api.post('/ticket', ticketData);

    // Log ticket creation activity
    createActivityLog({ 
      "action": `Created ticket`, 
      "user_id": getLoggedInUserId(),
      "ticket_id": response.data.id
    });

    return response;
  } catch (error) {
    console.log(error);
    throw error.response?.data || 'An error occurred while creating the ticket';
  }
};

// Update an existing ticket
export const updateTicket = async (ticketId, ticketData) => {
  try {
    console.log(ticketData);
    const response = await api.put(`/ticket/${ticketId}`, ticketData);

    // Log ticket update activity
    createActivityLog({ 
      "action": `Updated ticket`, 
      "user_id": getLoggedInUserId(),
      "ticket_id": ticketId
    });

    return response;
  } catch (error) {
    console.log('Error updating ticket:', error);
    throw error.response?.data || 'An error occurred while updating the ticket';
  }
};

// Delete a ticket by ID
export const deleteTicket = async (ticketId) => {
  try {
    const response = await api.delete(`/ticket/${ticketId}`);  

    // Log ticket deletion activity
    createActivityLog({ 
      "action": `Deleted ticket with ID: ${ticketId}`, 
      "user_id": getLoggedInUserId()
    });

    return response;
  } catch (error) {
    console.log('Error deleting ticket:', error);
    throw error.response?.data || 'An error occurred while deleting the ticket';
  }
};
