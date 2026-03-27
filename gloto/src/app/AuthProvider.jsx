import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../shared/lib/supabase";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  // 1. CARGA OPTIMISTA: Intentamos leer la sesión del almacenamiento local de inmediato
  const [user, setUser] = useState(() => {
    const session = localStorage.getItem("sb-auth-token"); // Ajusta el nombre si es necesario
    return session ? JSON.parse(session).user : null;
  });

  const [profile, setProfile] = useState(() => {
    const savedProfile = sessionStorage.getItem("gloto_profile");
    return savedProfile ? JSON.parse(savedProfile) : null;
  });

  // Si ya tenemos perfil en cache, no mostramos pantalla de carga
  const [loading, setLoading] = useState(!profile);

  const getProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, businesses(*)")
        .eq("id", userId)
        .single();

      if (data) {
        setProfile(data);
        // Guardamos en sessionStorage para que el F5 sea instantáneo
        sessionStorage.setItem("gloto_profile", JSON.stringify(data));
      }
    } catch (err) {
      console.error("Error al obtener perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Sincronizar sesión real de Supabase
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
        // Solo vamos a la red si no tenemos el perfil en cache
        if (!profile) {
          await getProfile(session.user.id);
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // 2. Escuchar cambios (Login/Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        await getProfile(session.user.id);
      } else {
        // Al cerrar sesión, limpiamos TODO
        setUser(null);
        setProfile(null);
        sessionStorage.removeItem("gloto_profile");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {/* Si ya tenemos perfil, mostramos la App aunque siga cargando validaciones por detrás */}
      {!loading || profile ? (
        children
      ) : (
        <div className="h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
