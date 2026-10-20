import React, { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserService } from '@/services/user.service';
import { EventService } from '@/services/event.service';
import { NotificationService } from '@/services/notification.service';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { DialogState } from '@/types/dialog';
import { ClubSummary, EventListItem, NotificationSummary, UserProfile } from '@/types/event';
import { getErrorMessage } from '@/utils/error';
import { HomeFeed } from '@/components/home/HomeFeed';

// Fallback data if API returns empty
const FALLBACK_CLUBS: ClubSummary[] = [
  { id: '1', name: 'Travel', icon: '✈️', color: '#EEF2FF' },
  { id: '2', name: 'Books', icon: '📚', color: '#FEF3C7' },
];

/**
 * Presents the home feed and provides a quick RSVP action for upcoming events.
 */
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<EventListItem[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<EventListItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  /**
   * Loads profile, event, and notification data while allowing each optional
   * feed request to fail without hiding the rest of the home screen.
   */
  const fetchData = useCallback(async () => {
    try {
      const [profileRes, eventsRes, featuredRes, notifRes] = await Promise.all([
        UserService.getMe().catch((error: unknown) => {
          console.error('Failed to fetch profile:', getErrorMessage(error, 'Failed to fetch profile'));
          return null;
        }),
        EventService.listEvents({ upcoming: 'true', limit: 5 }).catch((error: unknown) => {
          console.error('Failed to fetch upcoming events:', getErrorMessage(error, 'Failed to fetch upcoming events'));
          return { data: [] };
        }),
        EventService.getFeaturedExperiences().catch((error: unknown) => {
          console.error('Failed to fetch featured events:', getErrorMessage(error, 'Failed to fetch featured events'));
          return { data: [] };
        }),
        NotificationService.getNotifications().catch((error: unknown) => {
          console.error('Failed to fetch notifications:', getErrorMessage(error, 'Failed to fetch notifications'));
          return null;
        }),
      ]);

      if (profileRes?.data) setUser(profileRes.data);
      if (eventsRes?.data) setUpcomingEvents(eventsRes.data);
      if (featuredRes?.data) setFeaturedEvents(featuredRes.data);
      if (notifRes?.data) {
        const notificationSummary = notifRes.data as NotificationSummary;
        setUnreadCount(notificationSummary.unread_count || 0);
      }
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

  /**
   * Opens the shared confirmation dialog for a free-event RSVP or cancellation.
   */
  const handleQuickRsvp = (event: EventListItem) => {
    const isRsvped = event.user_rsvp_status === 'confirmed' || event.user_rsvp_status === 'waitlist';
    if (!isRsvped && event.event_type === 'paid') {
      setDialog({
        title: 'Booking required',
        message: 'Paid events require a completed booking instead of a free RSVP.',
        confirmLabel: 'OK',
        onConfirm: () => setDialog(null)
      });
      return;
    }

    setDialog({
      title: isRsvped ? 'Cancel RSVP' : 'Confirm RSVP',
      message: isRsvped
        ? `Are you sure you want to cancel your RSVP for "${event.title}"?`
        : `Are you sure you want to RSVP for "${event.title}"?`,
      confirmLabel: isRsvped ? 'Yes, Cancel' : "Yes, I'll attend!",
      destructive: isRsvped,
      onConfirm: () => {
        setDialog(null);
        void completeQuickRsvp(event, isRsvped);
      }
    });
  };

  /**
   * Executes the confirmed RSVP operation and displays its result in the
   * shared dialog, including backend validation failures.
   */
  const completeQuickRsvp = async (event: EventListItem, isRsvped: boolean) => {
    try {
      if (isRsvped) {
        await EventService.cancelRsvp(event.id);
        setDialog({
          title: 'Cancelled',
          message: `Your RSVP for "${event.title}" has been cancelled.`,
          confirmLabel: 'OK',
          onConfirm: () => setDialog(null)
        });
      } else {
        await EventService.rsvp(event.id);
        setDialog({
          title: '🎉 RSVP Confirmed!',
          message: `You're on the guest list for "${event.title}".`,
          confirmLabel: 'OK',
          onConfirm: () => setDialog(null)
        });
      }
      await fetchData();
    } catch (err: unknown) {
      setDialog({
        title: isRsvped ? 'Error' : 'RSVP Failed',
        message: getErrorMessage(err, isRsvped ? 'Could not cancel RSVP.' : 'Could not complete RSVP.'),
        confirmLabel: 'OK',
        onConfirm: () => setDialog(null)
      });
    }
  };

  const clubs = user?.clubs && user.clubs.length > 0 ? user.clubs : FALLBACK_CLUBS;

  return (
    <HomeFeed
      insetsTop={insets.top}
      userName={user?.name?.split(' ')[0]}
      router={router}
      clubs={clubs}
      upcomingEvents={upcomingEvents}
      featuredEvents={featuredEvents}
      unreadCount={unreadCount}
      refreshing={refreshing}
      loading={loading}
      dialog={dialog}
      onRefresh={onRefresh}
      onQuickRsvp={handleQuickRsvp}
      onDialogConfirm={() => {
        const onConfirm = dialog?.onConfirm;
        setDialog(null);
        onConfirm?.();
      }}
      onDialogCancel={() => setDialog(null)}
    />
  );
}
