import { create } from 'zustand';

export const useUi = create((set) => ({
  sidebarCollapsed: false,
  commandOpen: false,
  notesOpen: false,
  dark: localStorage.getItem('aura_dark') === '1',
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCommand: (commandOpen) => set({ commandOpen }),
  setNotes: (notesOpen) => set({ notesOpen }),
  toggleDark: () =>
    set((s) => {
      const dark = !s.dark;
      localStorage.setItem('aura_dark', dark ? '1' : '0');
      document.documentElement.classList.toggle('dark', dark);
      return { dark };
    }),
}));

if (typeof document !== 'undefined' && localStorage.getItem('aura_dark') === '1') {
  document.documentElement.classList.add('dark');
}
