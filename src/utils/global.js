import { store } from '../store/store'

// Helper function to get loggedInUser from Redux store
export const getLoggedInUser = () => {
  return store.getState().app.userName
}

// Helper function to get loggedInUserId from Redux store
export const getLoggedInUserId = () => {
  return store.getState().app.userId
}
