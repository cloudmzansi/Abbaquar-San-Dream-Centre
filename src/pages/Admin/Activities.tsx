import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getActivities, createActivity, updateActivity, deleteActivity, updateActivityOrder } from '@/lib/activitiesService';
import { Activity } from '@/types/supabase';
import { FileImage, Loader, Plus, Pencil, Trash2, Save, X, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ActivitiesAdmin = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [visibleItems, setVisibleItems] = useState(10); // Limit initial items displayed

  // Form states for new/edit activity
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [displayOn, setDisplayOn] = useState<'home' | 'activities' | 'both'>('both');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Load activities with pagination or limit
  const loadActivities = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getActivities();
      setActivities(data);
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

  // Handle loading more items
  const handleLoadMore = () => {
    setVisibleItems(prev => prev + 10);
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Create an image element to check dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl); // Clean up
      
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
  };

  // Set form for editing
  const handleEdit = (activity: Activity) => {
    setEditActivity(activity);
    setTitle(activity.title);
    setDescription(activity.description);
    setDisplayOn(activity.display_on);
    setPreviewUrl(activity.image_path || null);
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

    // Log all field values and their lengths for debugging
    console.log('Form Submission Values:', {
      title: title.length,
      description: description.length,
      displayOn: displayOn.length
    });

    // Validate form fields
    const errors: Partial<Record<keyof Omit<Activity, 'id' | 'created_at' | 'updated_at' | 'image_path' | 'order_index'>, string>> = {};
    if (!title) errors.title = 'Title is required';
    if (description && description.length > 130) errors.description = 'Description must not exceed 130 characters';
    if (title && title.length > 255) errors.title = 'Title must not exceed 255 characters';

    if (Object.keys(errors).length > 0) {
      setError('Please fill in all required fields: Title and Description.');
      setIsSubmitting(false);
      return;
    }

    if (!title || !description) {
      setError('Please fill in all required fields: Title and Description.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (editActivity) {
        // Update existing activity
        await updateActivity(
          editActivity.id, 
          { title, description, display_on: displayOn },
          imageFile || undefined
        );
        setSuccessMessage('Activity updated successfully');
      } else {
        // Create new activity
        await createActivity(
          { title, description, display_on: displayOn },
          imageFile || undefined
        );
        setSuccessMessage('Activity created successfully');
      }
      
      // Reset form and reload activities
      resetForm();
      await loadActivities();
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
      setSuccessMessage('Activity deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to delete activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle moving an activity up in the order
  const handleMoveUp = async (index: number) => {
    if (index <= 0) return; // Already at the top
    
    // Create a copy of activities
    const items = Array.from(activities);
    // Swap the item with the one above it
    [items[index], items[index - 1]] = [items[index - 1], items[index]];
    
    // Update the state immediately for a responsive UI
    setActivities(items);
    
    try {
      // Update the sort_order for the two affected items
      await Promise.all([
        updateActivityOrder(items[index - 1].id, index),
        updateActivityOrder(items[index].id, index + 1)
      ]);
      
      setSuccessMessage('Activity order updated');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to update activity order:', err);
      setError(`Failed to update activity order: ${err.message || 'Unknown error'}`);
      loadActivities(); // Reload to restore original order
    }
  };
  
  // Handle moving an activity down in the order
  const handleMoveDown = async (index: number) => {
    if (index >= activities.length - 1) return; // Already at the bottom
    
    // Create a copy of activities
    const items = Array.from(activities);
    // Swap the item with the one below it
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    
    // Update the state immediately for a responsive UI
    setActivities(items);
    
    try {
      // Update the sort_order for the two affected items
      await Promise.all([
        updateActivityOrder(items[index].id, index + 1),
        updateActivityOrder(items[index + 1].id, index + 2)
      ]);
      
      setSuccessMessage('Activity order updated');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to update activity order:', err);
      setError(`Failed to update activity order: ${err.message || 'Unknown error'}`);
      loadActivities(); // Reload to restore original order
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Activities Management</h1>
          
          {!isCreating && !editActivity && (
            <button
              onClick={handleCreate}
              className="flex items-center px-4 py-2 bg-[#4f7df9] text-white rounded-lg hover:bg-[#3a6eea] transition-colors"
            >
              <Plus size={18} className="mr-2" />
              Add New Activity
            </button>
          )}
        </div>

        {/* Success and Error Messages */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-900/50 text-green-200 rounded-md border border-green-700">{successMessage}</div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded-md border border-red-700">{error}</div>
        )}

        {/* Activity Form */}
        {(isCreating || editActivity) && (
          <div className="bg-[#102a4c]/60 backdrop-blur-sm rounded-lg shadow-md p-6 mb-8 border border-white/10 text-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editActivity ? 'Edit Activity' : 'Create New Activity'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10"
                title="Cancel"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (description.length > 130) {
                setError('Description exceeds 130 characters');
                return;
              }
              handleSubmit(e);
            }} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                  placeholder="Activity title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">
                  Description
                </label>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => {
                      // Limit to 130 characters
                      if (e.target.value.length <= 130) {
                        setDescription(e.target.value);
                      }
                    }}
                    className="w-full p-2 bg-[#1a3a5f]/80 border border-white/20 rounded-md focus:ring-[#4f7df9] focus:border-[#4f7df9] text-white min-h-[100px]"
                    maxLength={130}
                    required
                    placeholder="Enter activity description (max 130 characters)"
                  ></textarea>
                  <div className="text-xs text-right mt-1 text-white/60">
                    {description.length}/130 characters
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2">Display On</label>
                <select
                  value={displayOn}
                  onChange={(e) => setDisplayOn(e.target.value as 'home' | 'activities' | 'both')}
                  className="w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                >
                  <option value="home">Home Page Only</option>
                  <option value="activities">Activities Page Only</option>
                  <option value="both">Both Pages</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2">Image</label>
                <div className="flex flex-col gap-3">
                  <div className="w-full">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-[192px] border-2 border-white/20 border-dashed rounded-lg cursor-pointer bg-[#1a3a5f]/50 hover:bg-[#1a3a5f]/70">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FileImage className="w-8 h-8 mb-3 text-white/60" />
                          <p className="mb-2 text-sm text-white/80">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-white/60">PNG, JPG or WEBP (MAX. 2MB)</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                  
                  {previewUrl && (
                    <div className="w-[384px] h-[192px] relative rounded-md overflow-hidden border border-white/20 flex-shrink-0">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        width="384"
                        height="192"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
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
                      Save Activity
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Activities List */}
        {!isCreating && !editActivity && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-6 border border-white/20 shadow">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">All Activities</h2>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCreate}
                  className="px-2 py-1.5 sm:px-3 sm:py-2 bg-[#4f7df9] text-white rounded-md hover:bg-[#4f7df9]/80 transition-colors flex items-center text-xs sm:text-sm"
                >
                  <Plus size={14} className="mr-1" />
                  Add Activity
                </button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4f7df9]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-xl text-red-600">
                {error}
              </div>
            ) : activities.length === 0 ? (
              <div className="bg-white/10 p-4 rounded-lg text-white/70 text-center">
                No activities found
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {activities.slice(0, visibleItems).map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className="bg-white/10 rounded-lg overflow-hidden relative group border border-white/20 w-fit mx-auto"
                  >
                    {activity.image_path ? (
                      <img
                        src={activity.image_path}
                        alt={activity.title || 'Activity image'}
                        className="w-[384px] h-[192px] object-cover"
                        loading="eager"
                      />
                    ) : (
                      <div className="w-full h-48 bg-[#102a4c] flex items-center justify-center">
                        <FileImage className="text-white/40" size={32} />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-white">{activity.title}</h3>
                        <p className="text-xs text-white/70 mt-2 line-clamp-3">
                          {activity.description}
                        </p>
                        <span className="inline-block px-2 py-1 mt-3 bg-[#4f7df9]/30 text-white text-xs rounded-full capitalize">
                          {activity.display_on === 'both'
                            ? 'Home & Activities'
                            : activity.display_on === 'home'
                            ? 'Home Page'
                            : 'Activities Page'}
                        </span>
                      </div>
                    </div>
                    <div className="absolute right-2 top-2 flex space-x-1">
                      <div className="flex flex-col space-y-0.5">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className={`bg-gray-700/80 text-white p-1 rounded-t-md opacity-0 group-hover:opacity-100 transition-opacity ${index === 0 ? 'cursor-not-allowed opacity-50' : ''}`}
                          title="Move up"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === activities.length - 1}
                          className={`bg-gray-700/80 text-white p-1 rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity ${index === activities.length - 1 ? 'cursor-not-allowed opacity-50' : ''}`}
                          title="Move down"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleEdit(activity)}
                        className="bg-[#4f7df9]/80 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit activity"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(activity.id)}
                        className="bg-red-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete activity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && visibleItems < activities.length && (
              <div className="text-center mt-6">
                <button onClick={handleLoadMore} className="bg-[#073366] hover:bg-[#041d40] text-white px-4 py-2 rounded-lg transition-colors duration-200">
                  Load More ({visibleItems}/{activities.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ActivitiesAdmin;
