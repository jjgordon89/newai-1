import { configureStore, combineReducers, Reducer } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './reducers';
import rootSaga from './sagas';
import authReducer from './slices/authSlice';
import toastMiddleware from './middleware/toastMiddleware';

// Create the saga middleware
const sagaMiddleware = createSagaMiddleware();

// Create the store with middleware
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false, // Disable thunk as we're using saga
      serializableCheck: {
        // Ignore these action types (useful for non-serializable data in actions)
        ignoredActions: [
          'SOME_NON_SERIALIZABLE_ACTION',
          'notification/showToast',
          'documents/documentProcessed',
          'queries/submitQuery'
        ],
        // Ignore these field paths in state/actions
        ignoredPaths: [
          'some.path.to.non-serializable.value',
          'notifications.notifications.action',
          'documents.documentContent'
        ],
      },
    }).concat(sagaMiddleware, toastMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Run the saga
sagaMiddleware.run(rootSaga);

// Define RootState type explicitly to avoid circular references
export type RootState = ReturnType<typeof store.getState>;

// Define the AppDispatch type
export type AppDispatch = typeof store.dispatch;