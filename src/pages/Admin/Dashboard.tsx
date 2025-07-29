import { useState, useEffect, useReducer } from 'react';
import { format } from 'date-fns';
import AdminLayout from '@/components/admin/AdminLayout';
import TimeWidget from '@/components/admin/TimeWidget';
import WeatherWidget from '@/components/admin/WeatherWidget';
import { getDashboardData, getSystemHealth } from '@/lib/dashboardService';
import { RefreshCw, Users, Calendar, Image, Database, Activity } from 'lucide-react';

interface DashboardState {
  stats: {
    totalEvents: number;
    totalImages: number;
    totalActivities: number;
    totalTeamMembers: number;
  };
  systemHealth: {
    database: 'healthy' | 'warning' | 'error';
    api: 'healthy' | 'warning' | 'error';
    storage: 'healthy' | 'warning' | 'error';
  };
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: string;
    user?: string;
  }>;
  isLoading: boolean;
  error: string | null;
}

type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STATS'; payload: DashboardState['stats'] }
  | { type: 'SET_SYSTEM_HEALTH'; payload: DashboardState['systemHealth'] }
  | { type: 'SET_RECENT_ACTIVITY'; payload: DashboardState['recentActivity'] };

const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_SYSTEM_HEALTH':
      return { ...state, systemHealth: action.payload };
    case 'SET_RECENT_ACTIVITY':
      return { ...state, recentActivity: action.payload };
    default:
      return state;
  }
};

