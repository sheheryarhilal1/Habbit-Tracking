import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const HABIT_KEY = '@habit_data';
const COMPLETION_KEY = '@habit_completion_data';

//////////////////////////////////////////
// --------- HABIT LOGIC ---------------
//////////////////////////////////////////

// Get all stored habits
export const getHabits = async () => {
  try {
    const data = await AsyncStorage.getItem(HABIT_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to load habits:', err);
    return [];
  }
};

// Save a new habit (with UUID)
export const saveHabit = async (habit) => {
  try {
    const current = await getHabits();
    const newHabit = {
      ...habit,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...current, newHabit];
    await AsyncStorage.setItem(HABIT_KEY, JSON.stringify(updated));
    return newHabit;
  } catch (err) {
    console.error('Error saving habit:', err);
    return null;
  }
};

// Update an existing habit
export const updateHabit = async (updatedHabit) => {
  try {
    const current = await getHabits();
    const modified = current.map(h =>
      h.id === updatedHabit.id
        ? { ...h, ...updatedHabit, updatedAt: new Date().toISOString() }
        : h
    );
    await AsyncStorage.setItem(HABIT_KEY, JSON.stringify(modified));
    return true;
  } catch (err) {
    console.error('Error updating habit:', err);
    return false;
  }
};

// Delete a habit and its completion history
export const deleteHabit = async (habitId) => {
  try {
    const current = await getHabits();
    const filtered = current.filter(h => h.id !== habitId);
    await AsyncStorage.setItem(HABIT_KEY, JSON.stringify(filtered));

    const completions = await getHabitCompletions();
    delete completions[habitId];
    await AsyncStorage.setItem(COMPLETION_KEY, JSON.stringify(completions));

    return true;
  } catch (err) {
    console.error('Error deleting habit:', err);
    return false;
  }
};

// Clear all habit data and completion data
export const clearAllHabitData = async () => {
  try {
    await AsyncStorage.removeItem(HABIT_KEY);
    await AsyncStorage.removeItem(COMPLETION_KEY);
    console.log('All habit and completion data cleared.');
    return true;
  } catch (err) {
    console.error('Error clearing all habit data:', err);
    return false;
  }
};

//////////////////////////////////////////
// ------ COMPLETION TRACKING ----------
//////////////////////////////////////////

export const getHabitCompletions = async () => {
  try {
    const data = await AsyncStorage.getItem(COMPLETION_KEY);
    return data ? JSON.parse(data) : {};
  } catch (err) {
    console.error('Error fetching completions:', err);
    return {};
  }
};

export const toggleHabitCompletion = async (habitId, date) => {
  try {
    const completions = await getHabitCompletions();
    const habitCompletion = completions[habitId] || {};

    habitCompletion[date] = !habitCompletion[date];
    completions[habitId] = habitCompletion;

    await AsyncStorage.setItem(COMPLETION_KEY, JSON.stringify(completions));
    return habitCompletion[date];
  } catch (err) {
    console.error('Error toggling completion:', err);
    return false;
  }
};

export const getHabitStats = async (habitId) => {
  try {
    const completions = await getHabitCompletions();
    const completedDays = completions[habitId] || {};
    const totalCompleted = Object.values(completedDays).filter(Boolean).length;

    return {
      totalCompleted,
      completedDays,
    };
  } catch (err) {
    console.error('Error getting habit stats:', err);
    return {
      totalCompleted: 0,
      completedDays: {},
    };
  }
};

//////////////////////////////////////////
// --------- EXTRA UTILITIES -----------
//////////////////////////////////////////

export const reorderHabits = async (newOrder) => {
  try {
    await AsyncStorage.setItem(HABIT_KEY, JSON.stringify(newOrder));
    return true;
  } catch (err) {
    console.error('Error reordering habits:', err);
    return false;
  }
};

export const searchHabits = async (keyword) => {
  try {
    const habits = await getHabits();
    return habits.filter(habit =>
      habit.title.toLowerCase().includes(keyword.toLowerCase())
    );
  } catch (err) {
    console.error('Error searching habits:', err);
    return [];
  }
};
