import React, { type ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useUIStore, useThemeSync, useSettingsStore } from '@/store';

interface ClientLayoutProps {
  children: ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  useThemeSync();
  const theme = useUIStore(state => state.theme);
  const { settings, fetchSettings } = useSettingsStore();

  React.useEffect(() => {
    if (!settings.site_name) {
      fetchSettings();
    }
  }, [settings.site_name, fetchSettings]);

  // Apply custom CSS variables from settings
  React.useEffect(() => {
    // Note: primaryColor is not part of the current settings model
    // This functionality can be added later if needed
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground" data-theme={theme}>
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;