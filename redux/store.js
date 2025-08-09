import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import questionReducer from './slices/questionSlice';
import userContentReducer from './slices/userContentSlice';
import voteReducer from './slices/voteSlice';
import answerReducer from './slices/answerSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';


const persistConfig = {
  key: 'root',
  storage,
  // Only persist auth state to avoid issues with complex nested state
  whitelist: ['auth'],
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
    })
});

export const persistor = persistStore(store);
