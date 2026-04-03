import { useCartStore } from "../app/useCartStore";
import { useNavigate } from "react-router-dom";
import { supabase } from "../shared/lib/supabase";
import { useState } from "react";
import {
  X,
  ArrowLeft,
  CreditCard,
  Banknote,
  Smartphone,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
  Loader2,
  MapPin,
  Home,
  Package,
  Trash2,
} from "lucide-react";

export default function Checkout() {
  const { cart, addToCart, removeFromCart, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [deliveryType, setDeliveryType] = useState(null);

  // Cálculo corregido: Precio base + Opciones extras
  const calculateItemTotal = (item) => {
    const optionsExtra =
      item.selectedOptions?.reduce(
        (acc, opt) => acc + (Number(opt.extra_price) || 0),
        0,
      ) || 0;
    return (item.price + optionsExtra) * item.quantity;
  };

  const total = cart.reduce((acc, item) => acc + calculateItemTotal(item), 0);

  const handleConfirmOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setShowLoginModal(true);
        return;
      }

      const businessId = cart[0].business_id;

      // 1. Insertar la Orden principal
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

      // 2. Insertar los items con sus opciones (JSON)
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: calculateItemTotal(item),
        options: item.selectedOptions || [],
        notes: item.notes || "",
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      navigate(`/order-status/${order.id}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un problema al procesar tu orden. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-32 h-32 bg-slate-900 border border-white/5 rounded-[3rem] flex items-center justify-center mb-8 text-sky-500 shadow-3xl">
          <ShoppingBag size={56} strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4">
          Vacío Absoluto
        </h2>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mb-8">
          Tu bolsa de Gloto no tiene nada aún
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-sky-500 text-slate-950 px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-xl shadow-sky-500/20"
        >
          Volver al Menú
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-sky-500/30 pb-32">
      {/* NAVEGACIÓN SUPERIOR */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl  flex items-center justify-center group-hover:bg-sky-500 group-hover:text-slate-950 transition-all">
              <ArrowLeft size={18} />
            </div>
          </button>
          <div className="text-center">
            <h1 className="text-lg font-black italic uppercase tracking-tighter leading-none">
              RESUMEN
            </h1>
          </div>
          <div className="w-10 h-10" /> {/* Spacer para centrado */}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-16 px-6 py-12">
        {/* LADO IZQUIERDO: DETALLE DE PRODUCTOS */}
        <div className="lg:col-span-7 space-y-10">
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8 flex items-center gap-4">
              Productos <div className="h-px bg-white/5 flex-1" />
            </h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <article
                  key={item.cartItemId}
                  className="group border-b border-white/5 border-botoorounded-[2rem] p-5 hover:bg-white/[0.04] transition-all"
                >
                  {/* LÍNEA 1: IMAGEN + NOMBRE */}
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                      <img
                        src={item.image_url}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        alt={item.name}
                      />
                      <div className="absolute top-0.5 right-0.5 bg-sky-500 text-slate-950 text-[9px] font-black w-5 h-5 rounded-md flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      {/* LÍNEA 1: NOMBRE (El detalle sutil) */}
                      <div className="mb-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-sky-400 transition-colors leading-none">
                          {item.name}
                        </h3>
                      </div>

                      {/* LÍNEA 2: PRECIO + INCREMENTADORES (La zona de acción) */}
                      <div className="flex items-center justify-between">
                        <p className="text-[15px] font-black tracking-tighter text-white leading-none">
                          ${calculateItemTotal(item).toLocaleString()}
                        </p>

                        <div className="flex items-center bg-white/[0.05] rounded-full  gap-2">
                          {/* BOTÓN MENOS */}
                          <button
                            onClick={() => removeFromCart(item.cartItemId)}
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all active:scale-90"
                          >
                            <span className="text-xl font-light">−</span>
                          </button>

                          {/* CANTIDAD */}
                          <span className="font-black text-white text-sm w-4 text-center tabular-nums">
                            {item.quantity}
                          </span>

                          {/* BOTÓN MÁS */}
                          <button
                            onClick={() =>
                              addToCart(item, item.selectedOptions, item.notes)
                            }
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-sky-500/20 text-slate-400 hover:text-sky-400 transition-all active:scale-90 "
                          >
                            <span className="text-xl font-light">+</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LÍNEA 3: INDICACIONES */}
                  {item.notes && (
                    <div className="flex items-start gap-3 pt-4 ">
                      <div className="w-1 h-1 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                      <p className="text-[9px] font-bold text-orange-400 italic">
                        {item.notes}
                      </p>
                    </div>
                  )}

                  {/* OPCIONES (DEBAJO) */}
                  {item.selectedOptions && item.selectedOptions.length > 0 && (
                    <div
                      className={`flex flex-wrap gap-1.5 ${item.notes ? "mt-3" : "mt-4"}`}
                    >
                      {item.selectedOptions.map((opt) => (
                        <span
                          key={opt.id}
                          className="text-[8px] font-black bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-md uppercase"
                        >
                          + {opt.name}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
            <button
              onClick={() => {
                if (confirm("¿Deseas vaciar el carrito?")) {
                  clearCart();
                  navigate("/");
                }
              }}
              className="w-full mt-4 py-3 rounded-xl font-black uppercase tracking-[0.1em] text-xs flex items-center justify-center gap-3 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
            >
              <Trash2 size={16} />
              Vaciar Todo
            </button>
          </section>
        </div>

        {/* LADO DERECHO: PAGO Y CONTROL */}
        <div className="lg:col-span-5 mt-12 lg:mt-0">
          <div className="lg:sticky lg:top-32 space-y-8">
            {/* SELECTOR DE TIPO DE ENTREGA */}
            <section className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-5 mb-6 backdrop-blur-md">
              <header className="mb-5">
                <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400/50 text-center">
                  Método de Entrega
                </h3>
              </header>

              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: "pickup",
                    label: "Recoger",
                    desc: "Retira directamente en nuestro local",
                    icon: <Home size={16} />,
                  },
                  {
                    id: "point",
                    label: "En Punto",
                    desc: "Entrega en mesa o punto de encuentro",
                    icon: <MapPin size={16} />,
                  },
                  {
                    id: "delivery",
                    label: "Domicilio",
                    desc: "Envío rápido hasta tu ubicación",
                    icon: <Package size={16} />,
                  },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setDeliveryType(type.id)}
                    className={`flex items-center gap-4 p-3 rounded-[1.5rem] border transition-all duration-300 relative group ${
                      deliveryType === type.id
                        ? "border-orange-500/40 bg-orange-500/10 shadow-lg shadow-orange-500/5"
                        : "border-white/5 bg-slate-950/20 opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* ICONO LADO IZQUIERDO */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                        deliveryType === type.id
                          ? "bg-orange-500 text-slate-950 scale-105 shadow-orange-500/20 shadow-md"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {type.icon}
                    </div>

                    {/* TEXTOS */}
                    <div className="text-left">
                      <p
                        className={`text-[10px] font-black uppercase tracking-wider leading-none mb-1 ${
                          deliveryType === type.id
                            ? "text-orange-500"
                            : "text-white"
                        }`}
                      >
                        {type.label}
                      </p>
                      <p className="text-[8px] font-medium text-slate-500 uppercase leading-tight tracking-tight">
                        {type.desc}
                      </p>
                    </div>

                    {/* INDICADOR ACTIVO */}
                    {deliveryType === type.id && (
                      <div className="absolute right-4 bg-orange-500 w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,1)]" />
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* SELECTOR DE PAGO */}
            <section className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-5 backdrop-blur-md">
              <header className="mb-4">
                <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400/50 text-center">
                  Método de Pago
                </h3>
              </header>

              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: "cash",
                    label: "Efectivo",
                    desc: "Pago contra entrega",
                    icon: <Banknote size={16} />,
                  },
                  {
                    id: "card",
                    label: "Datáfono",
                    desc: "Tarjeta Crédito / Débito",
                    icon: <CreditCard size={16} />,
                  },
                  {
                    id: "transfer",
                    label: "Transferencia",
                    desc: "Nequi / Daviplata / Bancolombia",
                    icon: <Smartphone size={16} />,
                  },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-4 p-3 rounded-[1.5rem] border transition-all duration-300 relative group ${
                      paymentMethod === method.id
                        ? "border-sky-500/40 bg-sky-500/10 shadow-lg shadow-sky-500/5"
                        : "border-white/5 bg-slate-950/20 opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* ICONO */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                        paymentMethod === method.id
                          ? "bg-sky-500 text-slate-950 scale-105 shadow-sky-500/20 shadow-md"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {method.icon}
                    </div>

                    {/* TEXTOS COMPRIMIDOS */}
                    <div className="text-left">
                      <p
                        className={`text-[10px] font-black uppercase tracking-wider leading-none mb-1 ${
                          paymentMethod === method.id
                            ? "text-sky-400"
                            : "text-white"
                        }`}
                      >
                        {method.label}
                      </p>
                      <p className="text-[8px] font-medium text-slate-500 uppercase leading-tight tracking-tight">
                        {method.desc}
                      </p>
                    </div>

                    {/* INDICADOR LED SKY */}
                    {paymentMethod === method.id && (
                      <div className="absolute right-4 bg-sky-500 w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(14,165,233,1)]" />
                    )}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* LOGIN MODAL TÁCTICO */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 rounded-[3.5rem] max-w-sm w-full p-12 text-center relative overflow-hidden shadow-3xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-sky-500" />

            <div className="w-20 h-20 bg-sky-500/10 text-sky-500 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
              <ShieldCheck size={40} />
            </div>

            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">
              Verificación
            </h2>
            <p className="text-[10px] text-slate-400 font-bold mb-10 leading-relaxed uppercase tracking-widest">
              Para garantizar la entrega y rastreo, necesitamos que tu perfil
              esté activo.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => {
                  localStorage.setItem(
                    "redirectAfterLogin",
                    window.location.pathname,
                  );
                  navigate("/auth");
                }}
                className="w-full bg-white text-slate-950 font-black py-6 rounded-[2rem] uppercase text-[10px] tracking-widest hover:bg-sky-400 transition-all active:scale-95"
              >
                Acceder a mi cuenta
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full text-slate-500 font-black py-2 uppercase text-[9px] tracking-[0.3em] hover:text-white transition-colors"
              >
                Volver al carrito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER FIJO CON SUBTOTAL Y ENVIAR */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-white/5 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          {/* VALIDACIÓN */}
          {(!deliveryType || !paymentMethod) && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between gap-3 animate-pulse">
              {/* TEXTO CENTRALIZADO */}
              <p className="flex-1 text-[9px] font-black text-amber-400 uppercase tracking-[0.15em] text-center leading-none">
                {!deliveryType && !paymentMethod
                  ? "Selecciona método de entrega y de pago"
                  : !deliveryType
                    ? "Selecciona método de entrega"
                    : "Selecciona método de pago"}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ">
                Subtotal (COP)
              </p>
              <p className="text-3xl font-black text-white">
                ${total.toLocaleString()}
              </p>
            </div>

            <button
              disabled={isSubmitting || !deliveryType || !paymentMethod}
              onClick={handleConfirmOrder}
              className={`flex-1 max-w-[320px] py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-1 ${
                isSubmitting || !deliveryType || !paymentMethod
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed opacity-60"
                  : "bg-sky-500 text-slate-950 hover:bg-sky-400 active:scale-95 shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Procesando...
                </>
              ) : (
                <>
                  Enviar
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
