import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserService } from '@/services/user.service';
import { EventService } from '@/services/event.service';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

const { width } = Dimensions.get('window');

// Fallback data if API returns empty
const FALLBACK_CLUBS = [
  { id: '1', name: 'Travel', icon: '✈️', color: '#EEF2FF' },
  { id: '2', name: 'Books', icon: '📚', color: '#FEF3C7' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, eventsRes, featuredRes] = await Promise.all([
        UserService.getMe().catch(() => null),
        EventService.listEvents({ upcoming: 'true', limit: 5 }).catch(() => ({ data: [] })),
        EventService.getFeaturedExperiences().catch(() => ({ data: [] })),
      ]);

      if (profileRes?.data) setUser(profileRes.data);
      if (eventsRes?.data) setUpcomingEvents(eventsRes.data);
      if (featuredRes?.data) setFeaturedEvents(featuredRes.data);
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData().finally(() => setLoading(false));
    }, [fetchData])
  );

  const { refreshing, onRefresh } = usePullToRefresh(fetchData);

  const handleQuickRsvp = (event: any) => {
    const isRsvped = event.user_rsvp_status === 'confirmed' || event.user_rsvp_status === 'waitlist';
    if (isRsvped) {
      Alert.alert(
        'Cancel RSVP',
        `Are you sure you want to cancel your RSVP for "${event.title}"?`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              try {
                await EventService.cancelRsvp(event.id);
                Alert.alert('Cancelled', `Your RSVP for "${event.title}" has been cancelled.`);
                fetchData();
              } catch (err: any) {
                Alert.alert('Error', err.message || 'Could not cancel RSVP.');
              }
            }
          }
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
            onPress: async () => {
              try {
                await EventService.rsvp(event.id);
                Alert.alert('🎉 RSVP Confirmed!', `You're on the guest list for "${event.title}".`);
                fetchData();
              } catch (err: any) {
                Alert.alert('RSVP Failed', err.message || 'Could not complete RSVP.');
              }
            }
          }
        ]
      );
    }
  };

  const clubs = user?.clubs?.length > 0 ? user.clubs : FALLBACK_CLUBS;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#4F46E5" // iOS spinner color
            colors={['#4F46E5']} // Android spinner colors
          />
        }
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <View>
            <Text style={styles.welcomeText}>👋 Hi, {user?.name?.split(' ')[0] || 'User'}!</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialCommunityIcons name="bell-outline" size={24} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings' as any)}>
              <MaterialCommunityIcons name="cog-outline" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Your Clubs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>YOUR CLUBS</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore' as any)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clubsContainer}>
            {clubs.map((club: any, index: number) => {
              const colors = ['#EEF2FF', '#FEF3C7', '#ECFDF5', '#FDF2F8'];
              const bgColor = club.color || colors[index % colors.length];
              return (
                <TouchableOpacity key={club.id} style={[styles.clubCard, { backgroundColor: bgColor }]}>
                  <Text style={styles.clubIcon}>{club.icon || '🎯'}</Text>
                  <Text style={styles.clubLabel} numberOfLines={1}>{club.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Upcoming For You */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UPCOMING FOR YOU</Text>
          {upcomingEvents.length > 0 ? upcomingEvents.map((event) => {
            const date = new Date(event.starts_at);
            const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const isGoing = event.user_rsvp_status === 'confirmed' || event.user_rsvp_status === 'waitlist';
            
            return (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => router.push(`/events/${event.id}` as any)}
              >
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>📅 {event.title}</Text>
                  <Text style={styles.eventDetails}>
                    🕐 {formattedDate} {formattedTime} · 📍 {event.location_name || 'TBA'}
                  </Text>
                  <Text style={styles.eventDetails}>
                    👥 {event.rsvp_count}/{event.capacity} spots · <Text style={styles.priceText}>{event.price === 0 ? 'FREE' : `₹${event.price}`}</Text>
                  </Text>
                </View>
                <View style={styles.eventAction}>
                  <TouchableOpacity
                    style={[styles.actionButton, isGoing && styles.actionButtonActive]}
                    onPress={() => handleQuickRsvp(event)}
                  >
                    <Text style={[styles.actionButtonText, isGoing && styles.actionButtonTextActive]}>
                      {isGoing ? 'Going' : (event.event_type === 'paid' ? 'Book →' : 'RSVP →')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }) : (
            <Text style={{ marginTop: 12, color: '#6B7280' }}>No upcoming events right now.</Text>
          )}
        </View>

        {/* Featured Experience */}
        {featuredEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FEATURED EXPERIENCE</Text>
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() => router.push(`/events/${featuredEvents[0].id}` as any)}
            >
              <Image
                source={featuredEvents[0].images?.[0] ? { uri: featuredEvents[0].images[0] } : require('@/assets/images/hampi.png')}
                style={styles.featuredImage}
                resizeMode="cover"
              />
              <View style={styles.featuredOverlay}>
                <Text style={styles.featuredTitle}>{featuredEvents[0].title}</Text>
                <Text style={styles.featuredPrice}>
                  {featuredEvents[0].price === 0 ? 'FREE' : `₹${featuredEvents[0].price}`} · {new Date(featuredEvents[0].starts_at).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
    padding: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
  },
  seeAllText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
  },
  clubsContainer: {
    paddingRight: 24,
  },
  clubCard: {
    width: 100,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  clubIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  clubLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventInfo: {
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  eventDetails: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  priceText: {
    fontWeight: '700',
    color: '#111827',
  },
  eventAction: {
    alignItems: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonTextActive: {
    color: '#059669',
  },
  featuredCard: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  featuredImage: {
    width: '100%',
    height: 180,
  },
  featuredOverlay: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  featuredPrice: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
});
