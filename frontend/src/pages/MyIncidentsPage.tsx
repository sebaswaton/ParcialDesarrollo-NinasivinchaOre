import { useState, useEffect } from 'react';
import { incidentsApi } from '../api/incidents';
import type { Incident } from '../types';
import { IncidentCard } from '../components/incidents/IncidentCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { STATUS_LABELS, STATUS_COLORS } from '../utils/constants';

export function MyIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    incidentsApi.getMyIncidents()
      .then(res => setIncidents(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const counts = { pendiente: 0, en_progreso: 0, resuelto: 0, rechazado: 0 };
  incidents.forEach(i => { if (i.status in counts) counts[i.status as keyof typeof counts]++; });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis reportes</h1>
            <p className="text-sm text-gray-500">{incidents.length} incidencia(s) registrada(s)</p>
          </div>
        </div>
        <Link to="/incidents/new" className="btn-primary flex items-center gap-2 text-sm">
          Nuevo reporte
        </Link>
      </div>

      {/* Stats */}
      {incidents.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {(Object.entries(counts) as [keyof typeof counts, number][]).map(([status, count]) => (
            <div key={status} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm fade-up">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
                {STATUS_LABELS[status]}
              </span>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : incidents.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm fade-up">
          <h3 className="text-gray-700 font-semibold text-lg mb-1">Aún no tienes reportes</h3>
          <p className="text-gray-400 text-sm mb-6">Reporta la primera incidencia de tu zona y ayuda a mejorar tu ciudad</p>
          <Link to="/incidents/new" className="btn-primary inline-flex items-center gap-2">
            Hacer mi primer reporte
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {incidents.map((inc, i) => (
            <div key={inc.id} style={{ animationDelay: `${i * 50}ms` }}>
              <IncidentCard incident={inc} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
