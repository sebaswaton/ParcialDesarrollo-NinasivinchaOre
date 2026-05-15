import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { incidentsApi } from '../api/incidents';
import { LocationPicker } from '../components/incidents/LocationPicker';
import { MediaUploader } from '../components/incidents/MediaUploader';
import { INCIDENT_LABELS } from '../utils/constants';
import { IncidentTypeIcon } from '../components/common/IncidentTypeIcon';
import type { IncidentType } from '../types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const schema = z.object({
  type: z.enum(['bache', 'alumbrado', 'basura', 'seguridad', 'emergencia']),
  description: z.string().min(10, 'Descripción muy corta (mín. 10 caracteres)'),
  address: z.string().min(3, 'Ingresa una dirección referencial'),
});
type FormData = z.infer<typeof schema>;

const TYPES: IncidentType[] = ['bache', 'alumbrado', 'basura', 'seguridad', 'emergencia'];
const DEFAULT_LAT = -12.0464;
const DEFAULT_LNG = -77.0428;

const TYPE_COLORS: Record<IncidentType, string> = {
  bache:      'border-amber-300 bg-amber-50 ring-amber-300',
  alumbrado:  'border-sky-300 bg-sky-50 ring-sky-300',
  basura:     'border-emerald-300 bg-emerald-50 ring-emerald-300',
  seguridad:  'border-rose-300 bg-rose-50 ring-rose-300',
  emergencia: 'border-orange-300 bg-orange-50 ring-orange-300',
};

const STEPS = [
  { label: 'Tipo' },
  { label: 'Ubicación' },
  { label: 'Evidencia' },
];

export function NewIncidentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const selectedType = watch('type');

  const handleLocate = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); toast.success('Ubicación detectada'); },
      () => toast.error('No se pudo obtener tu ubicación')
    );
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('type', data.type);
      formData.append('description', data.description);
      formData.append('address', data.address);
      formData.append('lat', String(lat));
      formData.append('lng', String(lng));
      files.forEach(f => formData.append('media', f));
      const incident = await incidentsApi.create(formData);
      toast.success('Incidencia reportada exitosamente');
      navigate(`/incidents/${incident.id}`);
    } catch {
      toast.error('Error al enviar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const filledSections = [selectedType, true, true].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 text-sm font-medium">
            Volver
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-gray-900 text-lg">Reportar incidencia</h1>
            <p className="text-xs text-gray-500">Completa los datos del problema</p>
          </div>
          {/* Stepper mini */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <div key={i} className={clsx('flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                i < filledSections ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-400')}>
                <span className="hidden sm:block">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Tipo */}
        <div className="section-card fade-up">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold text-gray-900">¿Qué tipo de problema es?</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {TYPES.map(t => (
              <button key={t} type="button"
                onClick={() => setValue('type', t, { shouldValidate: true })}
                className={clsx(
                  'flex flex-col items-center p-3 rounded-xl border-2 text-xs font-medium transition-all duration-200 active:scale-95 hover:-translate-y-0.5',
                  selectedType === t
                    ? `${TYPE_COLORS[t]} ring-2 shadow-md`
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}>
                <IncidentTypeIcon type={t} className="w-6 h-6 mb-1.5" />
                {INCIDENT_LABELS[t]}
              </button>
            ))}
          </div>
          {errors.type && <p className="text-red-500 text-xs mt-2">Selecciona un tipo de incidencia</p>}
        </div>

        {/* Descripción + Dirección */}
        <div className="section-card fade-up">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold text-gray-900">Detalles del problema</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Descripción
              </label>
              <textarea {...register('description')} rows={4} placeholder="Describe el problema: tamaño, urgencia, cuánto tiempo lleva..." className="input-base resize-none" />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Dirección referencial
              </label>
              <input {...register('address')} placeholder="Ej: Av. Arequipa 1234, esquina con Av. Javier Prado" className="input-base" />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="section-card fade-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900">Marca la ubicación</h2>
            </div>
            <button type="button" onClick={handleLocate}
              className="flex items-center gap-1.5 text-xs text-green-700 font-semibold hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors">
              Usar mi ubicación
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3">Haz clic en el mapa para marcar el lugar exacto del problema</p>
          <LocationPicker lat={lat} lng={lng} onChange={(la, ln) => { setLat(la); setLng(ln); }} />
        </div>

        {/* Multimedia */}
        <div className="section-card fade-up">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold text-gray-900">Evidencia multimedia</h2>
            <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Opcional</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">Adjunta fotos, videos o audios que muestren el problema</p>
          <MediaUploader files={files} onChange={setFiles} />
        </div>

        {/* Submit */}
        <div className="pb-6">
          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enviando reporte...</>
            ) : (
              <>Enviar reporte</>
            )}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">Tu reporte será revisado por operadores municipales</p>
        </div>
      </form>
    </div>
  );
}
