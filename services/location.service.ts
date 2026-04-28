import { api } from './auth.service';

export interface LocationData {
  latitude: number;
  longitude: number;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  location_name: string | null;
}

export const LocationService = {
  /**
   * Send GPS coordinates to backend.
   * Backend handles reverse geocoding (Nominatim) and PostGIS point storage.
   */
  async updateLocation(latitude: number, longitude: number): Promise<LocationData> {
    try {
      const response = await api.post('/location/update', { latitude, longitude });
      return response.data?.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update location';
      throw new Error(message);
    }
  },
};
