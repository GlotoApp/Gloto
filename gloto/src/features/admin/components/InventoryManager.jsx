import { useState, useEffect } from "react";
import { supabase } from "../../../shared/lib/supabase";
import { Trash2, Eye, EyeOff, Plus, Edit3 } from "lucide-react";

export default function InventoryManager({
  businessId,
  onAddNew,
  onEditProduct,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) fetchProducts();
  }, [businessId]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id,business_id,category_id,name,description,price,image_url,is_available,created_at,category",
        )
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Products error:", error);
        setProducts([]);
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      console.error("Error en fetchProducts:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Evita que se abra el editor al hacer clic en borrar
    if (!confirm("¿Eliminar este producto permanentemente?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const toggleStatus = async (id, currentStatus, e) => {
    e.stopPropagation(); // Evita que se abra el editor
    const { error } = await supabase
      .from("products")
      .update({ is_available: !currentStatus })
      .eq("id", id);

    if (!error) {
      setProducts(
        products.map((p) =>
          p.id === id ? { ...p, is_available: !currentStatus } : p,
        ),
      );
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center font-black italic text-slate-700">
        CARGANDO MENÚ...
      </div>
    );

  return (
    <div className="space-y-10">
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
        <div>
          <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white">
            Mi <span className="text-sky-500">Menú</span>
          </h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em] mt-2">
            {products.length} Items registrados en el sistema
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="group bg-white hover:bg-sky-500 text-black hover:text-white px-10 py-5 rounded-3xl font-black text-xs transition-all shadow-2xl flex items-center gap-3 uppercase tracking-widest active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          Nuevo Producto
        </button>
      </div>

      {/* GRID AMPLIO */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => onEditProduct(product.id)}
            className={`group cursor-pointer relative bg-slate-900/40 border-2 ${
              product.is_available === false
                ? "border-red-500/20 opacity-50"
                : "border-white/5"
            } p-6 rounded-[3rem] hover:border-sky-500/50 hover:bg-slate-900 transition-all duration-500`}
          >
            {/* Imagen con Aspect Ratio de Cine */}
            <div className="relative aspect-[16/10] w-full bg-slate-800 rounded-[2rem] mb-6 overflow-hidden shadow-inner">
              <img
                src={
                  product.image_url ||
                  "https://via.placeholder.com/600x400?text=Sin+Imagen"
                }
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Status Badge */}
              {!product.is_available && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-red-500 text-white text-[10px] font-black uppercase px-6 py-2 rounded-full tracking-widest shadow-xl">
                    Fuera de Stock
                  </span>
                </div>
              )}
            </div>

            {/* Content info */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="max-w-[70%]">
                  <span className="text-sky-500 font-black text-[9px] uppercase tracking-widest mb-1 block">
                    {product.category || "General"}
                  </span>
                  <h3 className="font-black text-2xl uppercase italic leading-none text-white group-hover:text-sky-400 transition-colors">
                    {product.name}
                  </h3>
                </div>
                <p className="text-2xl font-black italic text-white">
                  ${product.price}
                </p>
              </div>

              {/* BARRA DE ACCIONES AL PIE */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex gap-2">
                  <button
                    onClick={(e) =>
                      toggleStatus(product.id, product.is_available, e)
                    }
                    className={`p-3 rounded-2xl transition-all ${
                      product.is_available
                        ? "bg-white/5 text-slate-400 hover:bg-sky-500 hover:text-white"
                        : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                    }`}
                  >
                    {product.is_available ? (
                      <Eye size={18} />
                    ) : (
                      <EyeOff size={18} />
                    )}
                  </button>
                  <button
                    onClick={(e) => handleDelete(product.id, e)}
                    className="p-3 bg-white/5 text-slate-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase group-hover:text-white transition-colors">
                  <Edit3 size={14} /> Editar
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Botón de "Añadir otro" al final del grid */}
        <div
          onClick={onAddNew}
          className="border-4 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center p-12 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus
              size={32}
              className="text-slate-600 group-hover:text-sky-500"
            />
          </div>
          <span className="text-slate-500 font-black uppercase text-xs tracking-widest">
            Añadir plato
          </span>
        </div>
      </div>
    </div>
  );
}
