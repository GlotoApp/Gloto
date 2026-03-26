import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Importamos el hook para navegar
import { supabase } from "../shared/lib/supabase";

export default function Marketplace() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Inicializamos la navegación

  useEffect(() => {
    async function getBusinesses() {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("is_active", true);

      if (error) {
        console.error("Error cargando negocios:", error);
      } else {
        setBusinesses(data);
      }
      setLoading(false);
    }

    getBusinesses();
  }, []);

  // Función para manejar el clic en un negocio
  const handleViewMenu = (slug) => {
    navigate(`/business/${slug}`);
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-white text-lg font-medium animate-pulse">
          Cargando sabores...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Explorar <span className="text-sky-500">Negocios</span>
          </h1>
          <p className="text-slate-400 mt-2">
            Pide de tus restaurantes favoritos en un solo lugar.
          </p>
        </header>

        {businesses.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500">
              Aún no hay negocios disponibles en tu zona.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((biz) => (
              <div
                key={biz.id}
                onClick={() => handleViewMenu(biz.slug)} // Navega al hacer clic en la card
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-sky-500/50 transition-all group cursor-pointer"
              >
                {/* Banner / Imagen del negocio */}
                <div className="h-48 bg-slate-800 flex items-center justify-center text-slate-700 overflow-hidden relative">
                  {biz.banner_url ? (
                    <img
                      src={biz.banner_url}
                      alt={biz.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="font-bold text-4xl italic opacity-20">
                      GLOTO
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">
                      {biz.name}
                    </h3>
                  </div>

                  <p className="text-slate-400 text-sm line-clamp-2 h-10">
                    {biz.description || "Sin descripción disponible."}
                  </p>

                  <div className="mt-6 flex justify-between items-center">
                    <span className="bg-sky-500/10 text-sky-400 text-xs font-bold px-3 py-1 rounded-full border border-sky-500/20">
                      Abierto
                    </span>
                    <button className="text-white font-bold text-sm bg-slate-800 px-4 py-2 rounded-lg group-hover:bg-white group-hover:text-black transition-all">
                      Ver Menú
                    </button>
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
