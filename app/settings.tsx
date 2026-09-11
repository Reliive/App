import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthService, setAuthToken } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { useAuth } from '@/contexts/AuthContext';
import { showLogoutDialog, showDeleteAccountDialog } from '@/dialogs/ConfirmationDialogs';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { signOut } = useAuth();

  const handleLogout = async () => {
    showLogoutDialog(async () => {
      try {
        await AuthService.logout();
      } catch (error: any) {
        console.error('Logout error:', error);
      } finally {
        await signOut();
      }
    });
  };

  const handleDeleteAccount = () => {
    showDeleteAccountDialog(async () => {
      try {
        await UserService.deleteMe();
        await signOut();
        Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to delete account');
      }
    });
  };

  const renderSettingRow = (icon: any, title: string, showChevron: boolean = true, rightComponent?: React.ReactNode, onPress?: () => void) => (
    <TouchableOpacity 
      style={styles.settingRow} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <MaterialCommunityIcons name={icon} size={24} color="#4B5563" style={styles.settingIcon} />
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showChevron && <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ACCOUNT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCOUNT</Text>
          <View style={styles.card}>
            {renderSettingRow('account-outline', 'Edit Profile', true, null, () => router.push('/profile/edit'))}
            <View style={styles.divider} />
            {renderSettingRow('bell-outline', 'Notifications', true, null, () => router.push('/notifications' as any))}
            <View style={styles.divider} />
            {renderSettingRow('lock-outline', 'Privacy', true, null, () => router.push('/settings/privacy' as any))}
          </View>
        </View>

        {/* ACCESSIBILITY SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCESSIBILITY</Text>
          <View style={styles.card}>
            {renderSettingRow('format-size', 'Text Size', true, null, () => Alert.alert('Text Size', 'Dynamic font scaling is enabled by default.'))}
            <View style={styles.divider} />
            {renderSettingRow(
              'moon-waning-crescent', 
              'Dark Mode', 
              false, 
              <Switch 
                value={isDarkMode} 
                onValueChange={setIsDarkMode} 
                trackColor={{ false: '#D1D5DB', true: '#4F46E5' }}
                thumbColor="#FFFFFF"
              />
            )}
          </View>
        </View>

        {/* SUPPORT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SUPPORT</Text>
          <View style={styles.card}>
            {renderSettingRow('help-circle-outline', 'Help & FAQ', true, null, () => router.push('/settings/help' as any))}
            <View style={styles.divider} />
            {renderSettingRow('email-outline', 'Contact Us', true, null, () => router.push('/settings/contact' as any))}
            <View style={styles.divider} />
            {renderSettingRow('file-document-outline', 'Terms & Privacy', true, null, () => router.push('/settings/terms' as any))}
          </View>
        </View>

        {/* LOG OUT BUTTON */}
        <TouchableOpacity style={[styles.card, styles.actionCard]} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#4B5563" />
          <Text style={styles.actionText}>Log Out</Text>
        </TouchableOpacity>

        {/* DELETE ACCOUNT BUTTON */}
        <TouchableOpacity style={[styles.card, styles.actionCard, styles.deleteCard]} onPress={handleDeleteAccount}>
          <MaterialCommunityIcons name="trash-can-outline" size={24} color="#DC2626" />
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 52,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  actionText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    marginLeft: 12,
  },
  deleteCard: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  deleteText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 12,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },
});
