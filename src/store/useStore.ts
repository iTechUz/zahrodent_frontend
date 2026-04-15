import { create } from 'zustand';
import { createAuthSlice, AuthSlice } from './slices/authSlice';
import { createAppSlice, AppSlice } from './slices/appSlice';

export type StoreState = AuthSlice & AppSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createAppSlice(...a),
}));
