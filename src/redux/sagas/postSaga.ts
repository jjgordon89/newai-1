import { takeLatest, put, call, delay } from 'redux-saga/effects';
import * as types from '../actions/types';
import { 
  fetchPostsSuccess, 
  fetchPostsFailure, 
  Post 
} from '../actions/postActions';
import { PayloadAction } from '@reduxjs/toolkit';

// Mock API call to simulate fetching posts
const fetchPostsApi = async () => {
  // In a real application, this would be an API call to a server
  await delay(1000); // Simulate network delay
  
  // Mock data
  return [
    {
      id: '1',
      title: 'Getting Started with Redux',
      body: 'Redux is a predictable state container for JavaScript apps...',
      author: 'Dan Abramov',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Understanding Redux Middleware',
      body: 'Redux middleware provides a third-party extension point between...',
      author: 'Mark Erikson',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Async Operations with Redux Saga',
      body: 'Redux Saga is a library that aims to make application side effects...',
      author: 'Jane Doe',
      createdAt: new Date().toISOString(),
    },
  ];
};

// Worker saga: performs the fetch posts task
function* fetchPostsSaga() {
  try {
    // Call the API
    const posts: Post[] = yield call(fetchPostsApi);
    
    // If successful, dispatch success action
    yield put(fetchPostsSuccess(posts));
  } catch (error) {
    // If failed, dispatch failure action
    yield put(fetchPostsFailure(error.message || 'Failed to fetch posts'));
  }
}

// Worker saga for adding a post
function* addPostSaga(action: PayloadAction<{ post: Post }>) {
  try {
    // Here you would typically make an API call to save the post
    // For this example, we're just simulating a delay
    yield delay(500);
    
    // The new post is already in the action payload and will be added
    // to the state by the reducer, so no need to dispatch another action
  } catch (error) {
    // In a real application, you might want to dispatch an error action
    console.error('Error adding post:', error);
  }
}

// Watcher saga: watches for post actions
export function* watchPosts() {
  yield takeLatest(types.FETCH_POSTS_REQUEST, fetchPostsSaga);
  yield takeLatest(types.ADD_POST, addPostSaga);
  // You could add more watchers for update, delete, etc.
}