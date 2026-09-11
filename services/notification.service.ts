import { api } from './auth.service';

export interface NotificationItem {
  id: string;
  user_id: string;
  type: 'event_reminder' | 'rsvp_confirmation' | 'club_update' | 'announcement' | 'system' | string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

export const NotificationService = {
  async getNotifications(params?: { unread?: boolean; limit?: number; offset?: number }) {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch notifications';
      throw new Error(message);
    }
  },

  async markAsRead(id: string) {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to mark notification as read';
      throw new Error(message);
    }
  },

  async markAllAsRead() {
    try {
      const response = await api.post('/notifications/read-all');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to mark all as read';
      throw new Error(message);
    }
  },

  async getPreferences() {
    try {
      const response = await api.get('/notifications/preferences');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to get notification preferences';
      throw new Error(message);
    }
  },

  async updatePreferences(preferences: any) {
    try {
      const response = await api.post('/notifications/preferences', preferences);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update preferences';
      throw new Error(message);
    }
  }
};
