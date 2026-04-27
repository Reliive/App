import { StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';

export default function HomeScreen() {
  // Redirect to login page as the entry point
  return <Redirect href="/auth/login" />;
}


