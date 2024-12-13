import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

// Create an instance of axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Function to set JWT token in Authorization header
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export const getUserIdFromToken = (token) => {
  if (!token) {
    return null
  }
  try {
    const decoded = jwtDecode(token)
    return decoded.sub
  } catch (error) {
    console.error('Token decoding error:', error)
    return null
  }
}

export const refreshTokenFun = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    const response = await api.post(
      '/refresh',
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`
        }
      }
    )

    return response.data
  } catch (error) {
    throw error.response.data
  }
}

// Interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      // Prevent retrying the refresh token request itself to avoid a loop
      if (originalRequest.url === '/refresh') {
        // Refresh token has failed, handle the failure (redirect to login)
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/session-expired'
      }

      // Prevent retrying the refresh token on login
      if (originalRequest.url === '/login') {
        return Promise.reject({
          message: 'Invalid credentials. Please try again.',
          status: 401
        })
      }

      originalRequest._retry = true

      try {
        // Attempt to refresh the token
        const refreshResponse = await refreshTokenFun()
        const newToken = refreshResponse.access_token

        // Set the new token in the headers of the original request
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        localStorage.setItem('authToken', newToken)

        // Retry the original request with the new token
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('authToken')
        setAuthToken()
        if (api.defaults.authFailureCallback) {
          api.defaults.authFailureCallback()
        }
        window.location.href = '/signin'

        // Return a custom error message if the refresh also fails
        return Promise.reject({
          message: 'Session expired. Please log in again.',
          status: 401
        })
      }
    }

    // Handle 422 Unprocessable Entity
    if (error.response && error.response.status === 422) {
      return Promise.reject({
        message: 'Validation error. Please check your input.',
        details: error.response.data.errors || [],
        status: 422
      })
    }

    // Handle 403 Forbidden
    if (error.response && error.response.status === 403) {
      window.location.href = '/unauthorized'
      return Promise.reject({
        message: 'You are not authorized to access this resource.',
        status: 403
      })
    }

    // Handle 404 Not Found
    if (error.response && error.response.status === 404) {
      return Promise.reject({
        message: 'The requested resource was not found.',
        status: 404
      })
    }

    // If none of the above, just reject the promise with the error
    return Promise.reject(error)
  }
)

export default api
