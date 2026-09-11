import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventService } from '@/services/event.service';

export default function EventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Past'>('Upcoming');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    hosting: { upcoming: any[], past: any[] },
    attending: { upcoming: any[], past: any[] }
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const fetchMyEvents = async () => {
        try {
          const res = await EventService.getMyEvents();
          if (res?.data && isMounted) {
            setData(res.data);
          }
        } catch (error) {
          console.error('Failed to load my events', error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      fetchMyEvents();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const renderAttendingEvent = (event: any) => {
    const date = new Date(event.starts_at);
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', '');
    const statusText = event.price > 0 && event.rsvp_status === 'confirmed' ? '🎫 Booked' : "✅ RSVP'd";
    
    return (
      <View key={event.id} style={styles.card}>
        <Text style={styles.cardDate}>📅 {dateStr}</Text>
        <Text style={styles.cardTitle}>{event.title}</Text>
        <Text style={styles.cardSubtitle}>
          🕐 {timeStr} · 📍 {event.location_name || 'TBD'}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.statusText}>{statusText}{event.price > 0 ? ` · ₹${event.price}` : ''}</Text>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push(`/events/${event.id}` as any)}
          >
            <Text style={styles.actionBtnText}>View →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderHostingEvent = (event: any) => {
    const date = new Date(event.starts_at);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return (
      <View key={event.id} style={styles.card}>
        <Text style={styles.cardTitle}>🎤 {event.title}</Text>
        <Text style={styles.cardSubtitle}>
          📅 {dateStr} · 👥 {event.rsvp_count || 0} RSVPs
        </Text>
        <View style={styles.cardFooter}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push(`/events/${event.id}/manage` as any)}
          >
            <Text style={styles.actionBtnText}>Manage →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const currentData = data ? {
    attending: activeTab === 'Upcoming' ? data.attending.upcoming : data.attending.past,
    hosting: activeTab === 'Upcoming' ? data.hosting.upcoming : data.hosting.past
  } : { attending: [], hosting: [] };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <Text style={styles.headerTitle}>My Events</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('Upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'Upcoming' && styles.activeTabText]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Past' && styles.activeTab]}
          onPress={() => setActiveTab('Past')}
        >
          <Text style={[styles.tabText, activeTab === 'Past' && styles.activeTabText]}>Past</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {currentData.attending.length === 0 && currentData.hosting.length === 0 ? (
             <View style={styles.emptyContainer}>
               <MaterialCommunityIcons name="calendar-blank" size={48} color="#D1D5DB" />
               <Text style={styles.emptyText}>No events found.</Text>
             </View>
          ) : (
            <>
              {currentData.attending.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>EVENTS YOU'RE ATTENDING</Text>
                  {currentData.attending.map(renderAttendingEvent)}
                </View>
              )}

              {currentData.hosting.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>EVENTS YOU'RE HOSTING</Text>
                  {currentData.hosting.map(renderHostingEvent)}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4F46E5',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#4F46E5',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669', // Emerald 600
  },
  actionBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
});
