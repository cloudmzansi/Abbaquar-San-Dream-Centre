import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getGalleryImages, uploadGalleryImage, deleteGalleryImage } from '@/lib/galleryService';
import { GalleryImage } from '@/types/supabase';
import { Trash2, Upload, Image, Loader, CheckSquare, Bug, AlertTriangle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const GalleryAdmin = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'events' | 'activities' | 'community'>('events');
  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Load gallery images
  const loadImages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const galleryImages = await getGalleryImages();
      setImages(galleryImages);
    } catch (err: any) {
      console.error('Failed to load gallery images:', err);
      setError('Failed to load images. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    
    try {
      await uploadGalleryImage(file, selectedCategory, title || undefined, altText || undefined);
      setUploadSuccess(true);
      setTitle('');
      setAltText('');
      
      // Reload the images
      await loadImages();
      
      // Reset the file input
      e.target.value = '';
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      setUploadError('Failed to upload image. Please try again later.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete image
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteGalleryImage(id);
      // Remove the deleted image from the state
      setImages(images.filter(img => img.id !== id));
      // Also remove from selected images if it was selected
      setSelectedImages(selectedImages.filter(imgId => imgId !== id));
    } catch (err: any) {
      console.error('Failed to delete image:', err);
      alert('Failed to delete image. Please try again later.');
    }
  };
  
  // Toggle image selection
  const toggleSelection = (id: string) => {
    setSelectedImages(prev => 
      prev.includes(id) 
        ? prev.filter(imgId => imgId !== id) // Remove if already selected
        : [...prev, id] // Add if not selected
    );
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedImages.length} selected image(s)? This action cannot be undone.`)) {
      return;
    }
    
    try {
      // Delete each selected image
      for (const id of selectedImages) {
        await deleteGalleryImage(id);
      }
      
      // Update state
      setImages(images.filter(img => !selectedImages.includes(img.id)));
      setSelectedImages([]);
    } catch (err: any) {
      console.error('Failed to delete images:', err);
      alert('Failed to delete some images. Please try again later.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 id="gallery-title" className="text-2xl sm:text-3xl font-bold text-white">Gallery Management</h1>
          <div className="flex flex-wrap gap-2">
            {selectedImages.length > 0 && (
              <button
                aria-label="Delete selected images"
                onClick={handleBulkDelete}
                className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm w-full sm:w-auto justify-center"
              >
                <Trash2 size={16} className="mr-1.5" />
                Delete Selected ({selectedImages.length})
              </button>
            )}
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow border border-white/20 p-3 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Upload Image</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as 'events' | 'activities' | 'community')}
                className="w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
              >
                <option value="events">Events</option>
                <option value="activities">Activities</option>
                <option value="community">Community</option>
              </select>
            </div>
            <div>
              <label className="block text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2">Image Title (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-2 py-1.5 sm:px-3 sm:py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f7df9]/50"
                placeholder="Image title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Alt Text (Optional)</label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image for accessibility"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50"
              />
            </div>
          </div>
          <div className="mt-4">
            <div className="md:col-span-2">
              <label className="block text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2">Image File</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-white/20 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10">
                  <div className="flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-6">
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-white/70" />
                    <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-white/70">Click to upload</p>
                    <p className="text-xs text-white/50">PNG, JPG or WEBP</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileUpload}
                    accept="image/png, image/jpeg, image/webp"
                  />
                </label>
              </div>
            </div>
          </div>
          {isUploading && (
            <div className="mt-2 flex items-center text-sm text-amber-600">
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              <span>Uploading image...</span>
            </div>
          )}
          {uploadError && (
            <div className="mt-2 text-sm text-red-600">
              {uploadError}
            </div>
          )}
          {uploadSuccess && (
            <div className="mt-2 text-sm text-green-600">
              Image uploaded successfully!
            </div>
          )}
        </div>

        {/* Gallery Images */}
        <section aria-labelledby="gallery-title" className="bg-white/10 backdrop-blur-sm rounded-lg shadow border border-white/20 p-3 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Gallery Images</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4f7df9]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-xl text-red-600">
              {error}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-white/70">
              <Image className="mx-auto h-12 w-12 text-white/50 mb-3" />
              <p>No images found. Upload your first image!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {images.map(image => (
                <div 
                  key={image.id} 
                  className={`bg-white/10 rounded-lg overflow-hidden relative group border cursor-pointer ${selectedImages.includes(image.id) ? 'border-[#4f7df9] ring-2 ring-[#4f7df9]/50' : 'border-white/20'}`}
                  onClick={() => toggleSelection(image.id)}
                >
                  <img 
                    src={image.image_path} 
                    alt={image.alt_text || `${image.category} photo`} 
                    className="w-full h-48 object-cover" 
                    onError={(e) => {
                      e.currentTarget.src = '/assets/hero.jpg';
                    }} 
                  />
                  <div className="p-3">
                    <span className="inline-block px-2 py-1 bg-[#4f7df9]/30 text-white text-xs rounded-full capitalize">
                      {image.category}
                    </span>
                    {image.title && (
                      <p className="mt-2 text-sm font-medium">{image.title}</p>
                    )}
                  </div>
                  
                  {/* Selection indicator */}
                  <div
                    className={`absolute right-2 top-2 p-1.5 rounded-md transition-all ${selectedImages.includes(image.id) ? 'bg-[#4f7df9] opacity-100' : 'bg-white/20 opacity-0 group-hover:opacity-100'}`}
                  >
                    <CheckSquare size={16} className="text-white" />
                  </div>
                  
                  {/* Trash button */}
                  <button
                    aria-label="Delete image"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering selection
                      handleDelete(image.id);
                    }}
                    className="absolute right-2 bottom-2 bg-red-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default GalleryAdmin;
