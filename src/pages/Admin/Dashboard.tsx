import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Image, FileImage, Calendar, Mail, TrendingUp, Users, Eye, Plus, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { checkSystemHealth, SystemHealth } from '@/lib/healthService';
import { getDashboardData, invalidateDashboardCache, type CountsData, type RecentActivity } from '@/lib/dashboardService';
import TimeWidget from '@/components/admin/TimeWidget';
import WeatherWidget from '@/components/admin/WeatherWidget';
import { format, subDays, isValid, parseISO } from 'date-fns';



const AdminDashboard = () => {
  const [countsData, setCountsData] = useState<CountsData>({
    gallery: 0,
    activities: 0,
    events: 0,
    messages: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Use optimized dashboard service with caching
      const { counts, recentActivity: activity } = await getDashboardData();
      
      setCountsData(counts);
      setRecentActivity(activity);

    } catch (err: any) {
      setError(`Failed to load data: ${err.message}. Check Supabase connection or data availability.`);
      console.log(`Dashboard error details: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const health = await checkSystemHealth();
      setSystemHealth(health);
    } catch (err: any) {
      console.error('Failed to check system health:', err);
      // Set a default error state
      setSystemHealth({
        database: { name: 'Database', status: 'error', message: 'Health check failed', lastChecked: new Date() },
        storage: { name: 'Storage', status: 'error', message: 'Health check failed', lastChecked: new Date() },
        authentication: { name: 'Authentication', status: 'error', message: 'Health check failed', lastChecked: new Date() },
        overall: 'down'
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLastRefresh(new Date());
    await Promise.all([fetchDashboardData(), fetchSystemHealth()]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
    fetchSystemHealth();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchSystemHealth();
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: 'Gallery Images',
      count: countsData.gallery,
      icon: Image,
      color: 'bg-blue-500',
      link: '/login/gallery',
      description: 'Photos & media'
    },
    {
      title: 'Activities',
      count: countsData.activities,
      icon: FileImage,
      color: 'bg-green-500',
      link: '/login/activities',
      description: 'Programmes & services'
    },
    {
      title: 'Events',
      count: countsData.events,
      icon: Calendar,
      color: 'bg-purple-500',
      link: '/login/events',
      description: 'Upcoming events'
    },
    {
      title: 'Contact Messages',
      count: countsData.messages,
      icon: Mail,
      color: 'bg-orange-500',
      link: '/login/messages',
      description: 'Form submissions'
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'gallery': return <Image className="w-4 h-4" />;
      case 'activities': return <FileImage className="w-4 h-4" />;
      case 'events': return <Calendar className="w-4 h-4" />;
      case 'messages': return <Mail className="w-4 h-4" />;
      default: return <Plus className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'gallery': return 'text-blue-400';
      case 'activities': return 'text-green-400';
      case 'events': return 'text-purple-400';
      case 'messages': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500/20 border-green-500/30';
      case 'offline': return 'bg-red-500/20 border-red-500/30';
      case 'error': return 'bg-yellow-500/20 border-yellow-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'offline': return 'bg-red-400';
      case 'error': return 'bg-yellow-400';
      default: return 'bg-gray-400';
    }
  };

  const getOverallStatusColor = (overall: string) => {
    switch (overall) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
            <p className="mt-2 text-white/70">Welcome to your admin portal</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="backdrop-blur-sm px-4 py-2 rounded-lg text-sm flex items-center space-x-2 bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <div className="backdrop-blur-sm px-4 py-2 rounded-lg text-sm flex items-center space-x-4 bg-white/10 border border-white/20 text-white/80">
              <TimeWidget />
              <span className="text-white/30">|</span>
              <WeatherWidget />
            </div>
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
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      {index === 0 ? 'Media' : index === 1 ? 'Content' : index === 2 ? 'Events' : 'Communication'}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-3xl font-bold text-white mb-1 group-hover:text-[#4f7df9] transition-colors">
                      {card.count}
                    </p>
                    <h2 className="font-medium text-white/80 mb-1">{card.title}</h2>
                    <p className="text-xs text-white/60">{card.description}</p>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4f7df9]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </a>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow border border-white/20 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <a
                  href="/login/gallery"
                  className="flex items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
                >
                  <Plus className="w-5 h-5 mr-3 text-[#4f7df9]" />
                  <div>
                    <p className="font-medium text-white">Add Image</p>
                    <p className="text-sm text-white/60">Upload to gallery</p>
                  </div>
                </a>
                <a
                  href="/login/activities"
                  className="flex items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
                >
                  <Plus className="w-5 h-5 mr-3 text-[#4f7df9]" />
                  <div>
                    <p className="font-medium text-white">Add Activity</p>
                    <p className="text-sm text-white/60">Create new programme</p>
                  </div>
                </a>
                <a
                  href="/login/events"
                  className="flex items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
                >
                  <Plus className="w-5 h-5 mr-3 text-[#4f7df9]" />
                  <div>
                    <p className="font-medium text-white">Add Event</p>
                    <p className="text-sm text-white/60">Schedule new event</p>
                  </div>
                </a>
                <a
                  href="/login/messages"
                  className="flex items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
                >
                  <Eye className="w-5 h-5 mr-3 text-[#4f7df9]" />
                  <div>
                    <p className="font-medium text-white">View Messages</p>
                    <p className="text-sm text-white/60">Check contact form</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow border border-white/20 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Activity
              </h2>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-white/30" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center p-3 bg-white/5 rounded-lg">
                      <div className={`p-2 rounded-lg bg-white/10 mr-3 ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{activity.action}</p>
                        <p className="text-xs text-white/70 truncate">{activity.title}</p>
                      </div>
                      <div className="text-xs text-white/50">
                        {(() => {
                          let formatted = 'N/A';
                          if (activity.timestamp) {
                            let dateObj = typeof activity.timestamp === 'string' ? new Date(activity.timestamp) : activity.timestamp;
                            if (isValid(dateObj)) {
                              try {
                                formatted = format(dateObj, 'dd/MM HH:mm');
                              } catch {}
                            }
                          }
                          return formatted;
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* System Status */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  System Status
                </h2>
                {systemHealth && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-white/60">Overall:</span>
                    <span className={`text-sm font-medium ${getOverallStatusColor(systemHealth.overall)}`}>
                      {systemHealth.overall.charAt(0).toUpperCase() + systemHealth.overall.slice(1)}
                    </span>
                  </div>
                )}
              </div>
              {systemHealth ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`flex items-center p-3 rounded-lg border ${getStatusColor(systemHealth.database.status)}`}>
                    <div className={`w-3 h-3 rounded-full mr-3 ${getStatusDotColor(systemHealth.database.status)}`}></div>
                    <div>
                      <p className="text-sm font-medium text-white">{systemHealth.database.name}</p>
                      <p className="text-xs text-white/70">{systemHealth.database.message}</p>
                    </div>
                  </div>
                  <div className={`flex items-center p-3 rounded-lg border ${getStatusColor(systemHealth.storage.status)}`}>
                    <div className={`w-3 h-3 rounded-full mr-3 ${getStatusDotColor(systemHealth.storage.status)}`}></div>
                    <div>
                      <p className="text-sm font-medium text-white">{systemHealth.storage.name}</p>
                      <p className="text-xs text-white/70">{systemHealth.storage.message}</p>
                    </div>
                  </div>
                  <div className={`flex items-center p-3 rounded-lg border ${getStatusColor(systemHealth.authentication.status)}`}>
                    <div className={`w-3 h-3 rounded-full mr-3 ${getStatusDotColor(systemHealth.authentication.status)}`}></div>
                    <div>
                      <p className="text-sm font-medium text-white">{systemHealth.authentication.name}</p>
                      <p className="text-xs text-white/70">{systemHealth.authentication.message}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-white/60">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-r-2 border-[#4f7df9] mx-auto mb-3"></div>
                  <p>Checking system status...</p>
                </div>
              )}
              <div className="mt-4 text-xs text-white/50 text-center">
                Last updated: {format(lastRefresh, 'HH:mm:ss')} | Auto-refresh every 30 seconds
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
