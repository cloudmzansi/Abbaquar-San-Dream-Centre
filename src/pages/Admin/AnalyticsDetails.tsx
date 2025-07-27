import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getDetailedAnalytics } from '@/lib/analyticsService';
import { 
  Calendar, 
  Clock, 
  Eye, 
  MousePointer, 
  Share, 
  Download,
  Filter,
  Search,
  RefreshCw,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';

interface AnalyticsDetailsProps {
  type: 'page-views' | 'sessions' | 'engagement' | 'content';
}

const AnalyticsDetails = ({ type }: AnalyticsDetailsProps) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState(30);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const detailedData = await getDetailedAnalytics(timeRange);
      
      switch (type) {
        case 'page-views':
          setData(detailedData.pageViews || []);
          break;
        case 'sessions':
          setData(detailedData.visitorSessions || []);
          break;
        case 'engagement':
          setData(detailedData.contentEngagement || []);
          break;
        case 'content':
          setData(detailedData.contentPopularity || []);
          break;
      }
    } catch (err: any) {
      console.error('Failed to load detailed analytics:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [type, timeRange]);

  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    
    switch (type) {
      case 'page-views':
        return item.page_path?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.page_title?.toLowerCase().includes(searchTerm.toLowerCase());
      case 'sessions':
        return item.session_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.first_page?.toLowerCase().includes(searchTerm.toLowerCase());
      case 'engagement':
        return item.content_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.action_type?.toLowerCase().includes(searchTerm.toLowerCase());
      case 'content':
        return item.content_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.content_type?.toLowerCase().includes(searchTerm.toLowerCase());
      default:
        return true;
    }
  });

  const getTypeIcon = () => {
    switch (type) {
      case 'page-views': return <Eye className="w-5 h-5" />;
      case 'sessions': return <Clock className="w-5 h-5" />;
      case 'engagement': return <MousePointer className="w-5 h-5" />;
      case 'content': return <Share className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'page-views': return 'Page Views';
      case 'sessions': return 'Visitor Sessions';
      case 'engagement': return 'Content Engagement';
      case 'content': return 'Content Popularity';
      default: return 'Analytics';
    }
  };

  const renderPageViews = () => (
    <div className="space-y-3">
      {filteredData.map((view: any) => (
        <div key={view.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div className="flex items-center space-x-4">
            <Eye className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-white">{view.page_path}</p>
              <p className="text-xs text-white/60">{view.page_title}</p>
              <p className="text-xs text-white/50">Session: {view.session_id}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">{format(new Date(view.created_at), 'dd/MM HH:mm')}</p>
            <p className="text-xs text-white/60">{view.device_type} • {view.browser}</p>
            {view.load_time && (
              <p className="text-xs text-white/50">{view.load_time}ms</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-3">
      {filteredData.map((session: any) => (
        <div key={session.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div className="flex items-center space-x-4">
            <Clock className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-sm font-medium text-white">Session: {session.session_id}</p>
              <p className="text-xs text-white/60">{session.first_page} → {session.last_page}</p>
              <p className="text-xs text-white/50">{session.page_count} pages</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">{format(new Date(session.started_at), 'dd/MM HH:mm')}</p>
            <p className="text-xs text-white/60">{session.device_type} • {session.browser}</p>
            {session.duration_seconds && (
              <p className="text-xs text-white/50">{Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderEngagement = () => (
    <div className="space-y-3">
      {filteredData.map((engagement: any) => (
        <div key={engagement.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div className="flex items-center space-x-4">
            <MousePointer className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-sm font-medium text-white">{engagement.content_type} - {engagement.action_type}</p>
              <p className="text-xs text-white/60">{engagement.page_path}</p>
              {engagement.content_id && (
                <p className="text-xs text-white/50">ID: {engagement.content_id}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">{format(new Date(engagement.created_at), 'dd/MM HH:mm')}</p>
            <p className="text-xs text-white/60">Session: {engagement.session_id}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => (
    <div className="space-y-3">
      {filteredData.map((content: any) => (
        <div key={content.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div className="flex items-center space-x-4">
            <Share className="w-4 h-4 text-orange-400" />
            <div>
              <p className="text-sm font-medium text-white">{content.content_title || content.content_type}</p>
              <p className="text-xs text-white/60">{content.content_type} • Score: {content.engagement_score.toFixed(2)}</p>
              <p className="text-xs text-white/50">
                {content.view_count} views • {content.click_count} clicks • {content.share_count} shares
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">
              {content.last_viewed_at ? format(new Date(content.last_viewed_at), 'dd/MM HH:mm') : 'Never'}
            </p>
            <p className="text-xs text-white/60">ID: {content.content_id}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderData = () => {
    switch (type) {
      case 'page-views': return renderPageViews();
      case 'sessions': return renderSessions();
      case 'engagement': return renderEngagement();
      case 'content': return renderContent();
      default: return <div>No data available</div>;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-[#4f7df9]"></div>
            <p className="mt-4 text-white/70">Loading detailed data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-3">
            {getTypeIcon()}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{getTypeTitle()}</h1>
              <p className="mt-1 text-white/70">Detailed analytics data</p>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            {/* Time Range Selector */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-white/60" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="backdrop-blur-sm px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20 text-white/80"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>

            <button
              onClick={loadData}
              className="backdrop-blur-sm px-4 py-2 rounded-lg text-sm flex items-center space-x-2 bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-200">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <input
            type="text"
            placeholder={`Search ${getTypeTitle().toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#4f7df9] focus:border-transparent"
          />
        </div>

        {/* Data */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow border border-white/20 p-6">
          {filteredData.length === 0 ? (
            <div className="text-center py-16 text-white/60">
              {getTypeIcon()}
              <p className="mt-4">No data available for the selected criteria</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">
                  {filteredData.length} {getTypeTitle().toLowerCase()}
                </h2>
                <button
                  onClick={() => {
                    const csv = [
                      // Add CSV export functionality here
                    ].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${type}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/15 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
              {renderData()}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsDetails; 