import * as types from '../actions/types';
import { Post, PostActionTypes } from '../actions/postActions';

// Define the post state interface
interface PostState {
  posts: Post[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: PostState = {
  posts: [],
  loading: false,
  error: null
};

// Post reducer
const postReducer = (state = initialState, action: PostActionTypes): PostState => {
  switch (action.type) {
    case types.FETCH_POSTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case types.FETCH_POSTS_SUCCESS:
      return {
        ...state,
        posts: action.payload.posts,
        loading: false,
        error: null
      };
    case types.FETCH_POSTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    case types.ADD_POST:
      return {
        ...state,
        posts: [...state.posts, action.payload.post]
      };
    case types.UPDATE_POST:
      return {
        ...state,
        posts: state.posts.map(post => 
          post.id === action.payload.post.id
            ? action.payload.post
            : post
        )
      };
    case types.DELETE_POST:
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== action.payload.id)
      };
    default:
      return state;
  }
};

export default postReducer;