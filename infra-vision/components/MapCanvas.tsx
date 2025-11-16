// components/MapCanvas.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

// Only set token if it's valid (not a placeholder)
const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
if (mapboxToken && mapboxToken !== 'your-mapbox-token' && typeof window !== 'undefined') {
  mapboxgl.accessToken = mapboxToken;
}

export default function MapCanvas({
  center = [77.209, 28.6139], // Delhi default
  zoom = 10
}: { center?: [number, number]; zoom?: number }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || token === 'your-mapbox-token') {
      setMapError(true);
      return;
    }

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center,
        zoom,
      });
      
      map.on('error', () => {
        setMapError(true);
      });
      
      return () => map.remove();
    } catch (error) {
      console.error('Mapbox initialization error:', error);
      setMapError(true);
    }
  }, [center, zoom]);

  if (mapError) {
    return (
      <div className="w-full h-96 rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Map unavailable. Please configure NEXT_PUBLIC_MAPBOX_TOKEN in .env</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden" ref={mapContainerRef}></div>
  );
}





