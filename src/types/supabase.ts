export interface GalleryImage {
  id: string;
  created_at: string;
  image_path: string;
  category: 'events' | 'activities' | 'community';
  title?: string;
  alt_text?: string;
}

export interface Activity {
  id: string;
  created_at: string;
  title: string;
  description: string;
  image_path?: string;
  display_on: 'home' | 'activities' | 'both';
  sort_order?: number;
}

export interface Event {
  id: string;
  created_at: string;
  title: string;
  date: string;
  start_time?: string;
  end_time?: string;
  venue: string;
  description: string;
  image_path?: string;
  display_on: 'home' | 'events' | 'both';
  publish_at?: string; // When the event should become visible (SAST timezone)
  is_archived?: boolean; // Whether the event has been moved to past events
  archived_at?: string; // When the event was archived
  status?: 'draft' | 'published' | 'archived'; // Current status
}

export interface Database {
  public: {
    Tables: {
      gallery: {
        Row: GalleryImage;
        Insert: Omit<GalleryImage, 'id' | 'created_at'>;
        Update: Partial<Omit<GalleryImage, 'id' | 'created_at'>>;
      };
      activities: {
        Row: Activity;
        Insert: Omit<Activity, 'id' | 'created_at'>;
        Update: Partial<Omit<Activity, 'id' | 'created_at'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at'>>;
      };
    };
  };
} 