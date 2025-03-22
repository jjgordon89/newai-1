import * as types from './types';

// Define types for posts
export interface Post {
  id: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
}

// Define action types
interface FetchPostsRequestAction {
  type: typeof types.FETCH_POSTS_REQUEST;
}

interface FetchPostsSuccessAction {
  type: typeof types.FETCH_POSTS_SUCCESS;
  payload: { posts: Post[] };
}

interface FetchPostsFailureAction {
  type: typeof types.FETCH_POSTS_FAILURE;
  payload: { error: string };
}

interface AddPostAction {
  type: typeof types.ADD_POST;
  payload: { post: Post };
}

interface UpdatePostAction {
  type: typeof types.UPDATE_POST;
  payload: { post: Post };
}

interface DeletePostAction {
  type: typeof types.DELETE_POST;
  payload: { id: string };
}

// Union type for all post actions
export type PostActionTypes = 
  | FetchPostsRequestAction
  | FetchPostsSuccessAction
  | FetchPostsFailureAction
  | AddPostAction
  | UpdatePostAction
  | DeletePostAction;

// Action creators
export const fetchPostsRequest = (): FetchPostsRequestAction => ({
  type: types.FETCH_POSTS_REQUEST
});

export const fetchPostsSuccess = (posts: Post[]): FetchPostsSuccessAction => ({
  type: types.FETCH_POSTS_SUCCESS,
  payload: { posts }
});

export const fetchPostsFailure = (error: string): FetchPostsFailureAction => ({
  type: types.FETCH_POSTS_FAILURE,
  payload: { error }
});

export const addPost = (post: Post): AddPostAction => ({
  type: types.ADD_POST,
  payload: { post }
});

export const updatePost = (post: Post): UpdatePostAction => ({
  type: types.UPDATE_POST,
  payload: { post }
});

export const deletePost = (id: string): DeletePostAction => ({
  type: types.DELETE_POST,
  payload: { id }
});