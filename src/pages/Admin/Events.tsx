import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getEvents, createEvent, updateEvent, deleteEvent } from '@/lib/eventsService';
import { Event } from '@/types/supabase';
import { supabase } from '@/lib/supabase';
import { Calendar, Loader, Plus, Pencil, Trash2, Save, X, Clock, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';

/**
 * Format a date string as '31/12/2025'.
 * Returns '-' if invalid.
 */
// Format ISO date string (yyyy-MM-dd) for display as dd/MM/yyyy
function formatEventDate(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy');
  } catch {
    return '-';
  }
}

/**
 * Format a time range as '18:00 to 20:00'. Handles missing/invalid times.
 */
function formatEventTimeRange(start?: string, end?: string): string {
  if (!start && !end) return '—';
  // Accepts '18:00', '18:00:00', or ISO time
  const parseTime = (t?: string) => {
    if (!t) return '';
    // If already HH:mm, return as is
    if (/^\d{2}:\d{2}$/.test(t)) return t;
    // If HH:mm:ss, strip seconds
    if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t.slice(0,5);
    // Try parsing ISO
    try {
      const d = new Date(t);
      if (!isNaN(d.getTime())) return format(d, 'HH:mm');
    } catch {}
    return t;
  };
  const s = parseTime(start);
  const e = parseTime(end);
  if (s && e) return `${s} to ${e}`;
  if (s) return s;
  if (e) return e;
  return '—';
}

