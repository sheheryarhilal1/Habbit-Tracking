import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Switch,
  useTheme,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { getHabits } from '../utils/storage';

export default function ProfileScreen() {
  const theme = useTheme();
  const { isDarkTheme, toggleTheme } = useContext(ThemeContext);

  const [avatarUri, setAvatarUri] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [stats, setStats] = useState({
    totalHabits: 0,
    currentStreak: 0,
    completionRate: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const savedProfile = await AsyncStorage.getItem('userProfile');
        if (savedProfile) {
          const { avatarUri, name, bio, email } = JSON.parse(savedProfile);
          if (avatarUri) setAvatarUri(avatarUri);
          if (name) setName(name);
          if (bio) setBio(bio);
          if (email) setEmail(email);
        } else {
          // Fallback defaults if no saved data
          setAvatarUri('https://musabumair.net/wp-content/uploads/2025/01/musab-umair-04-2.png.webp');
          setName('Musab Umair');
          setBio('Software Engineer - musabumair.net');
          setEmail('musab1507@gmail.com');
        }
      } catch (e) {
        console.log('Failed to load profile:', e);
      }
    }

    async function loadStats() {
      const habits = await getHabits();
      const totalHabits = habits?.length || 0;
      const currentStreak = Math.floor(Math.random() * 10) + 1;
      const completionRate = Math.floor(Math.random() * 100);
      setStats({ totalHabits, currentStreak, completionRate });
    }

    loadProfile();
    loadStats();
  }, []);

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'You need to allow access to photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not pick the image.');
    }
  };

  const isEmailValid = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }
    if (!isEmailValid(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    setSaving(true);

    try {
      await AsyncStorage.setItem(
        'userProfile',
        JSON.stringify({
          avatarUri,
          name,
          bio,
          email,
        })
      );

      setTimeout(() => {
        setSaving(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }, 1000);
    } catch (e) {
      setSaving(false);
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <Button
          mode="outlined"
          onPress={pickImage}
          style={{ marginTop: 8 }}
          icon="camera"
          compact
        >
          Change Avatar
        </Button>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          autoCapitalize="words"
        />
        <TextInput
          label="Bio"
          value={bio}
          onChangeText={setBio}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <View style={styles.themeToggleContainer}>
          <Text>Dark Theme</Text>
          <Switch value={isDarkTheme} onValueChange={toggleTheme} />
        </View>

        <Button
          mode="contained"
          onPress={handleSaveProfile}
          loading={saving}
          disabled={saving}
          style={{ marginTop: 16 }}
        >
          Save Profile
        </Button>
      </View>

      <View style={styles.statsContainer}>
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>
          Habit Stats Overview
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
              {stats.totalHabits}
            </Text>
            <Text variant="bodySmall">Total Habits</Text>
          </View>
          <View style={styles.statBox}>
            <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
              {stats.currentStreak} days
            </Text>
            <Text variant="bodySmall">Current Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
              {stats.completionRate}%
            </Text>
            <Text variant="bodySmall">Completion Rate</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ddd',
  },
  form: {
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
});
