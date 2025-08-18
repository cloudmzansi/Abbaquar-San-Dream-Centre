import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@/styles/leaflet.css';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  className?: string;
}

export default function Map({ className = '' }: MapProps) {
  useEffect(() => {
    // Initialize the map
    const map = L.map('map', {
      zoomControl: true,
      scrollWheelZoom: false,
      keyboard: true, // Enable keyboard navigation
      tap: true // Enable tap handler for touch devices
    }).setView([-29.9330556, 30.9830556], 15);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add marker
    const marker = L.marker([-29.9330556, 30.9830556], {
      title: 'Abbaquar-san Dream Centre', // Tooltip for screen readers
      alt: 'Location marker for Abbaquar-san Dream Centre'
    }).addTo(map);
    
    // Add popup with semantic HTML
    marker.bindPopup(`
      <div class="p-2" role="dialog" aria-label="Location details">
        <h3 class="font-semibold">Abbaquar-san Dream Centre</h3>
        <address class="not-italic">
          61 Gardenia Road<br />
          Merewent<br />
          Durban<br />
          4052<br />
          Kwa Zulu Natal<br />
          South Africa
        </address>
      </div>
    `).openPopup();

    // Force a resize to ensure the map fills the container
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Add keyboard event listeners for better navigation
    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.addEventListener('keydown', (e) => {
        // Arrow keys for panning
        switch(e.key) {
          case 'ArrowUp':
            map.panBy([0, -50]);
            break;
          case 'ArrowDown':
            map.panBy([0, 50]);
            break;
          case 'ArrowLeft':
            map.panBy([-50, 0]);
            break;
          case 'ArrowRight':
            map.panBy([50, 0]);
            break;
          // Plus and minus keys for zooming
          case '+':
            map.zoomIn();
            break;
          case '-':
            map.zoomOut();
            break;
          // Enter key to focus on marker
          case 'Enter':
            map.setView(marker.getLatLng(), 15);
            marker.openPopup();
            break;
        }
      });
    }

    // Cleanup
    return () => {
      if (mapElement) {
        mapElement.removeEventListener('keydown', () => {});
      }
      map.remove();
    };
  }, []);

  return (
    <div 
      className={`${className} relative w-full h-full min-h-[500px]`}
      role="region" 
      aria-label="Map showing location of Abbaquar-san Dream Centre"
    >
      <div 
        id="map" 
        className="absolute inset-0 w-full h-full rounded-lg" 
        tabIndex={0}
        aria-label="Interactive map"
      />
      <div className="sr-only">
        <p>Use arrow keys to pan the map, plus and minus keys to zoom, and Enter to focus on our location.</p>
        <p>Our address is 61 Gardenia Road, Merewent, Durban, 4052, Kwa Zulu Natal, South Africa.</p>
      </div>
    </div>
  );
} 