import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Default to light mode (false) always
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      console.log('Initial theme from localStorage:', savedTheme);
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      // Default to light mode instead of system preference
      return false;
    }
    return false;
  });

  useEffect(() => {
    // Apply theme class to document
    const root = document.documentElement;
    const body = document.body;
    console.log('Applying theme:', isDark ? 'dark' : 'light');
    
    if (isDark) {
      root.classList.add('dark');
      body.classList.add('dark');
      root.classList.remove('light');
      body.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.classList.add('light');
      body.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
    
    // Force a re-render by updating a data attribute
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    console.log('Document classes:', root.classList.toString());
    console.log('Body classes:', body.classList.toString());
  }, [isDark]);

  // Ensure theme is applied on initial load
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    console.log('Initial mount - applying theme:', isDark ? 'dark' : 'light');
    
    if (isDark) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    body.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    setIsDark(prevIsDark => {
      const newIsDark = !prevIsDark;
      console.log('Toggling theme:', { from: prevIsDark, to: newIsDark });
      
      // Force immediate update
      const root = document.documentElement;
      const body = document.body;
      
      if (newIsDark) {
        root.classList.add('dark');
        body.classList.add('dark');
        root.classList.remove('light');
        body.classList.remove('light');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
        root.classList.add('light');
        body.classList.add('light');
        localStorage.setItem('theme', 'light');
      }
      
      return newIsDark;
    });
  };

  const resetToLight = () => {
    console.log('Resetting to light mode');
    localStorage.removeItem('theme');
    setIsDark(false);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, resetToLight }}>
      {children}
    </ThemeContext.Provider>
  );
};
