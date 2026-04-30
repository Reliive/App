import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ClubService } from '@/services/club.service';

const EVENT_TEMPLATES = [
  { id: 'coffee', label: 'Coffee', icon: '☕' },
  { id: 'walk', label: 'Walk', icon: '🚶' },
  { id: 'dinner', label: 'Dinner', icon: '🍽️' },
  { id: 'custom', label: 'Custom', icon: '✨' },
];

const LOCATIONS = [
  { label: 'Bara Imambara', value: 'bara_imambara' },
  { label: 'Gomti Riverfront Park', value: 'gomti_riverfront' },
  { label: 'Janeshwar Mishra Park', value: 'janeshwar_mishra' },
  { label: 'Cubbon Park', value: 'cubbon_park' },
  { label: 'Custom Location', value: 'custom' },
];

export default function HostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // State
  const [selectedTemplate, setSelectedTemplate] = useState('coffee');
  const [title, setTitle] = useState('');
  
  // Date & Time
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Selects
  const [location, setLocation] = useState('');
  const [clubId, setClubId] = useState('');
  
  // Data
  const [clubs, setClubs] = useState<{label: string, value: string}[]>([]);

  useEffect(() => {
    // Set default title based on template
    const template = EVENT_TEMPLATES.find(t => t.id === selectedTemplate);
    if (template && title === '') {
      setTitle(`Sunday ${template.label}`);
    } else if (template && EVENT_TEMPLATES.some(t => `Sunday ${t.label}` === title)) {
      setTitle(`Sunday ${template.label}`);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const fetchedClubs = await ClubService.listClubs();
        const formattedClubs = fetchedClubs.map(c => ({
          label: `${c.icon || '📚'} ${c.name}`,
          value: c.id
        }));
        setClubs(formattedClubs);
      } catch (error) {
        console.error('Failed to fetch clubs:', error);
      }
    };
    
    fetchClubs();
  }, []);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) setDate(selectedTime);
  };

  const handleNext = () => {
    if (!title || !location || !clubId) {
      Alert.alert('Missing Details', 'Please fill in all required fields.');
      return;
    }

    router.push({
      pathname: '/events/create-details',
      params: {
        template: selectedTemplate,
        title,
        starts_at: date.toISOString(),
        location,
        clubId
      }
    });
  };

  const formatDate = (dateObj: Date) => {
    return dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  };
  
  const formatTime = (dateObj: Date) => {
    return dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <Text style={styles.headerTitle}>Host an Event</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What kind of event is this?</Text>
            
            <View style={styles.templatesGrid}>
              {EVENT_TEMPLATES.map((template) => {
                const isSelected = selectedTemplate === template.id;
                return (
                  <TouchableOpacity
                    key={template.id}
                    style={[styles.templateCard, isSelected && styles.templateCardSelected]}
                    onPress={() => setSelectedTemplate(template.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.templateIcon}>{template.icon}</Text>
                    <Text style={[styles.templateLabel, isSelected && styles.templateLabelSelected]}>
                      {template.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>DETAILS</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <Input
                placeholder="Sunday Book Reading..."
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date & Time</Text>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity 
                  style={styles.dateTimeButton} 
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dateTimeButton} 
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.dateTimeText}>{formatTime(date)}</Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={date}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Select
                label="Location"
                options={LOCATIONS}
                value={location}
                onValueChange={setLocation}
                placeholder="📍 Select Location"
              />
            </View>

            <View style={styles.inputGroup}>
              <Select
                label="Club"
                options={clubs}
                value={clubId}
                onValueChange={setClubId}
                placeholder="📚 Select Club"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Next: Details →"
            onPress={handleNext}
            variant="primary"
            style={styles.nextButton}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 16,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  templateCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  templateCardSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  templateIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  templateLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  templateLabelSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#111827',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    width: '100%',
  },
});
