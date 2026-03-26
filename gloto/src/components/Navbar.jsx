import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../shared/lib/supabase";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Obtener sesión al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. Escuchar cambios de auth (Login/Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo estilo Gloto */}
        <Link
          to="/"
          className="text-2xl font-black text-white italic tracking-tighter"
        >
          GLOTO
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-slate-300 hover:text-white transition-colors text-sm"
          >
            Marketplace
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sky-400 text-sm font-medium">
                Hola,{" "}
                {user.user_metadata?.full_name ||
                  user.email.split("@")[0] ||
                  "Usuario"}
              </span>
              <button
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-white px-4 py-2 rounded-lg text-sm transition-all"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
