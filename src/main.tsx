import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import '@/styles/leaflet.css';
import { reportWebVitals } from './reportWebVitals';
import { Analytics } from '@vercel/analytics/react';

// Add global error handler to catch unhandled exceptions
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});

try {
  // Get the root element
  const rootElement = document.getElementById("root");

  // Ensure the root element exists
  if (!rootElement) {
    throw new Error('Root element not found. Make sure there is a div with id "root" in your HTML.');
  }

  const root = createRoot(rootElement);

  // Wrap rendering in try-catch
  try {
    root.render(
      <ErrorBoundary>
        <App />
        <Analytics />
      </ErrorBoundary>
    );
    console.log('App rendered successfully');
  } catch (renderError) {
    console.error('Error rendering React application:', renderError);
    // Display a fallback UI
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1>Something went wrong</h1>
        <p>The application failed to load. Please check the console for details.</p>
      </div>
    `;
  }

  // Only report web vitals in production to avoid console clutter in development
  if (process.env.NODE_ENV === 'production') {
    reportWebVitals();
  }
} catch (error) {
  console.error('Critical application error:', error);
  // Try to display error message even if React fails to initialize
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1>Critical Error</h1>
      <p>The application failed to initialize. Please check the console for details.</p>
      <pre style="text-align: left; background: #f5f5f5; padding: 10px; border-radius: 5px;">${error?.message || 'Unknown error'}</pre>
    </div>
  `;
}
