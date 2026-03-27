import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../app/AuthProvider"; // Ajusta la ruta a tu AuthProvider

export default function ProtectedRoute({ allowedRoles }) {
  const { user, profile, loading } = useAuth();

  // 1. CARGA OPTIMISTA: Solo mostramos pantalla de carga si loading Y no tenemos profile en caché
  // Si el profile ya existe en sessionStorage, permitimos el acceso inmediatamente (F5 instantáneo)
  if (loading && !profile) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 animate-pulse">
            Verificando credenciales...
          </p>
        </div>
      </div>
    );
  }

  // 2. Si terminó de cargar y no hay usuario, mandarlo al login
  // Nota: puedes cambiar "/auth" por la página de login que prefieras
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // 3. Si hay usuario pero no tiene el rol permitido
  // Si allowedRoles es un array, verificamos si el rol del perfil está incluido
  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/" replace />;
  }

  // 4. Si todo está bien, renderizamos las rutas hijas (Outlet)
  // O children si decides no usar rutas anidadas
  return <Outlet />;
}
