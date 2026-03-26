import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../shared/lib/supabase";
import { useAuth } from "../app/AuthProvider";
import InventoryManager from "../features/admin/components/InventoryManager";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      // Si no está logueado, lo mandamos al login de SOCIOS, no al de clientes
      navigate("/portal");
      return;
    }
    if (user) {
      fetchBusiness();
    }
  }, [user, authLoading]);

  const fetchBusiness = async () => {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle(); // Usamos maybeSingle para que no de error si no hay nada

      if (error) throw error;

      setBusiness(data); // Si data es null, se guarda null
    } catch (err) {
      console.error("Error cargando negocio:", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Pantalla de carga
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-sky-500 font-black italic animate-pulse">
        CARGANDO PANEL...
      </div>
    );
  }

  // 2. Si no hay negocio encontrado (EVITA EL BLANCO)
  if (!business) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10 text-center text-white">
        <h1 className="text-4xl font-black italic mb-4">¡UPS!</h1>
        <p className="text-slate-400 max-w-sm mb-8">
          Tu cuenta ({user?.email}) no está vinculada a ningún negocio en Gloto.
          Verifica que el owner_id en la base de datos sea:
          <span className="block bg-white/10 p-2 rounded mt-2 text-sky-400 text-xs font-mono">
            {user?.id}
          </span>
        </p>
        <button
          onClick={() => navigate("/")}
          className="text-sky-500 font-bold underline"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  // 3. Render principal (Solo ocurre si business existe)
  return (
    <div className="flex min-h-screen bg-slate-950 text-white font-sans">
      <aside className="w-72 border-r border-white/5 bg-slate-900/50 backdrop-blur-xl p-8 flex flex-col">
        <div className="mb-12">
          <h2 className="text-2xl font-black italic tracking-tighter text-sky-400">
            GLOTO ADMIN
          </h2>
          <div className="mt-2 py-1 px-3 bg-sky-500/10 border border-sky-500/20 rounded-lg inline-block">
            <p className="text-[10px] text-sky-400 font-black uppercase tracking-widest">
              {business.name}
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-3 flex-1">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${
              activeTab === "products"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                : "text-slate-400 hover:bg-white/5"
            }`}
          >
            <span>📦</span> Mi Menú
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${
              activeTab === "settings"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                : "text-slate-400 hover:bg-white/5"
            }`}
          >
            <span>⚙️</span> Ajustes
          </button>
        </nav>

        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-auto p-4 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors text-left uppercase"
        >
          ✕ Cerrar Sesión
        </button>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === "products" && (
            <InventoryManager businessId={business.id} />
          )}
          {activeTab === "settings" && (
            <div>
              <h2 className="text-3xl font-black italic uppercase mb-6">
                Configuración
              </h2>
              <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem]">
                <p className="text-slate-400">Ajustes del local...</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