const EventsAdmin = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Omit<Event, 'id' | 'created_at' | 'updated_at'>, string>>>({});
  
  // Check if we're in localhost environment
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  // Form states for new/edit event
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [displayOn, setDisplayOn] = useState<'home' | 'events' | 'both'>('both');

  // Load events
  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err: any) {
      console.error('Failed to load events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const data = await getEvents(); 
        setEvents(data);
      } catch (err) {
        setError('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Reset form
  const resetForm = () => {
    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setVenue('');
    setDescription('');
    setDisplayOn('both');
    setEditEvent(null);
    setIsCreating(false);
  };

  // Format date as 'sun, 11 may 2025' (short, lowercase)
  const formatDate = (isoDate: string) => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('en-GB', {
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
      }).replace(/,/g, '').replace(/ /, ', ').toLowerCase();
    } catch (error) {
      console.error('Error formatting date:', error);
      return isoDate;
    }
  };
  
  // Format time as '14:00 - 16:00' from ISO or time string
  const formatTimeRange = (startTime?: string, endTime?: string) => {
    if (!startTime) return 'Time TBD';
    // Extract HH:MM from ISO string or time string
    const extractTime = (val?: string) => {
      if (!val) return '';
      // If ISO string, extract time part
      const match = val.match(/T(\d{2}:\d{2})/);
      if (match) return match[1];
      // If already HH:MM
      if (/^\d{2}:\d{2}/.test(val)) return val.slice(0,5);
      return val;
    };
    const formattedStartTime = extractTime(startTime);
    const formattedEndTime = extractTime(endTime);
    return formattedEndTime ? `${formattedStartTime} - ${formattedEndTime}` : formattedStartTime;
  };


  // Set form for editing
  const handleEdit = (event: Event) => {
    setEditEvent(event);
    setTitle(event.title);
    
    // Format date properly for the date input
    // The date input expects YYYY-MM-DD format
    try {
      const dateObj = new Date(event.date);
      const formattedDateForInput = dateObj.toISOString().split('T')[0];
      setDate(formattedDateForInput);
    } catch (e) {
      console.error('Error parsing date:', e);
      setDate(event.date || '');
    }
    
    // Extract HH:MM from ISO timestamp if needed
    const extractTime = (val?: string | null) => {
      if (!val) return '';
      const match = val.match(/T(\d{2}:\d{2})/);
      if (match) return match[1];
      // If already HH:MM
      if (/^\d{2}:\d{2}/.test(val)) return val.slice(0,5);
      return val;
    };
    setStartTime(extractTime(event.start_time));
    setEndTime(extractTime(event.end_time));
    setVenue(event.venue);
    setDescription(event.description);
    setDisplayOn(event.display_on || 'both');
    setIsCreating(false);
  };

  // Set form for creating
  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    setFormErrors({});

    // Log all field values and their lengths for debugging
    console.log('Form Submission Values:', {
      title: title.length,
      date: date.length,
      startTime: startTime.length,
      endTime: endTime.length,
      venue: venue.length,
      description: description.length,
      displayOn: displayOn.length
    });

    // Validate form fields
    const errors: Partial<Record<keyof Omit<Event, 'id' | 'created_at' | 'updated_at'>, string>> = {};
    if (!title) errors.title = 'Title is required';
    if (!date) errors.date = 'Date is required';
    if (description && description.length > 130) errors.description = 'Description must not exceed 130 characters';
    if (venue && venue.length > 255) errors.venue = 'Venue must not exceed 255 characters';
    if (title && title.length > 255) errors.title = 'Title must not exceed 255 characters';
    
    // Validate time format
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (startTime && !timeRegex.test(startTime)) {
      errors.start_time = 'Start time must be in HH:mm format (24h)';
    }
    if (endTime && !timeRegex.test(endTime)) {
      errors.end_time = 'End time must be in HH:mm format (24h)';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    if (!title || !date || !venue || !description) {
      setError('Please fill in all required fields: Title, Date, Venue, and Description.');
      setIsSubmitting(false);
      return;
    }

    if (description.length > 130) {
      setError('Description must be 130 characters or less');
      setIsSubmitting(false);
      return;
    }

    const eventData: any = {
      title,
      date,
      start_time: startTime ? startTime.slice(0, 5) : null, // Ensure only HH:mm is stored
      end_time: endTime ? endTime.slice(0, 5) : null, // Ensure only HH:mm is stored
      venue,
      description,
      display_on: displayOn,
    };

    // Time format validation already done above
    // Validate that if time is provided, date is also provided
    if ((startTime && !date) || (endTime && !date)) {
      setError('Please select a date if you provide a time.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (editEvent) {
        await updateEvent(editEvent.id, eventData);
        setEvents(prevEvents => prevEvents.map(ev => ev.id === editEvent.id ? { ...ev, ...eventData, id: editEvent.id } : ev));
        setSuccessMessage('Event updated successfully!');
      } else {
        const newEvent = await createEvent(eventData);
        // Assuming createEvent returns the new event with its ID and other fields
        // If createEvent only returns e.g. { id: newId }, you might need to merge or refetch.
        // For robust UI update, it's best if createEvent returns the full event object as saved in DB.
        // If newEvent is a full event object:
        setEvents(prevEvents => [newEvent, ...prevEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setSuccessMessage('Event created successfully!');
      }
      resetForm();
    } catch (err: any) {
      console.error('Detailed error saving event:', err); // Enhanced console logging
      
      const pgError = err as any; // Potentially a PostgrestError or other error type
      let detailedMessage = pgError.message || 'An unexpected error occurred.';
      if (pgError.details) detailedMessage += ` Details: ${pgError.details}`;
      if (pgError.hint) detailedMessage += ` Hint: ${pgError.hint}`;
      if (typeof err === 'string') detailedMessage = err; // Handle plain string errors

      setError(`Failed to save event. ${detailedMessage} (See console for more details)`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await deleteEvent(id);
      setEvents(prevEvents => prevEvents.filter(event => event.id !== id)); // Update local state
      setSuccessMessage('Event deleted successfully.');
      setError(null);
    } catch (err: any) {
      console.error('Error deleting event:', err);
      const pgError = err as any;
      let detailedMessage = pgError.message || 'An unexpected error occurred.';
      if (pgError.details) detailedMessage += ` Details: ${pgError.details}`;
      if (pgError.hint) detailedMessage += ` Hint: ${pgError.hint}`;
      if (typeof err === 'string') detailedMessage = err;

      setError(`Failed to delete event: ${detailedMessage}. Please try again. (See console for more details)`);
      setSuccessMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Events Management</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              aria-label="Create new event"
              onClick={handleCreate}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#4f7df9] text-white rounded-lg hover:bg-[#4f7df9]/80 transition-colors flex items-center justify-center text-sm w-full sm:w-auto"
            >
              <Plus size={16} className="mr-1.5 sm:mr-2" />
              Add Event
            </button>
          </div>
        </div>

        {/* Success and Error Messages */}
        {successMessage && (
          <div className="bg-green-50 p-3 sm:p-4 rounded-xl text-green-600 text-sm">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-4 rounded-xl text-red-600">
            {error}
          </div>
        )}

        {/* Event Form */}
        {(isCreating || editEvent) && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow border border-white/20 p-3 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">
              {editEvent ? 'Edit Event' : 'Create New Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50 ${formErrors.title ? 'border-red-500' : ''}`}
                    required
                  />
                  {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                </div>
                
                <div>
                  <label className="block text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50 ${formErrors.date ? 'border-red-500' : ''}`}
                    required
                  />
                  {formErrors.date && <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>}
                </div>
                
                <div>
                  <label className="block text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2">Start Time (Optional)</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50 ${formErrors.start_time ? 'border-red-500' : ''}`}
                  />
                  {formErrors.start_time && <p className="text-red-500 text-xs mt-1">{formErrors.start_time}</p>}
                </div>
                
                <div>
                  <label className="block text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2">End Time (Optional)</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50 ${formErrors.end_time ? 'border-red-500' : ''}`}
                  />
                  {formErrors.end_time && <p className="text-red-500 text-xs mt-1">{formErrors.end_time}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2">Venue</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50 ${formErrors.venue ? 'border-red-500' : ''}`}
                  placeholder="Event venue"
                  required
                />
                {formErrors.venue && <p className="text-red-500 text-xs mt-1">{formErrors.venue}</p>}
              </div>
              
              <div>
                <label className="block text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2">Description (max 130 characters)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50 ${formErrors.description ? 'border-red-500' : ''}`}
                  maxLength={130}
                />
                {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
                <div className="text-right text-sm text-white/70 mt-1">{description.length}/130 characters</div>
              </div>

              <div>
                <label className="block text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2">Display On</label>
                <select
                  value={displayOn}
                  onChange={(e) => setDisplayOn(e.target.value as 'home' | 'events' | 'both')}
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                  required
                >
                  <option value="both">Both Home & Events Pages</option>
                  <option value="home">Home Page Only</option>
                  <option value="events">Events Page Only</option>
                </select>
                <p className="text-white/60 text-xs mt-1">Choose where this event should be displayed on the website.</p>
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors text-sm w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#4f7df9] text-white rounded-md hover:bg-[#4f7df9]/80 transition-colors flex items-center justify-center text-sm w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={16} className="animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-1.5" />
                      Save Event
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow border border-white/20 p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-white">All Events</h2>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4f7df9]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-xl text-red-600">
              {error}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-white/70">
              <Calendar className="mx-auto h-12 w-12 text-white/50 mb-3" />
              <p>No events found. Add your first event!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {events.map(event => (
                <div 
                  key={event.id} 
                  className="bg-white/10 rounded-lg overflow-hidden relative group border border-white/20"
                >
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-white mb-1 truncate" title={event.title}>{event.title}</h3>
                    <div className="flex items-center text-xs text-white/70 mb-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatEventDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-xs text-white/70 mb-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatEventTimeRange(event.start_time, event.end_time)}</span>
                    </div>
                    <div className="flex items-center text-xs text-white/70 mb-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{event.venue}</span>
                    </div>
                    <p className="text-xs text-white/70 mt-2 line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                  <div className="absolute right-2 top-2 flex space-x-1">
                    <button
                      aria-label="Edit event"
                      onClick={() => handleEdit(event)}
                      className="bg-[#4f7df9]/80 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      aria-label="Delete event"
                      onClick={() => handleDelete(event.id)}
                      className="bg-red-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default EventsAdmin;
