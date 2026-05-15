import { useCallback, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string;

interface Props {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

const mapContainerStyle = { width: '100%', height: '100%' };

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

export function LocationPicker({ lat, lng, onChange }: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: MAPS_KEY,
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onChange(e.latLng.lat(), e.latLng.lng());
      }
    },
    [onChange]
  );

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 h-64 flex items-center justify-center text-red-500 text-sm">
        Error al cargar Google Maps
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 h-64 flex items-center justify-center text-gray-400 text-sm">
        Cargando mapa...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">Haz clic en el mapa para marcar la ubicación exacta</p>
      <div className="rounded-xl overflow-hidden border border-gray-200 h-64">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={{ lat, lng }}
          zoom={14}
          options={mapOptions}
          onLoad={onLoad}
          onClick={onMapClick}
        >
          <Marker position={{ lat, lng }} />
        </GoogleMap>
      </div>
      <p className="text-xs text-gray-400">
        Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
      </p>
    </div>
  );
}
