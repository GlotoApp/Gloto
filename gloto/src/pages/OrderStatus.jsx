import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../shared/lib/supabase";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  PackageCheck,
  ArrowLeft,
} from "lucide-react";

export default function OrderStatus() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    // 1. Cargar estado inicial
    const fetchOrder = async () => {
      const { data } = await supabase
        .from("orders")
        .select(`*, businesses(name)`)
        .eq("id", orderId)
        .single();
      setOrder(data);
      setLoading(false);
    };

    fetchOrder();

    // 2. Suscribirse a cambios REALTIME de ESTE pedido
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
          console.log("Cambio de estado detectado:", payload.new.status);
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
      <div className="min-h-screen bg-white flex items-center justify-center font-black italic uppercase">
        Rastreando Pedido...
      </div>
    );
  if (!order)
    return <div className="p-20 text-center">Pedido no encontrado.</div>;

  // Configuración de visualización por estado
  const statusConfig = {
    pending: {
      label: "Recibido",
      icon: <Clock className="animate-pulse" />,
      color: "text-amber-500",
      bg: "bg-amber-50",
      desc: "Esperando que el restaurante confirme.",
    },
    preparing: {
      label: "En Cocina",
      icon: <ChefHat className="animate-bounce" />,
      color: "text-sky-500",
      bg: "bg-sky-50",
      desc: "El chef está preparando tu comida.",
    },
    ready: {
      label: "¡Listo!",
      icon: <PackageCheck className="scale-125" />,
      color: "text-green-500",
      bg: "bg-green-50",
      desc: "Tu pedido está listo para entrega.",
    },
    completed: {
      label: "Entregado",
      icon: <CheckCircle2 />,
      color: "text-slate-900",
      bg: "bg-slate-100",
      desc: "¡Gracias por elegir Gloto!",
    },
  };

  const currentStatus = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-white text-black p-6 md:p-16">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"
        >
          <ArrowLeft size={14} /> Volver al Inicio
        </button>

        <header className="mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500 mb-2 block">
            Estado del Pedido
          </span>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-4">
            #{order.id.slice(0, 5)}
          </h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-tight">
            Restaurante:{" "}
            <span className="text-black">{order.businesses?.name}</span>
          </p>
        </header>

        {/* CARD DE ESTADO DINÁMICA */}
        <div
          className={`${currentStatus.bg} rounded-[3rem] p-10 border border-slate-100 mb-8 transition-all duration-500`}
        >
          <div className={`${currentStatus.color} mb-6 flex justify-center`}>
            {/* Renderizamos el icono con el tamaño escalado */}
            {window.cloneElement?.(currentStatus.icon, { size: 64 }) || (
              <div className="text-6xl">{currentStatus.icon}</div>
            )}
          </div>

          <h2
            className={`text-4xl font-black italic uppercase tracking-tighter text-center mb-2 ${currentStatus.color}`}
          >
            {currentStatus.label}
          </h2>
          <p className="text-center text-slate-600 font-medium px-4">
            {currentStatus.desc}
          </p>
        </div>

        {/* LÍNEA DE TIEMPO VISUAL */}
        <div className="flex justify-between items-center px-4 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
          {["pending", "preparing", "ready", "completed"].map((s, index) => (
            <div
              key={s}
              className={`relative z-10 w-4 h-4 rounded-full transition-all duration-700 ${
                order.status === s ||
                index <=
                  ["pending", "preparing", "ready", "completed"].indexOf(
                    order.status,
                  )
                  ? "bg-sky-500 scale-125"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        <div className="mt-20 border-t border-slate-100 pt-10 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">
            ¿Algún problema con tu pedido?
          </p>
          <button className="text-xs font-black uppercase italic underline decoration-sky-500 decoration-2 underline-offset-4">
            Contactar Soporte Gloto
          </button>
        </div>
      </div>
    </div>
  );
}
