import React, { createContext, useState, useEffect, useMemo } from 'react';
import { MD3DarkTheme, MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

const STORAGE_KEY = '@theme_preference';

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = Appearance.getColorScheme(); // 'light' | 'dark'
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Load saved theme or fallback to system preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedPreference !== null) {
          setIsDarkTheme(storedPreference === 'dark');
        } else {
          setIsDarkTheme(systemColorScheme === 'dark');
        }
      } catch (error) {
        console.warn('Error loading theme preference:', error);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newValue = !isDarkTheme;
      setIsDarkTheme(newValue);
      await AsyncStorage.setItem(STORAGE_KEY, newValue ? 'dark' : 'light');
    } catch (error) {
      console.warn('Error saving theme preference:', error);
    }
  };

  const paperTheme = isDarkTheme ? MD3DarkTheme : MD3LightTheme;

  // Optional: override or customize theme tokens globally
  const customTheme = {
    ...paperTheme,
    colors: {
      ...paperTheme.colors,
      primary: isDarkTheme ? '#90caf9' : '#1976d2', // Blue tones
      accent: isDarkTheme ? '#f48fb1' : '#d81b60',
      background: isDarkTheme ? '#121212' : '#ffffff',
      surface: isDarkTheme ? '#1e1e1e' : '#f5f5f5',
      // Add other color overrides here
    }
  };

  const contextValue = useMemo(() => ({
    isDarkTheme,
    toggleTheme,
    paperTheme: customTheme
  }), [isDarkTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
