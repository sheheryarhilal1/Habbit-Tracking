import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Checkbox, Text, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';

// Helper to generate a unique key for habit checked state by date
const getHabitStorageKey = (habitId, date) => `habitChecked-${habitId}-${date}`;

export default function HabitItem({ habit, onProgressChange }) {
  const theme = useTheme();
  const { isDarkTheme } = useContext(ThemeContext);

  // Use today's date string as YYYY-MM-DD for per-day tracking
  const today = new Date().toISOString().split('T')[0];

  const [checked, setChecked] = useState(false);
  const [animValue] = useState(new Animated.Value(checked ? 1 : 0));
  const [loading, setLoading] = useState(true);

  // Load checked state from AsyncStorage for today's date on mount
  useEffect(() => {
    (async () => {
      try {
        const savedValue = await AsyncStorage.getItem(getHabitStorageKey(habit.id, today));
        const isChecked = savedValue === 'true';
        setChecked(isChecked);
        animValue.setValue(isChecked ? 1 : 0);
      } catch (error) {
        console.warn('Failed to load habit checked state', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [habit.id, today]);

  // Animate checkbox toggle
  useEffect(() => {
    Animated.timing(animValue, {
      toValue: checked ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [checked, animValue]);

  // Handle checkbox toggle and save to AsyncStorage
  const onToggleCheckbox = async () => {
    try {
      const newChecked = !checked;
      setChecked(newChecked);
      await AsyncStorage.setItem(getHabitStorageKey(habit.id, today), newChecked.toString());
      if (onProgressChange) onProgressChange(habit.id, newChecked);
    } catch (error) {
      console.warn('Error saving habit checked state', error);
    }
  };

  if (loading) {
    // Optionally, show a placeholder or loader while loading state
    return <View style={[styles.container, { opacity: 0.5 }]}>
      <Checkbox status="unchecked" disabled />
      <Text style={[styles.title, { color: theme.colors.disabled }]}>Loading...</Text>
    </View>;
  }

  return (
    <TouchableOpacity
      onPress={onToggleCheckbox}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={`Mark habit "${habit.title}" as ${checked ? 'completed' : 'incomplete'}`}
      style={[styles.container, { backgroundColor: isDarkTheme ? theme.colors.surfaceVariant : '#f8f8f8' }]}
      activeOpacity={0.7}
    >
      <Animated.View style={{ opacity: animValue }}>
        <Checkbox
          status={checked ? 'checked' : 'unchecked'}
          onPress={onToggleCheckbox}
          color={theme.colors.primary}
        />
      </Animated.View>
      <View style={styles.textContainer}>
        <Text
          variant="titleMedium"
          style={[
            styles.title,
            checked && { textDecorationLine: 'line-through', color: theme.colors.disabled }
          ]}
        >
          {habit.title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
          {habit.createdAt
            ? `Created: ${new Date(habit.createdAt).toLocaleDateString()}`
            : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    // subtle shadow for elevated look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    marginLeft: 12,
    flexShrink: 1,
  },
  textContainer: {
    flexDirection: 'column',
    flex: 1,
  },
});
