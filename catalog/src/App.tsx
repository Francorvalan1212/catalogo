import React, { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { PublicCatalog } from './components/PublicCatalog';
import { initializeSampleData } from './utils/storage';

function App() {
  const { isAuthenticated, isAdmin, login, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    initializeSampleData();
  }, []);

  if (isAuthenticated && isAdmin) {
    return <AdminPanel onLogout={logout} isDark={isDark} onToggleTheme={toggleTheme} />;
  }

  if (!isAuthenticated) {
    // Show login option for admin
    const urlParams = new URLSearchParams(window.location.search);
    const showLogin = urlParams.get('admin') === 'true';
    
    if (showLogin) {
      return <Login onLogin={login} isDark={isDark} onToggleTheme={toggleTheme} />;
    }
  }

  return <PublicCatalog isDark={isDark} onToggleTheme={toggleTheme} />;
}

export default App;