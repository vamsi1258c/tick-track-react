import api from './api'
import { createActivityLog } from './activityLog'
import { getLoggedInUserId } from '../utils/global'

// Helper function to send an email
// const sendEmail = async (emailData) => {
//   try {
//     const response = await api.post('/mail/send', emailData);
//     console.log('Email sent successfully:', response.data);
//   } catch (error) {
//     console.error('Error sending email:', error.response?.data || error.message);
//   }
// };

// Fetch all tickets
export const fetchTickets = async () => {
  try {
    const response = await api.get('/ticket')
    return response
  } catch (error) {
    console.log('Error fetching tickets:', error)
    throw error.response?.data || 'An error occurred while fetching tickets'
  }
}

// Fetch a single ticket by ID
export const fetchTicket = async (ticketId) => {
  try {
    const response = await api.get(`/ticket/${ticketId}`)
    return response
  } catch (error) {
    console.log('Error fetching ticket:', error)
    throw error.response?.data || 'An error occurred while fetching the ticket'
  }
}

// Create a new ticket
export const createTicket = async (ticketData) => {
  try {
    const response = await api.post('/ticket', ticketData)

    // Log ticket creation activity
    createActivityLog({
      action: `Created ticket`,
      user_id: getLoggedInUserId(),
      ticket_id: response.data.id
    })

    // Send email notification
    // const emailData = {
    //   subject: 'New Ticket Created',
    //   recipients: [response.data.assignee.username],
    //   body: `A new ticket has been created:\n\nTitle: ${ticketData.title}\nDescription: ${ticketData.description}`,
    //   sender: 'noreply@vforit.com',
    // };
    // await sendEmail(emailData);

    return response
  } catch (error) {
    throw error.response?.data || 'An error occurred while creating the ticket'
  }
}

// Update an existing ticket
export const updateTicket = async (ticketId, ticketData) => {
  try {
    const response = await api.put(`/ticket/${ticketId}`, ticketData)

    // Log ticket update activity
    createActivityLog({
      action: `Updated ticket`,
      user_id: getLoggedInUserId(),
      ticket_id: ticketId
    })

    return response
  } catch (error) {
    console.log('Error updating ticket:', error)
    throw error.response?.data || 'An error occurred while updating the ticket'
  }
}

// Delete a ticket by ID
export const deleteTicket = async (ticketId) => {
  try {
    const response = await api.delete(`/ticket/${ticketId}`)

    // Log ticket deletion activity
    createActivityLog({
      action: `Deleted ticket with ID: ${ticketId}`,
      user_id: getLoggedInUserId()
    })

    return response
  } catch (error) {
    console.log('Error deleting ticket:', error)
    throw error.response?.data || 'An error occurred while deleting the ticket'
  }
}
