import api from './api'

// Fetch all activity logs
export const fetchActivityLogs = async () => {
  try {
    const response = await api.get('/activity-log')
    return response
  } catch (error) {
    console.log('Error fetching activity logs:', error)
    throw (
      error.response?.data || 'An error occurred while fetching activity logs'
    )
  }
}

// Fetch a single activity log by ID
export const fetchActivityLog = async (logId) => {
  try {
    const response = await api.get(`/activity-log/${logId}`)
    return response
  } catch (error) {
    console.log('Error fetching activity log:', error)
    throw (
      error.response?.data ||
      'An error occurred while fetching the activity log'
    )
  }
}

// Delete an activity log by ID
export const deleteActivityLog = async (logId) => {
  try {
    const response = await api.delete(`/activity-log/${logId}`)
    return response
  } catch (error) {
    console.log('Error deleting activity log:', error)
    throw (
      error.response?.data ||
      'An error occurred while deleting the activity log'
    )
  }
}

// Create a new activity log
export const createActivityLog = async (logData) => {
  try {
    const response = await api.post('/activity-log', logData)
    return response
  } catch (error) {
    console.log('Error creating activity log:', error)
  }
}

// Fetch activity logs by user ID
export const fetchActivityLogsByUserId = async (userId) => {
  try {
    const response = await api.get(`/activity-log/user/${userId}`)
    return response
  } catch (error) {
    console.log('Error fetching activity logs for user:', error)
    throw (
      error.response?.data ||
      'An error occurred while fetching activity logs for this user'
    )
  }
}

// Fetch activity logs by ticket ID
export const fetchActivityLogsByTicketId = async (ticketId) => {
  try {
    const response = await api.get(`/activity-log/ticket/${ticketId}`)
    return response
  } catch (error) {
    console.log('Error fetching activity logs for ticket:', error)
    throw (
      error.response?.data ||
      'An error occurred while fetching activity logs for this ticket'
    )
  }
}
