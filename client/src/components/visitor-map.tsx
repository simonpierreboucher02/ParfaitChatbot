import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface VisitorLocation {
  lat: number;
  lon: number;
  country: string | null;
  city: string | null;
}

interface VisitorMapProps {
  locations: VisitorLocation[];
}

export default function VisitorMap({ locations }: VisitorMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 10,
      worldCopyJump: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      className: "map-tiles",
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    if (locations.length === 0) {
      map.setView([20, 0], 2);
      return;
    }

    const customIcon = L.divIcon({
      className: "custom-marker",
      html: `<div class="marker-pin"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });

    locations.forEach((location) => {
      const marker = L.marker([location.lat, location.lon], { icon: customIcon }).addTo(map);
      
      const locationText = [location.city, location.country].filter(Boolean).join(", ") || "Unknown";
      marker.bindPopup(`<div class="marker-popup"><strong>${locationText}</strong></div>`);
    });

    const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lon]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 4 });
  }, [locations]);

  return (
    <>
      <div 
        ref={mapRef} 
        className="h-96 w-full rounded-lg overflow-hidden border border-border"
        data-testid="map-visitor-locations"
      />
      <style>{`
        .map-tiles {
          filter: hue-rotate(245deg) saturate(0.3) brightness(0.9);
        }
        .dark .map-tiles {
          filter: hue-rotate(245deg) saturate(0.3) brightness(0.4) invert(1);
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        .marker-pin {
          width: 18px;
          height: 18px;
          border-radius: 50% 50% 50% 0;
          background: hsl(var(--primary));
          position: absolute;
          transform: rotate(-45deg);
          left: 50%;
          top: 50%;
          margin: -18px 0 0 -9px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 2px solid hsl(var(--background));
        }
        .marker-pin::after {
          content: '';
          width: 8px;
          height: 8px;
          margin: 5px 0 0 5px;
          background: hsl(var(--background));
          position: absolute;
          border-radius: 50%;
        }
        .marker-popup {
          font-size: 12px;
          padding: 2px 4px;
        }
        .leaflet-popup-content-wrapper {
          background: hsl(var(--popover));
          color: hsl(var(--popover-foreground));
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .leaflet-popup-tip {
          background: hsl(var(--popover));
        }
      `}</style>
    </>
  );
}
