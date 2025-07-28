import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getEvents, createEvent, updateEvent, deleteEvent } from '@/lib/eventsService';
import { Event } from '@/types/supabase';
import { supabase } from '@/lib/supabase';
import { 
  Calendar, 
  Loader, 
  Plus, 
  Pencil, 
  Trash2, 
  Save, 
  X, 
  Clock, 
  MapPin,
  Search,
  Filter,
  Grid3X3,
  List,
  Eye,
  EyeOff,
  Calendar as CalendarIcon,
  Home,
  CalendarDays,
  ArrowUpDown,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  MapPin as MapPinIcon
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

/**
 * Format a date string as '31/12/2025'.
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
 * Format a time range as '18:00 to 20:00'. Handles missing/invalid times.
 */
function formatEventTimeRange(start?: string, end?: string): string {
  if (!start && !end) return '—';
  const parseTime = (t?: string) => {
    if (!t) return '';
    if (/^\d{2}:\d{2}$/.test(t)) return t;
    if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t.slice(0,5);
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

// New Fixed Date Input Component
const DateInput = ({ value, onChange, className, ...props }: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  [key: string]: any;
}) => {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  // Initialize from value
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(parts[2]);
      }
    } else {
      // Reset to empty if no value
      setYear('');
      setMonth('');
      setDay('');
    }
  }, [value]);

  const updateDate = (newYear: string, newMonth: string, newDay: string) => {
    // Only update if we have at least a year
    if (newYear) {
      const yearStr = newYear;
      const monthStr = newMonth || '01';
      const dayStr = newDay || '01';
      onChange(`${yearStr}-${monthStr}-${dayStr}`);
    } else {
      onChange('');
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Only allow digits
    setYear(val);
    
    if (val.length === 4) {
      // Auto-advance to month after 4 digits
      const monthInput = e.target.parentElement?.nextElementSibling?.nextElementSibling?.querySelector('input') as HTMLInputElement;
      if (monthInput) {
        monthInput.focus();
      }
    }
    
    updateDate(val, month, day);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Only allow digits
    setMonth(val);
    
    if (val.length === 2) {
      // Auto-advance to day after 2 digits
      const dayInput = e.target.parentElement?.nextElementSibling?.nextElementSibling?.querySelector('input') as HTMLInputElement;
      if (dayInput) {
        dayInput.focus();
      }
    }
    
    updateDate(year, val, day);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Only allow digits
    setDay(val);
    
    updateDate(year, month, val);
  };

  return (
    <div className={`flex gap-1 ${className}`}>
      <div className="flex-1">
        <input
          type="text"
          placeholder="YYYY"
          value={year}
          onChange={handleYearChange}
          maxLength={4}
          className="w-full px-2 py-2 bg-white/10 border border-white/20 rounded-md text-white text-center focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
        />
      </div>
      <div className="flex items-center text-white/50">/</div>
      <div className="flex-1">
        <input
          type="text"
          placeholder="MM"
          value={month}
          onChange={handleMonthChange}
          maxLength={2}
          className="w-full px-2 py-2 bg-white/10 border border-white/20 rounded-md text-white text-center focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
        />
      </div>
      <div className="flex items-center text-white/50">/</div>
      <div className="flex-1">
        <input
          type="text"
          placeholder="DD"
          value={day}
          onChange={handleDayChange}
          maxLength={2}
          className="w-full px-2 py-2 bg-white/10 border border-white/20 rounded-md text-white text-center focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
        />
      </div>
    </div>
  );
};

