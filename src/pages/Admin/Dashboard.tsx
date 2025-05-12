import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Image, FileImage, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import TimeWidget from '@/components/admin/TimeWidget';
import WeatherWidget from '@/components/admin/WeatherWidget';

interface CountsData {
  gallery: number;
  activities: number;
  events: number;
}

const AdminDashboard = () => {
  const [countsData, setCountsData] = useState<CountsData>({
    gallery: 0,
    activities: 0,
    events: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCounts = async () => {
      setIsLoading(true);
      try {
        // Get counts from each table
        const [galleryData, activitiesData, eventsData] = await Promise.all([supabase.from('gallery').select('id', { count: 'exact', head: true }), supabase.from('activities').select('id', { count: 'exact', head: true }), supabase.from('events').select('id', { count: 'exact', head: true })]);
        setCountsData({
          gallery: galleryData.count || 0,
          activities: activitiesData.count || 0,
          events: eventsData.count || 0,
        });
      } catch (err: any) {
        setError(`Failed to load data: ${err.message}. Check Supabase connection or data availability.`);
        // Add log for debugging, can be removed in production
        console.log(`Dashboard error details: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const cards = [
    {
      title: 'Gallery Images',
      count: countsData.gallery,
      icon: Image,
      color: 'bg-blue-500',
      link: '/admin/gallery',
    },
    {
      title: 'Activities',
      count: countsData.activities,
      icon: FileImage,
      color: 'bg-green-500',
      link: '/admin/activities',
    },
    {
      title: 'Events',
      count: countsData.events,
      icon: Calendar,
      color: 'bg-purple-500',
      link: '/admin/events',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
            <p className="mt-2 text-white/70">Welcome to your admin portal</p>
          </div>
          
          <div className="mt-4 md:mt-0 backdrop-blur-sm px-4 py-2 rounded-lg text-sm flex items-center space-x-4 bg-white/10 border border-white/20 text-white/80">
            <TimeWidget />
            <span className="text-white/30">|</span>
            <WeatherWidget />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-[#4f7df9]"></div>
              <p className="mt-4 text-white/70">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          // Added mt-8 for more space between header and cards
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20">
              {cards.map((card, index) => (
                <a
                  key={card.title}
                  href={card.link}
                  aria-label={`Navigate to ${card.title} management`}
                  className="group backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 overflow-hidden relative bg-white/10 border border-white/20 hover:bg-white/15"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#4f7df9]/30 text-white">
                      <card.icon className="" size={22} />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-md text-white/80 bg-white/10">
                      {index === 0 ? 'Media' : index === 1 ? 'Content' : 'Events'}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-4xl font-bold text-white mb-1 group-hover:text-[#4f7df9] transition-colors">
                      {card.count}
                    </p>
                    <h2 className="font-medium text-white/80">{card.title}</h2>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4f7df9]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </a>
              ))}
            </div>
          </>
        )}
        

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
