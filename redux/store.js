import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import questionReducer from './slices/questionSlice';
import userContentReducer from './slices/userContentSlice';
import voteReducer from './slices/voteSlice';
import answerReducer from './slices/answerSlice';
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from '@reduxjs/toolkit';

// Create a safe storage that works on both client and server
const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

// Use localStorage on client, noop storage on server
const storage = typeof window !== "undefined" 
  ? require('redux-persist/lib/storage').default
  : createNoopStorage();

const persistConfig = {
  key: 'root',
  storage,
  // Add whitelist to only persist certain slices
  whitelist: ['auth'], // Only persist auth state
};

const rootReducer = combineReducers({
  auth: authReducer,
  question: questionReducer,
  userContent: userContentReducer,
  vote: voteReducer,
  answer: answerReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  // Add dev tools only in development
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
