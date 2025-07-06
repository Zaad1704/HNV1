import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  actualTheme: 'light' | 'dark';
}

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// Export useTheme for backward compatibility
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeState, setThemeState] = useState<ThemeState>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme || 'system';
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const actualTheme = savedTheme === 'system' ? systemTheme : savedTheme;
    
    return {
      theme: savedTheme,
      actualTheme: actualTheme as 'light' | 'dark'
    };
  });

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const actualTheme = newTheme === 'system' ? systemTheme : newTheme;
    
    setThemeState({
      theme: newTheme,
      actualTheme: actualTheme as 'light' | 'dark'
    });
    
    // Apply theme to document
    applyTheme(actualTheme as 'light' | 'dark');
  };

  const toggleTheme = () => {
    const newTheme = themeState.actualTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const applyTheme = (theme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1f2937' : '#ffffff');
    }
  };

  useEffect(() => {
    // Apply initial theme
    applyTheme(themeState.actualTheme);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (themeState.theme === 'system') {
        const newActualTheme = e.matches ? 'dark' : 'light';
        setThemeState(prev => ({
          ...prev,
          actualTheme: newActualTheme
        }));
        applyTheme(newActualTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [themeState.theme]);

  const value = {
    theme: themeState.theme,
    actualTheme: themeState.actualTheme,
    setTheme,
    isDark: themeState.actualTheme === 'dark',
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};