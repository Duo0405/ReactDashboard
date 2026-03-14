import { create } from 'zustand'

interface AppState {
    sidebarOpen: boolean
    toggleSidebar: () => void
    setSidebar: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
    sidebarOpen: false,
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    setSidebar: (open) => set({ sidebarOpen: open }),
}))
