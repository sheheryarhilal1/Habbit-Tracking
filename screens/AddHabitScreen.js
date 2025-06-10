import React, { useState, useEffect, useContext } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import {
  TextInput,
  Button,
  HelperText,
  Snackbar,
  Text,
  SegmentedButtons,
  useTheme,
} from 'react-native-paper';
import { HabitContext } from '../App'; // Import HabitContext for editing
import { saveHabit, updateHabit } from '../utils/storage'; // Import updateHabit function

export default function AddHabitScreen({ navigation, route }) {
  const { habit, isEditing } = route.params || {}; // Get habit and editing flag
  const [title, setTitle] = useState(habit?.title || ''); // Set initial title if editing
  const [frequency, setFrequency] = useState(habit?.frequency || 'daily'); // Set initial frequency if editing
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const theme = useTheme();

  const handleSave = async () => {
    if (!title.trim()) {
      setSnackbarMsg('Please enter a habit title.');
      setSnackbarVisible(true);
      return;
    }

    setSubmitting(true);

    try {
      if (isEditing) {
        await updateHabit({ ...habit, title: title.trim(), frequency }); // Update existing habit
        setSnackbarMsg('Habit updated successfully!');
      } else {
        await saveHabit({ title: title.trim(), frequency }); // Save new habit
        setSnackbarMsg('Habit added successfully!');
      }
      setSnackbarVisible(true);
      setTitle('');
      setFrequency('daily');

      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      setSnackbarMsg('Something went wrong. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = title.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, padding: 16, backgroundColor: theme.colors.background }}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>
          {isEditing ? 'Edit Habit' : 'Create a New Habit'}
        </Text>

        <TextInput
          label="Habit Title"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={{ marginBottom: 8 }}
          autoFocus
        />
        <HelperText type={title.trim() ? 'info' : 'error'} visible={true}>
          {title.trim() ? 'Give your habit a clear name' : 'Title is required'}
        </HelperText>

        <Text style={{ marginTop: 12, marginBottom: 4 }}>Frequency</Text>
        <SegmentedButtons
          value={frequency}
          onValueChange={setFrequency}
          buttons={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'custom', label: 'Custom' },
          ]}
          style={{ marginBottom: 24 }}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          disabled={!isFormValid || submitting}
          loading={submitting}
        >
          {isEditing ? 'Update Habit' : 'Save Habit'}
        </Button>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2000}
          action={{
            label: 'OK',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMsg}
        </Snackbar>
      </View>
    </KeyboardAvoidingView>
  );
}