const EventsAdmin = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDisplay, setFilterDisplay] = useState<'all' | 'home' | 'events' | 'both'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Omit<Event, 'id' | 'created_at' | 'updated_at'>, string>>>({});
  
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
      setFilteredEvents(data);
    } catch (err: any) {
      console.error('Failed to load events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Filter and search events
  useEffect(() => {
    let filtered = events;

    // Filter by display location
    if (filterDisplay !== 'all') {
      filtered = filtered.filter(event => event.display_on === filterDisplay);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, filterDisplay]);

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
    setShowForm(false);
    setFormErrors({});
  };

  // Set form for editing
  const handleEdit = (event: Event) => {
    setEditEvent(event);
    setTitle(event.title);
    
    // Format date properly for the date input
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
      if (/^\d{2}:\d{2}/.test(val)) return val.slice(0,5);
      return val;
    };
    setStartTime(extractTime(event.start_time));
    setEndTime(extractTime(event.end_time));
    setVenue(event.venue);
    setDescription(event.description);
    setDisplayOn(event.display_on || 'both');
    setIsCreating(false);
    setShowForm(true);
  };

  // Set form for creating
  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
    setShowForm(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    setFormErrors({});

    if (!title.trim() || !date || !venue.trim() || !description.trim()) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    if (description.length > 130) {
      setError('Description must not exceed 130 characters.');
      setIsSubmitting(false);
      return;
    }

    // Validate time format
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (startTime && !timeRegex.test(startTime)) {
      setError('Start time must be in HH:mm format (24h).');
      setIsSubmitting(false);
      return;
    }
    if (endTime && !timeRegex.test(endTime)) {
      setError('End time must be in HH:mm format (24h).');
      setIsSubmitting(false);
      return;
    }

    const eventData: any = {
      title: title.trim(),
      date,
      start_time: startTime ? startTime.slice(0, 5) : null,
      end_time: endTime ? endTime.slice(0, 5) : null,
      venue: venue.trim(),
      description: description.trim(),
      display_on: displayOn,
    };

    try {
      if (editEvent) {
        await updateEvent(editEvent.id, eventData);
        setSuccessMessage('Event updated successfully!');
      } else {
        await createEvent(eventData);
        setSuccessMessage('Event created successfully!');
      }
      
      resetForm();
      await loadEvents();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving event:', err);
      setError('Failed to save event. Please try again.');
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
      setEvents(events.filter(event => event.id !== id));
      setSuccessMessage('Event deleted successfully!');
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to delete event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get display icon based on display_on value
  const getDisplayIcon = (displayOn: string) => {
    switch (displayOn) {
      case 'home':
        return <Home size={16} />;
      case 'events':
        return <CalendarDays size={16} />;
      case 'both':
        return <Grid3X3 size={16} />;
      default:
        return <Eye size={16} />;
    }
  };

  // Get display label
  const getDisplayLabel = (displayOn: string) => {
    switch (displayOn) {
      case 'home':
        return 'Home Page';
      case 'events':
        return 'Events Page';
      case 'both':
        return 'Both Pages';
      default:
        return 'Unknown';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Events Management</h1>
            <p className="text-white/70 mt-1">Manage your community events and activities</p>
          </div>
          
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-[#4f7df9] text-white rounded-lg hover:bg-[#3a6eea] transition-colors shadow-lg"
          >
            <Plus size={18} className="mr-2" />
            Add Event
          </button>
        </div>

        {/* Success and Error Messages */}
        {successMessage && (
          <div className="flex items-center p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <CheckCircle className="text-green-400 mr-3" size={20} />
            <span className="text-green-200">{successMessage}</span>
          </div>
        )}
        
        {error && (
          <div className="flex items-center p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <AlertCircle className="text-red-400 mr-3" size={20} />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-[#1a365d]/50 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
              <select
                value={filterDisplay}
                onChange={(e) => setFilterDisplay(e.target.value as any)}
                className="pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50 appearance-none"
              >
                <option value="all">All Locations</option>
                <option value="home">Home Page Only</option>
                <option value="events">Events Page Only</option>
                <option value="both">Both Pages</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#4f7df9] text-white' : 'text-white/70 hover:text-white'}`}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#4f7df9] text-white' : 'text-white/70 hover:text-white'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Event Form */}
        {showForm && (
          <div className="bg-[#1a365d]/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/10">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Event Title *</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                        placeholder="Enter event title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Event Date *</label>
                      <DateInput
                        value={date}
                        onChange={setDate}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Start Time</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">End Time</label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Venue *</label>
                      <input
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                        placeholder="Enter event venue"
                        required
                      />
                    </div>
                  </div>

                  {/* Right Column - Description & Display */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Description *</label>
                      <div className="relative">
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50 min-h-[120px] resize-none"
                          placeholder="Enter event description (max 130 characters)"
                          maxLength={130}
                          required
                        />
                        <div className="text-xs text-right mt-1 text-white/60">
                          {description.length}/130 characters
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Display Location</label>
                      <select
                        value={displayOn}
                        onChange={(e) => setDisplayOn(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                      >
                        <option value="both">Both Pages</option>
                        <option value="home">Home Page Only</option>
                        <option value="events">Events Page Only</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-white/70 hover:text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center px-4 py-2 bg-[#4f7df9] text-white rounded-lg hover:bg-[#3a6eea] transition-colors disabled:bg-[#4f7df9]/50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="animate-spin mr-2" size={18} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2" size={18} />
                        {editEvent ? 'Update Event' : 'Create Event'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="bg-[#1a365d]/50 backdrop-blur-sm rounded-lg border border-white/10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Events ({filteredEvents.length})
              </h2>
              {!showForm && (
                <button
                  onClick={handleCreate}
                  className="flex items-center px-3 py-2 bg-[#4f7df9] text-white rounded-lg hover:bg-[#3a6eea] transition-colors text-sm"
                >
                  <Plus size={16} className="mr-2" />
                  Add Event
                </button>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4f7df9] mb-4"></div>
                  <p className="text-white/70">Loading events...</p>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto text-white/40 mb-4" size={48} />
                <h3 className="text-lg font-medium text-white/70 mb-2">
                  {searchTerm || filterDisplay !== 'all' ? 'No events found' : 'No events yet'}
                </h3>
                <p className="text-white/50 mb-4">
                  {searchTerm || filterDisplay !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Create your first event to get started'
                  }
                </p>
                {!searchTerm && filterDisplay === 'all' && (
                  <button
                    onClick={handleCreate}
                    className="flex items-center mx-auto px-4 py-2 bg-[#4f7df9] text-white rounded-lg hover:bg-[#3a6eea] transition-colors"
                  >
                    <Plus size={18} className="mr-2" />
                    Create First Event
                  </button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {filteredEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className={`bg-white/10 rounded-lg overflow-hidden border border-white/20 hover:border-white/30 transition-all duration-200 group ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-white line-clamp-2">{event.title}</h3>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(event)}
                            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                            title="Edit event"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
                            title="Delete event"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <CalendarIcon size={14} />
                          <span>{formatEventDate(event.date)}</span>
                        </div>
                        
                        {(event.start_time || event.end_time) && (
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <ClockIcon size={14} />
                            <span>{formatEventTimeRange(event.start_time, event.end_time)}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <MapPinIcon size={14} />
                          <span className="line-clamp-1">{event.venue}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-white/70 line-clamp-3 mb-3">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          {getDisplayIcon(event.display_on)}
                          <span>{getDisplayLabel(event.display_on)}</span>
                        </div>
                        
                        <div className="text-xs text-white/40">
                          {new Date(event.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EventsAdmin;
