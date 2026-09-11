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
  },

  async getMyEvents() {
    try {
      const response = await api.get('/events/my');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to get my events';
      throw new Error(message);
    }
  },

  async createEvent(eventData: any) {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create event';
      throw new Error(message);
    }
  },

  async getEventDetails(id: string) {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to get event details';
      throw new Error(message);
    }
  },

  async getEventAttendees(id: string) {
    try {
      const response = await api.get(`/events/${id}/attendees`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to get attendees';
      throw new Error(message);
    }
  },

  async checkInAttendee(id: string, userId?: string) {
    try {
      const response = await api.post(`/events/${id}/checkin`, { user_id: userId });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Check-in failed';
      throw new Error(message);
    }
  },

  async cancelEvent(id: string, reason?: string) {
    try {
      const response = await api.delete(`/events/${id}`, { data: { reason } });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to cancel event';
      throw new Error(message);
    }
  },

  async updateEvent(id: string, eventData: any) {
    try {
      const response = await api.patch(`/events/${id}`, eventData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update event';
      throw new Error(message);
    }
  },

  async rsvp(id: string) {
    try {
      const response = await api.post(`/events/${id}/rsvp`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to RSVP for event';
      throw new Error(message);
    }
  },

  async cancelRsvp(id: string) {
    try {
      const response = await api.delete(`/events/${id}/rsvp`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to cancel RSVP';
      throw new Error(message);
    }
  }
};

