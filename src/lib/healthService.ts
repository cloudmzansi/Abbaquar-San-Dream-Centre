import { supabase } from './supabase';

export interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'error';
  message: string;
  lastChecked: Date;
}

export interface SystemHealth {
  database: ServiceStatus;
  storage: ServiceStatus;
  authentication: ServiceStatus;
  overall: 'healthy' | 'degraded' | 'down';
}

export const checkSystemHealth = async (): Promise<SystemHealth> => {
  const results = await Promise.allSettled([
    checkDatabaseHealth(),
    checkStorageHealth(),
    checkAuthHealth()
  ]);

  const [databaseResult, storageResult, authResult] = results;

  const database: ServiceStatus = {
    name: 'Database',
    status: databaseResult.status === 'fulfilled' ? databaseResult.value.status : 'error',
    message: databaseResult.status === 'fulfilled' ? databaseResult.value.message : 'Connection failed',
    lastChecked: new Date()
  };

  const storage: ServiceStatus = {
    name: 'Storage',
    status: storageResult.status === 'fulfilled' ? storageResult.value.status : 'error',
    message: storageResult.status === 'fulfilled' ? storageResult.value.message : 'Connection failed',
    lastChecked: new Date()
  };

  const authentication: ServiceStatus = {
    name: 'Authentication',
    status: authResult.status === 'fulfilled' ? authResult.value.status : 'error',
    message: authResult.status === 'fulfilled' ? authResult.value.message : 'Connection failed',
    lastChecked: new Date()
  };

  // Determine overall health
  const onlineServices = [database, storage, authentication].filter(s => s.status === 'online').length;
  const totalServices = 3;
  
  let overall: 'healthy' | 'degraded' | 'down';
  if (onlineServices === totalServices) {
    overall = 'healthy';
  } else if (onlineServices > 0) {
    overall = 'degraded';
  } else {
    overall = 'down';
  }

  return {
    database,
    storage,
    authentication,
    overall
  };
};

const checkDatabaseHealth = async (): Promise<ServiceStatus> => {
  try {
    // Test database connection with a simple count query
    const { data, error } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      return {
        name: 'Database',
        status: 'error',
        message: `Database error: ${error.message}`,
        lastChecked: new Date()
      };
    }

    return {
      name: 'Database',
      status: 'online',
      message: 'Connected successfully',
      lastChecked: new Date()
    };
  } catch (error: any) {
    return {
      name: 'Database',
      status: 'offline',
      message: `Connection failed: ${error.message}`,
      lastChecked: new Date()
    };
  }
};

const checkStorageHealth = async (): Promise<ServiceStatus> => {
  try {
    // Test storage by trying to list buckets or get a public URL
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      return {
        name: 'Storage',
        status: 'error',
        message: `Storage error: ${error.message}`,
        lastChecked: new Date()
      };
    }

    return {
      name: 'Storage',
      status: 'online',
      message: 'Storage accessible',
      lastChecked: new Date()
    };
  } catch (error: any) {
    return {
      name: 'Storage',
      status: 'offline',
      message: `Storage unavailable: ${error.message}`,
      lastChecked: new Date()
    };
  }
};

const checkAuthHealth = async (): Promise<ServiceStatus> => {
  try {
    // Test authentication by getting the current session
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return {
        name: 'Authentication',
        status: 'error',
        message: `Auth error: ${error.message}`,
        lastChecked: new Date()
      };
    }

    return {
      name: 'Authentication',
      status: 'online',
      message: 'Authentication service active',
      lastChecked: new Date()
    };
  } catch (error: any) {
    return {
      name: 'Authentication',
      status: 'offline',
      message: `Auth service unavailable: ${error.message}`,
      lastChecked: new Date()
    };
  }
}; 