const AdminDashboard = () => {
  const [state, dispatch] = useReducer(dashboardReducer, {
    stats: {
      totalUsers: 0,
      totalEvents: 0,
      totalImages: 0,
      totalActivities: 0,
      totalTeamMembers: 0,
    },
    systemHealth: {
      database: 'healthy',
      api: 'healthy',
      storage: 'healthy',
    },
    recentActivity: [],
    isLoading: false,
    error: null,
  });

  const fetchDashboardData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const data = await getDashboardData();
      // Transform the counts data to match the expected stats structure
      const stats = {
        totalEvents: data.counts.events || 0,
        totalImages: data.counts.gallery || 0,
        totalActivities: data.counts.activities || 0,
        totalTeamMembers: data.counts.teamMembers || 0,
      };
      
      // Transform recent activity to match expected structure
      const transformedActivity = (data.recentActivity || []).map((item: any) => ({
        id: item.id || `activity-${Date.now()}`,
        action: item.title || `${item.type || 'Item'} created`,
        timestamp: item.created_at || new Date().toISOString(),
        user: undefined // We don't have user info in the current structure
      }));
      
      dispatch({ type: 'SET_STATS', payload: stats });
      dispatch({ type: 'SET_RECENT_ACTIVITY', payload: transformedActivity });
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load dashboard data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const health = await getSystemHealth();
      // Transform the health data to match the expected structure
      const systemHealth = {
        database: health.database?.status === 'online' ? 'healthy' : 'error',
        api: health.authentication?.status === 'online' ? 'healthy' : 'error',
        storage: health.storage?.status === 'online' ? 'healthy' : 'error',
      };
      dispatch({ type: 'SET_SYSTEM_HEALTH', payload: systemHealth });
    } catch (error: any) {
      console.error('Failed to fetch system health:', error);
      // Set default error state
      dispatch({ type: 'SET_SYSTEM_HEALTH', payload: {
        database: 'error',
        api: 'error',
        storage: 'error',
      }});
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchSystemHealth();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
    fetchSystemHealth();
  };

  // Show loading state
  if (state.isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4f7df9] mx-auto mb-4"></div>
            <p className="text-white/70">Loading dashboard data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show error state
  if (state.error) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome back, Admin!</h1>
              <p className="mt-1 text-white/70">Today is {format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center px-4 py-2 bg-[#4f7df9] text-white rounded-lg hover:bg-[#4f7df9]/80 transition-colors shadow"
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </button>
              <div className="flex gap-3">
                <TimeWidget />
                <WeatherWidget />
              </div>
            </div>
          </div>
          
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-red-500 rounded-full mr-3"></div>
              <h2 className="text-xl font-semibold text-red-400">Error Loading Dashboard</h2>
            </div>
            <p className="text-red-300 mt-2">{state.error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, Admin!</h1>
            <p className="mt-1 text-white/70">Today is {format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 bg-[#4f7df9] text-white rounded-lg hover:bg-[#4f7df9]/80 transition-colors shadow"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
            <div className="flex gap-3">
              <TimeWidget />
              <WeatherWidget />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-[#1a365d] rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4 text-white">Quick Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center p-4 bg-[#0c2342] rounded-lg">
              <Calendar className="w-8 h-8 text-[#4f7df9] mr-3" />
              <div>
                <div className="text-2xl font-bold text-white">{state.stats?.totalEvents || 0}</div>
                <div className="text-sm text-white/70">Total Events</div>
              </div>
            </div>
            <div className="flex items-center p-4 bg-[#0c2342] rounded-lg">
              <Image className="w-8 h-8 text-[#4f7df9] mr-3" />
              <div>
                <div className="text-2xl font-bold text-white">{state.stats?.totalImages || 0}</div>
                <div className="text-sm text-white/70">Gallery Images</div>
              </div>
            </div>
            <div className="flex items-center p-4 bg-[#0c2342] rounded-lg">
              <Activity className="w-8 h-8 text-[#4f7df9] mr-3" />
              <div>
                <div className="text-2xl font-bold text-white">{state.stats?.totalActivities || 0}</div>
                <div className="text-sm text-white/70">Total Activities</div>
              </div>
            </div>
            <div className="flex items-center p-4 bg-[#0c2342] rounded-lg">
              <Users className="w-8 h-8 text-[#4f7df9] mr-3" />
              <div>
                <div className="text-2xl font-bold text-white">{state.stats?.totalTeamMembers || 0}</div>
                <div className="text-sm text-white/70">Team Members</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-[#1a365d] rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4 text-white">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-[#0c2342] rounded-lg">
              <Database className="w-6 h-6 mr-3" style={{ color: state.systemHealth?.database === 'healthy' ? '#10b981' : state.systemHealth?.database === 'warning' ? '#f59e0b' : '#ef4444' }} />
              <div>
                <div className="font-medium text-white">Database</div>
                <div className="text-sm" style={{ color: state.systemHealth?.database === 'healthy' ? '#10b981' : state.systemHealth?.database === 'warning' ? '#f59e0b' : '#ef4444' }}>
                  {state.systemHealth?.database === 'healthy' ? 'Healthy' : state.systemHealth?.database === 'warning' ? 'Warning' : 'Error'}
                </div>
              </div>
            </div>
            <div className="flex items-center p-4 bg-[#0c2342] rounded-lg">
              <Activity className="w-6 h-6 mr-3" style={{ color: state.systemHealth?.api === 'healthy' ? '#10b981' : state.systemHealth?.api === 'warning' ? '#f59e0b' : '#ef4444' }} />
              <div>
                <div className="font-medium text-white">API</div>
                <div className="text-sm" style={{ color: state.systemHealth?.api === 'healthy' ? '#10b981' : state.systemHealth?.api === 'warning' ? '#f59e0b' : '#ef4444' }}>
                  {state.systemHealth?.api === 'healthy' ? 'Healthy' : state.systemHealth?.api === 'warning' ? 'Warning' : 'Error'}
                </div>
              </div>
            </div>
            <div className="flex items-center p-4 bg-[#0c2342] rounded-lg">
              <Database className="w-6 h-6 mr-3" style={{ color: state.systemHealth?.storage === 'healthy' ? '#10b981' : state.systemHealth?.storage === 'warning' ? '#f59e0b' : '#ef4444' }} />
              <div>
                <div className="font-medium text-white">Storage</div>
                <div className="text-sm" style={{ color: state.systemHealth?.storage === 'healthy' ? '#10b981' : state.systemHealth?.storage === 'warning' ? '#f59e0b' : '#ef4444' }}>
                  {state.systemHealth?.storage === 'healthy' ? 'Healthy' : state.systemHealth?.storage === 'warning' ? 'Warning' : 'Error'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1a365d] rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4 text-white">Recent Activity</h2>
          <div className="space-y-3">
            {state.recentActivity?.slice(0, 3).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-[#0c2342] rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-[#4f7df9] rounded-full mr-3"></div>
                  <span className="text-white">{activity.action}</span>
                  {activity.user && (
                    <span className="text-white/60 ml-2">by {activity.user}</span>
                  )}
                </div>
                <span className="text-xs text-white/40">
                  {activity.timestamp && !isNaN(new Date(activity.timestamp).getTime())
                    ? format(new Date(activity.timestamp), 'MMM d, HH:mm')
                    : '—'}
                </span>
              </div>
            ))}
            {(!state.recentActivity || state.recentActivity.length === 0) && (
              <div className="text-center py-8 text-white/60">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
