import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from "@/components/Footer";
import { getGalleryImages } from '@/lib/galleryService';
import { GalleryImage } from '@/types/supabase';

const Gallery = () => {
  const [photos, setPhotos] = useState<GalleryImage[]>([]);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section aria-labelledby="gallery-hero-title" className="bg-[#073366] text-white py-20 mt-[88px]">
          <div className="container-custom">
            <h1 id="gallery-hero-title" className="text-4xl md:text-5xl font-bold mb-6 text-center">Gallery</h1>
            <p className="text-xl text-center max-w-3xl mx-auto">
              Browse through images of our activities, events, and community outreach programs.
            </p>
          </div>
        </section>

        {/* Gallery Content */}
        <section aria-labelledby="gallery-content-title" className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="flex justify-center mb-8 gap-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  aria-label={`Filter gallery by ${cat}`}
                  className={`px-4 py-2 rounded-full font-semibold ${filter === cat ? 'bg-[#073366] text-white' : 'bg-white text-[#073366] border border-[#073366]'}`}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {filteredPhotos.length === 0 ? (
                  <div className="col-span-full text-center text-gray-500">No images found.</div>
                ) : (
                  filteredPhotos.map(photo => (
                    <div key={photo.id} className="bg-white rounded-2xl overflow-hidden shadow-lg">
                      <img 
                        src={photo.image_path} 
                        alt={photo.alt_text || `${photo.category} photo`} 
                        className="w-full h-64 object-cover" 
                        width="384"
                        height="256"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/hero.jpg';
                        }} 
                      />
                      {photo.title && (
                        <div className="p-4">
                          <h3 className="text-lg font-medium text-[#073366]">{photo.title}</h3>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;
