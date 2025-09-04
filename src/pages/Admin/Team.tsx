import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAllTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, updateTeamMemberOrder } from '@/lib/teamService';
import { getAllVolunteers, createVolunteer, updateVolunteer, deleteVolunteer, updateVolunteerOrder } from '@/lib/volunteerService';
import { TeamMember, Volunteer, MemberWithSource } from '@/types/supabase';
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

const TeamAdmin = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [allMembers, setAllMembers] = useState<MemberWithSource[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberWithSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editMember, setEditMember] = useState<MemberWithSource | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'leadership' | 'management' | 'volunteers'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);

  // Form states for new/edit team member
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [category, setCategory] = useState<'leadership' | 'management' | 'volunteers'>('management');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load all members (team members and volunteers)
  const loadAllMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [members, volunteerList] = await Promise.all([
        getAllTeamMembers(),
        getAllVolunteers()
      ]);
      
      setTeamMembers(members);
      setVolunteers(volunteerList);
      
      // Combine all members into one array with source information
      const combined = [
        ...members.map(member => ({ ...member, source: 'team_members' as const })),
        ...volunteerList.map(volunteer => ({ ...volunteer, source: 'volunteers' as const }))
      ];
      setAllMembers(combined);
      setFilteredMembers(combined);
    } catch (err: any) {
      console.error('Failed to load members:', err);
      setError('Failed to load members. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllMembers();
  }, [loadAllMembers]);

  // Filter and search all members
  useEffect(() => {
    let filtered = allMembers;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(member => 
        filterStatus === 'active' ? member.is_active : !member.is_active
      );
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(member => 
        member.category === filterCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMembers(filtered);
  }, [allMembers, searchTerm, filterStatus, filterCategory]);

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
    setCategory('management');
    setSortOrder(0);
    setIsActive(true);
    setImageFile(null);
    setImagePreview(null);
    setEditMember(null);
    setIsCreating(false);
    setShowForm(false);
    setError(null);
    setSuccessMessage(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !role.trim()) {
      setError('Name and role are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let finalSortOrder = sortOrder;
      
      // If creating a new member, automatically set sort order to last position
      if (isCreating) {
        const maxSortOrder = teamMembers.length > 0 
          ? Math.max(...teamMembers.map(m => m.sort_order || 0))
          : 0;
        finalSortOrder = maxSortOrder + 1;
      }

      const memberData = {
        name: name.trim(),
        role: role.trim(),
        category: category,
        sort_order: finalSortOrder,
        is_active: isActive,
        image_path: editMember?.image_path
      };

      if (isCreating) {
        if (category === 'volunteers') {
          await createVolunteer(memberData, imageFile || undefined);
          setSuccessMessage('Volunteer created successfully!');
        } else {
        await createTeamMember(memberData, imageFile || undefined);
        setSuccessMessage('Team member created successfully!');
        }
      } else if (editMember) {
        if (editMember.source === 'volunteers') {
          await updateVolunteer(editMember.id, memberData, imageFile || undefined);
          setSuccessMessage('Volunteer updated successfully!');
        } else {
        await updateTeamMember(editMember.id, memberData, imageFile || undefined);
        setSuccessMessage('Team member updated successfully!');
        }
      }

      resetForm();
      await loadAllMembers();
    } catch (err: any) {
      console.error('Failed to save team member:', err);
      setError(err.message || 'Failed to save team member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (member: MemberWithSource) => {
    // Reset form state first
    resetForm();
    
    // Set edit state
    setEditMember(member);
    setName(member.name);
    setRole(member.role);
    setCategory(member.category || 'management');
    setSortOrder(member.sort_order || 0);
    setIsActive(member.is_active ?? true);
    setImagePreview(member.image_path || null);
    setImageFile(null);
    setIsCreating(false);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string, source?: string) => {
    if (!confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      return;
    }

    try {
      if (source === 'volunteers') {
        await deleteVolunteer(id);
        setSuccessMessage('Volunteer deleted successfully!');
      } else {
        await deleteTeamMember(id);
        setSuccessMessage('Team member deleted successfully!');
      }
      await loadAllMembers();
    } catch (err: any) {
      console.error('Failed to delete member:', err);
      setError(err.message || 'Failed to delete member. Please try again.');
    }
  };

  // Handle drag and drop reorder
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newMembers = Array.from(filteredTeamMembers);
    const [movedMember] = newMembers.splice(sourceIndex, 1);
    newMembers.splice(destinationIndex, 0, movedMember);

    // Update sort_order for all affected members
    const updatedMembers = newMembers.map((member, index) => ({
      ...member,
      sort_order: index + 1
    }));

    setFilteredTeamMembers(updatedMembers);

    try {
      await updateTeamMemberOrder(updatedMembers.map(member => ({
        id: member.id,
        sort_order: member.sort_order || 0
      })));
    } catch (err: any) {
      console.error('Failed to update order:', err);
      setError('Failed to update team member order. Please try again.');
      await loadTeamMembers(); // Reload to reset order
    }
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader className="animate-spin" />
            <span className="text-white">Loading team members...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Team Management</h1>
            <p className="text-white/70 mt-1">Manage your team members and their information</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsCreating(true);
              setShowForm(true);
            }}
            className="flex items-center px-4 py-2 bg-[#4f7df9] text-white rounded-lg hover:bg-[#3a6eea] transition-colors shadow-lg"
          >
            <UserPlus size={18} className="mr-2" />
            Add Team Member
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
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50 appearance-none"
              >
                <option value="all">All Members</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={18} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as 'all' | 'leadership' | 'management' | 'volunteers')}
                className="pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50 appearance-none"
              >
                <option value="all">All Categories</option>
                <option value="leadership">Leadership</option>
                <option value="management">Management</option>
                <option value="volunteers">Volunteers</option>
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

        {/* Team Member Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={resetForm}>
            <div className="bg-[#1a365d] rounded-lg shadow-xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {isCreating ? 'Add New Team Member' : 'Edit Team Member'}
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
                      <label className="block text-white text-sm font-medium mb-2">Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                        placeholder="Enter full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Role/Position *</label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                        placeholder="Enter role or position"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Category *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as 'leadership' | 'management' | 'volunteers')}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                        required
                      >
                        <option value="leadership">Leadership (Royal House)</option>
                        <option value="management">Management</option>
                        <option value="volunteers">Volunteers</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Sort Order</label>
                      <input
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                        placeholder="Display order (lower numbers first)"
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-4 h-4 text-[#4f7df9] bg-white/10 border-white/20 rounded focus:ring-[#4f7df9]/50"
                      />
                      <label htmlFor="isActive" className="text-white text-sm">
                        Active (visible on website)
                      </label>
                    </div>
                  </div>
                  
                  {/* Right Column - Image Upload */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Profile Photo</label>
                      <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          {imagePreview ? (
                            <div className="space-y-2">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg mx-auto"
                              />
                              <p className="text-white/70 text-sm">Click to change image</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="w-8 h-8 text-white/50 mx-auto" />
                              <p className="text-white/70 text-sm">Click to upload image</p>
                              <p className="text-white/50 text-xs">Recommended: Square image, 400x400px</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center px-4 py-2 bg-[#4f7df9] text-white rounded-lg hover:bg-[#3a6eea] transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="animate-spin w-4 h-4 mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isCreating ? 'Create Member' : 'Update Member'}
                      </>
                    )}
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        )}

        {/* Team Members Display */}
        <div className="bg-[#1a365d]/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/10">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-white">Team Members & Volunteers</h2>
            <p className="text-white/70 text-sm mb-6">
              Manage Leadership (Royal House), Management, and Volunteers. Use filters to view specific categories.
            </p>
            
            {/* Category Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-300 text-sm font-medium">Leadership</p>
                    <p className="text-yellow-200 text-2xl font-bold">
                      {allMembers.filter(m => m.category === 'leadership').length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-yellow-300/50" />
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">Management</p>
                    <p className="text-blue-200 text-2xl font-bold">
                      {allMembers.filter(m => m.category === 'management').length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-300/50" />
                </div>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">Volunteers</p>
                    <p className="text-green-200 text-2xl font-bold">
                      {allMembers.filter(m => m.category === 'volunteers').length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-green-300/50" />
                </div>
              </div>
            </div>
            
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/50">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'No members match your search criteria.' 
                    : 'No members found. Add your first member above.'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className="bg-[#0c2342]/50 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-[#0c2342]/70 transition-all duration-200 text-center"
                  >
                    <div className="mb-4">
                      {member.image_path ? (
                        <img
                          src={member.image_path}
                          alt={member.name}
                          className="w-32 h-32 mx-auto object-cover rounded-lg shadow-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 mx-auto bg-white/10 rounded-lg flex items-center justify-center shadow-lg">
                          <UserCheck className="w-10 h-10 text-white/30" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-white mb-1">{member.name}</h3>
                      <p className="text-white/70 text-sm">{member.role}</p>
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          member.category === 'leadership' 
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                            : member.category === 'management'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                        }`}>
                          {member.category === 'leadership' ? 'Leadership' : 
                           member.category === 'management' ? 'Management' : 'Volunteers'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(member)}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id, member.source)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="team-members">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {filteredMembers.map((member, index) => (
                        <Draggable key={member.id} draggableId={member.id} index={index}>
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
                                <span className="text-white/50 text-sm">{member.sort_order || 0}</span>
                              </div>
                              
                              <div className="flex-1 flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                  {member.image_path ? (
                                    <img
                                      src={member.image_path}
                                      alt={member.name}
                                      className="w-20 h-20 object-cover rounded-lg shadow-lg"
                                    />
                                  ) : (
                                    <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center shadow-lg">
                                      <UserCheck className="w-10 h-10 text-white/30" />
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <h3 className="font-semibold text-white mb-1">{member.name}</h3>
                                  <p className="text-white/70 text-sm">{member.role}</p>
                                  <div className="mt-1">
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                      member.category === 'leadership' 
                                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                                        : member.category === 'management'
                                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                        : 'bg-green-500/20 text-green-300 border border-green-500/30'
                                    }`}>
                                      {member.category === 'leadership' ? 'Leadership' : 
                                       member.category === 'management' ? 'Management' : 'Volunteers'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex-shrink-0 flex items-center space-x-2">
                                <button
                                  onClick={() => handleEdit(member)}
                                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(member.id, member.source)}
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
        </div>
      </div>
    </AdminLayout>
  );
};

export default TeamAdmin; 