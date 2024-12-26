import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userId: null,
  userName: '',
  userRole: '',
  authToken: null,
  refreshToken: null
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setUser: (state, { payload: { id = null, username = '', role = '' } }) => {
      state.userId = id
      state.userName = username
      state.userRole = role
    },
    setTokens: (
      state,
      { payload: { authToken = null, refreshToken = null } }
    ) => {
      state.authToken = authToken
      state.refreshToken = refreshToken
    },
    clearTokens: (state) => {
      state.authToken = null
      state.refreshToken = null
    }
  }
})

// Action creators are generated for each case reducer function
export const { setUser, setTokens, clearTokens } = appSlice.actions

export default appSlice.reducer
