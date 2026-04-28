import { api } from './auth.service';

export interface UpdateProfileData {
  name?: string;
  avatar_url?: string;
  neighborhood?: string;
  accessibility_prefs?: Record<string, boolean>;
  emergency_contact?: Record<string, string>;
  interests?: string[];
}

export const UserService = {
  async getMe() {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch profile';
      throw new Error(message);
    }
  },

  async updateProfile(profileData: UpdateProfileData) {
    try {
      const { interests, ...otherData } = profileData;
      
      // Update basic profile details
      if (Object.keys(otherData).length > 0) {
        await api.patch('/users/me', otherData);
      }

      // Update interests if provided
      if (interests && Array.isArray(interests)) {
        await api.post('/users/me/interests', { interests });
      }

      return { success: true, message: 'Profile updated' };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      throw new Error(message);
    }
  },

  async deleteMe() {
    try {
      const response = await api.delete('/users/me');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete account';
      throw new Error(message);
    }
  },
};
