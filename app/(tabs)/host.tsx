import React, { useState, useEffect } from 'react';
import { Text, View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ClubService } from '@/services/club.service';
import { EventDateTimePicker } from '@/components/events/EventDateTimePicker';
import { styles } from '@/styles/host.styles';

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
  const [title, setTitle] = useState('Sunday Coffee');
  
  // Date & Time
  const [date, setDate] = useState(new Date());
  
  // Selects
  const [location, setLocation] = useState('');
  const [clubId, setClubId] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Data
  const [clubs, setClubs] = useState<{label: string, value: string}[]>([]);

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

  const handleNext = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Title is required.';
    if (!location) errors.location = 'Location is required.';
    if (!clubId) errors.clubId = 'Club is required.';
    if (!selectedTemplate) errors.template = 'Category is required.';
    if (!date || Number.isNaN(date.getTime())) {
      errors.date = 'Date and time are required.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
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
            <Text style={styles.sectionTitle}>What kind of event is this?<Text style={styles.required}>*</Text></Text>
            
            <View style={styles.templatesGrid}>
              {EVENT_TEMPLATES.map((template) => {
                const isSelected = selectedTemplate === template.id;
                return (
                  <TouchableOpacity
                    key={template.id}
                    style={[styles.templateCard, isSelected && styles.templateCardSelected]}
                    onPress={() => {
                      setSelectedTemplate(template.id);
                      if (title.startsWith('Sunday ')) setTitle(`Sunday ${template.label}`);
                    }}
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
            {fieldErrors.template ? <Text style={styles.errorText}>{fieldErrors.template}</Text> : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>DETAILS</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title<Text style={styles.required}>*</Text></Text>
              <Input
                placeholder="Sunday Book Reading..."
                value={title}
                onChangeText={setTitle}
              />
              {fieldErrors.title ? <Text style={styles.errorText}>{fieldErrors.title}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date & Time<Text style={styles.required}>*</Text></Text>
              <EventDateTimePicker
                selectedDate={date}
                onDateChange={setDate}
                error={fieldErrors.date}
              />
            </View>

            <View style={styles.inputGroup}>
              <Select
                label="Location *"
                options={LOCATIONS}
                value={location}
                onValueChange={setLocation}
                placeholder="📍 Select Location"
              />
              {fieldErrors.location ? <Text style={styles.errorText}>{fieldErrors.location}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Select
                label="Club *"
                options={clubs}
                value={clubId}
                onValueChange={setClubId}
                placeholder="📚 Select Club"
              />
              {fieldErrors.clubId ? <Text style={styles.errorText}>{fieldErrors.clubId}</Text> : null}
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
