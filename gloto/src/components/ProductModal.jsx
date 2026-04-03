import { useState, useEffect } from "react";
import { useCartStore } from "../app/useCartStore";
import { supabase } from "../shared/lib/supabase";
import { useAuth } from "../app/AuthProvider";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function ProductModal({ product, onClose }) {
  const [modifiers, setModifiers] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Bloquear el scroll del cuerpo
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

  // Función para compartir producto
  const handleShareProduct = async () => {
    const shareData = {
      title: product.name,
      text: `¡Mira este proucto: ${product.name}! \n${product.description || ""}`,
      url: window.location.href, // Compartimos la URL actual que contiene el slug del negocio
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("¡Enlace del producto copiado!");
      }
    } catch (err) {
      console.log("Error al compartir:", err);
    }
  };

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
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    addToCart(product, selectedOptions, notes, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* HEADER DINÁMICO */}
      <div className="relative h-72 w-full flex-shrink-0">
        {loading ? (
          <div className="w-full h-full bg-slate-200 animate-pulse" />
        ) : (
          <>
            <img
              src={product.image_url || "/default.jpg"} // Si el archivo está en public/logo.png
              className="w-full h-full object-cover"
              alt={product.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20" />
          </>
        )}

        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 bg-white/90 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-20"
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

        {/* BOTÓN COMPARTIR (Nuevo) */}
        {!loading && (
          <button
            onClick={handleShareProduct}
            className="absolute top-6 right-6 bg-white/90 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-20"
          >
            <svg
              className="w-5 h-5 text-slate-900"
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
        )}
      </div>

      {/* CONTENIDO SCROLLEABLE */}
      <div className="flex-1 overflow-y-auto px-6 pb-10 -mt-8 relative z-10 bg-slate-950 rounded-t-[2.5rem]">
        {loading ? (
          <div className="pt-8 space-y-4">
            <div className="h-3 bg-slate-800 rounded w-24 animate-pulse" />
            <div className="flex justify-between items-start mt-1 gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-8 bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="h-8 bg-slate-800 rounded w-24 animate-pulse" />
            </div>
          </div>
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
                    <h3 className="text-sm font-black uppercase text-white tracking-tighter">
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
                              ? "border-orange-500 bg-orange-500/10"
                              : "border-slate-800 bg-slate-900 hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-orange-500 bg-orange-500" : "border-slate-600"}`}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                            <span
                              className={`text-sm font-bold ${isSelected ? "text-white" : "text-slate-400"}`}
                            >
                              {opt.name}
                            </span>
                          </div>
                          <span className="text-sm font-black text-white">
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
                placeholder="Escribe aquí si quieres añadir instrucciones..."
                className="w-full p-5 bg-slate-900 rounded-2xl text-sm border-2 border-slate-800 text-white focus:border-orange-500 focus:ring-0 min-h-[120px] transition-colors"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Las instrucciones adicionales pueden generar costos extra, ya que
              están fuera de las opciones estándar.
            </p>
          </>
        )}
      </div>

      {/* FOOTER FIJO */}
      <div className="p-6 bg-slate-950 border-t border-slate-800 flex items-center gap-6">
        <div className="flex items-center border-2 border-slate-800 rounded-full px-2 py-1">
          <button
            onClick={decrement}
            className="w-10 h-10 rounded-full text-white text-2xl font-bold active:scale-90 transition-transform"
          >
            −
          </button>
          <span className="text-xl font-black text-white w-8 text-center">
            {quantity}
          </span>
          <button
            onClick={increment}
            className="w-10 h-10 rounded-full text-white text-2xl font-bold active:scale-90 transition-transform"
          >
            +
          </button>
        </div>
        <button
          onClick={handleAdd}
          className="flex-1 bg-green-500 text-white h-14 rounded-full flex flex-col items-center justify-center active:scale-95 transition-all shadow-xl shadow-green-500/20"
        >
          <span className="font-black uppercase tracking-widest text-[12px]">
            Agregar
          </span>
          <span className="font-black text-[16px]">
            ${finalTotal.toLocaleString("es-CO")}
          </span>
        </button>
      </div>

      {/* MODAL DE LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl animate-in scale-in">
            <div className="p-8 text-center">
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>

              <div className="mb-6">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                  🔐
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
                  Inicia Sesión
                </h2>
                <p className="text-sm text-slate-500 font-bold mt-2">
                  Debes iniciar sesión para agregar productos
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    localStorage.setItem(
                      "redirectAfterLogin",
                      window.location.pathname,
                    );
                    navigate("/auth");
                  }}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white font-black py-4 rounded-2xl uppercase text-xs tracking-widest transition-all active:scale-95"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full border-2 border-slate-200 hover:border-slate-300 text-slate-900 font-black py-4 rounded-2xl uppercase text-xs tracking-widest transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
