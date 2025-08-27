import { create } from 'zustand';
import { useEffect } from 'react';

// User store example
type User = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

type UserState = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// UI store example
type UIState = {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  notification: string | null;
  setNotification: (msg: string | null) => void;
};

export const useUIStore = create<UIState>((set, get) => ({
  theme: 'dark', // Default to dark mode
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
  notification: null,
  setNotification: (msg) => set({ notification: msg }),
}));

export const useThemeSync = () => {
  const theme = useUIStore(state => state.theme);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      if (theme === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }, [theme]);
};

// --- Public Settings Store ---
import PublicAPI from '@/api/publicAPI';

type PublicSettings = {
  site_name?: string;
  site_logo?: string;
  site_favicon?: string;
  site_description?: string;
  site_keywords?: string;
  site_author?: string;
  site_email?: string;
  site_phone?: string;
  site_address?: string;
  site_city?: string;
  site_state?: string;
  site_zip?: string;
  site_country?: string;
  site_copyright?: string;
  site_github?: string;
  site_linkedin?: string;
  site_twitter?: string;
  site_instagram?: string;
  site_facebook?: string;
  site_youtube?: string;
  site_tiktok?: string;
  site_pinterest?: string;
  site_reddit?: string;
};

type SettingsState = {
  settings: PublicSettings;
  fetchSettings: () => Promise<void>;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {},
  fetchSettings: async () => {
    try {
      const data = await PublicAPI.settings.list();
      // Get the first (and should be only) settings object
      const settingsObj: PublicSettings = data[0] || {};
      set({ settings: settingsObj });
    } catch {
      // Optionally handle error
      set({ settings: {} });
    }
  },
}));
