import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userId: null,
  userName: '',
  userRole: ''
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setUser: (state, { payload: { id = null, username = '', role = '' } }) => {
      state.userId = id
      state.userName = username
      state.userRole = role
    }
  }
})

// Action creators are generated for each case reducer function
export const { setUser } = appSlice.actions

export default appSlice.reducer
