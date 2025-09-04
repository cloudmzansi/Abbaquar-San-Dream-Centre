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

export interface TeamMember {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  role: string;
  image_path?: string;
  sort_order?: number;
  is_active?: boolean;
  category?: 'leadership' | 'management' | 'volunteers';
}

export interface Volunteer {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  role: string;
  image_path?: string;
  sort_order?: number;
  is_active?: boolean;
  category?: 'leadership' | 'management' | 'volunteers';
}

// Union type for admin panel that includes source information
export type TeamMemberWithSource = TeamMember & { source: 'team_members' };
export type VolunteerWithSource = Volunteer & { source: 'volunteers' };
export type MemberWithSource = TeamMemberWithSource | VolunteerWithSource;

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
      team_members: {
        Row: TeamMember;
        Insert: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>>;
      };
      volunteers: {
        Row: Volunteer;
        Insert: Omit<Volunteer, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Volunteer, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
} 