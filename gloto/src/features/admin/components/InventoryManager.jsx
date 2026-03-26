import { useState, useEffect } from "react";
import { supabase } from "../../../shared/lib/supabase";
import ProductFormModal from "./ProductFormModal";

export default function InventoryManager({ businessId }) {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (businessId) fetchProducts();
  }, [businessId]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (!error) setProducts(data);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">
            Inventario
          </h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
            Gestiona tu menú
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-sky-500 hover:bg-sky-400 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-sky-500/20 active:scale-95"
        >
          + AGREGAR PRODUCTO
        </button>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group bg-slate-900/50 border border-white/5 p-4 rounded-[2rem] hover:border-sky-500/30 transition-all"
          >
            <div className="relative h-48 w-full bg-slate-800 rounded-[1.5rem] mb-4 overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/150?text=Sin+Imagen")
                  }
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-600 text-4xl">
                  🥘
                </div>
              )}
            </div>
            <div className="px-2">
              <h3 className="font-black text-xl uppercase italic leading-tight mb-1">
                {product.name}
              </h3>
              <p className="text-sky-400 font-black text-lg">
                ${product.price}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Aquí llamaremos al Modal más adelante */}
      {isModalOpen && (
        <ProductFormModal
          businessId={businessId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}
