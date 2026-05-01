import { StateCreator } from 'zustand';

export interface AppSlice {
  darkMode: boolean;
  toggleDarkMode: () => void;
  activeBranchId: string | null;
  setActiveBranchId: (id: string | null) => void;
}

export const createAppSlice: StateCreator<AppSlice> = (set) => ({
  darkMode: false,
  toggleDarkMode: () => set((s) => {
    const next = !s.darkMode;
    document.documentElement.classList.toggle('dark', next);
    return { darkMode: next };
  }),
  activeBranchId: localStorage.getItem('activeBranchId'),
  setActiveBranchId: (id) => {
    if (id) localStorage.setItem('activeBranchId', id);
    else localStorage.removeItem('activeBranchId');
    set({ activeBranchId: id });
  },
});
