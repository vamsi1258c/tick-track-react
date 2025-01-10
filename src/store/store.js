import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import appReducer from './appSlice'

const persistConfig = {
  key: 'root',
  storage
}

const persistedAppReducer = persistReducer(persistConfig, appReducer)

export const store = configureStore({
  reducer: {
    app: persistedAppReducer
  }
})

export const persistor = persistStore(store)
