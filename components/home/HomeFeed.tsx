import React from 'react';
import { ActivityIndicator, Image, RefreshControl, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { EventListItem, ClubSummary } from '@/types/event';
import { DialogState } from '@/types/dialog';
import { styles } from '@/styles/home.styles';
import { ActionDialog } from '@/components/common/ActionDialog';

interface HomeFeedProps {
  insetsTop: number;
  userName?: string;
  router: ReturnType<typeof useRouter>;
  clubs: ClubSummary[];
  upcomingEvents: EventListItem[];
  featuredEvents: EventListItem[];
  unreadCount: number;
  refreshing: boolean;
  loading: boolean;
  dialog: DialogState | null;
  onRefresh: () => void;
  onQuickRsvp: (event: EventListItem) => void;
  onDialogConfirm: () => void;
  onDialogCancel: () => void;
}

/**
 * Renders the home feed independently from data loading and RSVP orchestration.
 */
export function HomeFeed({
  insetsTop,
  userName,
  router,
  clubs,
  upcomingEvents,
  featuredEvents,
  unreadCount,
  refreshing,
  loading,
  dialog,
  onRefresh,
  onQuickRsvp,
  onDialogConfirm,
  onDialogCancel,
}: HomeFeedProps) {
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" colors={['#4F46E5']} />}
      >
        <View style={[styles.header, { paddingTop: insetsTop + 10 }]}>
          <Text style={styles.welcomeText}>👋 Hi, {userName || 'User'}!</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/notifications')} accessibilityRole="button" accessibilityLabel="Open notifications">
              <MaterialCommunityIcons name="bell-outline" size={24} color="#111827" />
              {unreadCount > 0 && <View style={styles.bellBadgeDot} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings')} accessibilityRole="button" accessibilityLabel="Open settings">
              <MaterialCommunityIcons name="cog-outline" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>YOUR CLUBS</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clubsContainer}>
            {clubs.map((club, index) => (
              <TouchableOpacity key={club.id} style={[styles.clubCard, { backgroundColor: club.color || ['#EEF2FF', '#FEF3C7', '#ECFDF5', '#FDF2F8'][index % 4] }]} accessibilityRole="button" accessibilityLabel={`Open ${club.name} club`}>
                <Text style={styles.clubIcon}>{club.icon || '🎯'}</Text>
                <Text style={styles.clubLabel} numberOfLines={1}>{club.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>UPCOMING FOR YOU</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')} accessibilityRole="button" accessibilityLabel="Explore all upcoming events">
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {upcomingEvents.length > 0 ? upcomingEvents.map((event) => {
            const date = new Date(event.starts_at);
            const isGoing = event.user_rsvp_status === 'confirmed' || event.user_rsvp_status === 'waitlist';
            return (
              <View key={event.id} style={styles.eventCard}>
                <TouchableOpacity style={styles.eventInfo} onPress={() => router.push(`/events/${event.id}`)} accessibilityRole="button" accessibilityLabel={`View event ${event.title}`}>
                  <Text style={styles.eventTitle}>📅 {event.title}</Text>
                  <Text style={styles.eventDetails}>🕐 {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · 📍 {event.location_name || 'TBA'}</Text>
                  <Text style={styles.eventDetails}>👥 {event.rsvp_count}/{event.capacity} spots · <Text style={styles.priceText}>{event.price === 0 ? 'FREE' : `₹${event.price}`}</Text></Text>
                </TouchableOpacity>
                <View style={styles.eventAction}>
                  <TouchableOpacity style={[styles.actionButton, isGoing && styles.actionButtonActive]} onPress={() => onQuickRsvp(event)} accessibilityRole="button" accessibilityLabel={isGoing ? `Cancel RSVP for ${event.title}` : `RSVP for ${event.title}`}>
                    <Text style={[styles.actionButtonText, isGoing && styles.actionButtonTextActive]}>{isGoing ? 'Going' : (event.event_type === 'paid' ? 'Book →' : 'RSVP →')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }) : <Text style={{ marginTop: 12, color: '#6B7280' }}>No upcoming events right now.</Text>}
        </View>

        {featuredEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FEATURED EXPERIENCE</Text>
            <TouchableOpacity style={styles.featuredCard} onPress={() => router.push(`/events/${featuredEvents[0].id}`)} accessibilityRole="button" accessibilityLabel={`View featured event ${featuredEvents[0].title}`}>
              <Image source={featuredEvents[0].images?.[0] ? { uri: featuredEvents[0].images[0] } : require('@/assets/images/hampi.png')} style={styles.featuredImage} resizeMode="cover" />
              <View style={styles.featuredOverlay}>
                <Text style={styles.featuredTitle}>{featuredEvents[0].title}</Text>
                <Text style={styles.featuredPrice}>{featuredEvents[0].price === 0 ? 'FREE' : `₹${featuredEvents[0].price}`} · {new Date(featuredEvents[0].starts_at).toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <ActionDialogBridge dialog={dialog} onConfirm={onDialogConfirm} onCancel={onDialogCancel} />
    </SafeAreaView>
  );
}

/**
 * Keeps dialog rendering declarative while the route owns action state.
 */
function ActionDialogBridge({ dialog, onConfirm, onCancel }: {
  dialog: DialogState | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <ActionDialog
      visible={dialog !== null}
      title={dialog?.title || ''}
      message={dialog?.message || ''}
      confirmLabel={dialog?.confirmLabel || 'OK'}
      destructive={dialog?.destructive}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
