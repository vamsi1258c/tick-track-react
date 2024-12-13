import api from './api'

// Fetch all comments for a specific ticket
export const fetchComments = async (ticketId) => {
  try {
    const response = await api.get(`/ticket/${ticketId}/comments`)
    return response
  } catch (error) {
    console.log('Error fetching comments:', error)
    throw error.response?.data || 'An error occurred while fetching comments'
  }
}

// Fetch a single comment by ID
export const fetchComment = async (commentId) => {
  try {
    const response = await api.get(`/comments/${commentId}`)
    return response
  } catch (error) {
    console.log('Error fetching comment:', error)
    throw error.response?.data || 'An error occurred while fetching the comment'
  }
}

// Create a new comment on a specific ticket
export const createComment = async (ticketId, commentData) => {
  try {
    console.log(commentData)
    const response = await api.post(`/ticket/${ticketId}/comments`, commentData)
    return response
  } catch (error) {
    console.log('Error creating comment:', error)
    throw error.response?.data || 'An error occurred while creating the comment'
  }
}

// Update an existing comment by ID
export const updateComment = async (commentId, commentData) => {
  try {
    const response = await api.put(`/comments/${commentId}`, commentData)
    return response
  } catch (error) {
    console.log('Error updating comment:', error)
    throw error.response?.data || 'An error occurred while updating the comment'
  }
}

// Delete a comment by ID
export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/comments/${commentId}`)
    return response
  } catch (error) {
    console.log('Error deleting comment:', error)
    throw error.response?.data || 'An error occurred while deleting the comment'
  }
}
