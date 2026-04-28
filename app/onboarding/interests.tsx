import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';

import { MaterialCommunityIcons } from '@expo/vector-icons';

const INTERESTS = [
  { id: '1', label: 'Travel', icon: '✈️' },
  { id: '2', label: 'Books', icon: '📚' },
  { id: '3', label: 'Art', icon: '🎨' },
  { id: '4', label: 'Music', icon: '🎵' },
  { id: '5', label: 'Cooking', icon: '🍳' },
  { id: '6', label: 'Wellness', icon: '🧘' },
  { id: '7', label: 'Technology', icon: '💻' },
  { id: '8', label: 'Outdoors', icon: '🌲' },
  { id: '9', label: 'Photography', icon: '📷' },
  { id: '10', label: 'Foodie', icon: '🍔' },
];

export default function InterestsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // Initialize selected interests from existing ones if provided
  const initialSelectedIds = useMemo(() => {
    if (!params.existingInterests) return [];
    try {
      const labels = JSON.parse(params.existingInterests as string);
      return INTERESTS
        .filter(i => labels.includes(i.label))
        .map(i => i.id);
    } catch (e) {
      return [];
    }
  }, [params.existingInterests]);

  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialSelectedIds);

  // Update selection if initialSelectedIds changes (e.g. on navigation)
  useEffect(() => {
    if (initialSelectedIds.length > 0) {
      setSelectedInterests(initialSelectedIds);
    }
  }, [initialSelectedIds]);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const hasChanged = useMemo(() => {
    if (selectedInterests.length !== initialSelectedIds.length) return true;
    const sortedInitial = [...initialSelectedIds].sort();
    const sortedCurrent = [...selectedInterests].sort();
    return sortedInitial.some((val, index) => val !== sortedCurrent[index]);
  }, [selectedInterests, initialSelectedIds]);

  const isButtonDisabled = selectedInterests.length < 1 || (params.existingInterests ? !hasChanged : false);

  const handleContinue = () => {
    if (isButtonDisabled) return;
    
    // Navigate to microprofile with name and interests param
    const selectedLabels = selectedInterests.map(id => INTERESTS.find(i => i.id === id)?.label).filter(Boolean);
    router.push({
      pathname: '/onboarding/microprofile',
      params: { 
        name: params.name,
        interests: JSON.stringify(selectedLabels)
      }
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        {params.existingInterests ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
          </TouchableOpacity>
        ) : (
          <View style={{ height: 20 }} /> // Spacer to keep layout consistent
        )}
        <Text style={styles.title}>What are you into?</Text>
        <Text style={styles.subtitle}>Pick at least 1 interest</Text>

        <View style={styles.grid}>
          {INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest.id);
            return (
              <TouchableOpacity
                key={interest.id}
                style={[styles.interestCard, isSelected && styles.interestCardSelected]}
                onPress={() => toggleInterest(interest.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.interestIcon}>{interest.icon}</Text>
                <Text 
                  style={[styles.interestLabel, isSelected && styles.interestLabelSelected]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {interest.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Continue →" 
          onPress={handleContinue}
          disabled={isButtonDisabled}
          style={isButtonDisabled ? styles.disabledButton : null}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
    marginLeft: -4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  interestCard: {
    width: '30%', // Maps perfectly to 3 items per row
    aspectRatio: 1, // Creates perfect squares
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  interestCardSelected: {
    borderColor: '#4F46E5', // Indigo color for active state
    backgroundColor: '#EEF2FF',
  },
  interestIcon: {
    fontSize: 36, // Large emojis as requested
    marginBottom: 8,
  },
  interestLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
    minWidth: 0,
  },
  interestLabelSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.5,
  }
});
