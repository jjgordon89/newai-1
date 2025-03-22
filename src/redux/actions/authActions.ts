import * as types from './types';

// Define types for actions and payload
interface LoginRequestAction {
  type: typeof types.LOGIN_REQUEST;
  payload: { username: string; password: string };
}

interface LoginSuccessAction {
  type: typeof types.LOGIN_SUCCESS;
  payload: { user: any; token: string };
}

interface LoginFailureAction {
  type: typeof types.LOGIN_FAILURE;
  payload: { error: string };
}

interface LogoutAction {
  type: typeof types.LOGOUT;
}

// Union type for all auth actions
export type AuthActionTypes = 
  | LoginRequestAction
  | LoginSuccessAction
  | LoginFailureAction
  | LogoutAction;

// Action creators
export const loginRequest = (username: string, password: string): LoginRequestAction => ({
  type: types.LOGIN_REQUEST,
  payload: { username, password }
});

export const loginSuccess = (user: any, token: string): LoginSuccessAction => ({
  type: types.LOGIN_SUCCESS,
  payload: { user, token }
});

export const loginFailure = (error: string): LoginFailureAction => ({
  type: types.LOGIN_FAILURE,
  payload: { error }
});

export const logout = (): LogoutAction => ({
  type: types.LOGOUT
});