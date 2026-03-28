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
  const [showCategories, setShowCategories] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const sectionRefs = useRef({});

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowCategories(true);
      } else {
        setShowCategories(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-bold text-slate-400 animate-pulse">
        Cargando...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 pb-32">
      {/* HEADER CUSTOM */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const input = document.querySelector('input[type="text"]');
              if (input) input.focus();
            }}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5 text-white"
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

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: business?.name,
                  text: `Mira este negocio: ${business?.name}`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Enlace copiado al portapapeles");
              }
            }}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5 text-white"
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
      </div>

      {/* HEADER: IMAGEN Y BOTÓN ATRÁS */}
      <div className="relative h-56 w-full bg-slate-200 pt-16">
        <img
          src={
            business?.cover_url ||
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000"
          }
          className="w-full h-full object-cover"
          alt="Cover"
        />
      </div>

      {/* INFO DEL NEGOCIO (DIDI STYLE CARD) */}
      <div className="max-w-2xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-slate-950 rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/50 border border-slate-50">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-black tracking-tight text-white">
              {business?.name}
            </h1>
            <div
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${business?.is_open ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}
            >
              {business?.is_open ? "Abierto" : "Cerrado"}
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm font-bold text-slate-500 mb-4">
            <span className="flex items-center gap-1 text-orange-500">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {business?.rating || "Nuevo"}
            </span>
            <span>•</span>
            <span>{business?.category}</span>
          </div>

          {/* DETALLES ADICIONALES */}
          <div className="space-y-2 text-sm text-slate-600 mb-6">
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 mt-0.5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{business?.address}</span>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="¿Qué se te antoja?"
              className="w-full bg-slate-100 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-orange-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="w-5 h-5 absolute left-4 top-3.5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* CATEGORÍAS STICKY */}
      <nav
        className={`fixed top-16 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 py-4 px-4 overflow-x-auto no-scrollbar flex gap-4 transition-opacity duration-300 ${showCategories ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              sectionRefs.current[cat]?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
            className="whitespace-nowrap px-5 py-2 rounded-full bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-orange-500 hover:text-white transition-all shadow-sm active:scale-95"
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* LISTA DE PRODUCTOS COMPACTA */}
      <main className="max-w-4xl mx-auto px-4 pt-10 space-y-12">
        {categories.map((cat) => (
          <section
            key={cat}
            ref={(el) => (sectionRefs.current[cat] = el)}
            className="scroll-mb-24"
          >
            <h2 className="text-xls font-black text-white  flex items-center gap-3">
              {cat}
            </h2>
            <div className="">
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
      className={`py-3 flex items-center gap-4 transition-all active:bg-slate-50 cursor-pointer ${!isAvailable && "opacity-40 grayscale"}`}
    >
      <div className="flex-1">
        <h3 className="font-bold text-white text-lg mb-1 leading-tight">
          {p.name}
        </h3>
        <p className="text-slate-400 text-xs line-clamp-2 mb-1 font-medium leading-relaxed">
          {p.description ||
            "Delicioso plato preparado con ingredientes frescos."}
        </p>
        <span className="font-black text-sky-500 text-lg">
          $
          {Number(p.price).toLocaleString("es-CO", {
            minimumFractionDigits: 0,
          })}
        </span>
      </div>

      <div className="relative w-28 h-28 flex-shrink-0">
        <img
          src={
            p.image_url ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop"
          }
          className="w-full h-full object-cover rounded-2xl shadow-md shadow-slate-200"
          alt={p.name}
        />
        {isAvailable && (
          <div className="absolute -bottom-1 -right-1 bg-white shadow-lg w-8 h-8 rounded-full flex items-center justify-center text-orange-500 font-black border border-slate-50">
            +
          </div>
        )}
      </div>
    </div>
  );
}
