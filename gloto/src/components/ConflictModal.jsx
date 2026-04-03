import { useCartStore } from "../app/useCartStore";

export default function ConflictModal() {
  const {
    showConflictModal,
    pendingProduct,
    clearAndAdd,
    cancelConflict,
    cart,
  } = useCartStore();

  if (!showConflictModal || !pendingProduct) return null;

  const currentBusinessName = cart.length > 0 ? cart[0].name : "Esta tienda";

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-end animate-in fade-in">
      <div className="w-full bg-slate-950 rounded-t-[2.5rem] p-6 space-y-6 border-t border-slate-800 animate-in slide-in-from-bottom duration-300">
        {/* ICONO DE ADVERTENCIA */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4v2m0 0v2m0-6v2m0-4v2"
              />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
        </div>

        {/* TÍTULO */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white">Cambiar de tienda</h2>
          <p className="text-sm text-slate-400">
            Tu carrito contiene productos de{" "}
            <span className="font-bold text-orange-500">
              {currentBusinessName}
            </span>
          </p>
        </div>

        {/* DESCRIPCIÓN */}
        <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
          <p className="text-sm text-slate-300 leading-relaxed">
            Para agregar productos de otra tienda, debes vaciar tu carrito
            actual.
            <br />
            <span className="text-xs text-slate-500 mt-2 block">
              ¿Deseas continuar?
            </span>
          </p>
        </div>

        {/* BOTONES */}
        <div className="space-y-3">
          <button
            onClick={clearAndAdd}
            className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-orange-500/20"
          >
            Vaciar carrito y continuar
          </button>
          <button
            onClick={cancelConflict}
            className="w-full bg-slate-900 text-slate-300 font-black py-4 rounded-2xl border border-slate-800 active:scale-95 transition-transform hover:bg-slate-800"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
