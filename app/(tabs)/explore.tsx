import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, ScrollView, 
  TouchableOpacity, TextInput, ActivityIndicator 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventService } from '@/services/event.service';

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterThisWeek, setFilterThisWeek] = useState(false);
  const [filterFree, setFilterFree] = useState(false);
  const [filterNearMe, setFilterNearMe] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await EventService.listEvents({ upcoming: true, limit: 50 });
        
        // Add a mock distance for demonstration since backend doesn't provide lat/long distance calculation yet
        const enhancedEvents = (res?.data || []).map((e: any) => ({
          ...e,
          mockDistance: (Math.random() * 8 + 0.5).toFixed(1) // Random distance between 0.5 and 8.5 km
        }));
        
        setEvents(enhancedEvents);
      } catch (error) {
        console.error('Failed to load explore events', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Extract unique categories from events (using club names as a proxy for categories)
  const categories = useMemo(() => {
    const cats = new Set<string>();
    events.forEach(e => {
      if (e.club?.name) cats.add(e.club.name);
    });
    // Ensure we have some default fallbacks if database is empty
    if (cats.size === 0) return ['All', 'Travel', 'Books', 'Art', 'Music'];
    return ['All', ...Array.from(cats)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // 1. Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = event.title?.toLowerCase().includes(query);
        const clubMatch = event.club?.name?.toLowerCase().includes(query);
        if (!titleMatch && !clubMatch) return false;
      }

      // 2. Category
      if (selectedCategory !== 'All') {
        if (event.club?.name !== selectedCategory) return false;
      }

      // 3. Quick Filters
      if (filterFree && event.event_type !== 'free' && event.price > 0) return false;
      
      if (filterThisWeek) {
        const eventDate = new Date(event.starts_at);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        if (eventDate > nextWeek) return false;
      }

      if (filterNearMe && parseFloat(event.mockDistance) > 3.0) { // Consider < 3km as Near Me
        return false;
      }

      return true;
    });
  }, [events, searchQuery, selectedCategory, filterThisWeek, filterFree, filterNearMe]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explore</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search events, clubs..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Categories & Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>FILTERS</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            {categories.map((cat, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.quickFiltersContainer}>
            <TouchableOpacity 
              style={[styles.quickFilterChip, filterThisWeek && styles.quickFilterActive]}
              onPress={() => setFilterThisWeek(!filterThisWeek)}
            >
              <Text style={[styles.quickFilterText, filterThisWeek && styles.quickFilterTextActive]}>This Week</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickFilterChip, filterFree && styles.quickFilterActive]}
              onPress={() => setFilterFree(!filterFree)}
            >
              <Text style={[styles.quickFilterText, filterFree && styles.quickFilterTextActive]}>Free</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickFilterChip, filterNearMe && styles.quickFilterActive]}
              onPress={() => setFilterNearMe(!filterNearMe)}
            >
              <Text style={[styles.quickFilterText, filterNearMe && styles.quickFilterTextActive]}>Near Me</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>{filteredEvents.length} EVENTS FOUND</Text>
          <TouchableOpacity style={styles.mapToggle}>
            <Text style={styles.mapToggleText}>🗺️ Map</Text>
          </TouchableOpacity>
        </View>

        {/* Results List */}
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
        ) : filteredEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No events found matching your filters.</Text>
          </View>
        ) : (
          <View style={styles.eventsContainer}>
            {filteredEvents.map(event => {
              const date = new Date(event.starts_at);
              let dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
              
              // Simplistic tomorrow check
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              if (date.toDateString() === tomorrow.toDateString()) {
                dayStr = 'Tomorrow';
              }
              
              const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', '');
              const spotsLeft = Math.max(0, event.capacity - (event.rsvp_count || 0));
              
              return (
                <TouchableOpacity key={event.id} style={styles.eventCard}>
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventSubtitle}>
                      {dayStr} {timeStr} · {event.mockDistance}km away
                    </Text>
                    <Text style={styles.eventMeta}>
                      <Text style={styles.eventMetaHighlight}>
                        {event.event_type === 'free' ? 'FREE' : `₹${event.price}`}
                      </Text>
                      {' · '}{spotsLeft} spots left
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    width: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 12,
  },
  chipScroll: {
    paddingBottom: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#111827',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  quickFiltersContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  quickFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  quickFilterActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  quickFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  quickFilterTextActive: {
    color: '#4F46E5',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
  },
  mapToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  mapToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  eventsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  eventSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  eventMeta: {
    fontSize: 14,
    color: '#6B7280',
  },
  eventMetaHighlight: {
    fontWeight: '700',
    color: '#059669', // Emerald 600
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
