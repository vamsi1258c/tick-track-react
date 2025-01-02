import { store } from '../store/store'

// Helper function to get loggedInUser from Redux store
export const getLoggedInUser = () => store?.getState()?.app?.userName

// Helper function to get loggedInUserId from Redux store
export const getLoggedInUserId = () => store?.getState()?.app?.userId

// Helper function to check user role
export const isUserInRole = (userName, selectedTicket, role) =>
  userName === selectedTicket?.[role]?.username
