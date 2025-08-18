import { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, MapPin, Search, Filter, Eye } from 'lucide-react';
import { getEvents } from '@/lib/eventsService';
import { Event } from '@/types/supabase';
import { format, parseISO } from 'date-fns';
import EventModal from '@/components/EventModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

/**
 * Format time to display as "start_time - end_time"
 */
function formatEventTime(event: Event): string {
  return event.start_time && event.end_time ? 
    `${event.start_time} - ${event.end_time}` : 
    event.start_time || 'Time TBD';
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getEvents('events');
        setEvents(data);
        setFilteredEvents(data);
      } catch (err) {
        console.error('Error loading events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEvents(events);
      return;
    }

    const filtered = events.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  // Group events by month
  const eventsByMonth = useMemo(() => {
    const grouped: { [key: string]: Event[] } = {};
    
    filteredEvents.forEach(event => {
      if (!event.date) return;
      
      try {
        const date = parseISO(event.date);
        const monthKey = format(date, 'MMMM yyyy');
        
        if (!grouped[monthKey]) {
          grouped[monthKey] = [];
        }
        grouped[monthKey].push(event);
      } catch {
        // Skip invalid dates
      }
    });

    // Sort months and events within each month
    return Object.keys(grouped)
      .sort((a, b) => {
        const dateA = parseISO(grouped[a][0]?.date || '');
        const dateB = parseISO(grouped[b][0]?.date || '');
        return dateA.getTime() - dateB.getTime();
      })
      .reduce((acc, month) => {
        acc[month] = grouped[month].sort((a, b) => {
          const dateA = parseISO(a.date || '');
          const dateB = parseISO(b.date || '');
          return dateA.getTime() - dateB.getTime();
        });
        return acc;
      }, {} as { [key: string]: Event[] });
  }, [filteredEvents]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A4BA3]"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex justify-center items-center py-24">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#073366] text-white px-6 py-2 rounded-lg hover:bg-[#052548]"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#083060] to-[#052548] text-white py-16 md:py-24">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif">Our Events</h1>
              <p className="text-lg md:text-xl text-gray-200">
                Join our community events and make a difference. Every event is an opportunity to connect, 
                learn, and create positive change.
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 bg-gray-50">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search events by title, description, or venue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A4BA3] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Events List */}
        <section className="py-16">
          <div className="container-custom">
            {Object.keys(eventsByMonth).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'No events found matching your search.' : 'No upcoming events at the moment.'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-[#8A4BA3] hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
                  <div key={month} className="space-y-6">
                    <h2 className="text-2xl font-bold text-[#073366] border-b-2 border-[#8A4BA3] pb-2">
                      {month}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {monthEvents.map((event) => (
                        <div
                          key={event.id}
                          className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-100"
                          onClick={() => handleEventClick(event)}
                        >
                          {/* Event Image */}
                          {event.image_path && (
                            <div className="relative h-48 rounded-t-xl overflow-hidden">
                              <img
                                src={event.image_path}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <div className="bg-white rounded-full p-2">
                                  <Eye className="h-5 w-5 text-[#073366]" />
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Event Details */}
                          <div className="p-6">
                            <h3 className="text-xl font-semibold text-[#073366] mb-3 line-clamp-2">
                              {event.title}
                            </h3>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-4 w-4 mr-2 text-[#8A4BA3]" />
                                <span className="text-sm">{formatEventDate(event.date)}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-2 text-[#8A4BA3]" />
                                <span className="text-sm">{formatEventTime(event)}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <MapPin className="h-4 w-4 mr-2 text-[#8A4BA3]" />
                                <span className="text-sm line-clamp-1">{event.venue}</span>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                              {event.description}
                            </p>
                            
                            <button className="w-full bg-[#8A4BA3] text-white py-2 rounded-lg hover:bg-[#7A3B93] transition-colors text-sm font-medium">
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default Events;
