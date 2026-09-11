import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ContactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Validation Error', 'Please fill in both subject and message.');
      return;
    }
    Alert.alert(
      'Message Sent! 📩',
      'Thank you for reaching out. Our support team will get back to you within 24 hours.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="email-fast-outline" size={48} color="#6366F1" />
        </View>
        <Text style={styles.title}>We'd Love to Hear From You</Text>
        <Text style={styles.subtitle}>Have feedback or need assistance? Send us a message directly.</Text>

        <View style={styles.contactInfoRow}>
          <View style={styles.contactCard}>
            <MaterialCommunityIcons name="email-outline" size={22} color="#4F46E5" />
            <Text style={styles.contactCardLabel}>Email Support</Text>
            <Text style={styles.contactCardVal}>support@reliive.com</Text>
          </View>

          <View style={styles.contactCard}>
            <MaterialCommunityIcons name="clock-outline" size={22} color="#4F46E5" />
            <Text style={styles.contactCardLabel}>Response Time</Text>
            <Text style={styles.contactCardVal}>Under 24 Hours</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="What do you need help with?"
            placeholderTextColor="#9CA3AF"
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Type your message here..."
            placeholderTextColor="#9CA3AF"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <MaterialCommunityIcons name="send-outline" size={18} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>Send Message</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 20,
  },
  contactInfoRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  contactCardVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  formCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 10,
  },
  multilineInput: {
    height: 90,
    textAlignVertical: 'top',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
