import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './Activities.css';
import { getActivities } from '@/lib/activitiesService';
import { Activity } from '@/types/supabase';

interface ActivitiesProps {
  showHeader?: boolean;
  displayOn?: 'home' | 'activities' | 'both';
}

const Activities = ({ showHeader = true, displayOn = 'activities' }: ActivitiesProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    getActivities(displayOn)
      .then(data => {
        setActivities(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading activities:', err);
        setError('Failed to load activities. Please try again later.');
        setIsLoading(false);
      });
  }, [displayOn]);

  const ActivityCard = ({ activity }: { activity: Activity }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md h-full w-[384px] mx-auto">
      <div className="relative overflow-hidden w-[384px] h-[192px]">
        <img 
          src={activity.image_path} 
          alt={activity.title}
          className="w-full h-full object-cover"
          width="384"
          height="192"
          loading="eager"
          decoding="sync"
          style={{ minWidth: '384px', minHeight: '192px' }}
          onError={(e) => {
            // Fallback image if the original fails to load
            e.currentTarget.src = '/assets/hero.jpg';
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-[#073366]">{activity.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-3">{activity.description}</p>
      </div>
    </div>
  );

  return (
    <section id="activities" className="py-16 md:py-24 bg-gray-50">
      <div className="container-custom">
        {showHeader && (
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="text-[#D72660] font-semibold mb-4 block">Our Programs</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#073366] font-serif">Activities</h2>
            <p className="text-lg text-gray-600 mb-8">
              Join our community and discover what we offer. We provide various activities to engage, 
              educate, and empower members of our community.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="min-h-[300px] flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#073366]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-lg text-center text-red-600 mb-8">
            <p>{error}</p>
          </div>
        ) : isMobile ? (
          <div className="min-h-[300px] w-full pb-12 overflow-x-hidden">
            <Swiper
              modules={[Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              centeredSlides={true}
              pagination={{ clickable: true }}
              className="w-full activities-swiper"
              role="region"
              aria-label="Activities carousel"
              style={{ width: '384px', margin: '0 auto' }}
            >
              {activities.length === 0 ? (
                <SwiperSlide>
                  <div className="text-center py-12 text-gray-500">No activities found.</div>
                </SwiperSlide>
              ) : (
                activities.map((activity) => (
                  <SwiperSlide key={activity.id}>
                    <ActivityCard activity={activity} />
                  </SwiperSlide>
                ))
              )}
            </Swiper>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[300px]">
            {activities.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">No activities found.</div>
            ) : (
              activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Activities;
