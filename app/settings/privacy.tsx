import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="shield-lock-outline" size={48} color="#6366F1" />
        </View>
        <Text style={styles.title}>Your Privacy Matters</Text>
        <Text style={styles.subtitle}>
          At Reliive, we protect your personal information and ensure full transparency over how your profile and activity data is shared.
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <MaterialCommunityIcons name="eye-outline" size={22} color="#4F46E5" />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Profile Visibility</Text>
              <Text style={styles.rowDesc}>Only registered club members can view your full interest profile.</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <MaterialCommunityIcons name="map-marker-off-outline" size={22} color="#4F46E5" />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Location Privacy</Text>
              <Text style={styles.rowDesc}>Your exact home location is never published. Only city and neighborhood are shown.</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <MaterialCommunityIcons name="database-eye-outline" size={22} color="#4F46E5" />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Data Control</Text>
              <Text style={styles.rowDesc}>You can request data exports or account deletion anytime from Settings.</Text>
            </View>
          </View>
        </View>

        <Text style={styles.demoNote}>💡 This is a preview demo screen. Advanced privacy toggles will be available in future updates.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 12,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  rowDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  demoNote: {
    marginTop: 24,
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
