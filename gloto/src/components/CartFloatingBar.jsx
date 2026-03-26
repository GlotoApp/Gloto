import { useCartStore } from "../app/useCartStore";
import { useNavigate } from "react-router-dom";

export default function CartFloatingBar() {
  const cart = useCartStore((state) => state.cart);
  const navigate = useNavigate();

  // Calculamos el total y la cantidad de items
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  // Si no hay nada en el carrito, el componente no se renderiza (invisible)
  if (cart.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center px-6 z-50">
      <div className="w-full max-w-2xl bg-black text-white p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between animate-in fade-in slide-in-from-bottom-10 duration-700 border border-slate-800">
        <div className="flex items-center gap-5">
          {/* Contador Circular */}
          <div className="bg-sky-500 text-white w-10 h-10 flex items-center justify-center rounded-full font-black text-sm italic shadow-lg shadow-sky-500/20">
            {totalItems}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
              Tu selección
            </p>
            <p className="text-2xl font-black italic tracking-tighter">
              ${totalPrice.toLocaleString()}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/checkout")}
          className="bg-sky-500 hover:bg-white hover:text-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-xl shadow-sky-500/10"
        >
          Ver Pedido <span>→</span>
        </button>
      </div>
    </div>
  );
}
