import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAllVolunteers, createVolunteer, updateVolunteer, deleteVolunteer, updateVolunteerOrder } from '@/lib/volunteerService';
import { Volunteer } from '@/types/supabase';
import { 
  Users, 
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
  ArrowUpDown,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  GripVertical,
  UserPlus,
  UserCheck,
  UserX
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const VolunteersAdmin = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editVolunteer, setEditVolunteer] = useState<Volunteer | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);

  // Form states for new/edit volunteer
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load volunteers
  const loadVolunteers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const volunteerList = await getAllVolunteers();
      setVolunteers(volunteerList);
      setFilteredVolunteers(volunteerList);
    } catch (err: any) {
      console.error('Failed to load volunteers:', err);
      setError('Failed to load volunteers. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVolunteers();
  }, [loadVolunteers]);

  // Filter and search volunteers
  useEffect(() => {
    let filtered = volunteers;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(volunteer => 
        filterStatus === 'active' ? volunteer.is_active : !volunteer.is_active
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(volunteer =>
        volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVolunteers(filtered);
  }, [volunteers, searchTerm, filterStatus]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setName('');
    setRole('');
    setSortOrder(0);
    setIsActive(true);
    setImageFile(null);
    setImagePreview(null);
    setEditVolunteer(null);
    setIsCreating(false);
    setShowForm(false);
    setError(null);
    setSuccessMessage(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let finalSortOrder = sortOrder;
      
      // If creating a new volunteer, automatically set sort order to last position
      if (isCreating) {
        const maxSortOrder = volunteers.length > 0 
          ? Math.max(...volunteers.map(v => v.sort_order || 0))
          : 0;
        finalSortOrder = maxSortOrder + 1;
      }

      if (isCreating) {
        await createVolunteer({
          name,
          role,
          sort_order: finalSortOrder,
          is_active: isActive,
          image_path: editVolunteer?.image_path
        }, imageFile);
        setSuccessMessage('Volunteer created successfully!');
      } else if (editVolunteer) {
        await updateVolunteer(editVolunteer.id, {
          name,
          role,
          sort_order: finalSortOrder,
          is_active: isActive,
          image_path: editVolunteer.image_path
        }, imageFile);
        setSuccessMessage('Volunteer updated successfully!');
      }

      await loadVolunteers();
      resetForm();
    } catch (err: any) {
      console.error('Failed to save volunteer:', err);
      setError(err.message || 'Failed to save volunteer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit volunteer
  const handleEdit = (volunteer: Volunteer) => {
    // Reset form state first
    resetForm();
    
    // Set edit state
    setEditVolunteer(volunteer);
    setName(volunteer.name);
    setRole(volunteer.role);
    setSortOrder(volunteer.sort_order || 0);
    setIsActive(volunteer.is_active || true);
    setImagePreview(volunteer.image_path || null);
    setImageFile(null);
    setIsCreating(false);
    setShowForm(true);
  };

  // Handle create new volunteer
  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
    setShowForm(true);
  };

  // Handle delete volunteer
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this volunteer? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteVolunteer(id);
      setSuccessMessage('Volunteer deleted successfully!');
      await loadVolunteers();
    } catch (err: any) {
      console.error('Failed to delete volunteer:', err);
      setError(err.message || 'Failed to delete volunteer. Please try again.');
    }
  };

  // Handle drag and drop reordering
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(filteredVolunteers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update sort order based on new positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      sort_order: index + 1
    }));

    setFilteredVolunteers(updatedItems);

    try {
      await updateVolunteerOrder(updatedItems.map(item => ({ id: item.id, sort_order: item.sort_order || 0 })));
    } catch (err: any) {
      console.error('Failed to update volunteer order:', err);
      setError('Failed to update volunteer order. Please refresh the page.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Volunteers Management</h1>
            <p className="text-white/70 mt-1">Manage your volunteers and their information</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-[#4f7df9] text-white rounded-lg hover:bg-[#3a6eea] transition-colors shadow-lg"
          >
            <UserPlus size={18} className="mr-2" />
            Add Volunteer
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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search volunteers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/50" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
              >
                <option value="all" className="bg-[#1a365d]">All Volunteers</option>
                <option value="active" className="bg-[#1a365d]">Active</option>
                <option value="inactive" className="bg-[#1a365d]">Inactive</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader className="animate-spin" />
              <span className="text-white">Loading volunteers...</span>
            </div>
          </div>
        )}

        {/* Volunteers Display */}
        {!isLoading && (
          <div className="bg-[#1a365d]/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/10">
            {viewMode === 'grid' ? (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredVolunteers.map((volunteer) => (
                    <div key={volunteer.id} className="bg-[#0c2342]/50 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-[#0c2342]/70 transition-all duration-200 text-center">
                      <div className="mb-4">
                        {volunteer.image_path ? (
                          <img
                            src={volunteer.image_path}
                            alt={volunteer.name}
                            className="w-32 h-32 mx-auto object-cover rounded-lg shadow-lg"
                          />
                        ) : (
                          <div className="w-32 h-32 mx-auto bg-white/10 rounded-lg flex items-center justify-center shadow-lg">
                            <UserCheck className="w-10 h-10 text-white/30" />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-white mb-1">{volunteer.name}</h3>
                        <p className="text-white/70 text-sm">{volunteer.role}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(volunteer)}
                          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(volunteer.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="volunteers">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="divide-y divide-white/10"
                    >
                      {filteredVolunteers.map((volunteer, index) => (
                        <Draggable key={volunteer.id} draggableId={volunteer.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-[#0c2342]/50 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-[#0c2342]/70 transition-all duration-200 flex items-center space-x-4 ${
                                snapshot.isDragging ? 'shadow-lg scale-105' : ''
                              }`}
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="flex items-center space-x-2 cursor-move"
                              >
                                <GripVertical className="w-4 h-4 text-white/30" />
                                <span className="text-white/50 text-sm">{volunteer.sort_order || 0}</span>
                              </div>
                              
                              <div className="flex-1 flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                  {volunteer.image_path ? (
                                    <img
                                      src={volunteer.image_path}
                                      alt={volunteer.name}
                                      className="w-20 h-20 object-cover rounded-lg shadow-lg"
                                    />
                                  ) : (
                                    <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center shadow-lg">
                                      <UserCheck className="w-10 h-10 text-white/30" />
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <h3 className="font-semibold text-white mb-1">{volunteer.name}</h3>
                                  <p className="text-white/70 text-sm">{volunteer.role}</p>
                                </div>
                              </div>

                              <div className="flex-shrink-0 flex items-center space-x-2">
                                <button
                                  onClick={() => handleEdit(volunteer)}
                                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(volunteer.id)}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
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
        )}

        {/* Volunteer Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={resetForm}>
            <div className="bg-[#1a365d] rounded-lg shadow-xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                              <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">
                      {isCreating ? 'Add New Volunteer' : 'Edit Volunteer'}
                    </h2>
                    <button
                      onClick={resetForm}
                      className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                        placeholder="Enter volunteer name"
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Role *
                      </label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                        placeholder="Enter volunteer role"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sort Order */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                        placeholder="Display order"
                      />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-5 h-5 text-[#4f7df9] bg-white/10 border-white/20 rounded focus:ring-[#4f7df9]/50"
                      />
                      <label htmlFor="isActive" className="ml-3 text-sm text-white">
                        Active
                      </label>
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Profile Image
                    </label>
                    <div className="space-y-4">
                      {imagePreview && (
                        <div className="w-32 h-32 rounded-lg overflow-hidden bg-white/10 border border-white/20">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <label className="flex items-center justify-center w-full h-32 border-2 border-white/20 border-dashed rounded-lg cursor-pointer hover:border-white/40 transition-colors bg-white/5">
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-white/50 mx-auto mb-2" />
                          <p className="text-sm text-white/70">
                            {imageFile ? imageFile.name : 'Click to upload image'}
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-[#4f7df9] text-white py-3 px-6 rounded-lg hover:bg-[#3a6eea] transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <Loader className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <Save className="w-5 h-5 mr-2" />
                      )}
                      {isCreating ? 'Create Volunteer' : 'Update Volunteer'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 border border-white/20 text-white/70 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default VolunteersAdmin;
