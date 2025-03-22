import { all, fork } from 'redux-saga/effects';
import { watchAuth } from './authSaga';
import { watchPosts } from './postSaga';

// Root saga that combines all the other sagas
export default function* rootSaga() {
  yield all([
    fork(watchAuth),
    fork(watchPosts),
    // Add more sagas here as needed
  ]);
}