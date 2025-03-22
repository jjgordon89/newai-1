import { takeLatest, put, call, delay } from 'redux-saga/effects';
import * as types from '../actions/types';
import { loginSuccess, loginFailure } from '../actions/authActions';
import { PayloadAction } from '@reduxjs/toolkit';

// Mock API call to simulate authentication
const loginApi = async (username: string, password: string) => {
  // In a real application, this would be an API call to a server
  await delay(1000); // Simulate network delay
  
  // Simulate authentication logic
  if (username === 'admin' && password === 'password') {
    return {
      user: {
        id: '1',
        username,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      },
      token: 'mock-jwt-token-xyz',
    };
  } else {
    throw new Error('Invalid credentials');
  }
};

// Worker saga: performs the login task
function* loginSaga(action: PayloadAction<{ username: string; password: string }>) {
  try {
    // Call the API
    const { username, password } = action.payload;
    const response = yield call(loginApi, username, password);
    
    // If successful, dispatch success action
    yield put(loginSuccess(response.user, response.token));
  } catch (error) {
    // If failed, dispatch failure action
    yield put(loginFailure(error.message || 'Login failed'));
  }
}

// Watcher saga: watches for login action
export function* watchAuth() {
  yield takeLatest(types.LOGIN_REQUEST, loginSaga);
}