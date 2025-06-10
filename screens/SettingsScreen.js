import React, { useContext, useEffect, useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Switch, List, Text, Divider, Snackbar, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeContext } from '../context/ThemeContext';
import { HabitContext, CompletionContext } from '../App';

export default function SettingsScreen() {
  const theme = useTheme();
  const { isDarkTheme, toggleTheme } = useContext(ThemeContext);
  const { habits, removeHabit } = useContext(HabitContext);
  const { completions } = useContext(CompletionContext);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const notifSetting = await AsyncStorage.getItem('notificationsEnabled');
        setNotificationsEnabled(notifSetting === 'true');
      } catch (error) {
        console.warn('Failed to load notifications setting:', error);
      }
    })();
  }, []);

  const onToggleNotifications = async () => {
    try {
      const newValue = !notificationsEnabled;
      setNotificationsEnabled(newValue);
      await AsyncStorage.setItem('notificationsEnabled', newValue.toString());
      showSnackbar(`Notifications ${newValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings.');
    }
  };

  const onClearHabits = () => {
    Alert.alert(
      'Clear All Habits',
      'Are you sure you want to delete all your habits? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            console.log('Attempting to clear habits...');
            try {
              for (const habit of habits) {
                await removeHabit(habit.id);
              }
              showSnackbar('All habits cleared.');
            } catch (error) {
              console.error('Error during clearing habits:', error);
              Alert.alert('Error', 'Failed to clear habits.');
            }
          },
        },
      ]
    );
  };

  const showSnackbar = (msg) => {
    setSnackbarMsg(msg);
    setSnackbarVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <List.Section title="Appearance">
        <List.Item
          title="Dark Mode"
          description="Toggle between light and dark themes"
          right={() => <Switch value={isDarkTheme} onValueChange={toggleTheme} />}
          onPress={toggleTheme}
        />
      </List.Section>

      <Divider />

      <List.Section title="Notifications">
        <List.Item
          title="Enable Notifications"
          description="Receive habit reminders and updates"
          right={() => (
            <Switch value={notificationsEnabled} onValueChange={onToggleNotifications} />
          )}
          onPress={onToggleNotifications}
        />
      </List.Section>

      <Divider />

      <List.Section title="Data Management">
        <List.Item
          title="Clear All Habits"
          description="Delete all saved habits permanently"
          onPress={onClearHabits}
          left={(props) => <List.Icon {...props} icon="delete" color={theme.colors.error} />}
        />
      </List.Section>

      <Divider />

      <View style={styles.appInfo}>
        <Text variant="bodySmall" style={{ color: theme.colors.disabled }}>
          App Version 1.0.0
        </Text>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMsg}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  appInfo: {
    marginTop: 32,
    alignItems: 'center',
  },
});
