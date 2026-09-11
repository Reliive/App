import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EventService } from '@/services/event.service';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await EventService.getEventDetails(id);
      if (res?.data) {
        setEvent(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load event details:', err);
      Alert.alert('Error', err.message || 'Failed to load event details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEventDetails();
  };

  const handleRsvpPress = () => {
    if (!event) return;

    const isRsvped = !!(event.user_rsvp && (event.user_rsvp.status === 'confirmed' || event.user_rsvp.status === 'waitlist'));

    if (isRsvped) {
      Alert.alert(
        'Cancel RSVP',
        `Are you sure you want to cancel your RSVP for "${event.title}"?`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: confirmCancelRsvp,
          },
        ]
      );
    } else {
      Alert.alert(
        'Confirm RSVP',
        `Are you sure you want to RSVP for "${event.title}"?`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, I\'ll attend!',
            style: 'default',
            onPress: confirmRsvp,
          },
        ]
      );
    }
  };

  const confirmRsvp = async () => {
    try {
      setActionLoading(true);
      await EventService.rsvp(id as string);
      Alert.alert('🎉 RSVP Confirmed!', `You're on the guest list for "${event.title}".`);
      fetchEventDetails();
    } catch (err: any) {
      Alert.alert('RSVP Failed', err.message || 'Could not complete RSVP.');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmCancelRsvp = async () => {
    try {
      setActionLoading(true);
      await EventService.cancelRsvp(id as string);
      Alert.alert('RSVP Cancelled', `Your RSVP for "${event.title}" has been cancelled.`);
      fetchEventDetails();
    } catch (err: any) {
      Alert.alert('Action Failed', err.message || 'Could not cancel RSVP.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading experience...</Text>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>Event Not Found</Text>
        <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.back()}>
          <Text style={styles.backHomeBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const startDate = event.starts_at ? new Date(event.starts_at) : null;
  const dateFormatted = startDate
    ? startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    : 'Date TBD';
  const timeFormatted = startDate
    ? startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : 'Time TBD';

  const isUserHost = false; // Host uses manage view
  const isRsvped = !!(event.user_rsvp && (event.user_rsvp.status === 'confirmed' || event.user_rsvp.status === 'waitlist'));
  const priceDisplay = event.price > 0 ? `₹${event.price}` : 'FREE';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Event Details</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => Alert.alert('Share', 'Share feature coming soon!')}>
          <MaterialCommunityIcons name="share-variant-outline" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#4F46E5']} />}
      >
        {/* Cover Image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              event.images?.[0]
                ? { uri: event.images[0] }
                : require('@/assets/images/hampi.png')
            }
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View style={styles.pricePill}>
            <Text style={styles.pricePillText}>{priceDisplay}</Text>
          </View>
        </View>

        {/* Title & Tag */}
        <View style={styles.sectionCard}>
          {event.club?.name && (
            <View style={styles.clubBadge}>
              <Text style={styles.clubIcon}>{event.club.icon || '🎯'}</Text>
              <Text style={styles.clubName}>{event.club.name}</Text>
            </View>
          )}
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.capacityRow}>
            <MaterialCommunityIcons name="account-group" size={18} color="#4F46E5" />
            <Text style={styles.capacityText}>
              {event.rsvp_count || 0} / {event.capacity || '∞'} spots filled ({event.spots_remaining || 0} left)
            </Text>
          </View>
        </View>

        {/* Date & Location Card */}
        <View style={styles.sectionCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="calendar-clock" size={22} color="#4F46E5" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>{dateFormatted}</Text>
              <Text style={styles.infoSubtitle}>{timeFormatted}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { marginTop: 14 }]}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="map-marker-radius" size={22} color="#4F46E5" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>{event.location_name || 'Location TBA'}</Text>
              {event.location_address ? (
                <Text style={styles.infoSubtitle}>{event.location_address}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Host Profile Card */}
        {event.host && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionCardHeader}>Hosted By</Text>
            <View style={styles.hostRow}>
              <View style={styles.hostAvatarCircle}>
                <Text style={styles.hostAvatarText}>
                  {event.host.name ? event.host.name.charAt(0).toUpperCase() : 'H'}
                </Text>
              </View>
              <View style={styles.hostInfo}>
                <View style={styles.hostNameRow}>
                  <Text style={styles.hostName}>{event.host.name}</Text>
                  {event.host.is_verified && (
                    <MaterialCommunityIcons name="check-decagram" size={16} color="#4F46E5" />
                  )}
                </View>
                <Text style={styles.hostSubtext}>
                  {event.host.events_hosted || 0} events hosted on Reliive
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* About Event Description */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardHeader}>About Experience</Text>
          <Text style={styles.descriptionText}>
            {event.description || 'Join us for this exciting community event! Connect with fellow members and enjoy a great experience.'}
          </Text>
        </View>
      </ScrollView>

      {/* Full Width Sticky Footer Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[
            styles.primaryRsvpBtn,
            isRsvped && styles.cancelRsvpBtn,
            actionLoading && styles.disabledBtn
          ]}
          onPress={handleRsvpPress}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryRsvpBtnText}>
              {isRsvped ? '✅ RSVP\'d (Tap to Cancel)' : (event.event_type === 'paid' ? `Book Experience · ${priceDisplay}` : 'RSVP Now')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 12,
  },
  backHomeBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
  },
  backHomeBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
    backgroundColor: '#E5E7EB',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  pricePill: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pricePillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  clubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  clubIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  clubName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 28,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  capacityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  infoSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  sectionCardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hostAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4F46E5',
  },
  hostInfo: {
    flex: 1,
  },
  hostNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hostName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  hostSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  primaryRsvpBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelRsvpBtn: {
    backgroundColor: '#059669',
  },
  disabledBtn: {
    opacity: 0.7,
  },
  primaryRsvpBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
