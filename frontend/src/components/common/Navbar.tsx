import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={clsx(
        'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
        location.pathname === to
          ? 'bg-green-50 text-green-700'
          : 'text-gray-500 hover:text-green-700 hover:bg-green-50'
      )}
    >
      {label}
    </Link>
  );

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        <Link to="/" className="font-bold text-lg text-gray-900 hover:text-green-700 transition-colors shrink-0">
          Vía<span className="text-green-700">Pública</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-1">
            {user.role === 'ciudadano' ? (
              <>
                {navLink('/my-incidents', 'Mis reportes')}
                <Link
                  to="/incidents/new"
                  className="bg-green-700 text-white text-sm font-semibold px-4 py-1.5 rounded-xl hover:bg-green-800 transition-all duration-150 shadow-sm active:scale-95 ml-1"
                >
                  Reportar
                </Link>
              </>
            ) : (
              navLink('/operator', 'Panel Operador')
            )}

            <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-200">
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1.5">
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {user.name}
                </span>
                <span className={clsx(
                  'hidden md:block text-xs px-1.5 py-0.5 rounded-md font-semibold',
                  user.role === 'operador' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-800'
                )}>
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-all duration-150"
              >
                Salir
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-all duration-150">
              Iniciar sesión
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
