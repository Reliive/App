import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '@/styles/create-details.styles';
import { MAX_EVENT_PHOTOS } from '@/constants/event';

interface EventDetailsOptionsProps {
  photos: string[];
  capacity: number;
  eventType: 'free' | 'paid';
  isWheelchairAccessible: boolean;
  hasAudioDescriptions: boolean;
  onAddPhoto: () => void;
  onRemovePhoto: (index: number) => void;
  onCapacityChange: (change: number) => void;
  onEventTypeChange: (eventType: 'free' | 'paid') => void;
  onWheelchairAccessibilityChange: () => void;
  onAudioDescriptionsChange: () => void;
}

/**
 * Renders the optional media, capacity, ticketing, and accessibility controls
 * so the event-details screen remains focused on description submission.
 */
export function EventDetailsOptions({
  photos,
  capacity,
  eventType,
  isWheelchairAccessible,
  hasAudioDescriptions,
  onAddPhoto,
  onRemovePhoto,
  onCapacityChange,
  onEventTypeChange,
  onWheelchairAccessibilityChange,
  onAudioDescriptionsChange,
}: EventDetailsOptionsProps) {
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.label}>Add Photos</Text>
        <View style={styles.photoGrid}>
          {photos.map((uri, index) => (
            <View key={uri} style={styles.photoContainer}>
              <Image source={{ uri }} style={styles.photo} />
              <TouchableOpacity style={styles.removePhotoBtn} onPress={() => onRemovePhoto(index)} accessibilityRole="button" accessibilityLabel={`Remove photo ${index + 1}`}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < MAX_EVENT_PHOTOS && (
            <TouchableOpacity style={styles.addPhotoBtn} onPress={onAddPhoto} accessibilityRole="button" accessibilityLabel="Add event photo">
              <MaterialCommunityIcons name="camera-plus-outline" size={24} color="#6B7280" />
              <Text style={styles.addPhotoText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Capacity</Text>
        <View style={styles.stepperContainer}>
          <TouchableOpacity style={styles.stepperBtn} onPress={() => onCapacityChange(-1)} accessibilityRole="button" accessibilityLabel="Decrease capacity">
            <MaterialCommunityIcons name="minus" size={20} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{capacity} people</Text>
          <TouchableOpacity style={styles.stepperBtn} onPress={() => onCapacityChange(1)} accessibilityRole="button" accessibilityLabel="Increase capacity">
            <MaterialCommunityIcons name="plus" size={20} color="#4F46E5" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Event Type<Text style={styles.required}>*</Text></Text>
        <View style={styles.toggleContainer}>
          {(['free', 'paid'] as const).map((option) => (
            <TouchableOpacity key={option} style={[styles.toggleBtn, eventType === option && styles.toggleBtnActive]} onPress={() => onEventTypeChange(option)} accessibilityRole="button" accessibilityLabel={`Select ${option} event`}>
              <Text style={[styles.toggleText, eventType === option && styles.toggleTextActive]}>{option.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Accessibility</Text>
        <TouchableOpacity style={styles.checkboxRow} onPress={onWheelchairAccessibilityChange} accessibilityRole="checkbox" accessibilityState={{ checked: isWheelchairAccessible }}>
          <MaterialCommunityIcons name={isWheelchairAccessible ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color={isWheelchairAccessible ? '#4F46E5' : '#9CA3AF'} />
          <Text style={styles.checkboxLabel}>Wheelchair accessible</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.checkboxRow} onPress={onAudioDescriptionsChange} accessibilityRole="checkbox" accessibilityState={{ checked: hasAudioDescriptions }}>
          <MaterialCommunityIcons name={hasAudioDescriptions ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color={hasAudioDescriptions ? '#4F46E5' : '#9CA3AF'} />
          <Text style={styles.checkboxLabel}>Audio descriptions available</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
