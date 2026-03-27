import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../shared/lib/supabase";
import { useAuth } from "../app/AuthProvider";
import InventoryManager from "../features/admin/components/InventoryManager";
import ProductEditor from "../features/admin/components/ProductEditor"; // Componente nuevo

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [viewMode, setViewMode] = useState("list"); // 'list' o 'editor'
  const [editingProductId, setEditingProductId] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/portal");
      return;
    }
    if (user) fetchBusiness();
  }, [user, authLoading]);

  const fetchBusiness = async () => {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setBusiness(data);
    } catch (err) {
      console.error("Error cargando negocio:", err);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para navegar entre lista y editor
  const openEditor = (id = null) => {
    setEditingProductId(id);
    setViewMode("editor");
  };

  const closeEditor = (refresh = false) => {
    setViewMode("list");
    setEditingProductId(null);
    // Podrías refrescar datos aquí si es necesario
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-sky-500 font-black italic animate-pulse">
        CARGANDO PANEL...
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10 text-center text-white">
        <h1 className="text-4xl font-black italic mb-4 text-red-500">
          ACCESO RESTRINGIDO
        </h1>
        <p className="text-slate-400 max-w-sm mb-8 font-bold uppercase text-[10px] tracking-widest">
          ID DE SOCIO: {user?.id}
        </p>
        <button
          onClick={() => navigate("/")}
          className="text-sky-500 font-black underline italic"
        >
          VOLVER AL MARKETPLACE
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* SIDEBAR - Solo se ve si no estamos en el editor a pantalla completa */}
      {viewMode === "list" && (
        <aside className="w-72 border-r border-white/5 bg-slate-900/50 backdrop-blur-xl p-8 flex flex-col shrink-0">
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
              📦 Mi Menú
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${
                activeTab === "settings"
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                  : "text-slate-400 hover:bg-white/5"
              }`}
            >
              ⚙️ Ajustes
            </button>
          </nav>

          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-auto p-4 text-[10px] font-black text-slate-600 hover:text-red-400 transition-colors text-left uppercase tracking-[0.2em]"
          >
            ✕ Cerrar Sesión
          </button>
        </aside>
      )}

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <div
          className={`mx-auto ${viewMode === "editor" ? "w-full" : "max-w-6xl p-12"}`}
        >
          {activeTab === "products" && (
            <>
              {viewMode === "list" ? (
                <InventoryManager
                  businessId={business.id}
                  onAddNew={() => openEditor()}
                  onEditProduct={(id) => openEditor(id)}
                />
              ) : (
                <ProductEditor
                  businessId={business.id}
                  productId={editingProductId}
                  onBack={closeEditor}
                />
              )}
            </>
          )}

          {activeTab === "settings" && viewMode === "list" && (
            <div>
              <h2 className="text-3xl font-black italic uppercase mb-6">
                Configuración
              </h2>
              <div className="p-12 bg-slate-900 border border-white/5 rounded-[3rem]">
                <p className="text-slate-400 font-bold uppercase text-xs">
                  Ajustes del local próximamente...
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
