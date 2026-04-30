import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert, TextInput, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';

export default function CreateEventDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // State for new fields
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [capacity, setCapacity] = useState(10);
  const [eventType, setEventType] = useState<'free' | 'paid'>('free');
  
  // Accessibility State
  const [isWheelchairAccessible, setIsWheelchairAccessible] = useState(false);
  const [hasAudioDescriptions, setHasAudioDescriptions] = useState(false);

  // Photo Picker Handler
  const pickImage = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    if (photos.length >= 4) {
      Alert.alert('Limit Reached', 'You can only add up to 4 photos.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handlePreview = () => {
    if (!description.trim()) {
      Alert.alert('Required Field', 'Please add an event description.');
      return;
    }

    // Build accessibility notes
    let accNotes = [];
    if (isWheelchairAccessible) accNotes.push('Wheelchair accessible');
    if (hasAudioDescriptions) accNotes.push('Audio descriptions available');
    const accessibility_notes = accNotes.join(', ');

    // Merge previous params with new ones
    const finalParams = {
      ...params,
      description,
      photos: JSON.stringify(photos), // pass array as string
      capacity: capacity.toString(),
      event_type: eventType,
      accessibility_notes
    };

    router.push({
      pathname: '/events/preview',
      params: finalParams
    });
  };

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Join us for a relaxed morning of coffee and book discussions. We'll be talking about..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Photos */}
          <View style={styles.section}>
            <Text style={styles.label}>Add Photos</Text>
            <View style={styles.photoGrid}>
              {photos.map((uri, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri }} style={styles.photo} />
                  <TouchableOpacity style={styles.removePhotoBtn} onPress={() => removePhoto(index)}>
                    <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              
              {photos.length < 4 && (
                <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImage}>
                  <MaterialCommunityIcons name="camera-plus-outline" size={24} color="#6B7280" />
                  <Text style={styles.addPhotoText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Capacity */}
          <View style={styles.section}>
            <Text style={styles.label}>Capacity</Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity 
                style={styles.stepperBtn} 
                onPress={() => setCapacity(Math.max(1, capacity - 1))}
              >
                <MaterialCommunityIcons name="minus" size={20} color="#4F46E5" />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{capacity} people</Text>
              <TouchableOpacity 
                style={styles.stepperBtn} 
                onPress={() => setCapacity(capacity + 1)}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Event Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Event Type</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleBtn, eventType === 'free' && styles.toggleBtnActive]} 
                onPress={() => setEventType('free')}
              >
                <Text style={[styles.toggleText, eventType === 'free' && styles.toggleTextActive]}>FREE</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, eventType === 'paid' && styles.toggleBtnActive]} 
                onPress={() => setEventType('paid')}
              >
                <Text style={[styles.toggleText, eventType === 'paid' && styles.toggleTextActive]}>PAID</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Accessibility */}
          <View style={styles.section}>
            <Text style={styles.label}>Accessibility</Text>
            
            <TouchableOpacity 
              style={styles.checkboxRow} 
              activeOpacity={0.7}
              onPress={() => setIsWheelchairAccessible(!isWheelchairAccessible)}
            >
              <MaterialCommunityIcons 
                name={isWheelchairAccessible ? "checkbox-marked" : "checkbox-blank-outline"} 
                size={24} 
                color={isWheelchairAccessible ? "#4F46E5" : "#9CA3AF"} 
              />
              <Text style={styles.checkboxLabel}>Wheelchair accessible</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checkboxRow} 
              activeOpacity={0.7}
              onPress={() => setHasAudioDescriptions(!hasAudioDescriptions)}
            >
              <MaterialCommunityIcons 
                name={hasAudioDescriptions ? "checkbox-marked" : "checkbox-blank-outline"} 
                size={24} 
                color={hasAudioDescriptions ? "#4F46E5" : "#9CA3AF"} 
              />
              <Text style={styles.checkboxLabel}>Audio descriptions available</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Preview Event →"
            onPress={handlePreview}
            variant="primary"
            style={styles.nextButton}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    minHeight: 120,
    padding: 12,
  },
  textArea: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 8,
    backgroundColor: '#F9FAFB',
  },
  stepperBtn: {
    padding: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  toggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#4F46E5',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 15,
    color: '#374151',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    width: '100%',
  },
});
