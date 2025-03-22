import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { AuthActionTypes } from './actions/authActions';
import { PostActionTypes } from './actions/postActions';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';

// Define a comprehensive dispatch type that works with all action types
export type AppThunkDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

// Custom hooks for Redux
export const useAppDispatch = () => useDispatch<AppDispatch & AppThunkDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;