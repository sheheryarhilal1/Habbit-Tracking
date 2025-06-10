import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeContext } from '../context/ThemeContext';
import { StatusBar } from 'react-native';

import DrawerNavigator from './DrawerNavigator';
import AddHabitScreen from '../screens/AddHabitScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  const { isDarkTheme } = useContext(ThemeContext);

  return (
    <>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} />
      <Stack.Navigator
        initialRouteName="HomeDrawer"
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: isDarkTheme ? '#1f1f1f' : '#ffffff',
          },
          headerTintColor: isDarkTheme ? '#ffffff' : '#000000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          animation: 'slide_from_right', // Native slide animation
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen
          name="HomeDrawer"
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="AddHabit"
          component={AddHabitScreen}
          options={{
            title: 'Add New Habit',
            animation: 'slide_from_bottom',
          }}
        />

        {/* Future screens can go here */}
        {/* <Stack.Screen name="HabitDetails" component={HabitDetailScreen} /> */}
      </Stack.Navigator>
    </>
  );
}
