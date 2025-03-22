import * as types from '../actions/types';
import { AuthActionTypes } from '../actions/authActions';

// Define the auth state interface
interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null
};

// Auth reducer
const authReducer = (state = initialState, action: AuthActionTypes): AuthState => {
  switch (action.type) {
    case types.LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case types.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };
    case types.LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    case types.LOGOUT:
      return initialState;
    default:
      return state;
  }
};

export default authReducer;