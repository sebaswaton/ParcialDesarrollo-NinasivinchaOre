import type { StatusHistory } from '../../types';
import { STATUS_LABELS, STATUS_COLORS } from '../../utils/constants';
import { Badge } from '../common/Badge';

interface Props {
  history: StatusHistory[];
}

export function StatusTimeline({ history }: Props) {
  if (history.length === 0) {
    return <p className="text-gray-400 text-sm">Sin historial de cambios</p>;
  }

  return (
    <ol className="relative border-l border-gray-200 space-y-4 ml-3">
      {history.map((item) => (
        <li key={item.id} className="ml-4">
          <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-green-600" />
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge
                label={STATUS_LABELS[item.old_status]}
                className={STATUS_COLORS[item.old_status]}
              />
              <span className="text-gray-400 text-xs font-bold">a</span>
              <Badge
                label={STATUS_LABELS[item.new_status]}
                className={STATUS_COLORS[item.new_status]}
              />
            </div>
            {item.note && <p className="text-sm text-gray-600">{item.note}</p>}
            <p className="text-xs text-gray-400 mt-1">
              {item.operator?.name || 'Operador'} -{' '}
              {new Date(item.changed_at).toLocaleString('es-PE')}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
