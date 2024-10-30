// Helper function to get loggedInUser from localStorage
export const getLoggedInUser = () => {
    return localStorage.getItem('userName');
  };

// Helper function to get loggedInUser from localStorage
export const getLoggedInUserId = () => {
    return Number(localStorage.getItem('userId'));
  };