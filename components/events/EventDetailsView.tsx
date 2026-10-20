import React from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EventDetails } from '@/types/event';
import { DialogState } from '@/types/dialog';
import { ActionDialog } from '@/components/common/ActionDialog';
import { styles } from '@/styles/event-details.styles';

interface EventDetailsViewProps {
  event: EventDetails | null;
  insetsTop: number;
  insetsBottom: number;
  loading: boolean;
  refreshing: boolean;
  actionLoading: boolean;
  dialog: DialogState | null;
  onBack: () => void;
  onRefresh: () => void;
  onRsvp: () => void;
  onDialogConfirm: () => void;
  onDialogCancel: () => void;
}

/**
 * Renders event details and delegates navigation and RSVP behavior to the route.
 */
export function EventDetailsView({
  event,
  insetsTop,
  insetsBottom,
  loading,
  refreshing,
  actionLoading,
  dialog,
  onBack,
  onRefresh,
  onRsvp,
  onDialogConfirm,
  onDialogCancel,
}: EventDetailsViewProps) {
  if (loading && !refreshing) {
    return <SafeAreaView style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#4F46E5" /><Text style={styles.loadingText}>Loading experience...</Text></SafeAreaView>;
  }
  if (!event) {
    return <SafeAreaView style={[styles.container, styles.center]}><MaterialCommunityIcons name="alert-circle-outline" size={48} color="#9CA3AF" /><Text style={styles.emptyTitle}>Event Not Found</Text><TouchableOpacity style={styles.backHomeBtn} onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back"><Text style={styles.backHomeBtnText}>Go Back</Text></TouchableOpacity></SafeAreaView>;
  }

  const startDate = event.starts_at ? new Date(event.starts_at) : null;
  const dateFormatted = startDate ? startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Date TBD';
  const timeFormatted = startDate ? startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Time TBD';
  const isRsvped = event.user_rsvp?.status === 'confirmed' || event.user_rsvp?.status === 'waitlist';
  const priceDisplay = event.price > 0 ? `₹${event.price}` : 'FREE';

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insetsTop, 10) }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back"><MaterialCommunityIcons name="arrow-left" size={24} color="#111827" /></TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Event Details</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => Alert.alert('Share', 'Share feature coming soon!')} accessibilityRole="button" accessibilityLabel="Share event"><MaterialCommunityIcons name="share-variant-outline" size={22} color="#111827" /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}>
        <View style={styles.imageContainer}>
          <Image source={event.images?.[0] ? { uri: event.images[0] } : require('@/assets/images/hampi.png')} style={styles.coverImage} resizeMode="cover" />
          <View style={styles.pricePill}><Text style={styles.pricePillText}>{priceDisplay}</Text></View>
        </View>
        <View style={styles.sectionCard}>
          {event.club?.name && <View style={styles.clubBadge}><Text style={styles.clubIcon}>{event.club.icon || '🎯'}</Text><Text style={styles.clubName}>{event.club.name}</Text></View>}
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.capacityRow}><MaterialCommunityIcons name="account-group" size={18} color="#4F46E5" /><Text style={styles.capacityText}>{event.rsvp_count || 0} / {event.capacity || '∞'} spots filled ({event.spots_remaining || 0} left)</Text></View>
        </View>
        <View style={styles.sectionCard}>
          <View style={styles.infoRow}><View style={styles.iconCircle}><MaterialCommunityIcons name="calendar-clock" size={22} color="#4F46E5" /></View><View style={styles.infoTextContainer}><Text style={styles.infoTitle}>{dateFormatted}</Text><Text style={styles.infoSubtitle}>{timeFormatted}</Text></View></View>
          <View style={[styles.infoRow, { marginTop: 14 }]}><View style={styles.iconCircle}><MaterialCommunityIcons name="map-marker-radius" size={22} color="#4F46E5" /></View><View style={styles.infoTextContainer}><Text style={styles.infoTitle}>{event.location_name || 'Location TBA'}</Text>{event.location_address && <Text style={styles.infoSubtitle}>{event.location_address}</Text>}</View></View>
        </View>
        {event.host && <View style={styles.sectionCard}><Text style={styles.sectionCardHeader}>Hosted By</Text><View style={styles.hostRow}><View style={styles.hostAvatarCircle}><Text style={styles.hostAvatarText}>{event.host.name ? event.host.name.charAt(0).toUpperCase() : 'H'}</Text></View><View style={styles.hostInfo}><View style={styles.hostNameRow}><Text style={styles.hostName}>{event.host.name}</Text>{event.host.is_verified && <MaterialCommunityIcons name="check-decagram" size={16} color="#4F46E5" />}</View><Text style={styles.hostSubtext}>{event.host.events_hosted || 0} events hosted on Reliive</Text></View></View></View>}
        <View style={styles.sectionCard}><Text style={styles.sectionCardHeader}>About Experience</Text><Text style={styles.descriptionText}>{event.description || 'Join us for this exciting community event! Connect with fellow members and enjoy a great experience.'}</Text></View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insetsBottom, 16) }]}><TouchableOpacity style={[styles.primaryRsvpBtn, isRsvped && styles.cancelRsvpBtn, actionLoading && styles.disabledBtn]} onPress={onRsvp} disabled={actionLoading} accessibilityRole="button" accessibilityLabel={isRsvped ? 'Cancel RSVP' : 'RSVP for this event'}>{actionLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.primaryRsvpBtnText}>{isRsvped ? '✅ RSVP\'d (Tap to Cancel)' : (event.event_type === 'paid' ? `Book Experience · ${priceDisplay}` : 'RSVP Now')}</Text>}</TouchableOpacity></View>
      <ActionDialog visible={dialog !== null} title={dialog?.title || ''} message={dialog?.message || ''} confirmLabel={dialog?.confirmLabel || 'OK'} destructive={dialog?.destructive} onConfirm={onDialogConfirm} onCancel={onDialogCancel} />
    </SafeAreaView>
  );
}
