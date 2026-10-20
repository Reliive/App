export interface CreateEventInput {
  title: string;
  description: string;
  club_id?: string;
  event_type: string;
  starts_at: string;
  location_name: string;
  capacity: number;
  accessibility_notes: string;
  images: string[];
}

export type EventType = 'free' | 'paid' | string;

export interface ClubSummary {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface EventListItem {
  id: string;
  title: string;
  event_type: EventType;
  starts_at: string;
  location_name?: string | null;
  capacity: number;
  rsvp_count: number;
  price: number;
  images?: string[];
  user_rsvp_status?: EventRsvp['status'] | null;
}

export interface EventHost {
  name: string;
  is_verified?: boolean;
  events_hosted?: number;
}

export interface EventAttendee {
  id: string;
  name: string;
  avatar_url?: string;
  rsvp_id: string;
  checked_in: boolean;
  checked_in_at?: string;
  rsvp_at: string;
}

export interface EventDetails extends EventListItem {
  description?: string | null;
  location_address?: string | null;
  spots_remaining?: number;
  club?: ClubSummary | null;
  host?: EventHost | null;
  user_rsvp?: EventRsvp | null;
}

export interface EventCollections {
  hosting: {
    upcoming: EventListItem[];
    past: EventListItem[];
  };
  attending: {
    upcoming: EventListItem[];
    past: EventListItem[];
  };
}

export interface UserProfile {
  name?: string;
  clubs?: ClubSummary[];
}

export interface NotificationSummary {
  unread_count?: number;
}

export interface EventRsvp {
  id: string;
  event_id: string;
  user_id: string;
  status: 'confirmed' | 'waitlist' | 'cancelled';
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string | null;
  data: T;
}
