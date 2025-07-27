import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  getAnalyticsSummary, 
  getDetailedAnalytics,
  AnalyticsSummary 
} from '@/lib/analyticsService';
import { 
  Users, 
  Eye, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  Globe, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Heart,
  DollarSign,
  Calendar,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import { format, subDays } from 'date-fns';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
  const [detailedData, setDetailedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(30); // days
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadAnalytics = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const [summary, detailed] = await Promise.all([
        getAnalyticsSummary(timeRange),
        getDetailedAnalytics(timeRange)
      ]);

      setAnalyticsData(summary);
      setDetailedData(detailed);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    await loadAnalytics(true);
  };

  const handleTimeRangeChange = (days: number) => {
    setTimeRange(days);
    loadAnalytics();
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadAnalytics(true);
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [timeRange]);

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getBrowserIcon = (browser: string) => {
    // All browser icons use Globe since specific browser icons don't exist in lucide-react
    return <Globe className="w-4 h-4" />;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-[#4f7df9]"></div>
            <p className="mt-4 text-white/70">Loading analytics data...</p>
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
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="mt-2 text-white/70">Visitor insights and content performance</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            {/* Time Range Selector */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-white/60" />
              <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(Number(e.target.value))}
                className="backdrop-blur-sm px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20 text-white/80"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="backdrop-blur-sm px-4 py-2 rounded-lg text-sm flex items-center space-x-2 bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-200">
            {error}
          </div>
        )}



        {analyticsData && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="backdrop-blur-sm rounded-xl shadow-sm p-6 bg-white/10 border border-white/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-blue-500/30 text-white">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-md text-white/80 bg-white/10">
                    Visitors
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {analyticsData.totalVisitors.toLocaleString()}
                  </p>
                  <p className="text-sm text-white/60">Unique visitors</p>
                </div>
              </div>

              <div className="backdrop-blur-sm rounded-xl shadow-sm p-6 bg-white/10 border border-white/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-green-500/30 text-white">
                    <Eye className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-md text-white/80 bg-white/10">
                    Views
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {analyticsData.totalPageViews.toLocaleString()}
                  </p>
                  <p className="text-sm text-white/60">Page views</p>
                </div>
              </div>

              <div className="backdrop-blur-sm rounded-xl shadow-sm p-6 bg-white/10 border border-white/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-purple-500/30 text-white">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-md text-white/80 bg-white/10">
                    Duration
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {formatDuration(analyticsData.averageSessionDuration)}
                  </p>
                  <p className="text-sm text-white/60">Avg session</p>
                </div>
              </div>

              <div className="backdrop-blur-sm rounded-xl shadow-sm p-6 bg-white/10 border border-white/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-orange-500/30 text-white">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-md text-white/80 bg-white/10">
                    Bounce
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {analyticsData.bounceRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-white/60">Bounce rate</p>
                </div>
              </div>
            </div>

            {/* Donation Analytics */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow border border-white/20 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Donation Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {analyticsData.donationStats.totalDonations}
                  </p>
                  <p className="text-sm text-white/60">Total Donations</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(analyticsData.donationStats.averageDonation)}
                  </p>
                  <p className="text-sm text-white/60">Average Donation</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {analyticsData.donationStats.conversionRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-white/60">Conversion Rate</p>
                </div>
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow border border-white/20 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Top Pages
              </h2>
              {analyticsData.topPages.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 text-white/30" />
                  <p>No page view data available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analyticsData.topPages.slice(0, 10).map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-white/60 w-6">#{index + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{page.page}</p>
                          <p className="text-xs text-white/60">{page.views} views</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-24 bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-[#4f7df9] h-2 rounded-full"
                            style={{ 
                              width: `${(page.views / analyticsData.topPages[0].views) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Device & Browser Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Breakdown */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow border border-white/20 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Monitor className="w-5 h-5 mr-2" />
                  Device Breakdown
                </h2>
                {analyticsData.deviceBreakdown.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    <Monitor className="w-12 h-12 mx-auto mb-3 text-white/30" />
                    <p>No device data available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analyticsData.deviceBreakdown.map((device, index) => (
                      <div key={device.device} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getDeviceIcon(device.device)}
                          <div>
                            <p className="text-sm font-medium text-white capitalize">{device.device}</p>
                            <p className="text-xs text-white/60">{device.count} visits</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-24 bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ 
                                width: `${(device.count / analyticsData.deviceBreakdown.reduce((sum, d) => sum + d.count, 0)) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Browser Breakdown */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow border border-white/20 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Browser Breakdown
                </h2>
                {analyticsData.browserBreakdown.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    <Globe className="w-12 h-12 mx-auto mb-3 text-white/30" />
                    <p>No browser data available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analyticsData.browserBreakdown.map((browser, index) => (
                      <div key={browser.browser} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getBrowserIcon(browser.browser)}
                          <div>
                            <p className="text-sm font-medium text-white capitalize">{browser.browser}</p>
                            <p className="text-xs text-white/60">{browser.count} visits</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-24 bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ 
                                width: `${(browser.count / analyticsData.browserBreakdown.reduce((sum, b) => sum + b.count, 0)) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Popular Content */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow border border-white/20 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Popular Content
              </h2>
              {analyticsData.topContent.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <Heart className="w-12 h-12 mx-auto mb-3 text-white/30" />
                  <p>No content engagement data available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analyticsData.topContent.slice(0, 10).map((content, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-white/60 w-6">#{index + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{content.content}</p>
                          <p className="text-xs text-white/60">Engagement score: {content.engagement.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-24 bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ 
                              width: `${(content.engagement / analyticsData.topContent[0].engagement) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Last Updated */}
            <div className="text-center text-xs text-white/50">
              Last updated: {format(lastRefresh, 'HH:mm:ss')} | Auto-refresh every 5 minutes
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Analytics; 