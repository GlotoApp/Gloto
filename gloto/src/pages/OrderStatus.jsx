import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../shared/lib/supabase";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  PackageCheck,
  ArrowLeft,
  MessageCircle,
  MapPin,
  Receipt,
  HelpCircle,
} from "lucide-react";

export default function OrderStatus() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      // Trae la orden, los items y los productos
      const { data } = await supabase
        .from("orders")
        .select(`*, businesses(name), order_items(*, products(name))`)
        .eq("id", orderId)
        .single();
      setOrder(data);
      setLoading(false);
    };

    fetchOrder();

    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder((prev) => ({ ...prev, status: payload.new.status }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-sky-500/10 border-t-sky-500 rounded-full animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500 animate-pulse">
          Sincronizando...
        </span>
      </div>
    );

  const statusConfig = {
    pending: {
      label: "Recibido",
      icon: <Clock size={40} />,
      color: "text-amber-400",
      bg: "from-amber-500/20 to-transparent",
      desc: "El restaurante está revisando tu pedido.",
      step: 0,
    },
    preparing: {
      label: "En Cocina",
      icon: <ChefHat size={40} />,
      color: "text-sky-400",
      bg: "from-sky-500/20 to-transparent",
      desc: "Tu comida se está preparando en este momento.",
      step: 1,
    },
    ready: {
      label: "¡Listo!",
      icon: <PackageCheck size={40} />,
      color: "text-green-400",
      bg: "from-green-500/20 to-transparent",
      desc: "¡Todo listo! Tu pedido espera por ti.",
      step: 2,
    },
    completed: {
      label: "Entregado",
      icon: <CheckCircle2 size={40} />,
      color: "text-slate-400",
      bg: "from-slate-500/10 to-transparent",
      desc: "Pedido finalizado. ¡Que lo disfrutes!",
      step: 3,
    },
  };

  const currentStatus = statusConfig[order.status] || statusConfig.pending;
  const steps = ["pending", "preparing", "ready", "completed"];
  const currentStepIndex = steps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-sky-500/30">
      {/* HEADER DE NAVEGACIÓN */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/60 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="p-2.5 bg-slate-900 rounded-2xl hover:bg-slate-800 transition-all border border-white/5"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
              Orden
            </span>
            <span className="font-mono text-sm text-sky-500 font-bold tracking-tighter">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-xl mx-auto pt-28 px-6 pb-24">
        {/* TITULAR DINÁMICO */}
        <header className="mb-8">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-3">
            Tu <span className="text-sky-500 italic">Pedido</span>
          </h1>
          <div className="flex items-center gap-3 bg-slate-900/50 self-start px-4 py-2 rounded-2xl border border-white/5">
            <MapPin size={14} className="text-sky-500" />
            <span className="text-xs font-black uppercase tracking-tight">
              {order.businesses?.name}
            </span>
          </div>
        </header>

        {/* HERO CARD (STATUS) */}
        <div
          className={`relative overflow-hidden rounded-[2.5rem] p-8 border border-white/10 mb-6 bg-gradient-to-br ${currentStatus.bg} transition-all duration-1000`}
        >
          <div className="flex items-center gap-6 relative z-10">
            <div
              className={`p-5 rounded-[2rem] bg-slate-950/50 backdrop-blur-md border border-white/10 ${currentStatus.color} shadow-2xl`}
            >
              {currentStatus.icon}
            </div>
            <div>
              <h2
                className={`text-2xl font-black italic uppercase tracking-tighter leading-none mb-1 ${currentStatus.color}`}
              >
                {currentStatus.label}
              </h2>
              <p className="text-slate-400 text-xs font-bold leading-snug max-w-[180px]">
                {currentStatus.desc}
              </p>
            </div>
          </div>
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Receipt size={80} className="-rotate-12" />
          </div>
        </div>

        {/* PROGRESS TRACKER */}
        <div className="bg-slate-900/30 backdrop-blur-sm rounded-[2rem] p-8 border border-white/5 mb-8">
          <div className="relative flex justify-between">
            {/* Línea Base */}
            <div className="absolute top-2.5 left-0 w-full h-[3px] bg-slate-800 rounded-full" />
            {/* Línea Activa */}
            <div
              className="absolute top-2.5 left-0 h-[3px] bg-sky-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(14,165,233,0.6)]"
              style={{ width: `${(currentStepIndex / 3) * 100}%` }}
            />

            {steps.map((s, i) => (
              <div key={s} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full border-[3px] transition-all duration-500 ${
                    i <= currentStepIndex
                      ? "bg-sky-500 border-slate-950 scale-110"
                      : "bg-slate-900 border-slate-800"
                  } ${i === currentStepIndex ? "animate-pulse ring-4 ring-sky-500/20" : ""}`}
                />
                <span
                  className={`text-[8px] font-black uppercase mt-3 tracking-tighter ${
                    i <= currentStepIndex ? "text-white" : "text-slate-600"
                  }`}
                >
                  {statusConfig[s].label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* DETALLE DEL PEDIDO: Productos, método de pago y entrega */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
              Productos pedidos
            </p>
            <ul className="space-y-2">
              {order.order_items?.map((item) => {
                let options = [];
                try {
                  if (typeof item.options === "string") {
                    options = JSON.parse(item.options);
                  } else if (Array.isArray(item.options)) {
                    options = item.options;
                  }
                } catch {}
                // Calcular el precio unitario con extras
                const optionsTotal = options.reduce(
                  (acc, opt) => acc + (Number(opt.extra_price) || 0),
                  0,
                );
                const unitPrice =
                  Number(item.unit_price) + optionsTotal ||
                  Number(item.unit_price) ||
                  0;
                return (
                  <li
                    key={item.id}
                    className="flex flex-col gap-1 bg-slate-900/60 rounded-xl p-3 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-white text-base bg-sky-500/80 rounded-lg px-2 py-0.5">
                        {item.quantity}x
                      </span>
                      <span className="font-bold text-sky-400 text-base">
                        {item.products?.name || "Producto"}
                      </span>
                      <span className="ml-auto text-xs font-bold text-green-400 bg-green-900/40 rounded-lg px-2 py-0.5">
                        ${unitPrice.toLocaleString("es-CO")}
                      </span>
                    </div>
                    {(options.length > 0 ||
                      (item.notes && item.notes.trim() !== "")) && (
                      <div className="ml-2 flex flex-col gap-1 mt-1">
                        {options.length > 0 && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-bold text-orange-400 whitespace-nowrap">
                              Opciones:
                            </span>
                            <span className="text-xs text-orange-200">
                              {options.map((opt) => opt.name).join(", ")}
                            </span>
                          </div>
                        )}
                        {item.notes && item.notes.trim() !== "" && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-bold text-sky-400 whitespace-nowrap">
                              Indicaciones:
                            </span>
                            <span className="text-xs text-slate-300 italic">
                              {item.notes}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="h-px bg-white/10 my-4" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Monto Total
                </p>
                <p className="text-xl font-black italic text-sky-500">
                  ${Number(order.total_price).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Método de Pago
                </p>
                <p className="text-xs font-bold uppercase tracking-tight text-white">
                  {order.payment_method
                    ? order.payment_method
                    : "No especificado"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Método de Entrega
                </p>
                <p className="text-xs font-bold uppercase tracking-tight text-white">
                  {order.delivery_type
                    ? order.delivery_type
                    : "No especificado"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ACCIONES RÁPIDAS */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-3 py-5 bg-white text-slate-950 rounded-3xl font-black uppercase text-xs hover:scale-[1.02] active:scale-[0.98] transition-all">
            <MessageCircle size={18} strokeWidth={3} />
            Soporte
          </button>
          <button className="flex-1 flex items-center justify-center gap-3 py-5 bg-slate-900 text-white border border-white/5 rounded-3xl font-black uppercase text-xs hover:bg-slate-800 transition-all">
            <HelpCircle size={18} strokeWidth={2} />
            Ayuda
          </button>
        </div>
      </main>
    </div>
  );
}
