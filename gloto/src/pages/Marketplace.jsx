import { useEffect, useState } from "react";
import { supabase } from "../shared/lib/supabase";
import { useAuth } from "../app/AuthProvider";
import { useNavigate } from "react-router-dom"; // Faltaba esta importación

export default function Marketplace() {
  const { profile, loading } = useAuth(); // Aquí se llama 'loading'
  const [businesses, setBusinesses] = useState([]);
  const [fetching, setFetching] = useState(true); // Aquí se llama 'fetching'
  const navigate = useNavigate(); // Inicializamos el hook de navegación

  useEffect(() => {
    async function fetchBusinesses() {
      setFetching(true);
      try {
        // Quitamos el .eq("is_active", true) temporalmente para asegurar que traiga ALGO
        const { data, error } = await supabase.from("businesses").select("*");

        if (error) {
          console.error("Error de Supabase:", error.message);
          return;
        }

        setBusinesses(data || []);
      } catch (err) {
        console.error("Error crítico:", err);
      } finally {
        setFetching(false);
      }
    }

    fetchBusinesses();
  }, []);

  const handleViewMenu = (slug) => {
    navigate(`/business/${slug}`);
  };

  // 1. CORRECCIÓN: Usamos 'loading' (del auth) y 'profile'
  if (loading && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-white text-lg font-medium animate-pulse italic uppercase tracking-widest">
          Gloto <span className="text-sky-500">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24">
      {" "}
      {/* pt-24 para que no lo tape el Navbar fixed */}
      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Explorar <span className="text-sky-500 italic">Negocios</span>
          </h1>
          <p className="text-slate-400 mt-2">
            Hola,{" "}
            <span className="text-white font-bold">
              {profile?.full_name || "Glover"}
            </span>
            . Pide de tus favoritos.
          </p>
        </header>

        {/* 2. CORRECCIÓN: Usamos 'fetching' en lugar de 'loadingBusinesses' */}
        {fetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-64 bg-slate-900/50 animate-pulse rounded-2xl border border-slate-800"
              />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
            <p className="text-slate-500 text-lg font-medium">
              No hay restaurantes disponibles aún
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((biz) => (
              <div
                key={biz.id}
                onClick={() => handleViewMenu(biz.slug)}
                className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-sky-500/50 transition-all duration-300 group cursor-pointer shadow-lg"
              >
                {/* Badge de Cerrado */}
                {!biz.is_open && (
                  <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
                    Cerrado
                  </div>
                )}

                {/* Imagen de Portada */}
                <div className="h-40 bg-slate-800 overflow-hidden">
                  <img
                    src={
                      biz.cover_url ||
                      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000"
                    }
                    alt={biz.name}
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${!biz.is_open ? "grayscale opacity-50" : ""}`}
                  />
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={biz.logo_url}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                      alt="logo"
                    />
                    <h3 className="text-xl font-bold line-clamp-1">
                      {biz.name}
                    </h3>
                  </div>
                  <p className="text-slate-400 text-xs line-clamp-2 h-8 mb-4">
                    {biz.description}
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                    <span className="text-sky-500 font-bold text-sm">
                      ★ {biz.rating?.toFixed(1) || "5.0"}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-slate-800 px-2 py-1 rounded">
                      {biz.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
