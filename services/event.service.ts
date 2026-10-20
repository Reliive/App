import axios from 'axios';
import { api } from './auth.service';
import {
  ApiResponse,
  CreateEventInput,
  EventAttendee,
  EventDetails,
  EventCollections,
  EventListItem,
  EventRsvp,
} from '@/types/event';
import { getErrorMessage } from '@/utils/error';

interface EventValidationError {
  field: string;
  message: string;
}

type EventQuery = Record<string, string | number | boolean>;

/**
 * Provides typed API operations for event discovery, management, and RSVPs.
 * Each operation preserves a useful backend error message for the UI.
 */
export const EventService = {
  async listEvents(params?: EventQuery): Promise<ApiResponse<EventListItem[]>> {
    try {
      const response = await api.get('/events', { params });
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to list events'));
    }
  },

  async getFeaturedExperiences(): Promise<ApiResponse<EventListItem[]>> {
    try {
      const response = await api.get('/events', { params: { featured: 'true' } });
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to get featured experiences'));
    }
  },

  async getMyEvents(): Promise<ApiResponse<EventCollections>> {
    try {
      const response = await api.get('/events/my');
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to get my events'));
    }
  },

  async createEvent(eventData: CreateEventInput): Promise<ApiResponse<EventDetails>> {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error: unknown) {
      const responseData = getResponseData(error);
      let message = getErrorMessage(error, 'Failed to create event');
      if (Array.isArray(responseData?.errors)) {
        const validationErrors = responseData.errors.filter(isEventValidationError);
        const errorDetails = validationErrors
          .map(({ field, message: detail }) => `${field}: ${detail}`)
          .join(', ');
        if (errorDetails) {
          message = `${message}: ${errorDetails}`;
        }
      }
      throw new Error(message);
    }
  },

  async getEventDetails(id: string): Promise<ApiResponse<EventDetails>> {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to get event details'));
    }
  },

  async getEventAttendees(id: string): Promise<ApiResponse<EventAttendee[]>> {
    try {
      const response = await api.get(`/events/${id}/attendees`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to get attendees'));
    }
  },

  async checkInAttendee(id: string, userId?: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await api.post(`/events/${id}/checkin`, { user_id: userId });
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Check-in failed'));
    }
  },

  async cancelEvent(id: string, reason?: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await api.delete(`/events/${id}`, { data: { reason } });
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to cancel event'));
    }
  },

  async updateEvent(
    id: string,
    eventData: Record<string, string | number | null>
  ): Promise<ApiResponse<EventDetails>> {
    try {
      const response = await api.patch(`/events/${id}`, eventData);
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to update event'));
    }
  },

  async rsvp(id: string): Promise<ApiResponse<EventRsvp>> {
    try {
      const response = await api.post(`/events/${id}/rsvp`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to RSVP for event'));
    }
  },

  async cancelRsvp(id: string): Promise<ApiResponse<unknown>> {
    try {
      const response = await api.delete(`/events/${id}/rsvp`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to cancel RSVP'));
    }
  },
};

/**
 * Extracts validation payload data only when Axios confirms the response shape.
 */
function getResponseData(error: unknown): { errors?: unknown } | null {
  if (!axios.isAxiosError(error) || !error.response?.data || typeof error.response.data !== 'object') {
    return null;
  }
  return error.response.data as { errors?: unknown };
}

/**
 * Narrows arbitrary backend validation entries to the fields used in messages.
 */
function isEventValidationError(value: unknown): value is EventValidationError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<EventValidationError>;
  return typeof candidate.field === 'string' && typeof candidate.message === 'string';
}
