import { View, ActivityIndicator } from 'react-native';

export default function IndexScreen() {
  // The useProtectedRoute hook in _layout.tsx will automatically
  // redirect the user to either /auth/login or /(tabs) based on their session.
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );
}
