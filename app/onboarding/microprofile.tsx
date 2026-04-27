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

const NEIGHBORHOODS = [
  { label: 'Downtown', value: 'downtown' },
  { label: 'Uptown', value: 'uptown' },
  { label: 'Midtown', value: 'midtown' },
  { label: 'Suburb', value: 'suburb' },
  { label: 'Other', value: 'other' },
];

export default function MicroprofileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState((params.name as string) || '');
  const [neighborhood, setNeighborhood] = useState('');
  const [showNeighborhoodDropdown, setShowNeighborhoodDropdown] = useState(false);
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

  const handleSelectNeighborhood = (value: string) => {
    setNeighborhood(value);
    setShowNeighborhoodDropdown(false);
    setError('');
  };

  const handleFinishSetup = async () => {
    if (!neighborhood) {
      setError('Please select a neighborhood');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Call API to update profile
      // await userService.updateProfile({
      //   name: displayName,
      //   neighborhood,
      //   accessibility_prefs: accessibility,
      // });

      Alert.alert('Success', 'Profile completed successfully!');
      // Navigate to home or next screen
      // router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const selectedNeighborhoodLabel = NEIGHBORHOODS.find(
    n => n.value === neighborhood
  )?.label || 'Select Neighborhood';

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

          {/* Neighborhood Dropdown */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Neighborhood</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowNeighborhoodDropdown(!showNeighborhoodDropdown)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !neighborhood && styles.dropdownPlaceholder,
                ]}
              >
                {selectedNeighborhoodLabel}
              </Text>
              <MaterialCommunityIcons
                name={showNeighborhoodDropdown ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {showNeighborhoodDropdown ? (
              <View style={styles.dropdownMenu}>
                {NEIGHBORHOODS.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.dropdownItem,
                      neighborhood === item.value && styles.dropdownItemSelected,
                    ]}
                    onPress={() => handleSelectNeighborhood(item.value)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        neighborhood === item.value && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
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
          title="Finish Setup"
          onPress={handleFinishSetup}
          loading={loading}
          disabled={loading || !neighborhood}
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
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 4,
    zIndex: 10,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemSelected: {
    backgroundColor: '#EEF2FF',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#111827',
  },
  dropdownItemTextSelected: {
    color: '#4F46E5',
    fontWeight: '600',
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
