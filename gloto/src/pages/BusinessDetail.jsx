import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../shared/lib/supabase";
import CartFloatingBar from "../components/CartFloatingBar";
import ProductModal from "../components/ProductModal";

export default function BusinessDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para UI dinámica
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const sectionRefs = useRef({});
  const tabsContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (biz) {
        setBusiness(biz);
        const { data: prods } = await supabase
          .from("products")
          .select("*")
          .eq("business_id", biz.id)
          .order("name");
        setProducts(prods || []);
      }
      setLoading(false);
    }
    loadData();
  }, [slug]);

  const structuredData = useMemo(() => {
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    return filtered.reduce((acc, p) => {
      const cat = p.category || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
      return acc;
    }, {});
  }, [products, searchTerm]);

  const categories = Object.keys(structuredData);

  // 1. Manejo de Scroll (Header y Buscador)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 60);

      // Abre el buscador automáticamente si scrollea después de la info del negocio
      if (scrollY > 380) setIsSearchOpen(true);
      else if (!searchTerm) setIsSearchOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [searchTerm]);

  // 2. ScrollSpy (Detectar Categoría Activa)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveCategory(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    Object.values(sectionRefs.current).forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [categories]);

  // Auto-scroll horizontal del nav para mantener categoría activa visible
  useEffect(() => {
    if (!tabsContainerRef.current || !activeCategory) return;

    const container = tabsContainerRef.current;
    const activeButton = container.querySelector(
      `button[data-category="${activeCategory}"]`,
    );

    if (!activeButton) return;

    const containerCenter = container.clientWidth / 2;
    const buttonCenter = activeButton.offsetLeft + activeButton.clientWidth / 2;
    const target = buttonCenter - containerCenter;

    const maxScroll = container.scrollWidth - container.clientWidth;
    const scrollLeft = Math.max(0, Math.min(target, maxScroll));

    container.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, [activeCategory]);

  if (loading)
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center font-bold text-slate-400 animate-pulse">
        Cargando...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 mb-200">
      {/* HEADER DINÁMICO */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 py-3 flex items-center justify-between ${
          isScrolled
            ? "bg-slate-950 border-b border-slate-800"
            : "bg-transparent border-b border-transparent shadow-none"
        }`}
      >
        {/* Botón Atrás */}
        <button
          onClick={() => navigate("/")}
          className={`p-2 rounded-full transition-all duration-300 ${
            isScrolled
              ? "hover:bg-slate-800"
              : "bg-slate-800 text-white backdrop-blur-sm"
          }`}
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Contenedor del Buscador (Se expande al scrollear o clic) */}
        <div
          className={`flex-1 mx-4 transition-all duration-500 ease-in-out ${
            isSearchOpen
              ? "opacity-100 scale-100"
              : "opacity-0 scale-90 pointer-events-none"
          }`}
        >
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar..."
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-orange-500 backdrop-blur-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="w-4 h-4 absolute left-3 top-2.5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Botones de Acción (Lupa y Compartir) */}
        <div className="flex items-center gap-2">
          {!isSearchOpen && (
            <button
              onClick={() => {
                setIsSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 200);
              }}
              className={`p-2 rounded-full transition-all duration-300 ${
                isScrolled
                  ? "hover:bg-slate-800 text-white"
                  : "bg-slate-950 text-white backdrop-blur-sm"
              }`}
            >
              <svg
                className="w-6 h-6 bg-slate-950"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          )}

          <button
            className={`p-2 rounded-full transition-all duration-300 ${
              isScrolled
                ? "hover:bg-slate-800 text-white"
                : "bg-slate-950 text-white backdrop-blur-sm"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* PORTADA */}
      <div className="relative h-64 w-full">
        <img
          src={
            business?.cover_url ||
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836"
          }
          className="w-full h-full object-cover"
          alt="Cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20" />
      </div>

      {/* INFO DEL NEGOCIO */}
      <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl border border-slate-800">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-black text-white tracking-tight">
              {business?.name}
            </h1>
            <div
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${business?.is_open ? "bg-green-500/10 text-green-500" : "bg-slate-800 text-slate-500"}`}
            >
              {business?.is_open ? "Abierto" : "Cerrado"}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-slate-500 mb-4">
            <span className="flex items-center gap-1 text-orange-500">
              ★{" "}
              {business?.rating
                ? parseFloat(business.rating).toFixed(1)
                : "Nuevo"}
            </span>
            <span>•</span>
            <span>{business?.category}</span>
          </div>
          <div className="text-sm text-slate-400 flex items-start gap-2.5 group cursor-default">
            {/* Contenedor del icono con un fondo sutil */}
            <div className="flex-shrink-0 p-1 rounded-md  group-hover:bg-orange-500/10 transition-colors duration-300">
              <svg
                className="w-4 h-4 text-orange-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>

            {/* Texto de la dirección */}
            <span className="leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
              {business?.address || "Dirección no disponible"}
            </span>
          </div>
        </div>
      </div>

      {/* CATEGORÍAS STICKY */}
      <nav
        ref={tabsContainerRef}
        className={`fixed top-[60px] left-0 right-0 z-40 bg-slate-950 border-b border-slate-800 py-4 px-4 overflow-x-auto no-scrollbar flex gap-3 transition-all duration-300 ${isScrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            data-category={cat}
            onClick={() => {
              setActiveCategory(cat);
              sectionRefs.current[cat]?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${activeCategory === cat ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-slate-900 text-slate-500 hover:text-white"}`}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* LISTA DE PRODUCTOS */}
      <main className="max-w-4xl mx-auto px-4 pt-10 space-y-5">
        {categories.map((cat) => (
          <section
            key={cat}
            id={cat}
            ref={(el) => (sectionRefs.current[cat] = el)}
            className="scroll-mt-32"
          >
            <h2 className="text-xl font-black text-white  flex items-center gap-3">
              {cat}
              <div className="h-px flex-1 bg-slate-800"></div>
            </h2>
            <div className="divide-y divide-slate-900">
              {structuredData[cat].map((p) => (
                <CompactProductRow
                  key={p.id}
                  p={p}
                  onClick={() => setSelectedProduct(p)}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      <CartFloatingBar />
    </div>
  );
}

function CompactProductRow({ p, onClick }) {
  const isAvailable = p.is_available;
  return (
    <div
      onClick={() => isAvailable && onClick()}
      className={`py-3 flex items-center gap-4 transition-all active:bg-slate-900 cursor-pointer ${!isAvailable && "opacity-40 grayscale"}`}
    >
      <div className="flex-1">
        <h3 className="font-bold text-white text-lg mb-1">{p.name}</h3>
        <p className="text-slate-500 text-xs line-clamp-2 mb-2">
          {p.description ||
            "Delicioso plato preparado con ingredientes frescos."}
        </p>
        <span className="font-black text-orange-500 text-lg">
          $
          {Number(p.price).toLocaleString("es-CO", {
            minimumFractionDigits: 0,
          })}
        </span>
      </div>
      <div className="relative w-28 h-28 flex-shrink-0">
        <img
          src={p.image_url || "https://via.placeholder.com/150"}
          className="w-full h-full object-cover rounded-2xl shadow-xl"
          alt={p.name}
        />
        {isAvailable && (
          <div className="absolute -bottom-1 -right-1 bg-orange-500 text-slate-950 shadow-lg w-8 h-8 rounded-full flex items-center justify-center font-black">
            +
          </div>
        )}
      </div>
    </div>
  );
}
