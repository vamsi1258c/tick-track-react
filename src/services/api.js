import axios from 'axios';
import {jwtDecode} from 'jwt-decode';


// Create an instance of axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set JWT token in Authorization header
export const setAuthToken = (token) => {
 
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getUserIdFromToken = (token) => {
    if (!token) {
        console.log("no token");
        return null;
    }
    try {
        const decoded = jwtDecode(token);
        return decoded.sub;  
    } catch (error) {
        console.error("Token decoding error:", error);
        return null;
    }
};

export const refreshTokenFun = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken'); 
    const response = await api.post('/refresh', {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      }});
  
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};


// Add a response interceptor to handle 401 errors (unauthorized)
api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
   
    // Handle 401 errors
    if (error.response && error.response.status === 401 && !originalRequest._retry) {

      // Prevent retrying the refresh token request itself to avoid a loop
      if (originalRequest.url === '/refresh' ) {
        // Refresh token has failed, handle the failure (redirect to login)
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/signin'; // Redirect to login page

        return Promise.reject({
          message: 'Session expired. Please log in again.',
          status: 401
        });
      }

      // Prevent retrying the refresh token on login
      if (originalRequest.url === '/login' ) {
        console.log("INSIDE LOGIN BLOCK");
        console.log(originalRequest.url === '/signin' );
         return Promise.reject({
          message: 'Invalid credentials. Please try again.',
          status: 401
        });
      }
      
      originalRequest._retry = true; // Mark this request as being retried
       
      try {
        // Attempt to refresh the token
        const refreshResponse = await refreshTokenFun();  
        const newToken = refreshResponse.access_token;

        // Set the new token in the headers of the original request
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        localStorage.setItem('authToken', newToken);

        // Retry the original request with the new token
        return api(originalRequest);

      } catch (refreshError) {
        localStorage.removeItem('authToken');
        setAuthToken();
        if (api.defaults.authFailureCallback) {
          api.defaults.authFailureCallback();
        }
        window.location.href = '/signin'; 

        // Return a custom error message if the refresh also fails
        return Promise.reject({
          message: 'Session expired. Please log in again.',
          status: 401
        });
      }
    }

    // If the error is not 401, just reject the promise with the error
    return Promise.reject(error);
  }
);

  
export default api;
