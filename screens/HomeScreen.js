import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity
} from 'react-native';
import {
  Text,
  FAB,
  ActivityIndicator,
  useTheme,
  IconButton,
  Snackbar
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import HabitItem from '../components/HabitItem';
import {
  getHabits,
  deleteHabit,
  updateHabitStatus
} from '../utils/storage';

export default function HomeScreen({ navigation }) {
  const theme = useTheme();
  const [habits, setHabits] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const showSnackbar = (message) => {
    setSnackbar({ visible: true, message });
  };

  const hideSnackbar = () => {
    setSnackbar({ visible: false, message: '' });
  };

  const loadHabits = async () => {
    setRefreshing(true);
    const data = await getHabits();
    setHabits(data || []);
    setRefreshing(false);
    setLoading(false);
  };

  useEffect(() => {
    loadHabits();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [])
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleDelete = async (habitId) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habitId);
              await loadHabits(); // Reload habits after deletion
              showSnackbar('Habit deleted');
            } catch (error) {
              console.error('Error deleting habit:', error);
              showSnackbar('Failed to delete habit. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleEdit = (habit) => {
    navigation.navigate('AddHabit', { habit, isEditing: true }); // Pass existing habit and editing flag
  };

  const handleToggleComplete = async (habitId, completed) => {
    await updateHabitStatus(habitId, completed);
    await loadHabits();
    showSnackbar(completed ? 'Habit completed!' : 'Marked as incomplete');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 8 }}>
        {getGreeting()}, here’s your habit list:
      </Text>

      {loading ? (
        <ActivityIndicator animating={true} size="large" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadHabits}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {habits.length === 0 ? (
            <View style={{ marginTop: 32, alignItems: 'center' }}>
              <Text variant="titleMedium" style={{ color: theme.colors.outline }}>
                No habits found. Start by adding one!
              </Text>
            </View>
          ) : (
            habits.map((habit) => (
              <View
                key={habit.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  backgroundColor: theme.colors.surface,
                  borderRadius: 8,
                  padding: 10,
                  elevation: 2,
                }}
              >
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => handleToggleComplete(habit.id, !habit.completed)}
                >
                  <HabitItem habit={habit} />
                </TouchableOpacity>
                <IconButton icon="pencil" onPress={() => handleEdit(habit)} />
                <IconButton icon="delete" onPress={() => handleDelete(habit.id)} />
              </View>
            ))
          )}
        </ScrollView>
      )}

      <FAB
        icon="plus"
        label="Add"
        style={{
          position: 'absolute',
          right: 16,
          bottom: 20,
          backgroundColor: theme.colors.primary,
        }}
        onPress={() => navigation.navigate('AddHabit')}
      />

      <Snackbar
        visible={snackbar.visible}
        onDismiss={hideSnackbar}
        duration={3000}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}
