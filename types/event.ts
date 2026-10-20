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
