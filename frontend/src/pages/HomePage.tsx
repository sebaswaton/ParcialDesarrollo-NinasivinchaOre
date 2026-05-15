import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { incidentsApi } from '../api/incidents';
import type { Incident, IncidentType, IncidentStatus } from '../types';
import { IncidentCard } from '../components/incidents/IncidentCard';
import { SkeletonCard } from '../components/common/LoadingSpinner';
import { INCIDENT_LABELS, STATUS_LABELS } from '../utils/constants';
import { IncidentTypeIcon } from '../components/common/IncidentTypeIcon';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

const TYPES: IncidentType[] = ['bache', 'alumbrado', 'basura', 'seguridad', 'emergencia'];
const STATUSES: IncidentStatus[] = ['pendiente', 'en_progreso', 'resuelto', 'rechazado'];

const TYPE_STYLES: Record<IncidentType, string> = {
  bache:      'bg-amber-50 border-amber-200 hover:border-amber-400 hover:bg-amber-100',
  alumbrado:  'bg-sky-50 border-sky-200 hover:border-sky-400 hover:bg-sky-100',
  basura:     'bg-emerald-50 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100',
  seguridad:  'bg-rose-50 border-rose-200 hover:border-rose-400 hover:bg-rose-100',
  emergencia: 'bg-orange-50 border-orange-200 hover:border-orange-400 hover:bg-orange-100',
};
const TYPE_ACTIVE: Record<IncidentType, string> = {
  bache:      'border-amber-500 bg-amber-100 ring-2 ring-amber-300',
  alumbrado:  'border-sky-500 bg-sky-100 ring-2 ring-sky-300',
  basura:     'border-emerald-500 bg-emerald-100 ring-2 ring-emerald-300',
  seguridad:  'border-rose-500 bg-rose-100 ring-2 ring-rose-300',
  emergencia: 'border-orange-500 bg-orange-100 ring-2 ring-orange-300',
};

export function HomePage() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<IncidentType | ''>('');
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | ''>('');

  useEffect(() => {
    setLoading(true);
    incidentsApi
      .getAll({ type: filterType || undefined, status: filterStatus || undefined })
      .then((res) => { setIncidents(res.data); setTotal(res.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterType, filterStatus]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-emerald-700 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Plataforma Municipal
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 leading-tight">
                Reporta incidencias<br />
                <span className="text-green-200">en tu ciudad</span>
              </h1>
              <p className="text-green-100 text-sm max-w-md">
                Baches, alumbrado, basura, seguridad : reporta el problema y haz seguimiento hasta su resolución.
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-green-200">
                <span className="flex items-center gap-1">Seguimiento en tiempo real</span>
                <span className="flex items-center gap-1">Evidencia multimedia</span>
              </div>
            </div>
            {user?.role === 'ciudadano' && (
              <Link
                to="/incidents/new"
                className="shrink-0 flex items-center gap-2 bg-white text-green-800 font-bold px-6 py-3 rounded-2xl hover:bg-green-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-95"
              >
                Reportar ahora
              </Link>
            )}
            {!user && (
              <div className="flex gap-3 shrink-0">
                <Link to="/register" className="flex items-center gap-2 bg-white text-green-800 font-bold px-6 py-3 rounded-2xl hover:bg-green-50 transition-all shadow-xl hover:-translate-y-0.5">
                  Únete gratis
                </Link>
                <Link to="/login" className="flex items-center gap-2 bg-white/20 text-white font-semibold px-5 py-3 rounded-2xl hover:bg-white/30 transition-all">
                  Ingresar
                </Link>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-8">
            {TYPES.map((t) => {
              const count = incidents.filter(i => i.type === t).length;
              return (
                <button
                  key={t}
                  onClick={() => setFilterType(filterType === t ? '' : t)}
                  className={clsx(
                    'rounded-2xl border p-3 text-center transition-all duration-200 active:scale-95',
                    filterType === t ? TYPE_ACTIVE[t] : TYPE_STYLES[t]
                  )}
                >
                  <div className="flex justify-center mb-1">
                    <IncidentTypeIcon type={t} className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="text-xs font-semibold text-gray-700 leading-tight">{INCIDENT_LABELS[t]}</div>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">{count}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-1 text-sm text-gray-500 mr-2">
            <span className="font-medium">Estado:</span>
          </div>
          {(['', ...STATUSES] as (IncidentStatus | '')[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={clsx(
                'px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 active:scale-95',
                filterStatus === s
                  ? 'bg-green-700 text-white border-green-700 shadow-md shadow-green-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700'
              )}
            >
              {s === '' ? 'Todos' : STATUS_LABELS[s]}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-400 font-medium">{total} incidencia(s)</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm fade-up">
            <h3 className="text-gray-700 font-semibold text-lg mb-1">Sin resultados</h3>
            <p className="text-gray-400 text-sm mb-6">No hay incidencias con los filtros seleccionados</p>
            <button
              onClick={() => { setFilterType(''); setFilterStatus(''); }}
              className="btn-outline text-sm"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {incidents.map((inc, i) => (
              <div key={inc.id} style={{ animationDelay: `${i * 40}ms` }}>
                <IncidentCard incident={inc} />
              </div>
            ))}
          </div>
        )}

        {/* Info banner for anonymous */}
        {!user && incidents.length > 0 && (
          <div className="mt-10 bg-gradient-to-r from-green-700 to-emerald-600 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl fade-up">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-bold text-lg">¿Ves un problema en tu zona?</p>
                <p className="text-green-200 text-sm">Crea una cuenta gratis y reporta incidencias con evidencia.</p>
              </div>
            </div>
            <Link to="/register" className="shrink-0 bg-white text-green-800 font-bold px-6 py-2.5 rounded-xl hover:bg-green-50 transition-all hover:-translate-y-0.5 active:scale-95">
              Registrarme
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
