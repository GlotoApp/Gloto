import { useEffect, useState, useMemo } from "react";
import { supabase } from "../shared/lib/supabase";
import { useAuth } from "../app/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Marketplace() {
  const { profile, loading: authLoading } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBusinesses() {
      setFetching(true);
      try {
        const { data, error } = await supabase
          .from("businesses")
          .select(
            "id,name,slug,category,cover_url,is_open,rating,description,plan,is_active",
          )
          .eq("is_active", true)
          .order("name");
        if (error) {
          console.error("Database error:", error);
          setBusinesses([]);
        } else {
          setBusinesses(data || []);
        }
      } catch (err) {
        console.error("Error:", err.message);
        setBusinesses([]);
      } finally {
        setFetching(false);
      }
    }
    fetchBusinesses();
  }, []);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((biz) => {
      const matchesSearch = biz.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        activeCategory === "Todos" || biz.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [businesses, searchTerm, activeCategory]);

  const categories = useMemo(() => {
    const cats = businesses.map((b) => b.category).filter(Boolean);
    return ["Todos", ...new Set(cats)];
  }, [businesses]);

  const placeholders = useMemo(
    () => ["Buscar...", ...categories.slice(1).map((cat) => `${cat}...`)],
    [categories],
  );

  const placeholderText = placeholders[placeholderIndex];

  useEffect(() => {
    if (placeholders.length <= 1) return;
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        setFading(false);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  if (authLoading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-sky-500 font-bold tracking-[0.2em]">
        GLOTO
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-6 pt-8">
        {/* HEADER LIMPIO */}
        <header className="flex flex-col items-center gap-6 mb-5">
          <div className="text-left">
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
              Explorar <span className="text-sky-500">Negocios</span>
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
              Cerca de ti
            </p>
          </div>
        </header>

        {/* INPUT DE BÚSQUEDA CENTRADO */}
        <div className="flex justify-center mb-5">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-800 rounded-full px-5 py-2 text-sm focus:border-sky-500/50 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span
              className={`absolute inset-0 flex items-center pl-5 pr-2 text-sm text-slate-500 transition-opacity duration-500 pointer-events-none ${searchTerm || fading ? "opacity-0" : "opacity-100"}`}
            >
              {placeholderText}
            </span>
          </div>
        </div>

        {/* CATEGORÍAS TIPO PILLS SIN BORDES PESADOS */}
        <div className="flex gap-2 overflow-x-auto pb-5 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat
                  ? "bg-sky-500  text-black"
                  : "bg-slate-900 text-slate-500 hover:text-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRID DE LISTA (2 COLUMNAS) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
          {fetching
            ? [1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-24 bg-slate-900/40 animate-pulse rounded-2xl"
                />
              ))
            : filteredBusinesses.map((biz) => (
                <div
                  key={biz.id}
                  onClick={() => navigate(`/business/${biz.slug}`)}
                  className="group flex items-center gap-5  rounded-2xl cursor-pointer hover:bg-slate-900/40 transition-all"
                >
                  {/* IMAGEN: Miniatura limpia (Usa placeholder si cover_url es null) */}
                  <div className="w-28 h-28 md:w-24 md:h-24 flex-shrink-0 relative">
                    <img
                      src={
                        biz.cover_url ||
                        "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300"
                      }
                      className={`w-full h-full object-cover rounded-xl shadow-lg transition-transform duration-500 group-hover:scale-105 ${!biz.is_open ? "grayscale opacity-30" : ""}`}
                      alt={biz.name}
                    />
                  </div>

                  {/* INFO: Sin bordes internos, pura jerarquía visual */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors truncate tracking-tight">
                        {biz.name}
                      </h3>
                    </div>

                    {/* Categoría y descripción corta */}
                    <p className="text-slate-500 text-[11px] font-bold tracking-tighter mb-3">
                      <span className="text-sky-500 text-[11px] font-black mr-2">
                        ★{" "}
                        {parseFloat(biz.rating) > 0
                          ? parseFloat(biz.rating).toFixed(1)
                          : "NUEVO"}
                      </span>
                      {biz.category}{" "}
                      {biz.description && (
                        <span className="text-slate-700 mx-1">•</span>
                      )}{" "}
                      {biz.description}
                    </p>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${biz.is_open ? "text-emerald-500 bg-emerald-500/10" : "text-slate-600 bg-slate-800"}`}
                      >
                        {biz.is_open ? "Abierto" : "Cerrado"}
                      </span>
                      {biz.plan === "prime" && (
                        <span className="text-amber-500 text-[10px] font-bold">
                          ✦ PRIME
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
