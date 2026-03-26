import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../shared/lib/supabase";
import CartFloatingBar from "../components/CartFloatingBar";
import ProductModal from "../components/ProductModal"; // Importamos el modal

export default function BusinessDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para el producto seleccionado
  const [selectedProduct, setSelectedProduct] = useState(null);

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
          .eq("business_id", biz.id);
        setProducts(prods || []);
      }
      setLoading(false);
    }
    loadData();
  }, [slug]);

  if (loading)
    return (
      <div className="p-20 text-center font-black italic uppercase tracking-tighter">
        Cargando Menú...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-black pb-32">
      {/* HEADER DINÁMICO */}
      <header className="max-w-5xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate("/")}
          className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-8"
        >
          ← Volver
        </button>
        <h1 className="text-7xl font-black italic uppercase tracking-tighter">
          {business?.name}
        </h1>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedProduct(p)} // Al dar clic a cualquier parte de la carta
              className="group cursor-pointer bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-2xl transition-all duration-500"
            >
              {/* Imagen que toma el mayor campo visual */}
              <div className="h-56 bg-slate-100 overflow-hidden">
                <img
                  src={
                    p.image_url ||
                    "https://via.placeholder.com/500x300?text=Gloto+Food"
                  }
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt={p.name}
                />
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">
                    {p.category}
                  </span>
                  <span className="font-black text-xl text-amber-500 italic">
                    ${Number(p.price).toLocaleString()}
                  </span>
                </div>

                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2 group-hover:text-sky-500 transition-colors">
                  {p.name}
                </h3>

                {/* Descripción limitada con ... */}
                <p className="text-slate-400 text-sm line-clamp-2 mb-6">
                  {p.description}
                </p>

                <div className="flex justify-end">
                  <div className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-lg group-hover:bg-sky-500 transition-all">
                    +
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL DE PRODUCTO */}
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
