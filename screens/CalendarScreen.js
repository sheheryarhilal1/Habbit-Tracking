import React, { useEffect, useState } from 'react';
import { View, FlatList, Modal } from 'react-native';
import { Text, Card, useTheme, Divider, Portal, Button } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { getHabits } from '../utils/storage';

// Dummy logic: every habit is "completed" on today's date for demo
const simulateHabitHistory = async () => {
  const today = new Date().toISOString().split('T')[0];
  const habits = await getHabits();
  return {
    [today]: {
      marked: true,
      dotColor: '#00f',
      habits: habits || [],
    },
  };
};

export default function CalendarScreen() {
  const theme = useTheme();
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [habitList, setHabitList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadMarkedDates();
  }, []);

  const loadMarkedDates = async () => {
    const history = await simulateHabitHistory();
    setMarkedDates(history);
  };

  const handleDayPress = (day) => {
    const dateStr = day.dateString;
    const dayData = markedDates[dateStr];

    setSelectedDate(dateStr);
    setHabitList(dayData?.habits || []);
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: theme.colors.background }}>
      <Text variant="titleLarge" style={{ marginBottom: 16 }}>
        Habit Calendar
      </Text>

      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          ...markedDates,
          ...(selectedDate && {
            [selectedDate]: {
              ...(markedDates[selectedDate] || {}),
              selected: true,
              selectedColor: theme.colors.primary,
            },
          }),
        }}
        theme={{
          todayTextColor: theme.colors.primary,
          arrowColor: theme.colors.primary,
          selectedDayBackgroundColor: theme.colors.primary,
          dotColor: theme.colors.primary,
        }}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.4)',
              justifyContent: 'flex-end',
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.surface,
                padding: 20,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                maxHeight: '60%',
              }}
            >
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                Habits on {selectedDate}
              </Text>
              <Divider style={{ marginBottom: 12 }} />

              {habitList.length > 0 ? (
                <FlatList
                  data={habitList}
                  keyExtractor={(item, index) => item.title + index}
                  renderItem={({ item }) => (
                    <Card style={{ marginBottom: 10 }}>
                      <Card.Title title={item.title} subtitle={`Frequency: ${item.frequency || 'N/A'}`} />
                    </Card>
                  )}
                />
              ) : (
                <Text style={{ marginTop: 16, color: theme.colors.outline }}>
                  No habits completed on this day.
                </Text>
              )}

              <Button
                mode="text"
                onPress={() => setModalVisible(false)}
                style={{ marginTop: 16 }}
              >
                Close
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}
