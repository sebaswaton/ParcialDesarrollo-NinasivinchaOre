import type { IncidentType, IncidentStatus } from '../types';

export const INCIDENT_LABELS: Record<IncidentType, string> = {
  bache: 'Bache',
  alumbrado: 'Alumbrado',
  basura: 'Basura',
  seguridad: 'Seguridad Ciudadana',
  emergencia: 'Emergencia',
};

// Nombres de íconos lucide — se renderizan con <IncidentTypeIcon />
export const INCIDENT_ICON_NAMES: Record<IncidentType, string> = {
  bache:      'Construction',
  alumbrado:  'Lightbulb',
  basura:     'Trash2',
  seguridad:  'ShieldAlert',
  emergencia: 'Siren',
};

export const INCIDENT_COLORS: Record<IncidentType, string> = {
  bache: 'bg-yellow-100 text-yellow-800',
  alumbrado: 'bg-blue-100 text-blue-800',
  basura: 'bg-green-100 text-green-800',
  seguridad: 'bg-red-100 text-red-800',
  emergencia: 'bg-orange-100 text-orange-800',
};

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En Progreso',
  resuelto: 'Resuelto',
  rechazado: 'Rechazado',
};

export const STATUS_COLORS: Record<IncidentStatus, string> = {
  pendiente: 'bg-gray-100 text-gray-700',
  en_progreso: 'bg-blue-100 text-blue-700',
  resuelto: 'bg-green-100 text-green-700',
  rechazado: 'bg-red-100 text-red-700',
};
