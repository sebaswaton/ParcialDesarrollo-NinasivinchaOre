import type { IncidentType } from '../../types';

const COLORS: Record<IncidentType, string> = {
  bache:      'bg-amber-500',
  alumbrado:  'bg-sky-500',
  basura:     'bg-emerald-500',
  seguridad:  'bg-rose-500',
  emergencia: 'bg-orange-500',
};

interface Props {
  type: IncidentType;
  className?: string;
}

export function IncidentTypeIcon({ type, className = 'w-3 h-3' }: Props) {
  return <span className={`inline-block rounded-full ${COLORS[type]} ${className}`} />;
}
