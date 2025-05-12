export interface TeamMember {
  name: string;
  role: string;
  image: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
} 