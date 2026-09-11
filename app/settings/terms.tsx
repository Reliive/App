import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TermsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="file-document-outline" size={48} color="#6366F1" />
        </View>
        <Text style={styles.title}>Terms of Service & Policies</Text>
        <Text style={styles.subtitle}>Last updated: September 2026</Text>

        <View style={styles.card}>
          <Text style={styles.sectionHeading}>1. Acceptance of Terms</Text>
          <Text style={styles.bodyText}>
            By accessing or using Reliive, you agree to comply with our community standards, guidelines, and safety policies.
          </Text>

          <Text style={styles.sectionHeading}>2. Community Guidelines</Text>
          <Text style={styles.bodyText}>
            Reliive is built for active adults to form respectful, trusted social circles. Harassment, hate speech, or non-consensual behavior will result in instant account suspension.
          </Text>

          <Text style={styles.sectionHeading}>3. Event Hosting & Refunds</Text>
          <Text style={styles.bodyText}>
            Event hosts are responsible for maintaining accurate event descriptions and venue information. Paid ticket refunds follow the organizer's cancellation policy.
          </Text>

          <Text style={styles.sectionHeading}>4. Privacy & Data Handling</Text>
          <Text style={styles.bodyText}>
            We never sell your personal contact information to third parties. Data is encrypted and used exclusively to power your local community experience.
          </Text>
        </View>

        <Text style={styles.demoNote}>💡 This is a demo template preview of the Reliive Terms & Privacy agreement.</Text>
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
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  demoNote: {
    marginTop: 24,
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
