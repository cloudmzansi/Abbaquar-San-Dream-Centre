import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import EventModal from '@/components/EventModal';
import { 
  getEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  getAllEventsForAdmin, 
  getArchivedEvents, 
  archiveEvent, 
  unarchiveEvent,
  runScheduledTasks 
} from '@/lib/eventsService';
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
  ArrowUpDown,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
  ExternalLink,
  Upload,
  Image as ImageIcon
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
  if (!start && !end) return '--:--';
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
  return '--:--';
}

// Super Ultimate Working Date Input Component
const DateInput = ({ value, onChange, className, ...props }: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  [key: string]: any;
}) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

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

  const updateDate = (newDay: string, newMonth: string, newYear: string) => {
    let dateStr = '';
    if (newYear) {
      dateStr = newYear;
      if (newMonth) {
        dateStr += `-${newMonth}`;
        if (newDay) {
          dateStr += `-${newDay}`;
        } else {
          dateStr += '-';
        }
      } else {
        dateStr += '-';
      }
    }
    onChange(dateStr);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Only allow digits
    setDay(val);
    if (val.length === 2) {
      // Auto-advance to month after 2 digits
      const monthInput = e.target.parentElement?.nextElementSibling?.nextElementSibling?.querySelector('input') as HTMLInputElement;
      if (monthInput) {
        monthInput.focus();
      }
    }
    updateDate(val, month, year);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Only allow digits
    setMonth(val);
    if (val.length === 2) {
      // Auto-advance to year after 2 digits
      const yearInput = e.target.parentElement?.nextElementSibling?.nextElementSibling?.querySelector('input') as HTMLInputElement;
      if (yearInput) {
        yearInput.focus();
      }
    }
    updateDate(day, val, year);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); // Only allow digits
    setYear(val);
    updateDate(day, month, val);
  };

  return (
    <div className={`flex gap-1 ${className}`}>
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
          placeholder="YYYY"
          value={year}
          onChange={handleYearChange}
          maxLength={4}
          className="w-full px-2 py-2 bg-white/10 border border-white/20 rounded-md text-white text-center focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
        />
      </div>
    </div>
  );
};

