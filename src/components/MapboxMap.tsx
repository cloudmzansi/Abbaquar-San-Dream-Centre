import { useEffect, useRef, useState } from 'react';

interface MapboxMapProps {
  className?: string;
}

// Create a fallback map component in case Mapbox fails to load
const FallbackMap = ({ className = '' }: MapboxMapProps) => (
  <div className={`${className} bg-gray-200 flex items-center justify-center rounded-lg`}>
    <div className="text-center p-8">
      <h3 className="text-xl font-semibold mb-4">Abbaquar-san Dream Centre</h3>
      <p className="mb-2">61 Gardenia Road, Wentworth, Durban, 4052</p>
      <p className="text-sm text-gray-600">Map loading unavailable</p>
    </div>
  </div>
);

export default function MapboxMap({ className = '' }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);
  
  useEffect(() => {
    // Safety timeout - if map doesn't load in 5 seconds, show fallback
    const timeoutId = setTimeout(() => {
      if (!window.mapboxgl) {
        setMapError(true);
      }
    }, 5000);
    
    // Add Mapbox CSS
    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    // Load Mapbox script
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js';
    script.async = true;
    
    script.onload = () => {
      clearTimeout(timeoutId);
      initializeMap();
    };
    
    script.onerror = () => {
      clearTimeout(timeoutId);
      setMapError(true);
      console.error('Failed to load Mapbox GL JS');
    };
    
    document.body.appendChild(script);
    
    function initializeMap() {
      if (!mapContainer.current || !window.mapboxgl) return;
      
      try {
        // Initialize the map
        window.mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kcmV3bWljaGFlbHMiLCJhIjoiY21hYjZsODRsMjVteTJqc2c5YmVobTUxciJ9.0oH87QTpuUeVhLbxLENL4Q';
        
        const map = new window.mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [30.9830556, -29.9330556], // Longitude, Latitude for Durban
          zoom: 15,
          scrollZoom: false
        });
        
        // Add navigation controls
        map.addControl(new window.mapboxgl.NavigationControl(), 'top-right');
        
        // Add marker
        const marker = new window.mapboxgl.Marker({ color: '#073366' })
          .setLngLat([30.9830556, -29.9330556])
          .addTo(map);
          
        // Add popup
        const popup = new window.mapboxgl.Popup({ closeButton: false })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">Abbaquar-san Dream Centre</h3>
              <address class="not-italic">61 Gardenia Road, Wentworth, Durban, 4052</address>
            </div>
          `);
          
        marker.setPopup(popup);
        
        // Cleanup
        return () => {
          map.remove();
        };
      } catch (error) {
        console.error('Error initializing Mapbox:', error);
        setMapError(true);
      }
    }
    
    return () => {
      clearTimeout(timeoutId);
      // Clean up script and link if component unmounts
      document.body.removeChild(script);
      document.head.removeChild(link);
    };
  }, []);
  
  if (mapError) {
    return <FallbackMap className={className} />;
  }
  
  return (
    <div 
      className={`${className} relative w-full h-full min-h-[500px]`}
      role="region" 
      aria-label="Map showing location of Abbaquar-san Dream Centre"
    >
      <div 
        ref={mapContainer}
        className="absolute inset-0 w-full h-full rounded-lg" 
        tabIndex={0}
        aria-label="Interactive map"
      />
      <div className="sr-only">
        <p>Our address is 61 Gardenia Road, Wentworth, Durban, 4052.</p>
      </div>
    </div>
  );
}

// Add TypeScript interface for Mapbox GL
declare global {
  interface Window {
    mapboxgl: any;
  }
}
