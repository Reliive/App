import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserService } from '@/services/user.service';
import { useRouter } from 'expo-router';

// Fallbacks if data is missing
const FALLBACK_BADGES = [
  { id: '1', name: 'Explorer', icon: '🏅' },
  { id: '2', name: 'Regular', icon: '🎯' },
  { id: '3', name: 'Bookworm', icon: '📚' },
];

const FALLBACK_INTERESTS = [
  { id: '1', label: 'Travel', icon: '✈️', color: '#EEF2FF' },
  { id: '2', label: 'Books', icon: '📚', color: '#FEF3C7' },
  { id: '3', label: 'Music', icon: '🎵', color: '#ECFDF5' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await UserService.getMe();
        if (res?.data) {
          setUser(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  const name = user?.name || 'User';
  const neighborhood = user?.neighborhood || 'Not specified';
  const eventsAttended = user?.stats?.events_attended || 0;
  const eventsHosted = user?.stats?.events_hosted || 0;
  // Calculate points as a dummy metric since it's not in the API
  const points = eventsAttended * 10 + eventsHosted * 50 + 156;

  // For badges and interests we will use fallbacks if empty, to ensure UI is visible.
  const badges = user?.badges?.length > 0 ? user.badges : FALLBACK_BADGES;
  const interests = user?.interests?.length > 0 
    ? user.interests.map((interest: string, idx: number) => ({
        id: String(idx), label: interest, icon: '✨', color: '#EEF2FF'
      })) 
    : FALLBACK_INTERESTS;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings')}>
            <MaterialCommunityIcons name="cog-outline" size={26} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={48} color="#9CA3AF" />
              </View>
            )}
          </View>
          <Text style={styles.nameText}>{name}</Text>
          <Text style={styles.locationText}>📍 {neighborhood}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{eventsAttended}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{eventsHosted}</Text>
            <Text style={styles.statLabel}>Hosted</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{points}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BADGES</Text>
          <View style={styles.badgesWrapper}>
            {badges.map((badge: any, index: number) => (
              <View key={index} style={styles.badgeChip}>
                <Text style={styles.badgeIcon}>{badge.icon || '🏅'}</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* My Interests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>MY INTERESTS</Text>
          </View>
          <View style={styles.interestsWrapper}>
            {interests.map((interest: any, index: number) => {
              const colors = ['#EEF2FF', '#FEF3C7', '#ECFDF5', '#FDF2F8'];
              const bgColor = interest.color || colors[index % colors.length];
              return (
                <View key={interest.id} style={[styles.interestChip, { backgroundColor: bgColor }]}>
                  <Text style={styles.interestIcon}>{interest.icon}</Text>
                  <Text style={styles.interestLabel}>{interest.label}</Text>
                </View>
              );
            })}
          </View>
          <TouchableOpacity 
            style={styles.editInterestsButton}
            onPress={() => router.push('/onboarding/interests')}
          >
            <Text style={styles.editInterestsText}>Edit →</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Upsell */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.premiumCard} activeOpacity={0.8}>
            <View style={styles.premiumContent}>
              <Text style={styles.premiumTitle}>⭐ Upgrade to Premium</Text>
              <Text style={styles.premiumSubtitle}>Early access, discounts & more</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#F59E0B" />
          </TouchableOpacity>
        </View>

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
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  iconButton: {
    padding: 8,
    marginRight: -8,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 32,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
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
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  badgesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  badgeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  interestsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  interestIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  interestLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  editInterestsButton: {
    alignSelf: 'flex-end',
  },
  editInterestsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: '#D97706',
    fontWeight: '500',
  },
});