// Custom DateTime Input Component (matches the styling of DateInput and time inputs)
const DateTimeInput = ({ value, onChange, className, ...props }: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  [key: string]: any;
}) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [time, setTime] = useState('');

  // Parse the datetime value
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setDay(date.getDate().toString().padStart(2, '0'));
      setMonth((date.getMonth() + 1).toString().padStart(2, '0'));
      setYear(date.getFullYear().toString());
      setTime(date.toTimeString().slice(0, 5)); // HH:MM format
    } else {
      setDay('');
      setMonth('');
      setYear('');
      setTime('');
    }
  }, [value]);

  // Update the parent value when any part changes
  const updateDateTime = (newDay: string, newMonth: string, newYear: string, newTime: string) => {
    if (newDay && newMonth && newYear && newTime) {
      const dateStr = `${newYear}-${newMonth}-${newDay}T${newTime}`;
      onChange(dateStr);
    } else {
      onChange('');
    }
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDay = e.target.value;
    setDay(newDay);
    updateDateTime(newDay, month, year, time);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = e.target.value;
    setMonth(newMonth);
    updateDateTime(day, newMonth, year, time);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = e.target.value;
    setYear(newYear);
    updateDateTime(day, month, newYear, time);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    updateDateTime(day, month, year, newTime);
  };

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      {/* Date part - similar to DateInput */}
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={day}
          onChange={handleDayChange}
          placeholder="DD"
          maxLength={2}
          className="w-12 px-2 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
        />
        <span className="text-white/60">/</span>
        <input
          type="text"
          value={month}
          onChange={handleMonthChange}
          placeholder="MM"
          maxLength={2}
          className="w-12 px-2 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
        />
        <span className="text-white/60">/</span>
        <input
          type="text"
          value={year}
          onChange={handleYearChange}
          placeholder="YYYY"
          maxLength={4}
          className="w-16 px-2 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
        />
      </div>
      
      {/* Time part - similar to time inputs */}
      <div className="flex items-center gap-2">
        <span className="text-white/60">at</span>
        <div className="relative">
          <input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
          />
          <Clock className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/50" size={16} />
        </div>
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
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Omit<Event, 'id' | 'created_at' | 'updated_at'>, string>>>({});
  const [showArchived, setShowArchived] = useState(false);
  
  // Form states for new/edit event
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [publishAt, setPublishAt] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('published');
  const [editingTimeForEvent, setEditingTimeForEvent] = useState<string | null>(null);
  
  // Preview modal state
  const [previewEvent, setPreviewEvent] = useState<Event | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  // Debug: Log when editingTimeForEvent changes
  useEffect(() => {
    console.log('editingTimeForEvent changed to:', editingTimeForEvent);
  }, [editingTimeForEvent]);

  // Debug: Log when popup should be showing
  useEffect(() => {
    if (editingTimeForEvent) {
      console.log('Popup should be showing for event:', editingTimeForEvent);
    }
  }, [editingTimeForEvent]);


  // Load events
  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getAllEventsForAdmin();
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

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(event => event.status === filterStatus);
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
  }, [events, searchTerm, filterStatus]);

  // Reset form
  const resetForm = () => {
    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setVenue('');
    setDescription('');
    setPublishAt('');
    setStatus('published');

    setEditEvent(null);
    setIsCreating(false);
    setShowForm(false);
    setFormErrors({});
    setSelectedImage(null);
    setImagePreview(null);
    setImageUploadError(null);
  };

  // Handle image upload
  const handleImageUpload = async (file: File): Promise<string> => {
    setIsUploadingImage(true);
    setImageUploadError(null);
    
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'webp';
      const fileName = `event-${timestamp}.${fileExtension}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('events')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('events')
        .getPublicUrl(fileName);
      
      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Image upload error:', error);
      setImageUploadError(error.message || 'Failed to upload image');
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageUploadError('Please select a valid image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('Image size must be less than 5MB');
      return;
    }
    
    setSelectedImage(file);
    setImageUploadError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Set form for editing
  const handleEdit = (event: Event) => {
    setEditEvent(event);
    setTitle(event.title);
    
    // Only try to parse if the date is valid (YYYY-MM-DD)
    if (event.date && /^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
      try {
        const dateObj = new Date(event.date);
        const formattedDateForInput = dateObj.toISOString().split('T')[0];
        setDate(formattedDateForInput);
      } catch (e) {
        setDate(event.date); // fallback to raw value
      }
    } else {
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
    
    // Set scheduling fields
    setPublishAt(event.publish_at ? new Date(event.publish_at).toISOString().slice(0, 16) : '');
    setStatus(event.status || 'published');

    // Set image preview if event has an image
    if (event.image_path) {
      setImagePreview(event.image_path);
    }

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

    let imagePath = editEvent?.image_path || null;
    
    // Upload image if selected
    if (selectedImage) {
      try {
        imagePath = await handleImageUpload(selectedImage);
      } catch (error) {
        setError('Failed to upload image. Please try again.');
        setIsSubmitting(false);
        return;
      }
    }

    const eventData: any = {
      title: title.trim(),
      date,
      start_time: startTime ? startTime.slice(0, 5) : null,
      end_time: endTime ? endTime.slice(0, 5) : null,
      venue: venue.trim(),
      description: description.trim(),
      image_path: imagePath,
      display_on: 'home',
      publish_at: publishAt ? new Date(publishAt).toISOString() : null,
      status: status,
    };

    try {
      if (editEvent) {
        console.log('Updating event with data:', eventData);
        await updateEvent(editEvent.id, eventData);
        setSuccessMessage('Event updated successfully!');
      } else {
        console.log('Creating event with data:', eventData);
        await createEvent(eventData);
        setSuccessMessage('Event created successfully!');
      }
      
      resetForm();
      await loadEvents();
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving event:', err);
      console.error('Error details:', err.message, err.details, err.hint);
      setError(`Failed to save event: ${err.message || 'Please try again.'}`);
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

        {/* Automation Info */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="text-blue-400 mt-1" size={20} />
            <div>
              <h3 className="text-blue-200 font-medium mb-1">Automated Scheduling</h3>
              <p className="text-blue-300 text-sm">
                Events are automatically published and archived based on their schedule. 
                Draft events become visible at their publish time, and past events are archived at 8:00 AM the next day.
              </p>
            </div>
          </div>
        </div>

        {/* New Interactive Features Info */}
        <div className="bg-[#4f7df9]/20 border border-[#4f7df9]/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <ExternalLink className="text-[#4f7df9] mt-1" size={20} />
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">New Interactive Features</h3>
              <p className="text-white/80 text-sm mb-2">
                Your events are now fully interactive! Users can click on event cards to view detailed information in a popup modal, 
                and there's a dedicated Events page with search and filtering capabilities.
              </p>
              <div className="text-white/70 text-xs space-y-1">
                <p>• <strong>Preview Button:</strong> Click the eye icon on any event to see how it appears to users</p>
                <p>• <strong>Form Preview:</strong> Use the Preview button when creating/editing to see your changes</p>
                <p>• <strong>User Experience:</strong> Events are now clickable with hover effects and detailed modals</p>
              </div>
            </div>
          </div>
        </div>

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



            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
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
                      <select
                        value={venue === 'Abbaquar-San Dream Centre' ? 'preset' : 'custom'}
                        onChange={(e) => {
                          if (e.target.value === 'preset') {
                            setVenue('Abbaquar-San Dream Centre');
                          } else {
                            setVenue('');
                          }
                        }}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                      >
                        <option value="preset">Abbaquar-San Dream Centre</option>
                        <option value="custom">Other (type below)</option>
                      </select>
                      {venue !== 'Abbaquar-San Dream Centre' && (
                        <input
                          type="text"
                          value={venue}
                          onChange={(e) => setVenue(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50 mt-2"
                          placeholder="Enter custom venue"
                          required
                        />
                      )}
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
                      <label className="block text-sm font-medium text-white mb-2">Publish At (SAST)</label>
                      <DateTimeInput
                        value={publishAt}
                        onChange={setPublishAt}
                        className="w-full"
                        placeholder="Leave empty to publish immediately"
                      />
                      <p className="text-xs text-white/60 mt-1">
                        When this event should become visible on the website
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                      <p className="text-xs text-white/60 mt-1">
                        Draft events are only visible to admins
                      </p>
                    </div>

                    {/* Event Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Event Image/Poster</label>
                      <div className="space-y-3">
                        {/* Image Preview */}
                        {(imagePreview || editEvent?.image_path) && (
                          <div className="relative">
                            <img
                              src={imagePreview || editEvent?.image_path}
                              alt="Event preview"
                              className="w-full h-48 object-cover rounded-lg border border-white/20"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedImage(null);
                                setImagePreview(null);
                                setImageUploadError(null);
                              }}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              title="Remove image"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}
                        
                        {/* Upload Button */}
                        {!imagePreview && !editEvent?.image_path && (
                          <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-white/40 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                              id="event-image-upload"
                            />
                            <label
                              htmlFor="event-image-upload"
                              className="cursor-pointer flex flex-col items-center"
                            >
                              <Upload className="text-white/60 mb-2" size={24} />
                              <span className="text-white/80 text-sm mb-1">Click to upload image</span>
                              <span className="text-white/60 text-xs">PNG, JPG, WebP up to 5MB</span>
                            </label>
                          </div>
                        )}
                        
                        {/* Upload Progress */}
                        {isUploadingImage && (
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <Loader className="animate-spin" size={16} />
                            <span>Uploading image...</span>
                          </div>
                        )}
                        
                        {/* Error Message */}
                        {imageUploadError && (
                          <div className="text-red-400 text-sm">{imageUploadError}</div>
                        )}
                      </div>
                    </div>
                    

                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      // Create a preview event from current form data
                      const previewEventData: Event = {
                        id: editEvent?.id || 'preview',
                        created_at: editEvent?.created_at || new Date().toISOString(),
                        title: title || 'Preview Event',
                        date: date || new Date().toISOString().split('T')[0],
                        start_time: startTime || undefined,
                        end_time: endTime || undefined,
                        venue: venue || 'Preview Venue',
                        description: description || 'Preview description',
                        display_on: 'home',
                        publish_at: publishAt || undefined,
                        status: status,
                        is_archived: false
                      };
                      setPreviewEvent(previewEventData);
                      setIsPreviewModalOpen(true);
                    }}
                    disabled={!title || !date || !venue || !description}
                    className="flex items-center px-4 py-2 text-white/70 hover:text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ExternalLink className="mr-2" size={18} />
                    Preview
                  </button>
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
                  {searchTerm ? 'No events found' : 'No events yet'}
                </h3>
                <p className="text-white/50 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search' 
                    : 'Create your first event to get started'
                  }
                </p>
                {!searchTerm && (
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
                    className={`bg-white/10 rounded-lg overflow-hidden border border-white/20 hover:border-white/30 transition-all duration-200 group relative ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-white line-clamp-2">{event.title}</h3>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setPreviewEvent(event);
                              setIsPreviewModalOpen(true);
                            }}
                            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                            title="Preview event"
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(event)}
                            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                            title="Edit event"
                          >
                            <Pencil size={16} />
                          </button>
                          {event.is_archived ? (
                            <button
                              onClick={async () => {
                                try {
                                  await unarchiveEvent(event.id);
                                  await loadEvents();
                                  setSuccessMessage('Event restored successfully!');
                                  setTimeout(() => setSuccessMessage(null), 3000);
                                } catch (err: any) {
                                  setError('Failed to restore event. Please try again.');
                                }
                              }}
                              className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-md transition-colors"
                              title="Restore event"
                            >
                              <Eye size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                try {
                                  await archiveEvent(event.id);
                                  await loadEvents();
                                  setSuccessMessage('Event archived successfully!');
                                  setTimeout(() => setSuccessMessage(null), 3000);
                                } catch (err: any) {
                                  setError('Failed to archive event. Please try again.');
                                }
                              }}
                              className="p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-md transition-colors"
                              title="Archive event"
                            >
                              <EyeOff size={16} />
                            </button>
                          )}
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
                        
                        <div 
                          className="flex items-center gap-2 text-sm text-white/70 cursor-pointer hover:text-white hover:bg-white/10 px-2 py-1 rounded transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Time row clicked for event:', event.id);
                            setEditingTimeForEvent(event.id);
                          }}
                          title="Click to edit time"
                        >
                          <ClockIcon size={14} />
                          <span>{formatEventTimeRange(event.start_time, event.end_time)}</span>
                        </div>
                        
                        {/* Time Edit Popup */}
                        {editingTimeForEvent === event.id && (
                          <div className="absolute top-0 left-0 z-50 bg-[#1a365d] border border-white/20 rounded-lg p-4 shadow-lg min-w-[300px]">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-white text-sm">Edit Time</span>
                              <button
                                onClick={() => setEditingTimeForEvent(null)}
                                className="ml-auto text-white/70 hover:text-white"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-white/70 mb-1">Start Time</label>
                                <input
                                  type="time"
                                  value={event.start_time || ''}
                                  onChange={(e) => {
                                    // Update the event's start_time
                                    const updatedEvents = events.map(ev => 
                                      ev.id === event.id 
                                        ? { ...ev, start_time: e.target.value }
                                        : ev
                                    );
                                    setEvents(updatedEvents);
                                  }}
                                  className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-white/70 mb-1">End Time</label>
                                <input
                                  type="time"
                                  value={event.end_time || ''}
                                  onChange={(e) => {
                                    // Update the event's end_time
                                    const updatedEvents = events.map(ev => 
                                      ev.id === event.id 
                                        ? { ...ev, end_time: e.target.value }
                                        : ev
                                    );
                                    setEvents(updatedEvents);
                                  }}
                                  className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-3">
                              <button
                                onClick={() => setEditingTimeForEvent(null)}
                                className="px-3 py-1 text-xs text-white/70 hover:text-white border border-white/20 rounded"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await updateEvent(event.id, {
                                      start_time: event.start_time,
                                      end_time: event.end_time
                                    });
                                    setEditingTimeForEvent(null);
                                    await loadEvents(); // Reload to get updated data
                                  } catch (err) {
                                    console.error('Failed to update time:', err);
                                  }
                                }}
                                className="px-3 py-1 text-xs bg-[#4f7df9] text-white rounded"
                              >
                                Save
                              </button>
                            </div>
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
                          <CalendarIcon size={12} />
                          <span>{new Date(event.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        {/* Status indicator */}
                        <div className="flex items-center gap-1">
                          {event.status === 'draft' && (
                            <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded-full">
                              Draft
                            </span>
                          )}
                          {event.status === 'archived' && (
                            <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-300 rounded-full">
                              Archived
                            </span>
                          )}
                          {event.publish_at && new Date(event.publish_at) > new Date() && (
                            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full">
                              Scheduled
                            </span>
                          )}
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

      {/* Event Preview Modal */}
      <EventModal
        event={previewEvent}
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewEvent(null);
        }}
      />
    </AdminLayout>
  );
};

export default EventsAdmin;
