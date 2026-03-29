import { useState, useEffect } from "react";
import { useCartStore } from "../app/useCartStore";
import { supabase } from "../shared/lib/supabase";

export default function ProductModal({ product, onClose }) {
  const [modifiers, setModifiers] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);

  // Bloquear el scroll del cuerpo cuando la interfaz está abierta
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "unset");
  }, []);

  useEffect(() => {
    async function loadModifiers() {
      if (!product) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("product_modifiers")
        .select(
          `
          id, name, is_required, 
          modifier_options ( id, name, extra_price )
        `,
        )
        .eq("product_id", product.id);

      if (!error) setModifiers(data || []);
      setLoading(false);
    }
    loadModifiers();
  }, [product?.id]);

  if (!product) return null;

  const handleOptionToggle = (option, modifier) => {
    const isSingleChoice =
      modifier.max_selection === 1 ||
      modifier.name.toLowerCase().includes("tamaño");

    if (isSingleChoice) {
      const filtered = selectedOptions.filter(
        (opt) =>
          !modifier.modifier_options.some((modOpt) => modOpt.id === opt.id),
      );
      setSelectedOptions([...filtered, option]);
    } else {
      const exists = selectedOptions.find((o) => o.id === option.id);
      if (exists) {
        setSelectedOptions(selectedOptions.filter((o) => o.id !== option.id));
      } else {
        setSelectedOptions([...selectedOptions, option]);
      }
    }
  };

  const optionsTotal = selectedOptions.reduce(
    (acc, opt) => acc + (Number(opt.extra_price) || 0),
    0,
  );
  const finalUnitPrice = Number(product.price) + optionsTotal;
  const finalTotal = finalUnitPrice * quantity;

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAdd = () => {
    addToCart(product, selectedOptions, notes, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* HEADER DINÁMICO (Imagen y Botón Volver) */}
      <div className="relative h-72 w-full flex-shrink-0">
        {loading ? (
          <div className="w-full h-full bg-slate-200 animate-pulse" />
        ) : (
          <>
            <img
              src={
                product.image_url ||
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
              }
              className="w-full h-full object-cover"
              alt={product.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />
          </>
        )}

        {/* Botón Cerrar/Volver */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 bg-white/90 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <svg
            className="w-6 h-6 text-slate-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* CONTENIDO SCROLLEABLE */}
      <div className="flex-1 overflow-y-auto px-6 pb-10 -mt-8 relative z-10 bg-slate-950 rounded-t-[2.5rem]">
        {loading ? (
          <>
            {/* Skeleton para categoría */}
            <div className="pt-8 space-y-4">
              <div className="h-3 bg-slate-200 rounded w-24 animate-pulse" />
              {/* Skeleton para título y precio */}
              <div className="flex justify-between items-start mt-1 gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-8 bg-slate-200 rounded animate-pulse" />
                  <div className="h-8 bg-slate-200 rounded w-3/4 animate-pulse" />
                </div>
                <div className="h-8 bg-slate-200 rounded w-24 animate-pulse" />
              </div>
              {/* Skeleton para descripción */}
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse" />
              </div>
            </div>

            {/* Skeleton para modificadores */}
            <div className="mt-10 space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-40 animate-pulse" />
                  <div className="space-y-2">
                    {[1, 2].map((j) => (
                      <div
                        key={j}
                        className="h-16 bg-slate-100 rounded-2xl animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Skeleton para notas */}
            <div className="mt-10 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-48 animate-pulse" />
              <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
            </div>
          </>
        ) : (
          <>
            <div className="pt-8">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                {product.category || "Especialidad"}
              </span>
              <div className="flex justify-between items-start mt-1">
                <h2 className="text-3xl font-black text-white leading-tight">
                  {product.name}
                </h2>
                {Number(product.price) > 0 && (
                  <span className="text-xl font-black text-white">
                    ${Number(product.price).toLocaleString("es-CO")}
                  </span>
                )}
              </div>
              <p className="text-white/50 mt-5 text-sm leading-relaxed">
                {product.description || "Sin descripción disponible."}
              </p>
            </div>

            {/* MODIFICADORES */}
            <div className="mt-10 space-y-10">
              {modifiers.map((mod) => (
                <div key={mod.id}>
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="text-sm font-black uppercase text-slate-900 tracking-tighter">
                      {mod.name}
                    </h3>
                    {mod.is_required && (
                      <span className="text-[10px] font-bold text-white bg-orange-500 px-2 py-0.5 rounded-full uppercase">
                        Obligatorio
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3">
                    {mod.modifier_options.map((opt) => {
                      const isSelected = selectedOptions.some(
                        (o) => o.id === opt.id,
                      );
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleOptionToggle(opt, mod)}
                          className={`flex justify-between items-center p-5 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                            isSelected
                              ? "border-orange-500 bg-orange-50/50"
                              : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-orange-500 bg-orange-500" : "border-slate-300"}`}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                            <span
                              className={`text-sm font-bold ${isSelected ? "text-slate-900" : "text-slate-600"}`}
                            >
                              {opt.name}
                            </span>
                          </div>
                          <span className="text-sm font-black text-slate-900">
                            {opt.extra_price > 0
                              ? `+$${opt.extra_price.toLocaleString("es-CO")}`
                              : "Incluido"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* NOTAS */}
            <div className="mt-10">
              <h3 className="text-sm font-black uppercase text-white mb-4 tracking-tighter">
                ¿Alguna instrucción especial?
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instrucciones especiales..."
                className="w-full p-5 bg-slate-50 rounded-2xl text-sm border-2 border-slate-100 focus:border-orange-500 focus:ring-0 min-h-[120px] transition-colors"
              />
              <p className="text-white/50 text-xs mt-2">
                Las instrucciones adicionales pueden generar costos extra, ya
                que están fuera de las opciones estándar.
              </p>
            </div>
          </>
        )}
      </div>

      {/* FOOTER FIJO */}
      <div className="p-6 bg-slate-950 border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0,0.05)] flex items-center gap-10">
        <div className="flex items-center border-2 border-slate-200 rounded-full px-3 py-1">
          <button
            onClick={decrement}
            className="w-12 h-12 rounded-full text-white flex items-center justify-center text-2xl font-bold active:scale-90 transition-transform focus:outline-none"
          >
            −
          </button>
          <span className="text-2xl font-black text-white w-8 text-center">
            {quantity}
          </span>
          <button
            onClick={increment}
            className="w-12 h-12 rounded-full text-white flex items-center justify-center text-2xl font-bold active:scale-90 transition-transform focus:outline-none"
          >
            +
          </button>
        </div>
        <button
          onClick={handleAdd}
          className="flex-1 bg-green text-white py-1 rounded-full flex flex-col items-center justify-center hover:bg-green-600 active:scale-95 transition-all shadow-xl shadow-slate-200"
        >
          {/* Texto Principal */}
          <span className="font-black uppercase tracking-widest text-[14px] text-blancopuro">
            Agregar
          </span>

          {/* Precio Debajo */}
          <span className="font-black uppercase tracking-widest text-[14px] text-blancopuro">
            ${finalTotal.toLocaleString("es-CO")}
          </span>
        </button>
      </div>
    </div>
  );
}
