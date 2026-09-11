import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NotificationService, NotificationItem } from '@/services/notification.service';

// Mock sample notifications for fresh users
const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'sample-1',
    user_id: 'user-1',
    type: 'event_reminder',
    title: 'Upcoming Event Reminder',
    message: 'Friday Coffee Meetup starts tomorrow at 10:00 AM!',
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'sample-2',
    user_id: 'user-1',
    type: 'rsvp_confirmation',
    title: 'RSVP Confirmed',
    message: 'Your spot is reserved for Sunset Terrace Music Meetup.',
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
  },
  {
    id: 'sample-3',
    user_id: 'user-1',
    type: 'club_update',
    title: 'New Club Meetup',
    message: 'Travelers Club posted a new weekend trip to Hampi!',
    is_read: true,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await NotificationService.getNotifications();
      if (res?.data?.notifications && res.data.notifications.length > 0) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unread_count || 0);
      } else {
        // Use initial sample data if db empty
        setNotifications(SAMPLE_NOTIFICATIONS);
        setUnreadCount(SAMPLE_NOTIFICATIONS.filter(n => !n.is_read).length);
      }
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      // Fallback gracefully
      setNotifications(SAMPLE_NOTIFICATIONS);
      setUnreadCount(SAMPLE_NOTIFICATIONS.filter(n => !n.is_read).length);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkItemRead = async (item: NotificationItem) => {
    if (item.is_read) return;
    try {
      // Update UI state immediately
      setNotifications(prev =>
        prev.map(n => (n.id === item.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Call API if not a sample ID
      if (!item.id.startsWith('sample-')) {
        await NotificationService.markAsRead(item.id);
      }
    } catch (err: any) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      setActionLoading(true);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);

      await NotificationService.markAllAsRead().catch(() => null);
      Alert.alert('Done', 'All notifications marked as read.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to mark all read.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterTab === 'unread') return !n.is_read;
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_reminder':
      case 'event_update':
        return { name: 'calendar-clock', color: '#6366F1', bg: '#EEF2FF' };
      case 'rsvp_confirmation':
        return { name: 'ticket-confirmation-outline', color: '#10B981', bg: '#ECFDF5' };
      case 'club_update':
        return { name: 'account-group-outline', color: '#F59E0B', bg: '#FEF3C7' };
      case 'announcement':
        return { name: 'bullhorn-outline', color: '#8B5CF6', bg: '#F3E8FF' };
      default:
        return { name: 'bell-outline', color: '#6B7280', bg: '#F3F4F6' };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadCountPill}>
              <Text style={styles.unreadCountText}>{unreadCount} new</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.markAllBtn, unreadCount === 0 && styles.disabledMarkAllBtn]}
          onPress={handleMarkAllRead}
          disabled={unreadCount === 0 || actionLoading}
        >
          {actionLoading ? (
            <ActivityIndicator size="small" color="#6366F1" />
          ) : (
            <>
              <MaterialCommunityIcons name="check-all" size={18} color={unreadCount > 0 ? '#4F46E5' : '#9CA3AF'} />
              <Text style={[styles.markAllText, unreadCount === 0 && styles.disabledMarkAllText]}>Read All</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, filterTab === 'all' && styles.activeFilterChip]}
          onPress={() => setFilterTab('all')}
        >
          <Text style={[styles.filterChipText, filterTab === 'all' && styles.activeFilterChipText]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterTab === 'unread' && styles.activeFilterChip]}
          onPress={() => setFilterTab('unread')}
        >
          <Text style={[styles.filterChipText, filterTab === 'unread' && styles.activeFilterChipText]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#6366F1']} />}
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="bell-off-outline" size={56} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>
              {filterTab === 'unread' ? "You're all caught up! No unread notifications." : 'You have no notifications right now.'}
            </Text>
          </View>
        ) : (
          filteredNotifications.map(item => {
            const iconInfo = getNotificationIcon(item.type);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.card, !item.is_read && styles.unreadCard]}
                onPress={() => handleMarkItemRead(item)}
                activeOpacity={0.7}
              >
                {!item.is_read && <View style={styles.blueDot} />}

                <View style={[styles.iconBox, { backgroundColor: iconInfo.bg }]}>
                  <MaterialCommunityIcons name={iconInfo.name as any} size={22} color={iconInfo.color} />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.cardTitle, !item.is_read && styles.unreadCardTitle]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.timeAgo}>{formatTimeAgo(item.created_at)}</Text>
                  </View>
                  <Text style={styles.cardMessage}>{item.message}</Text>
                </View>
              </TouchableOpacity>
            );
          })
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
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  unreadCountPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  unreadCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  disabledMarkAllBtn: {
    backgroundColor: '#F3F4F6',
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  disabledMarkAllText: {
    color: '#9CA3AF',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeFilterChip: {
    backgroundColor: '#6366F1',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  unreadCard: {
    backgroundColor: '#F5F7FF',
    borderColor: '#C7D2FE',
  },
  blueDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    paddingRight: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 6,
  },
  unreadCardTitle: {
    fontWeight: '700',
    color: '#1E1B4B',
  },
  timeAgo: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  cardMessage: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    marginTop: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
});
