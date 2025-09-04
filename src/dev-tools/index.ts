// Dev tools - only available in development mode
if (import.meta.env.DEV) {
  // Debug components
  export { default as DebugPanel } from './DebugPanel';
  export { default as EventsDebugPanel } from './EventsDebugPanel';
  
  // Debug utilities
  export * from './debugUtils';
  export { default as SupabaseDebug } from './supabaseDebug';
  export * from './testDatabase';
  export * from './createSampleEvents';
} else {
  // In production, export empty objects to prevent errors
  export const DebugPanel = () => null;
  export const EventsDebugPanel = () => null;
  export const SupabaseDebug = () => null;
}
