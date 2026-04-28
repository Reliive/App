import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { UserService } from '@/services/user.service';
import LocationPicker from '@/components/LocationPicker';
import type { LocationData } from '@/services/location.service';

export default function MicroprofileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState((params.name as string) || '');
  const [locationSet, setLocationSet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [accessibility, setAccessibility] = useState({
    wheelchair: false,
    largeText: false,
    audioDesc: false,
  });

  const handleImagePicker = () => {
    // TODO: Implement image picker using expo-image-picker
    Alert.alert('Image Picker', 'Image picker integration coming soon');
  };

  const toggleAccessibility = (key: keyof typeof accessibility) => {
    setAccessibility(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLocationSet = (location: LocationData) => {
    // Location is already saved to backend by LocationPicker component
    setLocationSet(true);
    setError('');
  };

  const handleFinishSetup = async () => {
    if (!locationSet) {
      setError('Please set your location');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let parsedInterests: string[] = [];
      try {
        if (params.interests) {
          parsedInterests = JSON.parse(params.interests as string);
        }
      } catch (e) {}

      await UserService.updateProfile({
        name: displayName,
        accessibility_prefs: accessibility,
        interests: parsedInterests,
      });

      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Profile</Text>
        </View>

        {/* Image Uploader Section */}
        <View style={styles.imageSection}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <TouchableOpacity onPress={handleImagePicker} style={styles.imageUploadButton}>
                <MaterialCommunityIcons name="camera" size={36} color="#4F46E5" />
                <Text style={styles.imageUploadText}>Add Pic</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.optionalText}>(Optional)</Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={18} color="#E74C3C" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Form Fields Section */}
        <View style={styles.formSection}>
          {/* Display Name Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Display Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter display name"
                value={displayName}
                onChangeText={(text) => {
                  setDisplayName(text);
                  if (error) setError('');
                }}
                placeholderTextColor="#9CA3AF"
              />
              {displayName ? (
                <TouchableOpacity onPress={() => setDisplayName('')}>
                  <MaterialCommunityIcons name="close" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Location — GPS-based picker (replaces old dropdown) */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Location</Text>
            <LocationPicker
              onLocationSet={handleLocationSet}
              errorMessage={!locationSet && error.includes('location') ? error : undefined}
            />
          </View>
        </View>

        {/* Accessibility Section */}
        <View style={styles.accessibilitySection}>
          <Text style={styles.sectionLabel}>Accessibility Preferences</Text>

          {[
            { key: 'wheelchair', label: 'Wheelchair accessible' },
            { key: 'largeText', label: 'Large text' },
            { key: 'audioDesc', label: 'Audio descriptions' },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.checkboxWrapper}
              onPress={() => toggleAccessibility(item.key as keyof typeof accessibility)}
            >
              <View
                style={[
                  styles.checkbox,
                  accessibility[item.key as keyof typeof accessibility] && styles.checkboxChecked,
                ]}
              >
                {accessibility[item.key as keyof typeof accessibility] ? (
                  <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                ) : null}
              </View>
              <Text style={styles.checkboxLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Finish Setup Button */}
      <View style={styles.footer}>
        <Button
          title={loading ? 'Setting up...' : 'Finish Setup'}
          onPress={handleFinishSetup}
          isLoading={loading}
          disabled={loading || !locationSet}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginLeft: -4,
  },
  imageSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#F9FAFB',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imageUploadButton: {
    alignItems: 'center',
  },
  imageUploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginTop: 8,
  },
  optionalText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginLeft: 8,
    flex: 1,
  },
  formSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  accessibilitySection: {
    marginHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});
