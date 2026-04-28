import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ExpoLocation from 'expo-location';
import { LocationService, LocationData } from '@/services/location.service';

interface LocationPickerProps {
  /** Called when location is successfully fetched and saved */
  onLocationSet: (location: LocationData) => void;
  /** Optional error message from parent */
  errorMessage?: string;
}

type LocationState = 'idle' | 'requesting' | 'fetching' | 'saving' | 'done' | 'denied' | 'error';

export default function LocationPicker({ onLocationSet, errorMessage }: LocationPickerProps) {
  const [state, setState] = useState<LocationState>('idle');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = useCallback(async () => {
    setError(null);
    setState('requesting');

    try {
      // 1. Request permission
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState('denied');
        setError('Location permission denied');
        return;
      }

      // 2. Try Last Known Position (Instant)
      setState('fetching');
      let position = await ExpoLocation.getLastKnownPositionAsync();

      // 3. If last known is missing or too old (older than 10 mins), get fresh
      const isOld = position && (Date.now() - position.timestamp > 10 * 60 * 1000);
      
      if (!position || isOld) {
        position = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.Low,
        });
      }

      const { latitude, longitude } = position.coords;

      // 4. Send to backend
      setState('saving');
      const locationData = await LocationService.updateLocation(latitude, longitude);

      setLocation(locationData);
      setState('done');
      onLocationSet(locationData);
    } catch (err: any) {
      console.error('Location error:', err);
      setState('error');
      setError(err.message || 'Failed to get location');
    }
  }, [onLocationSet]);

  const handleOpenSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  const handleRetry = useCallback(() => {
    setState('idle');
    setError(null);
    setLocation(null);
    handleGetLocation();
  }, [handleGetLocation]);

  // Successfully resolved location
  if (state === 'done' && location) {
    return (
      <View style={styles.container}>
        <View style={styles.successCard}>
          <View style={styles.successHeader}>
            <MaterialCommunityIcons name="map-marker-check" size={22} color="#10B981" />
            <Text style={styles.successTitle}>Location Set</Text>
          </View>
          <View style={styles.locationDetails}>
            {location.location_city ? (
              <Text style={styles.cityText}>{location.location_city}</Text>
            ) : null}
            <Text style={styles.regionText}>
              {[location.location_state, location.location_country]
                .filter(Boolean)
                .join(', ')}
            </Text>
          </View>
          <TouchableOpacity style={styles.changeButton} onPress={handleRetry}>
            <MaterialCommunityIcons name="refresh" size={16} color="#4F46E5" />
            <Text style={styles.changeText}>Update Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Permission denied
  if (state === 'denied') {
    return (
      <View style={styles.container}>
        <View style={styles.deniedCard}>
          <MaterialCommunityIcons name="map-marker-off" size={32} color="#EF4444" />
          <Text style={styles.deniedTitle}>Location Access Denied</Text>
          <Text style={styles.deniedText}>
            Please enable location access in your device settings to continue.
          </Text>
          <View style={styles.deniedActions}>
            <TouchableOpacity style={styles.settingsButton} onPress={handleOpenSettings}>
              <Text style={styles.settingsButtonText}>Open Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Loading states
  const isLoading = ['requesting', 'fetching', 'saving'].includes(state);
  const loadingText =
    state === 'requesting' ? 'Requesting permission...'
    : state === 'fetching' ? 'Getting your location...'
    : state === 'saving' ? 'Saving location...'
    : '';

  return (
    <View style={styles.container}>
      {/* Get Location Button */}
      <TouchableOpacity
        style={[styles.locationButton, isLoading && styles.locationButtonDisabled]}
        onPress={handleGetLocation}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>{loadingText}</Text>
          </>
        ) : (
          <>
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={22}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Use My Current Location</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Error state */}
      {(state === 'error' || errorMessage) ? (
        <View style={styles.errorRow}>
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#EF4444" />
          <Text style={styles.errorText}>{error || errorMessage}</Text>
          {state === 'error' ? (
            <TouchableOpacity onPress={handleRetry}>
              <Text style={styles.retryLink}>Retry</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {/* Info text */}
      {state === 'idle' ? (
        <Text style={styles.infoText}>
          We'll use GPS to detect your city. This is only used for matching you with nearby users.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  // — Get Location Button —
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  locationButtonDisabled: {
    backgroundColor: '#818CF8',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // — Success Card —
  successCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 16,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#166534',
    marginLeft: 8,
  },
  locationDetails: {
    marginLeft: 30,
    marginBottom: 12,
  },
  cityText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  regionText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 30,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  changeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
    marginLeft: 4,
  },
  // — Denied Card —
  deniedCard: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 20,
  },
  deniedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
    marginTop: 10,
  },
  deniedText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  deniedActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  settingsButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  settingsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  retryButton: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  // — Error —
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginLeft: 6,
    flex: 1,
  },
  retryLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
    marginLeft: 8,
  },
  // — Info —
  infoText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 10,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
});
