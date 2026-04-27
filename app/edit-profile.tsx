import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserService } from '@/services/user.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const NEIGHBORHOODS = [
  { label: 'Koramangala', value: 'Koramangala' },
  { label: 'Indiranagar', value: 'Indiranagar' },
  { label: 'HSR Layout', value: 'HSR Layout' },
  { label: 'Jayanagar', value: 'Jayanagar' },
  { label: 'Alambagh', value: 'Alambagh' },
  { label: 'Whitefield', value: 'Whitefield' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [name, setName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await UserService.getMe();
        if (res?.data) {
          setUser(res.data);
          setName(res.data.name || '');
          setNeighborhood(res.data.neighborhood || '');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        Alert.alert('Error', 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    
    try {
      setSaving(true);
      await UserService.updateProfile({
        name: name.trim(),
        neighborhood,
      });
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Text style={styles.label}>Avatar</Text>
          <View style={styles.avatarWrapper}>
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => user?.avatar_url && setIsImageModalVisible(true)}
            >
              <View style={styles.avatarContainer}>
                {user?.avatar_url ? (
                  <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <MaterialCommunityIcons name="account" size={60} color="#9CA3AF" />
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.editIconContainer} 
                  onPress={() => Alert.alert('Coming Soon', 'Profile image upload will be enabled in the next version!')}
                >
                  <MaterialCommunityIcons name="camera" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <Input
            label="Display Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Neighborhood</Text>
            <View style={styles.neighborhoodContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.neighborhoodScroll}>
                {NEIGHBORHOODS.map((n) => (
                  <TouchableOpacity 
                    key={n.value}
                    style={[
                      styles.neighborhoodChip, 
                      neighborhood === n.value && styles.neighborhoodChipActive
                    ]}
                    onPress={() => setNeighborhood(n.value)}
                  >
                    <Text style={[
                      styles.neighborhoodText,
                      neighborhood === n.value && styles.neighborhoodTextActive
                    ]}>{n.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <Button 
            title="Save Changes" 
            onPress={handleSave} 
            isLoading={saving}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal visible={isImageModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <TouchableOpacity 
            style={styles.modalClose} 
            onPress={() => setIsImageModalVisible(false)}
          >
            <MaterialCommunityIcons name="close" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.modalContent}>
            {user?.avatar_url && (
              <Image 
                source={{ uri: user.avatar_url }} 
                style={styles.fullScreenImage} 
                resizeMode="contain" 
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    marginTop: 12,
  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4F46E5',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 8,
  },
  neighborhoodContainer: {
    marginTop: 8,
  },
  neighborhoodScroll: {
    flexGrow: 0,
  },
  neighborhoodChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  neighborhoodChipActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  neighborhoodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  neighborhoodTextActive: {
    color: '#4F46E5',
  },
  saveButton: {
    marginTop: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  modalContent: {
    width: '100%',
    height: '80%',
  },
  fullScreenImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
