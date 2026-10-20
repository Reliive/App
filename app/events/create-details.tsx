import React, { useState } from 'react';
import { Text, View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { styles } from '@/styles/create-details.styles';
import { EventDetailsOptions } from '@/components/events/EventDetailsOptions';
import { DESCRIPTION_MAX_LENGTH, MAX_EVENT_PHOTOS } from '@/constants/event';


export default function CreateEventDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // State for new fields
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
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

    if (photos.length >= MAX_EVENT_PHOTOS) {
      Alert.alert('Limit Reached', `You can only add up to ${MAX_EVENT_PHOTOS} photos.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
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
      setDescriptionError('Description is required.');
      return;
    }
    setDescriptionError('');

    // Build accessibility notes
    const accessibility_notes = [
      isWheelchairAccessible ? 'Wheelchair accessible' : '',
      hasAudioDescriptions ? 'Audio descriptions available' : '',
    ].filter(Boolean).join(', ');

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
            <Text style={styles.label}>Description<Text style={styles.required}>*</Text></Text>
            <View style={[styles.textAreaContainer, descriptionError ? styles.inputError : null]}>
              <TextInput
                style={styles.textArea}
                placeholder="Join us for a relaxed morning of coffee and book discussions. We'll be talking about..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                value={description}
                onChangeText={(value) => {
                  setDescription(value);
                  if (value.trim()) setDescriptionError('');
                }}
                maxLength={DESCRIPTION_MAX_LENGTH}
                textAlignVertical="top"
              />
            </View>
            <View style={styles.descriptionMeta}>
              <Text style={descriptionError ? styles.errorText : styles.helperText}>
                {descriptionError || 'Tell people what to expect.'}
              </Text>
              <Text style={styles.helperText}>{description.length}/{DESCRIPTION_MAX_LENGTH}</Text>
            </View>
          </View>

          <EventDetailsOptions
            photos={photos}
            capacity={capacity}
            eventType={eventType}
            isWheelchairAccessible={isWheelchairAccessible}
            hasAudioDescriptions={hasAudioDescriptions}
            onAddPhoto={pickImage}
            onRemovePhoto={removePhoto}
            onCapacityChange={(change) => setCapacity((current) => Math.max(1, current + change))}
            onEventTypeChange={setEventType}
            onWheelchairAccessibilityChange={() => setIsWheelchairAccessible((current) => !current)}
            onAudioDescriptionsChange={() => setHasAudioDescriptions((current) => !current)}
          />

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
