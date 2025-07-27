import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  isSidebarOpen: boolean;
  isDarkMode: boolean;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      isDarkMode: false,
      
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      openSidebar: () => set({ isSidebarOpen: true }),
      closeSidebar: () => set({ isSidebarOpen: false }),
    }),
    {
      name: 'ui-storage',
    }
  )
);

export default useUIStore;