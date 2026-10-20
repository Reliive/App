import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventService } from '@/services/event.service';
import { EventDetails, EventRsvp } from '@/types/event';
import { DialogState } from '@/types/dialog';
import { getErrorMessage } from '@/utils/error';
import { EventDetailsView } from '@/components/events/EventDetailsView';

/**
 * Coordinates event-detail loading and RSVP actions for the event detail view.
 */
export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Loads the event and reports failures without updating an unmounted screen.
   */
  const fetchEventDetails = useCallback(async () => {
    if (!id) return;
    try {
      const response = await EventService.getEventDetails(id);
      if (response.data && isMountedRef.current) setEvent(response.data);
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to load event details.');
      console.error('Failed to load event details:', message);
      if (isMountedRef.current) Alert.alert('Error', message);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [id]);

  useEffect(() => {
    isMountedRef.current = true;
    const loadTimer = setTimeout(() => void fetchEventDetails(), 0);
    return () => {
      clearTimeout(loadTimer);
      isMountedRef.current = false;
    };
  }, [fetchEventDetails]);

  /**
   * Refreshes the event from the server when the user pulls the view down.
   */
  const handleRefresh = () => {
    setRefreshing(true);
    void fetchEventDetails();
  };

  /**
   * Opens the correct confirmation or booking message for the current event.
   */
  const handleRsvpPress = () => {
    if (!event) return;
    if (event.event_type === 'paid') {
      showMessage('Booking required', 'Paid events require a completed booking instead of a free RSVP.');
      return;
    }
    const isRsvped = event.user_rsvp?.status === 'confirmed' || event.user_rsvp?.status === 'waitlist';
    setDialog({
      title: isRsvped ? 'Cancel RSVP' : 'Confirm RSVP',
      message: isRsvped ? `Are you sure you want to cancel your RSVP for "${event.title}"?` : `Are you sure you want to RSVP for "${event.title}"?`,
      confirmLabel: isRsvped ? 'Yes, Cancel' : "Yes, I'll attend!",
      destructive: isRsvped,
      onConfirm: isRsvped ? confirmCancelRsvp : confirmRsvp,
    });
  };

  /**
   * Creates an RSVP and reconciles the optimistic view with the server state.
   */
  const confirmRsvp = async () => {
    if (!event || !id) return;
    const eventTitle = event.title;
    try {
      setActionLoading(true);
      const response = await EventService.rsvp(id);
      const rsvp: EventRsvp = response.data;
      setEvent((currentEvent) => currentEvent ? {
        ...currentEvent,
        user_rsvp: rsvp,
        rsvp_count: rsvp.status === 'confirmed' ? currentEvent.rsvp_count + 1 : currentEvent.rsvp_count,
      } : currentEvent);
      showMessage('🎉 RSVP Confirmed!', `You're on the guest list for "${eventTitle}".`);
      await fetchEventDetails();
    } catch (error: unknown) {
      showMessage('RSVP Failed', getErrorMessage(error, 'Could not complete RSVP.'));
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Cancels the current RSVP and refreshes the event details afterward.
   */
  const confirmCancelRsvp = async () => {
    if (!event || !id) return;
    const eventTitle = event.title;
    try {
      setActionLoading(true);
      await EventService.cancelRsvp(id);
      showMessage('RSVP Cancelled', `Your RSVP for "${eventTitle}" has been cancelled.`);
      await fetchEventDetails();
    } catch (error: unknown) {
      showMessage('Action Failed', getErrorMessage(error, 'Could not cancel RSVP.'));
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Displays an informational dialog for success and recoverable failures.
   */
  const showMessage = (title: string, message: string) => {
    setDialog({ title, message, confirmLabel: 'OK', onConfirm: () => setDialog(null) });
  };

  /**
   * Closes the dialog before invoking its action to prevent duplicate taps.
   */
  const handleDialogConfirm = () => {
    const onConfirm = dialog?.onConfirm;
    setDialog(null);
    onConfirm?.();
  };

  return (
    <EventDetailsView
      event={event}
      insetsTop={insets.top}
      insetsBottom={insets.bottom}
      loading={loading}
      refreshing={refreshing}
      actionLoading={actionLoading}
      dialog={dialog}
      onBack={() => router.back()}
      onRefresh={handleRefresh}
      onRsvp={handleRsvpPress}
      onDialogConfirm={handleDialogConfirm}
      onDialogCancel={() => setDialog(null)}
    />
  );
}
