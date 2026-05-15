import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';

const schema = z.object({
  name: z.string().min(2, 'Nombre muy corto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden', path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await authRegister(data.name, data.email, data.password);
      toast.success('Cuenta creada exitosamente');
      navigate('/');
    } catch {
      toast.error('Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md fade-up">
        <div className="mb-8">
          <span className="font-bold text-lg">Vía<span className="text-green-700">Pública</span></span>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mb-6">Únete y comienza a reportar incidencias</p>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {['Geolocalización', 'Multimedia', 'Seguimiento'].map(label => (
              <div key={label} className="bg-green-50 rounded-xl p-2.5 text-center">
                <div className="text-xs font-medium text-green-700">{label}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre completo</label>
              <input {...register('name')} type="text" placeholder="Juan Pérez" className="input-base" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
              <input {...register('email')} type="email" placeholder="tu@email.com" className="input-base" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" className="input-base pr-16" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-medium">
                  {showPass ? 'Ocultar' : 'Ver'}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirmar contraseña</label>
              <input {...register('confirmPassword')} type={showPass ? 'text' : 'password'} placeholder="Repite tu contraseña" className="input-base" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-green-700 font-semibold hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
