import React, { useState, useEffect } from 'react';
import { getCacheStats, getPerformanceMetrics } from '@/lib/cacheService';
import { getSystemHealth } from '@/lib/dashboardService';
import { supabase } from '@/lib/supabase';
import { 
  Activity, 
  Database, 
  HardDrive, 
  Shield, 
  Zap, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PerformanceMetrics {
  cache: {
    totalEntries: number;
    expiredEntries: number;
    averageAccessCount: number;
    memoryUsage: number;
  };
  database: {
    queryTime: number;
    status: string;
    error?: string;
  };
  memory: {
    used: number;
    total: number;
    limit: number;
  };
}

interface SystemHealth {
  database: { status: string; message: string };
  storage: { status: string; message: string };
  authentication: { status: string; message: string };
}

const DebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [metrics, health] = await Promise.all([
        getPerformanceMetrics(),
        getSystemHealth()
      ]);
      
      setPerformanceMetrics(metrics);
      setSystemHealth(health);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing debug data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      refreshData();
      const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // Only show in development
  if (process.env.NODE_ENV === 'production') return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'text-green-600';
      case 'error':
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(prev => !prev)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-blue-700 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4" />
          <span>{isVisible ? 'Hide Debug' : 'Debug Panel'}</span>
        </div>
      </button>
      
      {isVisible && (
        <div className="fixed bottom-16 right-4 bg-white p-6 rounded-lg shadow-xl border border-gray-200 max-w-md max-h-[80vh] overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Performance Debug</h3>
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
          
          {isLoading && (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}
          
          {performanceMetrics && (
            <div className="space-y-4">
              {/* Cache Statistics */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Cache Statistics
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Total Entries: {performanceMetrics.cache.totalEntries}</div>
                  <div>Expired: {performanceMetrics.cache.expiredEntries}</div>
                  <div>Avg Access: {performanceMetrics.cache.averageAccessCount}</div>
                  <div>Memory: {formatBytes(performanceMetrics.cache.memoryUsage)}</div>
                </div>
              </div>
              
              {/* Database Performance */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Database Performance
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Query Time:</span>
                    <span className={performanceMetrics.database.queryTime < 100 ? 'text-green-600' : 'text-red-600'}>
                      {performanceMetrics.database.queryTime}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(performanceMetrics.database.status)}
                      <span className={getStatusColor(performanceMetrics.database.status)}>
                        {performanceMetrics.database.status}
                      </span>
                    </div>
                  </div>
                  {performanceMetrics.database.error && (
                    <div className="text-red-600 text-xs">
                      Error: {performanceMetrics.database.error}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Memory Usage */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <HardDrive className="w-4 h-4 mr-2" />
                  Memory Usage
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Used:</span>
                    <span>{formatBytes(performanceMetrics.memory.used)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total:</span>
                    <span>{formatBytes(performanceMetrics.memory.total)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Limit:</span>
                    <span>{formatBytes(performanceMetrics.memory.limit)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(performanceMetrics.memory.used / performanceMetrics.memory.limit) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {systemHealth && (
            <div className="mt-4 space-y-3">
              <h4 className="font-semibold flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                System Health
              </h4>
              
              {Object.entries(systemHealth).map(([service, status]) => (
                <div key={service} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="capitalize font-medium">{service}</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status.status)}
                    <span className={getStatusColor(status.status)}>
                      {status.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
