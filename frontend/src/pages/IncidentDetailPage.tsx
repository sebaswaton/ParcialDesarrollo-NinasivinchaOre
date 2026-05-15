import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { incidentsApi } from '../api/incidents';
import type { Incident, StatusHistory } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { StatusTimeline } from '../components/incidents/StatusTimeline';
import {
  INCIDENT_LABELS,
  INCIDENT_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
} from '../utils/constants';
import { IncidentTypeIcon } from '../components/common/IncidentTypeIcon';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string;
const mapContainerStyle = { width: '100%', height: '100%' };

function IncidentMap({ lat, lng, address }: { lat: number; lng: number; address: string }) {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: MAPS_KEY });
  const [showInfo, setShowInfo] = useState(true);
  const center = { lat, lng };

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        Cargando mapa...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={16}
      options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
    >
      <Marker position={center} onClick={() => setShowInfo(true)} />
      {showInfo && (
        <InfoWindow position={center} onCloseClick={() => setShowInfo(false)}>
          <p className="text-sm font-medium text-gray-800">{address}</p>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([incidentsApi.getById(id), incidentsApi.getHistory(id)])
      .then(([inc, hist]) => {
        setIncident(inc);
        setHistory(hist);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!incident) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Incidencia no encontrada</p>
      <Link to="/" className="text-green-700 hover:underline text-sm mt-2 block">Volver al inicio</Link>
    </div>
  );

  const images = incident.media_files.filter((m) => m.media_type === 'image');
  const videos = incident.media_files.filter((m) => m.media_type === 'video');
  const audios = incident.media_files.filter((m) => m.media_type === 'audio');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-700 mb-6 text-sm">
        Volver
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <IncidentTypeIcon type={incident.type} className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <Badge label={INCIDENT_LABELS[incident.type]} className={INCIDENT_COLORS[incident.type]} />
                  <p className="text-xs text-gray-400 mt-1">ID: {incident.id.slice(0, 8)}...</p>
                </div>
              </div>
              <Badge label={STATUS_LABELS[incident.status]} className={STATUS_COLORS[incident.status]} />
            </div>
            <p className="text-gray-700 leading-relaxed">{incident.description}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                {incident.address}
              </span>
              <span className="flex items-center gap-1.5">
                {new Date(incident.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
              {incident.user && (
                <span className="flex items-center gap-1.5">
                  {incident.user.name}
                </span>
              )}
            </div>
          </div>

          {/* Images */}
          {images.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Fotografías</h2>
              <div className="grid grid-cols-2 gap-3">
                {images.map((img) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt="evidencia"
                    className="rounded-lg w-full h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setActiveMedia(img.url)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Videos</h2>
              <div className="space-y-3">
                {videos.map((v) => (
                  <video key={v.id} src={v.url} controls className="w-full rounded-lg" />
                ))}
              </div>
            </div>
          )}

          {/* Audios */}
          {audios.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Audios</h2>
              <div className="space-y-2">
                {audios.map((a) => (
                  <audio key={a.id} src={a.url} controls className="w-full" />
                ))}
              </div>
            </div>
          )}

          {/* Google Map */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Ubicación</h2>
            <div className="h-56 rounded-xl overflow-hidden">
              <IncidentMap lat={incident.lat} lng={incident.lng} address={incident.address} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Historial de estado</h2>
            <StatusTimeline history={history} />
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {activeMedia && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setActiveMedia(null)}
        >
          <img src={activeMedia} alt="" className="max-w-full max-h-full rounded-xl" />
        </div>
      )}
    </div>
  );
}
