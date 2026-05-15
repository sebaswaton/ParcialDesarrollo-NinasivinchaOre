import { Link } from 'react-router-dom';
import type { Incident } from '../../types';
import { Badge } from '../common/Badge';
import { INCIDENT_LABELS, INCIDENT_COLORS, STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';

interface Props { incident: Incident }

const MEDIA_LABELS: Record<string, string> = {
  image: 'Foto',
  video: 'Video',
  audio: 'Audio',
};

const INCIDENT_GRADIENTS: Record<string, string> = {
  bache:      'from-yellow-50 to-amber-100',
  alumbrado:  'from-blue-50 to-sky-100',
  basura:     'from-green-50 to-emerald-100',
  seguridad:  'from-red-50 to-rose-100',
  emergencia: 'from-orange-50 to-red-100',
};

export function IncidentCard({ incident }: Props) {
  const formatted = new Date(incident.created_at).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const firstImage = incident.media_files.find((m) => m.media_type === 'image');
  const isPending = incident.status === 'pendiente';

  return (
    <Link
      to={`/incidents/${incident.id}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-sm card-hover overflow-hidden fade-up"
    >
      <div className="relative h-40 overflow-hidden">
        {firstImage ? (
          <img
            src={firstImage.url}
            alt="evidencia"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${INCIDENT_GRADIENTS[incident.type]}`} />
        )}

        <div className="absolute top-3 right-3">
          <Badge label={STATUS_LABELS[incident.status]} className={`${STATUS_COLORS[incident.status]} shadow-sm`} dot pulse={isPending} />
        </div>
        <div className="absolute top-3 left-3">
          <Badge label={INCIDENT_LABELS[incident.type]} className={`${INCIDENT_COLORS[incident.type]} shadow-sm`} />
        </div>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-900 transition-colors">
          {incident.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-50">
          <span className="truncate max-w-[55%]">{incident.address}</span>
          <span className="shrink-0">{formatted}</span>
        </div>

        {incident.media_files.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {['image', 'video', 'audio'].map(type => {
              const count = incident.media_files.filter(m => m.media_type === type).length;
              if (!count) return null;
              return (
                <span key={type} className="text-xs text-gray-400 bg-gray-50 rounded-full px-2 py-0.5">
                  {MEDIA_LABELS[type]} {count}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </Link>
  );
}
