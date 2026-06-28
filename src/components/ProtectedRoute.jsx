import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Cargando...</div>;

  if (!user) {
    // Si intentas entrar a superadmin, vas al login especial
    if (location.pathname === "/superadmin") {
      return <Navigate to="/login-superadmin" replace />;
    }
    // Si intentas entrar al POS, vas al login normal
    return <Navigate to="/login" replace />;
  }

  return children;
};
