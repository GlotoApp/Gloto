import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../shared/lib/supabase";

// --- CONFIGURACIÓN DE IDENTIDAD VISUAL (MÉTODOS DE ENTREGA) ---
const DELIVERY_STYLES = {
  Domicilio: {
    bg: "bg-purple-500",
    text: "text-purple-400",
    badge: "bg-purple-500/10 border-purple-500/20",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.4)]",
    light: "text-purple-400/50 hover:text-purple-400 hover:bg-purple-500/5",
  },
  Recoger: {
    bg: "bg-blue-500",
    text: "text-blue-400",
    badge: "bg-blue-500/10 border-blue-500/20",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.4)]",
    light: "text-blue-400/50 hover:text-blue-400 hover:bg-blue-500/5",
  },
  "En Punto": {
    bg: "bg-amber-500",
    text: "text-amber-400",
    badge: "bg-amber-500/10 border-amber-500/20",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.4)]",
    light: "text-amber-400/50 hover:text-amber-400 hover:bg-amber-500/5",
  },
};

// --- COMPONENTES DE UI ATÓMICOS ---

const StatusBadge = ({ type }) => {
  const style = DELIVERY_STYLES[type] || {
    text: "text-slate-400",
    badge: "bg-slate-500/10 border-slate-500/20",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${style.text} ${style.badge}`}
    >
      {type}
    </span>
  );
};

const Timer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((new Date() - new Date(startTime)) / 1000);
      setElapsed(seconds);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const format = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`font-mono font-black text-xs ${elapsed > 600 ? "text-red-500 animate-pulse" : "text-slate-400"}`}
    >
      {format(elapsed)}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export default function Kitchen() {
  const { businessId } = useParams();
  const [orders, setOrders] = useState([]);
  const [businessName, setBusinessName] = useState("Cargando...");
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [activeFilters, setActiveFilters] = useState([
    "Domicilio",
    "Recoger",
    "En Punto",
  ]);
  const audioRef = useRef(new Audio("/notification.mp3"));

  useEffect(() => {
    if (!businessId) return;

    const fetchInitialData = async () => {
      const { data } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();
      if (data) setBusinessName(data.name);
      await fetchOrders();
    };

    fetchInitialData();

    const channel = supabase
      .channel(`kds-${businessId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `business_id=eq.${businessId}`,
        },
        fetchOrders,
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [businessId]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select(`*, order_items (options, notes, *, products ( name, price ))`)
      .eq("business_id", businessId)
      .neq("status", "completed")
      .order("created_at", { ascending: true });

    if (data) setOrders(data);
    setLoading(false);
  };

  const updateStatus = async (orderId, newStatus) => {
    const previousOrders = [...orders];
    setUpdatingOrder(orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (error) {
      setOrders(previousOrders);
      console.error("Error al actualizar estado");
    }
    setUpdatingOrder(null);
  };

  const filteredOrders = useMemo(
    () => orders.filter((o) => activeFilters.includes(o.delivery_type)),
    [orders, activeFilters],
  );

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-black text-sky-500 animate-pulse text-4xl tracking-tighter ">
        GLOTO KDS
      </div>
    );

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden selection:bg-sky-500/30 font-sans">
      {/* HEADER TACTICAL */}
      <header className="px-8 py-6 flex justify-between items-center bg-slate-900/40 backdrop-blur-2xl border-b border-white/5 shadow-2xl z-50">
        <div className="flex justify-between items-center gap-8 w-full">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-white uppercase ">
              {businessName}
            </h1>
          </div>

          {/* NAVEGACIÓN DE FILTROS SINCRONIZADA */}
          <nav className="flex gap-2 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
            {["Domicilio", "Recoger", "En Punto"].map((type) => {
              const isActive = activeFilters.includes(type);
              const style = DELIVERY_STYLES[type];
              return (
                <button
                  key={type}
                  onClick={() =>
                    setActiveFilters((prev) =>
                      prev.includes(type)
                        ? prev.filter((t) => t !== type)
                        : [...prev, type],
                    )
                  }
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all duration-300 border border-transparent ${
                    isActive
                      ? `${style.bg} text-white ${style.glow}`
                      : `${style.light}`
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* KDS GRID */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-0 divide-x divide-white/5 overflow-hidden">
        <KDSColumn
          title="Nuevos"
          orders={filteredOrders.filter((o) => o.status === "pending")}
          accent="text-amber-400"
          btnText="Empezar A Cocinar"
          btnColor="bg-amber-500"
          onNext={(id) => updateStatus(id, "preparing")}
          updatingOrder={updatingOrder}
        />
        <KDSColumn
          title="En Cocina"
          orders={filteredOrders.filter((o) => o.status === "preparing")}
          accent="text-sky-400"
          btnText="Pedido Listo"
          btnColor="bg-sky-500"
          onNext={(id) => updateStatus(id, "ready")}
          onBack={(id) => updateStatus(id, "pending")}
          updatingOrder={updatingOrder}
        />
        <KDSColumn
          title="Despacho"
          orders={filteredOrders.filter((o) => o.status === "ready")}
          accent="text-emerald-400"
          btnText="Entregar"
          btnColor="bg-emerald-500"
          onNext={(id) => updateStatus(id, "completed")}
          onBack={(id) => updateStatus(id, "preparing")}
          updatingOrder={updatingOrder}
        />
      </main>
    </div>
  );
}

function KDSColumn({
  title,
  orders,
  accent,
  btnText,
  btnColor,
  onNext,
  onBack,
  updatingOrder,
}) {
  return (
    <div className="flex flex-col h-full bg-slate-950/20 overflow-hidden">
      <div className="p-6 flex items-center justify-between bg-slate-900/10 backdrop-blur-sm border-b border-white/5">
        <h2
          className={`text-xl font-black uppercase tracking-tighter ${accent}`}
        >
          {title}{" "}
          <span className="ml-2 text-slate-600 text-sm font-mono">
            / {orders.length}
          </span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
        {orders.map((order) => (
          <div
            key={order.id}
            className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] transform transition-all duration-500"
          >
            {/* LÍNEA DE ESTADO SUPERIOR */}
            <div
              className={`h-3 w-full ${DELIVERY_STYLES[order.delivery_type]?.bg || "bg-slate-200"}`}
            />

            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <Timer startTime={order.created_at} />
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black text-slate-900 uppercase">
                      #{order.id.slice(0, 8)}
                    </span>
                    <StatusBadge type={order.delivery_type} />
                  </div>
                </div>
                {onBack && (
                  <button
                    onClick={() => onBack(order.id)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-300 hover:text-red-500 transition-all active:scale-90"
                  >
                    ↺
                  </button>
                )}
              </div>

              {/* LISTA DE PRODUCTOS */}
              <div className="space-y-4 mb-8">
                {order.order_items?.map((item) => {
                  let options = [];
                  try {
                    options =
                      typeof item.options === "string"
                        ? JSON.parse(item.options)
                        : item.options || [];
                  } catch {
                    options = [];
                  }

                  const optionsTotal = options.reduce(
                    (acc, opt) => acc + (Number(opt.extra_price) || 0),
                    0,
                  );
                  const unitPrice =
                    Number(item.unit_price) + optionsTotal ||
                    Number(item.products?.price) ||
                    0;

                  return (
                    <div key={item.id} className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        {/* Cantidad Resaltada */}
                        <span className="font-black text-slate-900 text-3xl min-w-[35px]">
                          {item.quantity}
                        </span>

                        {/* Producto */}
                        <span className="font-black text-slate-900 text-2x1 uppercase tracking-tighter flex-1 leading-none">
                          {item.products?.name || "Producto"}
                        </span>

                        {/* Precio con estilo OrderStatus */}
                        <span className="text-[12px] font-black text-blancopuro px-2 py-1 rounded-lg  bg-blancopuro/10">
                          ${unitPrice.toLocaleString("es-CO")}
                        </span>
                      </div>

                      {/* DETALLES EN COLUMNA (Opciones y Notas) */}
                      <div className="ml-10 flex flex-col gap-2">
                        {options.length > 0 && (
                          <div className="flex flex-col border-l-2 border-orange-400 pl-3">
                            <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">
                              Opciones:
                            </span>
                            <span className="text-[11px] text-slate-600 font-bold">
                              {options.map((opt) => opt.name).join(", ")}
                            </span>
                          </div>
                        )}

                        {item.notes && item.notes.trim() !== "" && (
                          <div className="flex flex-col border-l-2 border-amber-400 pl-3">
                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">
                              Indicaciones:
                            </span>
                            <span className="text-[11px] text-slate-500 italic font-medium leading-tight">
                              {item.notes}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => onNext(order.id)}
                disabled={!!updatingOrder}
                className={`w-full ${btnColor} text-white py-3 rounded-[1.8rem] font-black uppercase text-sm shadow-2xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center`}
              >
                {updatingOrder === order.id ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  btnText
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
