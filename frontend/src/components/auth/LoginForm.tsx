import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      toast.success('Bienvenido de vuelta');
      navigate('/');
    } catch {
      toast.error('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-800 via-green-700 to-emerald-700 flex-col items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative text-center">
          <h2 className="text-4xl font-bold mb-3">ViaPública</h2>
          <p className="text-green-200 text-lg mb-8">Plataforma de registro<br />de incidencias municipales</p>
          <div className="space-y-3 text-left">
            {['Reporta baches, alumbrado y más', 'Adjunta fotos, videos o audios', 'Haz seguimiento en tiempo real'].map(tip => (
              <div key={tip} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur">
                <span className="text-green-300 font-bold text-sm">OK</span>
                <span className="text-sm text-green-100">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md fade-up">
          <div className="lg:hidden mb-8">
            <span className="font-bold text-lg">Vía<span className="text-green-700">Pública</span></span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Iniciar sesión</h1>
          <p className="text-gray-500 text-sm mb-8">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo electrónico</label>
              <input {...register('email')} type="email" placeholder="tu@email.com" className="input-base" />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Contraseña" className="input-base pr-16" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium">
                  {showPass ? 'Ocultar' : 'Ver'}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-green-700 font-semibold hover:underline">Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
