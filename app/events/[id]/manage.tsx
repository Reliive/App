import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EventService } from '@/services/event.service';

interface Attendee {
  id: string;
  name: string;
  avatar_url?: string;
  rsvp_id: string;
  checked_in: boolean;
  checked_in_at?: string;
  rsvp_at: string;
}

export default function ManageEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'checked_in'>('all');
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCapacity, setEditCapacity] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [eventRes, attendeesRes] = await Promise.all([
        EventService.getEventDetails(id),
        EventService.getEventAttendees(id)
      ]);

      if (eventRes?.data) setEvent(eventRes.data);
      if (attendeesRes?.data) setAttendees(attendeesRes.data);
    } catch (err: any) {
      console.error('Failed to load manage event data:', err);
      Alert.alert('Error', err.message || 'Failed to load event management details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openEditModal = () => {
    if (!event) return;
    setEditTitle(event.title || '');
    setEditDescription(event.description || '');
    setEditLocation(event.location_name || '');
    setEditCapacity(event.capacity ? String(event.capacity) : '');
    setEditPrice(event.price ? String(event.price) : '0');
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      Alert.alert('Validation Error', 'Event title cannot be empty.');
      return;
    }
    try {
      setSavingEdit(true);
      const updatePayload = {
        title: editTitle,
        description: editDescription,
        location_name: editLocation,
        capacity: editCapacity ? parseInt(editCapacity, 10) : 0,
        price: editPrice ? parseFloat(editPrice) : 0,
      };

      const res = await EventService.updateEvent(id as string, updatePayload);
      if (res?.data) {
        setEvent(res.data);
      }
      setEditModalVisible(false);
      Alert.alert('Success', 'Event details updated successfully!');
      loadData();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Failed to update event details.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCheckIn = async (attendee: Attendee) => {
    if (attendee.checked_in) return;
    try {
      setCheckingInId(attendee.id);
      await EventService.checkInAttendee(id as string, attendee.id);
      
      setAttendees(prev =>
        prev.map(a => (a.id === attendee.id ? { ...a, checked_in: true, checked_in_at: new Date().toISOString() } : a))
      );
      Alert.alert('Success', `${attendee.name} marked as checked in!`);
    } catch (err: any) {
      Alert.alert('Check-in Failed', err.message || 'Could not check in attendee.');
    } finally {
      setCheckingInId(null);
    }
  };

  const handleCancelEvent = () => {
    Alert.alert(
      'Cancel Event',
      'Are you sure you want to cancel this event? This will notify all attendees.',
      [
        { text: 'No, Keep Event', style: 'cancel' },
        {
          text: 'Yes, Cancel Event',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await EventService.cancelEvent(id as string, 'Host cancelled event.');
              Alert.alert('Cancelled', 'The event has been cancelled.', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel event.');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const filteredAttendees = attendees.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterTab === 'pending') return !a.checked_in;
    if (filterTab === 'checked_in') return a.checked_in;
    return true;
  });

  const checkedInCount = attendees.filter(a => a.checked_in).length;

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading event management...</Text>
      </SafeAreaView>
    );
  }

  const startDate = event?.starts_at ? new Date(event.starts_at) : null;
  const dateFormatted = startDate
    ? startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'TBD';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Manage Event</Text>
        <TouchableOpacity style={styles.editHeaderBtn} onPress={openEditModal}>
          <MaterialCommunityIcons name="square-edit-outline" size={18} color="#4F46E5" />
          <Text style={styles.editHeaderBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#6366F1']} />}
      >
        {/* Event Banner & Details Card */}
        <View style={styles.eventCard}>
          <View style={styles.titleRow}>
            <Text style={styles.eventTitle}>{event?.title || 'Event Details'}</Text>
            <View style={[styles.statusBadge, event?.status === 'cancelled' && styles.statusCancelled]}>
              <Text style={styles.statusText}>{event?.status?.toUpperCase() || 'PUBLISHED'}</Text>
            </View>
          </View>

          {event?.description ? (
            <Text style={styles.eventDescription} numberOfLines={2}>{event.description}</Text>
          ) : null}

          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="calendar" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{dateFormatted}</Text>
          </View>
          {event?.location_name && (
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#6B7280" />
              <Text style={styles.metaText} numberOfLines={1}>{event.location_name}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.cardEditBtn} onPress={openEditModal}>
            <MaterialCommunityIcons name="pencil" size={16} color="#6366F1" />
            <Text style={styles.cardEditBtnText}>Edit Details</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{attendees.length} / {event?.capacity || '∞'}</Text>
            <Text style={styles.statLabel}>RSVPs</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{checkedInCount}</Text>
            <Text style={styles.statLabel}>Checked In</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {event?.event_type === 'paid' ? `₹${event.price || 0}` : 'Free'}
            </Text>
            <Text style={styles.statLabel}>Price</Text>
          </View>
        </View>

        {/* Attendee Roster Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Attendee List ({filteredAttendees.length})</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search attendee by name..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.filterChip, filterTab === 'all' && styles.activeFilterChip]}
            onPress={() => setFilterTab('all')}
          >
            <Text style={[styles.filterChipText, filterTab === 'all' && styles.activeFilterChipText]}>
              All ({attendees.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filterTab === 'pending' && styles.activeFilterChip]}
            onPress={() => setFilterTab('pending')}
          >
            <Text style={[styles.filterChipText, filterTab === 'pending' && styles.activeFilterChipText]}>
              Pending ({attendees.length - checkedInCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filterTab === 'checked_in' && styles.activeFilterChip]}
            onPress={() => setFilterTab('checked_in')}
          >
            <Text style={[styles.filterChipText, filterTab === 'checked_in' && styles.activeFilterChipText]}>
              Checked In ({checkedInCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Attendees List */}
        {filteredAttendees.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="account-search-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No attendees found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search query.' : 'No attendees registered under this filter.'}
            </Text>
          </View>
        ) : (
          filteredAttendees.map(item => (
            <View key={item.id} style={styles.attendeeCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{item.name ? item.name.charAt(0).toUpperCase() : 'U'}</Text>
              </View>

              <View style={styles.attendeeInfo}>
                <Text style={styles.attendeeName}>{item.name}</Text>
                <Text style={styles.rsvpDate}>
                  RSVPed on {new Date(item.rsvp_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>

              {item.checked_in ? (
                <View style={styles.checkedInBadge}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#059669" />
                  <Text style={styles.checkedInBadgeText}>Checked In</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.checkInBtn}
                  onPress={() => handleCheckIn(item)}
                  disabled={checkingInId === item.id}
                >
                  {checkingInId === item.id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.checkInBtnText}>Check In</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        {/* Host Danger Zone */}
        <View style={styles.dangerZone}>
          <TouchableOpacity style={styles.cancelEventBtn} onPress={handleCancelEvent}>
            <MaterialCommunityIcons name="close-circle-outline" size={20} color="#EF4444" />
            <Text style={styles.cancelEventBtnText}>Cancel Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Details Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Event Details</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.formInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Event Title"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.multilineInput]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Describe your event..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>Location Name</Text>
              <TextInput
                style={styles.formInput}
                value={editLocation}
                onChangeText={setEditLocation}
                placeholder="Venue / Address"
                placeholderTextColor="#9CA3AF"
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Capacity</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editCapacity}
                    onChangeText={setEditCapacity}
                    placeholder="Max seats"
                    keyboardType="number-pad"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {event?.event_type === 'paid' && (
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.inputLabel}>Price (₹)</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editPrice}
                      onChangeText={setEditPrice}
                      placeholder="Ticket Price"
                      keyboardType="decimal-pad"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveEdit}
                disabled={savingEdit}
              >
                {savingEdit ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editHeaderBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  scrollContent: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  eventDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
    lineHeight: 18,
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#4B5563',
  },
  cardEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  cardEditBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#111827',
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  activeFilterChip: {
    backgroundColor: '#6366F1',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  attendeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  rsvpDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  checkInBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 84,
    alignItems: 'center',
  },
  checkInBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  checkedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  checkedInBadgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyBox: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
    textAlign: 'center',
  },
  dangerZone: {
    marginTop: 24,
    marginBottom: 32,
  },
  cancelEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    gap: 6,
  },
  cancelEventBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalForm: {
    paddingVertical: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 10,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  modalCancelText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 14,
  },
  modalSaveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    minWidth: 110,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
