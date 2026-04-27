import { api } from './auth.service';

export const EventService = {
  async listEvents(params?: any) {
    try {
      const response = await api.get('/events', { params });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to list events';
      throw new Error(message);
    }
  },

  async getFeaturedExperiences() {
    try {
      const response = await api.get('/events', { params: { featured: 'true' } });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to get featured experiences';
      throw new Error(message);
    }
  }
};
