import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Roboto_400Regular } from '@expo-google-fonts/roboto';
import 'react-native-get-random-values';

import MainNavigator from './navigation/MainNavigator';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';

import {
  getHabits,
  getHabitCompletions,
  saveHabit,
  updateHabit,
  deleteHabit,
  toggleHabitCompletion,
} from './utils/storage';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Contexts for global state
export const HabitContext = React.createContext();
export const CompletionContext = React.createContext();

export default function App() {
  return (
    <ThemeProvider>
      <AppInitializer />
    </ThemeProvider>
  );
}

function AppInitializer() {
  const { paperTheme } = useContext(ThemeContext);
  const [appIsReady, setAppIsReady] = useState(false);
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState({});

  // Load fonts using Expo Google Fonts
  const [fontsLoaded] = useFonts({
    Roboto: Roboto_400Regular,
  });

  useEffect(() => {
    async function prepare() {
      try {
        const storedHabits = await getHabits();
        const storedCompletions = await getHabitCompletions();
        setHabits(storedHabits);
        setCompletions(storedCompletions);
        await new Promise(res => setTimeout(res, 200)); // Simulated delay
      } catch (err) {
        console.warn('App initialization error:', err);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    if (fontsLoaded) {
      prepare();
    }
  }, [fontsLoaded]);

  // --- Habit Logic Functions ---
  const addHabit = async (habit) => {
    const newHabit = await saveHabit(habit);
    if (newHabit) {
      setHabits(prev => [...prev, newHabit]);
    }
  };

  const editHabit = async (updatedHabit) => {
    await updateHabit(updatedHabit);
    setHabits(prev =>
      prev.map(habit =>
        habit.id === updatedHabit.id ? { ...habit, ...updatedHabit } : habit
      )
    );
  };

  const removeHabit = async (habitId) => {
    await deleteHabit(habitId);
    setHabits(prev => prev.filter(habit => habit.id !== habitId));

    // Remove completions for deleted habit
    setCompletions(prev => {
      const updated = { ...prev };
      delete updated[habitId];
      return updated;
    });
  };

  // --- Completion Toggle Logic ---
  const toggleCompletion = async (habitId, date) => {
    const newStatus = await toggleHabitCompletion(habitId, date);
    setCompletions(prev => ({
      ...prev,
      [habitId]: {
        ...(prev[habitId] || {}),
        [date]: newStatus,
      },
    }));
  };

  if (!appIsReady || !fontsLoaded) return null;

  return (
    <HabitContext.Provider value={{ habits, addHabit, editHabit, removeHabit }}>
      <CompletionContext.Provider value={{ completions, toggleCompletion }}>
        <PaperProvider theme={paperTheme}>
          <NavigationContainer theme={paperTheme}>
            <MainNavigator />
          </NavigationContainer>
        </PaperProvider>
      </CompletionContext.Provider>
    </HabitContext.Provider>
  );
}
