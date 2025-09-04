import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import '@/styles/leaflet.css';
import { reportWebVitals } from './reportWebVitals';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { errorHandler } from './lib/errorHandler';

// Register service worker for improved performance and offline capabilities
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        errorHandler.handleError(error, { 
          operation: 'ServiceWorker registration',
          component: 'main.tsx'
        });
      });
  });
}

// Add global error handler to catch unhandled exceptions
window.addEventListener('error', (event) => {
  errorHandler.handleError(event.error, { 
    operation: 'Global error handler',
    component: 'main.tsx'
  });
});

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  errorHandler.handleError(event.reason, { 
    operation: 'Unhandled promise rejection',
    component: 'main.tsx'
  });
});

try {
  // Get the root element
  const rootElement = document.getElementById("root");

  // Ensure the root element exists
  if (!rootElement) {
    throw new Error('Root element not found. Make sure there is a div with id "root" in your HTML.');
  }

  // Debug mobile issues
  console.log('Device info:', {
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    },
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  });

  const root = createRoot(rootElement);

  // Wrap rendering in try-catch
  try {
    // Use startTransition to prioritize interactive updates
    root.render(
      <ErrorBoundary>
        <App />
        <Analytics debug={false} />
        <SpeedInsights sampleRate={25} />
      </ErrorBoundary>
    );
    console.log('App rendered successfully');
  } catch (renderError) {
    errorHandler.handleError(renderError, { 
      operation: 'React application rendering',
      component: 'main.tsx'
    });
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
  errorHandler.handleError(error, { 
    operation: 'Critical application initialization',
    component: 'main.tsx'
  });
  // Try to display error message even if React fails to initialize
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1>Critical Error</h1>
      <p>The application failed to initialize. Please check the console for details.</p>
      <pre style="text-align: left; background: #f5f5f5; padding: 10px; border-radius: 5px;">${error?.message || 'Unknown error'}</pre>
    </div>
  `;
}
