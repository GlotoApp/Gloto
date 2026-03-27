import { useCartStore } from "../app/useCartStore";
import { useNavigate } from "react-router-dom";
import { supabase } from "../shared/lib/supabase";
import { useState } from "react";

export default function Checkout() {
  const { cart, addToCart, removeFromCart, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para el método de pago
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleConfirmOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        alert("Debes iniciar sesión para finalizar tu pedido.");
        navigate("/auth");
        return;
      }

      // 1. Crear la cabecera del pedido
      const businessId = cart[0].business_id;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: user.id,
          business_id: businessId,
          total_price: total,
          status: "pending",
          payment_method: paymentMethod,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Crear el detalle del pedido (Incluyendo opciones y notas)
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
        options: item.selectedOptions || [],
        notes: item.notes || "",
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // --- CAMBIO AQUÍ: Redirección al Status en lugar de al Home ---
      clearCart();
      navigate(`/order-status/${order.id}`);
    } catch (error) {
      console.error("Error:", error);
      alert("No pudimos procesar el pedido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-4xl text-black">
          🛒
        </div>
        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">
          Tu carrito está vacío
        </h2>
        <button
          onClick={() => navigate("/")}
          className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-sky-500 transition-all"
        >
          Volver al Menú
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-6 md:p-16">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* COLUMNA IZQUIERDA: Resumen */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-10 flex items-center gap-2 hover:text-black"
          >
            <span>←</span> Editar Orden
          </button>

          <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-12">
            Resumen <br /> <span className="text-sky-500">de Pedido</span>
          </h1>

          <div className="space-y-8">
            {cart.map((item) => (
              <div
                key={item.cartItemId}
                className="border-b border-slate-100 pb-8"
              >
                <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.image_url}
                      className="w-full h-full object-cover"
                      alt={item.name}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-black uppercase italic tracking-tighter leading-none">
                      {item.name}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.selectedOptions?.map((opt) => (
                        <span
                          key={opt.id}
                          className="text-[9px] font-black bg-sky-50 text-sky-600 px-2 py-1 rounded-md uppercase"
                        >
                          + {opt.name}
                        </span>
                      ))}
                    </div>

                    {item.notes && (
                      <p className="mt-2 text-[11px] text-slate-400 italic bg-slate-50 p-2 rounded-lg border-l-2 border-slate-200">
                        "{item.notes}"
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center bg-slate-100 rounded-xl p-1">
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="px-3 font-bold hover:text-sky-500"
                        >
                          -
                        </button>
                        <span className="text-xs font-black w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            addToCart(item, item.selectedOptions, item.notes)
                          }
                          className="px-3 font-bold hover:text-sky-500"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-mono font-bold text-amber-600 text-sm">
                        ${item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: Pago */}
        <div className="lg:sticky lg:top-16 h-fit">
          <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <div className="mb-10">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 text-center">
                Método de Pago
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: "cash", label: "Efectivo", icon: "💵" },
                  { id: "card", label: "Tarjeta (Datáfono)", icon: "💳" },
                  { id: "transfer", label: "Transferencia", icon: "📱" },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === method.id
                        ? "border-black bg-white shadow-md"
                        : "border-transparent bg-slate-100/50 opacity-60"
                    }`}
                  >
                    <span className="font-bold text-sm uppercase">
                      {method.label}
                    </span>
                    <span>{method.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 mb-10 border-t border-slate-200 pt-8">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-widest">
                  Total a Pagar
                </span>
                <span className="text-5xl font-black italic tracking-tighter">
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              disabled={isSubmitting}
              onClick={handleConfirmOrder}
              className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl ${
                isSubmitting
                  ? "bg-slate-200 text-slate-400"
                  : "bg-black text-white hover:bg-sky-500 active:scale-95"
              }`}
            >
              {isSubmitting ? "Procesando..." : "Confirmar Pedido Real"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
