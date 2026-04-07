import { create } from "zustand";

interface AppState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  globalSearch: "",
  setGlobalSearch: (search: string) => set({ globalSearch: search }),
}));
