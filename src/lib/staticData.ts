import photosData from '../data/photos.json';
import activitiesData from '../data/activities.json';
import eventsData from '../data/events.json';

export interface Photo {
  id: number;
  image: string;
  category: 'events' | 'activity' | 'community';
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  image?: string;
  displayOn: 'home' | 'activities' | 'both';
}

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  image?: string;
  displayOn: 'home' | 'events' | 'both';
}

// Simulate API calls with static data
export const getPhotos = (): Promise<Photo[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(photosData as Photo[]);
    }, 300); // Simulate network delay
  });
};

export const getActivities = (displayOn?: 'home' | 'activities'): Promise<Activity[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const activities = activitiesData as Activity[];
      if (displayOn) {
        resolve(activities.filter(a => a.displayOn === displayOn || a.displayOn === 'both'));
      } else {
        resolve(activities);
      }
    }, 300);
  });
};

export const getEvents = (displayOn?: 'home' | 'events'): Promise<Event[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const events = eventsData as Event[];
      if (displayOn) {
        resolve(events.filter(e => e.displayOn === displayOn || e.displayOn === 'both'));
      } else {
        resolve(events);
      }
    }, 300);
  });
}; 