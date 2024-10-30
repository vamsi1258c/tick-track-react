import api from './api';

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

//   Fetch a single ticket by ID
export const fetchTicket = async (ticketId) => {
  try {
    const response = await api.get(`/ticket/${ticketId}`);  
    return response;
  } catch (error) {
    console.log('Error fetching ticket:', error);
    throw error.response?.data || 'An error occurred while fetching the ticket';
  }
};

// Update an existing ticket
export const updateTicket = async (ticketId, ticketData) => {
  try {
    console.log(ticketData);
    const response = await api.put(`/ticket/${ticketId}`, ticketData);
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
    return response;
  } catch (error) {
    console.log('Error deleting ticket:', error);
    throw error.response?.data || 'An error occurred while deleting the ticket';
  }
};

// Create a new ticket
export const createTicket = async (ticketData) => {
  try {
    console.log(ticketData)
    const response = await api.post('/ticket', ticketData);
    return response;
  } catch (error) {
    console.log(error);
    throw error.response.data
  }
};