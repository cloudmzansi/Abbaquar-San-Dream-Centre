import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Calendar, Clock, MapPin, Eye, ArrowRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { getEvents } from '@/lib/eventsService';
import { Event } from '@/types/supabase';
import { format, parseISO } from 'date-fns';
import EventModal from './EventModal';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import './UpcomingEvents.css';

interface UpcomingEventsProps {
  displayOn?: 'home' | 'events' | 'both';
}

/**
 * Format a date string as 'DD/MM/YYYY'.
 * Returns '-' if invalid.
 */
function formatEventDate(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy');
  } catch {
    return '-';
  }
}

// Memoize EventCard to prevent unnecessary re-renders
const EventCard = memo(({ event, onClick }: { event: Event; onClick: (event: Event) => void }) => {
  // Format time to display as "start_time - end_time" using useMemo
  const formattedTime = useMemo(() => {
    return event.start_time && event.end_time ? 
      `${event.start_time} - ${event.end_time}` : 
      event.start_time || 'Time TBD';
  }, [event.start_time, event.end_time]);
    
  return (
    <div 
      className="bg-gray-50 rounded-2xl p-6 h-full cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group"
      onClick={() => onClick(event)}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="bg-white rounded-2xl p-3 shadow-sm">
            <Calendar className="h-6 w-6 text-[#8A4BA3]" />
          </div>
          <span className="text-sm font-medium text-[#8A4BA3] bg-[#8A4BA3]/10 px-3 py-1 rounded-full">
            Upcoming
          </span>
        </div>
        <h3 className="text-xl font-semibold text-[#073366] mt-2 group-hover:text-[#8A4BA3] transition-colors">
          {event.title}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm">{formatEventDate(event.date)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm">{formattedTime}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">{event.venue}</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm line-clamp-3">{event.description}</p>
        
        {/* Click indicator */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center text-[#8A4BA3] text-sm font-medium">
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </div>
          <ArrowRight className="h-4 w-4 text-[#8A4BA3]" />
        </div>
      </div>
    </div>
  );
});

const UpcomingEvents = ({ displayOn = 'home' }: UpcomingEventsProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoize the checkMobile function to prevent recreation on each render
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  // Handle window resize with useCallback
  useEffect(() => {
    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // Fetch events with useCallback to prevent unnecessary recreation
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getEvents(displayOn);
      setEvents(data);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [displayOn]);
  
  // Fetch events when displayOn changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle event click
  const handleEventClick = useCallback((event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  // Memoize the mobile events display to prevent unnecessary re-renders
  const mobileEventsDisplay = useMemo(() => (
    <div className="w-full pb-12">
      <Swiper
        modules={[Pagination]}
        spaceBetween={16}
        slidesPerView={1.2}
        centeredSlides={true}
        pagination={{ 
          clickable: true,
          enabled: true
        }}
        className="w-full events-swiper"
      >
        {events.length === 0 ? (
          <SwiperSlide>
            <div className="text-center py-12 text-gray-500">No upcoming events found.</div>
          </SwiperSlide>
        ) : (
          events.map((event) => (
            <SwiperSlide key={event.id}>
              <EventCard event={event} onClick={handleEventClick} />
            </SwiperSlide>
          ))
        )}
      </Swiper>
    </div>
  ), [events, handleEventClick]);

  // Memoize the desktop events display to prevent unnecessary re-renders
  const desktopEventsDisplay = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {events.length === 0 ? (
        <div className="col-span-full text-center py-12 text-gray-500">No upcoming events found.</div>
      ) : (
        events.map((event) => (
          <EventCard key={event.id} event={event} onClick={handleEventClick} />
        ))
      )}
    </div>
  ), [events, handleEventClick]);

  // Memoize the loading and error states
  const loadingDisplay = useMemo(() => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A4BA3]"></div>
    </div>
  ), []);

  const errorDisplay = useMemo(() => (
    <div className="bg-red-50 p-6 rounded-lg text-center text-red-600 mb-8">
      <p>{error}</p>
    </div>
  ), [error]);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <span className="text-[#8A4BA3] font-semibold mb-4 block">Join Us</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#073366] font-serif">Upcoming Events</h2>
          <p className="text-lg text-gray-600">
            Join our community events and make a difference. Every event is an opportunity to connect, 
            learn, and create positive change.
          </p>
        </div>

        {isLoading ? loadingDisplay : 
         error ? errorDisplay : 
         isMobile ? mobileEventsDisplay : desktopEventsDisplay}
        
        {/* View All Events Button */}
        {!isLoading && !error && events.length > 0 && (
          <div className="text-center mt-12">
            <a 
              href="/events" 
              className="inline-flex items-center bg-[#8A4BA3] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#7A3B93] transition-colors"
            >
              View All Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        )}
      </div>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </section>
  );
};

// Memoize the entire component to prevent unnecessary re-renders from parent components
export default memo(UpcomingEvents); 