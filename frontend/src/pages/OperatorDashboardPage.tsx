import { useState, useEffect } from 'react';
import { incidentsApi } from '../api/incidents';
import type { Incident, IncidentStatus } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Badge } from '../components/common/Badge';
import { INCIDENT_LABELS, INCIDENT_COLORS, STATUS_LABELS, STATUS_COLORS } from '../utils/constants';
import { IncidentTypeIcon } from '../components/common/IncidentTypeIcon';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const STATUSES: IncidentStatus[] = ['pendiente', 'en_progreso', 'resuelto', 'rechazado'];

const STATUS_CARD_STYLES: Record<IncidentStatus, string> = {
  pendiente:   'bg-gray-50 border-gray-200',
  en_progreso: 'bg-blue-50 border-blue-200',
  resuelto:    'bg-green-50 border-green-200',
  rechazado:   'bg-red-50 border-red-200',
};
const STATUS_NUM_COLORS: Record<IncidentStatus, string> = {
  pendiente:   'text-gray-700',
  en_progreso: 'text-blue-700',
  resuelto:    'text-green-700',
  rechazado:   'text-red-700',
};

interface UpdateModalProps {
  incident: Incident;
  onClose: () => void;
  onUpdated: (updated: Incident) => void;
}

function UpdateModal({ incident, onClose, onUpdated }: UpdateModalProps) {
  const [status, setStatus] = useState<IncidentStatus>(incident.status);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (status === incident.status) { toast.error('Selecciona un estado diferente'); return; }
    try {
      setLoading(true);
      const updated = await incidentsApi.updateStatus(incident.id, status, note);
      toast.success('Estado actualizado correctamente');
      onUpdated(updated);
      onClose();
    } catch { toast.error('Error al actualizar'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl fade-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <IncidentTypeIcon type={incident.type} className="w-7 h-7 text-gray-500" />
          <div>
            <h3 className="font-bold text-gray-900">Actualizar estado</h3>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{incident.description}</p>
          </div>
        </div>

        {/* Estado actual */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-5 text-sm">
          <span className="text-gray-500">Estado actual:</span>
          <Badge label={STATUS_LABELS[incident.status]} className={STATUS_COLORS[incident.status]} dot />
        </div>

        {/* Selección de nuevo estado */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nuevo estado</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={clsx(
                'py-2.5 px-3 rounded-xl text-sm font-semibold border-2 transition-all duration-150 active:scale-95',
                status === s
                  ? `${STATUS_COLORS[s]} border-current shadow-sm ring-2 ring-current/20`
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
              )}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Nota */}
        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="Nota del operador (opcional): cuadrilla asignada, motivo de rechazo..."
          rows={3} className="input-base resize-none mb-4" />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-outline">Cancelar</button>
          <button onClick={submit} disabled={loading}
            className={clsx('flex-1 btn-primary', loading && 'opacity-70')}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </span>
            ) : 'Guardar cambio'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function OperatorDashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | ''>('pendiente');
  const [selected, setSelected] = useState<Incident | null>(null);

  const load = () => {
    setLoading(true);
    incidentsApi.getAll({ status: filterStatus || undefined, limit: 50 })
      .then(res => setIncidents(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus]);

  const counts: Record<IncidentStatus, number> = { pendiente: 0, en_progreso: 0, resuelto: 0, rechazado: 0 };
  incidents.forEach(i => { if (i.status in counts) counts[i.status]++; });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel del Operador</h1>
            <p className="text-sm text-gray-500">Gestiona y actualiza el estado de las incidencias</p>
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 hover:bg-green-50 px-3 py-2 rounded-xl transition-all">
          <span>Actualizar</span>
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
            className={clsx(
              'rounded-2xl border-2 p-4 text-left transition-all duration-200 card-hover',
              filterStatus === s ? `${STATUS_CARD_STYLES[s]} ring-2 ring-offset-1` : `${STATUS_CARD_STYLES[s]} hover:shadow-md`
            )}>
            <p className={clsx('text-3xl font-bold', STATUS_NUM_COLORS[s])}>{counts[s]}</p>
            <Badge label={STATUS_LABELS[s]} className={`${STATUS_COLORS[s]} mt-2`} dot pulse={s === 'pendiente' && counts[s] > 0} />
          </button>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(['', ...STATUSES] as (IncidentStatus | '')[]).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={clsx(
              'px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 active:scale-95',
              filterStatus === s
                ? 'bg-green-700 text-white border-green-700 shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700'
            )}>
            {s === '' ? 'Todos' : STATUS_LABELS[s]}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400 self-center">{incidents.length} resultado(s)</span>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden fade-up">
          {incidents.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 font-medium">Sin incidencias para mostrar</p>
              <p className="text-gray-400 text-sm mt-1">Cambia los filtros para ver más resultados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Tipo', 'Descripción', 'Dirección', 'Estado', 'Fecha', 'Acciones'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {incidents.map(inc => (
                    <tr key={inc.id} className="hover:bg-green-50/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <IncidentTypeIcon type={inc.type} className="w-5 h-5 text-gray-500" />
                          <Badge label={INCIDENT_LABELS[inc.type]} className={INCIDENT_COLORS[inc.type]} />
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="truncate text-gray-700 group-hover:text-gray-900">{inc.description}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{inc.address}</td>
                      <td className="px-4 py-3">
                        <Badge label={STATUS_LABELS[inc.status]} className={STATUS_COLORS[inc.status]} dot pulse={inc.status === 'pendiente'} />
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(inc.created_at).toLocaleDateString('es-PE')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link to={`/incidents/${inc.id}`}
                            className="px-2 py-1 text-xs text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all font-medium" title="Ver detalle">
                            Ver
                          </Link>
                          <button onClick={() => setSelected(inc)}
                            className="px-3 py-1.5 bg-green-700 text-white text-xs font-semibold rounded-lg hover:bg-green-800 transition-all active:scale-95 shadow-sm hover:shadow-green-200 opacity-0 group-hover:opacity-100">
                            Actualizar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selected && (
        <UpdateModal
          incident={selected}
          onClose={() => setSelected(null)}
          onUpdated={updated => setIncidents(prev => prev.map(i => i.id === updated.id ? updated : i))}
        />
      )}
    </div>
  );
}
