import { useState, useEffect } from "react";
import { useCartStore } from "../app/useCartStore";
import { supabase } from "../shared/lib/supabase";

export default function ProductModal({ product, onClose }) {
  const [modifiers, setModifiers] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);

  if (!product) return null;

  // 1. Cargar modificadores (Tamaños, Adiciones) desde Supabase
  useEffect(() => {
    async function loadModifiers() {
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
  }, [product.id]);

  // 2. Lógica para seleccionar/deseleccionar opciones
  const handleOptionToggle = (option, modifier) => {
    // Si el modificador es de selección única (como Tamaño), quitamos la opción anterior de ese grupo
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
      // Si es múltiple (como Ingredientes Extra)
      const exists = selectedOptions.find((o) => o.id === option.id);
      if (exists) {
        setSelectedOptions(selectedOptions.filter((o) => o.id !== option.id));
      } else {
        setSelectedOptions([...selectedOptions, option]);
      }
    }
  };

  // 3. Cálculo de precio en tiempo real (Base + Opciones)
  const optionsTotal = selectedOptions.reduce(
    (acc, opt) => acc + (Number(opt.extra_price) || 0),
    0,
  );
  const finalUnitPrice = Number(product.price) + optionsTotal;

  const handleAdd = () => {
    // Enviamos el producto con sus opciones elegidas y las notas
    addToCart(product, selectedOptions, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        {/* Header con Imagen */}
        <div className="h-48 bg-slate-100 relative flex-shrink-0">
          <img
            src={product.image_url || "https://via.placeholder.com/500x300"}
            className="w-full h-full object-cover"
            alt={product.name}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-md w-8 h-8 rounded-full flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Contenido Scrolleable */}
        <div className="p-8 overflow-y-auto flex-1">
          <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em]">
            {product.category}
          </span>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mt-1">
            {product.name}
          </h2>
          <p className="text-slate-500 mt-2 text-xs leading-relaxed">
            {product.description}
          </p>

          {/* Renderizado de Modificadores (Pizza Tamaño, Extras, etc) */}
          <div className="mt-8 space-y-8">
            {loading ? (
              <p className="text-center text-xs font-bold animate-pulse"></p>
            ) : (
              modifiers.map((mod) => (
                <div key={mod.id}>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex justify-between">
                    {mod.name}{" "}
                    {mod.is_required && (
                      <span className="text-red-500">(Obligatorio)</span>
                    )}
                  </h3>
                  <div className="grid gap-2">
                    {mod.modifier_options.map((opt) => {
                      const isSelected = selectedOptions.some(
                        (o) => o.id === opt.id,
                      );
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleOptionToggle(opt, mod)}
                          className={`flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${
                            isSelected
                              ? "border-black bg-slate-50"
                              : "border-transparent bg-slate-50/50 hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className={`text-sm font-bold ${isSelected ? "text-black" : "text-slate-500"}`}
                          >
                            {opt.name}
                          </span>
                          <span className="text-sm font-black italic">
                            {opt.extra_price > 0
                              ? `+$${opt.extra_price.toLocaleString()}`
                              : "Gratis"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Notas del cliente */}
          <div className="mt-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
              Notas o instrucciones
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Sin cebolla, que la masa esté bien tostada..."
              className="w-full p-4 bg-slate-50 rounded-2xl text-sm border-none focus:ring-2 focus:ring-sky-500 min-h-[80px]"
            />
          </div>
        </div>

        {/* Footer con Botón de Acción */}
        <div className="p-8 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={handleAdd}
            className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-sky-500 transition-all shadow-xl"
          >
            Agregar por ${finalUnitPrice.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}
