import { useEffect, useState, useCallback } from 'react';
import Header from '../components/Header';
import Footer from "@/components/Footer";
import { getGalleryImages } from '@/lib/galleryService';
import { GalleryImage } from '@/types/supabase';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SEO, SEOConfigs } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";

const Gallery = () => {
  const [photos, setPhotos] = useState<GalleryImage[]>([]);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryImage | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const categories = ['All', 'Events', 'Activities', 'Community'];

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    getGalleryImages()
      .then(data => {
        setPhotos(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError('Failed to load photos. Please try again later.');
        setIsLoading(false);
      });
  }, []);

  const filteredPhotos = filter === 'All'
    ? photos
    : photos.filter(photo => {
        if (filter === 'Events') return photo.category === 'events';
        if (filter === 'Activities') return photo.category === 'activities';
        if (filter === 'Community') return photo.category === 'community';
        return true;
      });

  const openLightbox = (photo: GalleryImage) => {
    setSelectedPhoto(photo);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  }, []);

  const navigateToNextPhoto = useCallback(() => {
    if (!selectedPhoto) return;
    
    const currentIndex = filteredPhotos.findIndex(photo => photo.id === selectedPhoto.id);
    if (currentIndex < filteredPhotos.length - 1) {
      setSelectedPhoto(filteredPhotos[currentIndex + 1]);
    }
  }, [selectedPhoto, filteredPhotos]);

  const navigateToPrevPhoto = useCallback(() => {
    if (!selectedPhoto) return;
    
    const currentIndex = filteredPhotos.findIndex(photo => photo.id === selectedPhoto.id);
    if (currentIndex > 0) {
      setSelectedPhoto(filteredPhotos[currentIndex - 1]);
    }
  }, [selectedPhoto, filteredPhotos]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowRight':
          navigateToNextPhoto();
          break;
        case 'ArrowLeft':
          navigateToPrevPhoto();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox, navigateToNextPhoto, navigateToPrevPhoto]);

  return (
    <>
      <SEO {...SEOConfigs.gallery} />
      <div className="flex flex-col min-h-screen">
        <Header />
        <Breadcrumb />
        <main className="flex-grow">
        {/* Hero Section */}
        <section aria-labelledby="gallery-hero-title" className="bg-[#073366] text-white py-24 pt-32">
          <div className="container-custom">
            <h1 id="gallery-hero-title" className="text-4xl md:text-5xl font-bold mb-6 text-center font-serif">Gallery</h1>
            <p className="text-xl text-center max-w-3xl mx-auto">
              Browse through images of our activities, events, and community outreach programs.
            </p>
          </div>
        </section>

        {/* Gallery Content */}
        <section aria-labelledby="gallery-content-title" className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="flex flex-wrap justify-center mb-8 gap-2 px-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  aria-label={`Filter gallery by ${cat}`}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-semibold text-sm sm:text-base ${filter === cat ? 'bg-[#073366] text-white' : 'bg-white text-[#073366] border border-[#073366]'}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#073366]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-6 rounded-lg text-center text-red-600">
                <p>{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {filteredPhotos.length === 0 ? (
                  <div className="col-span-full text-center text-gray-500">No images found.</div>
                ) : (
                  filteredPhotos.map(photo => (
                    <div 
                      key={photo.id} 
                      className="bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                      onClick={() => openLightbox(photo)}
                      role="button"
                      aria-label={`View ${photo.title || 'image'} in lightbox`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          openLightbox(photo);
                        }
                      }}
                    >
                      <img 
                        src={photo.image_path} 
                        alt={photo.alt_text || `${photo.category} photo`} 
                        className="w-full h-48 md:h-64 object-cover" 
                        width="384"
                        height="256"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/hero.jpg';
                        }} 
                      />
                      {photo.title && (
                        <div className="p-3 md:p-4">
                          <h3 className="text-base md:text-lg font-medium text-[#073366]">{photo.title}</h3>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>

        {/* Lightbox */}
        {lightboxOpen && selectedPhoto && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox"
          >
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors z-20"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <X size={24} />
            </button>

            {/* Previous arrow */}
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors z-20 disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.stopPropagation();
                navigateToPrevPhoto();
              }}
              disabled={filteredPhotos.findIndex(photo => photo.id === selectedPhoto.id) === 0}
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Next arrow */}
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors z-20 disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.stopPropagation();
                navigateToNextPhoto();
              }}
              disabled={filteredPhotos.findIndex(photo => photo.id === selectedPhoto.id) === filteredPhotos.length - 1}
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>

            {/* Image container with animation */}
            <div 
              className="relative max-w-[90vw] max-h-[85vh] z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedPhoto.image_path} 
                alt={selectedPhoto.alt_text || `${selectedPhoto.category} photo`}
                className="max-w-full max-h-[85vh] object-contain animate-fade-in"
                onError={(e) => {
                  e.currentTarget.src = '/assets/hero.jpg';
                }}
              />
              {selectedPhoto.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white py-3 px-4">
                  <h3 className="text-lg font-medium">{selectedPhoto.title}</h3>
                </div>
              )}
            </div>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/30 px-3 py-1 rounded-full">
              {filteredPhotos.findIndex(photo => photo.id === selectedPhoto.id) + 1} / {filteredPhotos.length}
            </div>
          </div>
        )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Gallery;
