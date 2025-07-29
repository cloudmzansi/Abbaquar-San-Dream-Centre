import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getActivities, createActivity, updateActivity, deleteActivity, updateActivityOrder } from '@/lib/activitiesService';
import { Activity } from '@/types/supabase';
import { 
  FileImage, 
  Loader, 
  Plus, 
  Pencil, 
  Trash2, 
  Save, 
  X, 
  Search,
  Filter,
  Grid3X3,
  List,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Calendar,
  Home,
  Activity as ActivityIcon,
  ArrowUpDown,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  GripVertical
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const ActivitiesAdmin = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDisplay, setFilterDisplay] = useState<'all' | 'home' | 'activities' | 'both'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);

  // Form states for new/edit activity
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [displayOn, setDisplayOn] = useState<'home' | 'activities' | 'both'>('both');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load activities
  const loadActivities = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getActivities();
      setActivities(data);
      setFilteredActivities(data);
    } catch (err: any) {
      console.error('Failed to load activities:', err);
      setError('Failed to load activities. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  // Filter and search activities
  useEffect(() => {
    let filtered = activities;

    // Filter by display location
    if (filterDisplay !== 'all') {
      filtered = filtered.filter(activity => activity.display_on === filterDisplay);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  }, [activities, searchTerm, filterDisplay]);

  // Handle image file selection with drag and drop
  const handleImageChange = useCallback((file: File) => {
    // Create an image element to check dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      if (img.width !== 384 || img.height !== 192) {
        setError(`Image must be exactly 384x192 pixels. Current size: ${img.width}x${img.height}`);
        setImageFile(null);
        setPreviewUrl(null);
        return;
      }
      
      setImageFile(file);
      setPreviewUrl(objectUrl);
      setError(null);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError('Failed to load image. Please try again.');
      setImageFile(null);
      setPreviewUrl(null);
    };
    
    img.src = objectUrl;
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    handleImageChange(files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageChange(files[0]);
    }
  };

  // Reset form
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDisplayOn('both');
    setImageFile(null);
    setPreviewUrl(null);
    setEditActivity(null);
    setIsCreating(false);
    setShowForm(false);
  };

  // Set form for editing
  const handleEdit = (activity: Activity) => {
    setEditActivity(activity);
    setTitle(activity.title);
    setDescription(activity.description);
    setDisplayOn(activity.display_on);
    setPreviewUrl(activity.image_path || null);
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

    if (!title.trim() || !description.trim()) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    if (description.length > 130) {
      setError('Description must not exceed 130 characters.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (editActivity) {
        await updateActivity(
          editActivity.id, 
          { title: title.trim(), description: description.trim(), display_on: displayOn },
          imageFile || undefined
        );
        setSuccessMessage('Activity updated successfully!');
      } else {
        await createActivity(
          { title: title.trim(), description: description.trim(), display_on: displayOn },
          imageFile || undefined
        );
        setSuccessMessage('Activity created successfully!');
      }
      
      resetForm();
      await loadActivities();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving activity:', err);
      setError('Failed to save activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await deleteActivity(id);
      setActivities(activities.filter(activity => activity.id !== id));
      setSuccessMessage('Activity deleted successfully!');
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to delete activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get display icon based on display_on value
  const getDisplayIcon = (displayOn: string) => {
    switch (displayOn) {
      case 'home':
        return <Home size={16} />;
      case 'activities':
        return <ActivityIcon size={16} />;
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
      case 'activities':
        return 'Activities Page';
      case 'both':
        return 'Both Pages';
      default:
        return 'Unknown';
    }
  };

  // Handle drag and drop reorder
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newActivities = Array.from(filteredActivities);
    const [movedActivity] = newActivities.splice(sourceIndex, 1);
    newActivities.splice(destinationIndex, 0, movedActivity);

    // Update sort_order for all affected activities
    const updatedActivities = newActivities.map((activity, index) => ({
      ...activity,
      sort_order: index + 1
    }));

    setFilteredActivities(updatedActivities);

    try {
      await updateActivityOrder(updatedActivities.map(activity => ({
        id: activity.id,
        sort_order: activity.sort_order || 0
      })));
    } catch (err: any) {
      console.error('Failed to update order:', err);
      setError('Failed to update activity order. Please try again.');
      await loadActivities(); // Reload to reset order
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
          <h1 className="text-3xl font-bold text-white">Activities Management</h1>
            <p className="text-white/70 mt-1">Manage your community activities and events</p>
          </div>
          
            <button
              onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-[#4f7df9] text-white rounded-lg hover:bg-[#3a6eea] transition-colors shadow-lg"
            >
              <Plus size={18} className="mr-2" />
            Add Activity
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
                placeholder="Search activities..."
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
                <option value="activities">Activities Page Only</option>
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

        {/* Activity Form */}
        {showForm && (
          <div className="bg-[#1a365d]/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/10">
            <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editActivity ? 'Edit Activity' : 'Create New Activity'}
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
                  {/* Left Column - Text Fields */}
                  <div className="space-y-4">
              <div>
                      <label className="block text-sm font-medium text-white mb-2">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                        placeholder="Enter activity title"
                  required
                />
              </div>
              
              <div>
                      <label className="block text-sm font-medium text-white mb-2">Description *</label>
                <div className="relative">
                  <textarea
                    value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50 min-h-[120px] resize-none"
                          placeholder="Enter activity description (max 130 characters)"
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
                  <option value="activities">Activities Page Only</option>
                </select>
                    </div>
              </div>
              
                  {/* Right Column - Image Upload */}
                  <div className="space-y-4">
              <div>
                      <label className="block text-sm font-medium text-white mb-2">Activity Image</label>
                      <div
                        className={`w-full h-[192px] border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                          isDragging 
                            ? 'border-[#4f7df9] bg-[#4f7df9]/10' 
                            : 'border-white/30 hover:border-white/50 bg-white/5'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileInput}
                        />
                  
                        {previewUrl ? (
                          <div className="relative w-full h-full">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImageFile(null);
                                setPreviewUrl(null);
                              }}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-white/70">
                            <Upload size={32} className="mb-2" />
                            <p className="text-sm font-medium">Drop image here or click to upload</p>
                            <p className="text-xs mt-1">384x192 pixels required</p>
                    </div>
                  )}
                      </div>
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
                        {editActivity ? 'Update Activity' : 'Create Activity'}
                    </>
                  )}
                </button>
              </div>
            </form>
            </div>
          </div>
        )}

        {/* Activities List */}
        <div className="bg-[#1a365d]/50 backdrop-blur-sm rounded-lg border border-white/10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Activities ({filteredActivities.length})
              </h2>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4f7df9] mb-4"></div>
                  <p className="text-white/70">Loading activities...</p>
              </div>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto text-white/40 mb-4" size={48} />
                <h3 className="text-lg font-medium text-white/70 mb-2">
                  {searchTerm || filterDisplay !== 'all' ? 'No activities found' : 'No activities yet'}
                </h3>
                <p className="text-white/50 mb-4">
                  {searchTerm || filterDisplay !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Create your first activity to get started'
                  }
                </p>
                {!searchTerm && filterDisplay === 'all' && (
                  <button
                    onClick={handleCreate}
                    className="flex items-center mx-auto px-4 py-2 bg-[#4f7df9] text-white rounded-lg hover:bg-[#3a6eea] transition-colors"
                  >
                    <Plus size={18} className="mr-2" />
                    Create First Activity
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="bg-white/10 rounded-lg overflow-hidden border border-white/20 hover:border-white/30 transition-all duration-200 group"
                  >
                    {/* Image */}
                    <div>
                    {activity.image_path ? (
                      <img
                        src={activity.image_path}
                          alt={activity.title}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                      />
                    ) : (
                        <div className="w-full h-48 bg-[#102a4c] flex items-center justify-center">
                          <ImageIcon className="text-white/40" size={32} />
                      </div>
                    )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-white line-clamp-2">{activity.title}</h3>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(activity)}
                            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                        title="Edit activity"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(activity.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Delete activity"
                      >
                        <Trash2 size={16} />
                      </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-white/70 line-clamp-3 mb-3">
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          {getDisplayIcon(activity.display_on)}
                          <span>{getDisplayLabel(activity.display_on)}</span>
                        </div>
                        
                        <div className="text-xs text-white/40">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="activities">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {filteredActivities.map((activity, index) => (
                        <Draggable key={activity.id} draggableId={activity.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-white/10 rounded-lg overflow-hidden border border-white/20 hover:border-white/30 transition-all duration-200 group flex ${
                                snapshot.isDragging ? 'shadow-lg scale-105' : ''
                              }`}
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="flex items-center justify-center px-3 cursor-move"
                              >
                                <GripVertical className="w-4 h-4 text-white/30" />
                              </div>
                              
                              {/* Image */}
                              <div className="w-48 flex-shrink-0">
                              {activity.image_path ? (
                                <img
                                  src={activity.image_path}
                                    alt={activity.title}
                                    className="w-full h-32 object-cover"
                                    loading="lazy"
                                />
                              ) : (
                                  <div className="w-full h-32 bg-[#102a4c] flex items-center justify-center">
                                    <ImageIcon className="text-white/40" size={32} />
                                </div>
                              )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <h3 className="font-medium text-white line-clamp-2">{activity.title}</h3>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEdit(activity)}
                                      className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                  title="Edit activity"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(activity.id)}
                                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
                                  title="Delete activity"
                                >
                                  <Trash2 size={16} />
                                </button>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-white/70 line-clamp-3 mb-3">
                                  {activity.description}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs text-white/60">
                                    {getDisplayIcon(activity.display_on)}
                                    <span>{getDisplayLabel(activity.display_on)}</span>
                                  </div>
                                  
                                  <div className="text-xs text-white/40">
                                    {new Date(activity.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ActivitiesAdmin;
