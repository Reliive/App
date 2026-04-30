import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { ClubService, Club } from '@/services/club.service';
import { EventService } from '@/services/event.service';

export default function PreviewEventScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [clubName, setClubName] = useState('Loading club...');
  const [isPublishing, setIsPublishing] = useState(false);

  const {
    title,
    description,
    starts_at,
    location,
    clubId,
    capacity,
    event_type,
    photos,
    accessibility_notes
  } = params as any;

  // Parse photos safely
  let parsedPhotos: string[] = [];
  try {
    parsedPhotos = photos ? JSON.parse(photos) : [];
  } catch (e) {
    console.error('Failed to parse photos', e);
  }

  const coverPhoto = parsedPhotos.length > 0 ? parsedPhotos[0] : null;

  useEffect(() => {
    const fetchClub = async () => {
      if (!clubId) return;
      try {
        const allClubs = await ClubService.listClubs();
        const club = allClubs.find(c => c.id === clubId);
        if (club) {
          setClubName(`${club.icon || '📚'} ${club.name}`);
        } else {
          setClubName('Unknown Club');
        }
      } catch (error) {
        console.error('Error fetching club name:', error);
        setClubName('Unknown Club');
      }
    };
    fetchClub();
  }, [clubId]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // Create payload matching backend expected format
      const payload = {
        title: title,
        description: description,
        club_id: clubId,
        event_type: event_type,
        starts_at: starts_at,
        location_name: location,
        capacity: parseInt(capacity) || 10,
        accessibility_notes: accessibility_notes,
        // Optional placeholders for future
        images: parsedPhotos // NOTE: In a real app, these URIs would be uploaded to storage first.
      };

      await EventService.createEvent(payload);
      Alert.alert(
        'Success! 🎉',
        'Your event has been published successfully.',
        [
          { text: 'Awesome', onPress: () => router.push('/(tabs)/host') }
        ]
      );
    } catch (error: any) {
      Alert.alert('Publish Failed', error.message || 'Something went wrong.');
    } finally {
      setIsPublishing(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    return `${d.toLocaleDateString('en-US', dateOptions)} · ${d.toLocaleTimeString('en-US', timeOptions)}`;
  };

  const formatLocation = (locStr: string) => {
    if (!locStr) return '';
    return locStr.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <View style={styles.safeArea}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Event Image */}
        <View style={styles.imageContainer}>
          {coverPhoto ? (
            <Image source={{ uri: coverPhoto }} style={styles.coverImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialCommunityIcons name="camera-outline" size={48} color="#9CA3AF" />
              <Text style={styles.placeholderText}>No Image Selected</Text>
            </View>
          )}
        </View>

        {/* Title & Club */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.clubName}>{clubName}</Text>
        </View>

        {/* Quick Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={20} color="#6B7280" />
            <Text style={styles.infoText}>{formatDate(starts_at)}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#6B7280" />
            <Text style={styles.infoText}>{formatLocation(location)}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account-group" size={20} color="#6B7280" />
            <Text style={styles.infoText}>0/{capacity} spots</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        {/* Accessibility Notes (if any) */}
        {accessibility_notes ? (
          <View style={styles.accessibilitySection}>
            <MaterialCommunityIcons name="human-wheelchair" size={20} color="#4F46E5" />
            <Text style={styles.accessibilityText}>{accessibility_notes}</Text>
          </View>
        ) : null}

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#B45309" />
          <Text style={styles.warningText}>This is a preview. Your event will go live after publishing.</Text>
        </View>

      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Button
          title="✏️ Edit Details"
          onPress={() => router.back()}
          variant="secondary"
          style={styles.editButton}
          disabled={isPublishing}
        />
        <Button
          title={isPublishing ? "Publishing..." : "🎉 Publish Event"}
          onPress={handlePublish}
          variant="primary"
          style={styles.publishButton}
          disabled={isPublishing}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
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
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
    marginBottom: 20,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: '#9CA3AF',
    fontSize: 14,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  clubName: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500',
  },
  infoGrid: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#4B5563',
  },
  descriptionSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  accessibilitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
    gap: 10,
  },
  accessibilityText: {
    fontSize: 14,
    color: '#4F46E5',
    flex: 1,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
    gap: 10,
  },
  warningText: {
    fontSize: 14,
    color: '#B45309',
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    padding: 20,
    paddingBottom: 30, // Extra padding for bottom
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  editButton: {
    width: '100%',
  },
  publishButton: {
    width: '100%',
  },
});
