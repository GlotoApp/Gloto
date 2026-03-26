import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../shared/lib/supabase";

export default function Kitchen() {
  const { businessId } = useParams();
  const [orders, setOrders] = useState([]);
  const [businessName, setBusinessName] = useState("Cargando...");
  const [loading, setLoading] = useState(true);

  const audioRef = useRef(new Audio("/notification.mp3"));

  useEffect(() => {
    if (!businessId) return;

    const fetchBusinessInfo = async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();
      if (!error && data) setBusinessName(data.name);
    };

    fetchBusinessInfo();
    fetchOrders();

    const channel = supabase
      .channel(`kds-${businessId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `business_id=eq.${businessId}`,
        },
        () => {
          playNotification();
          fetchOrders();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `business_id=eq.${businessId}`,
        },
        () => fetchOrders(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId]);

  const playNotification = () => {
    audioRef.current
      .play()
      .catch((err) => console.log("Audio bloqueado:", err));
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`*, order_items (*, products ( name ))`)
      .eq("business_id", businessId)
      .neq("status", "completed")
      .order("created_at", { ascending: true });

    if (!error) setOrders(data);
    setLoading(false);
  };

  const updateStatus = async (orderId, newStatus) => {
    await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
  };

  const columnNew = orders.filter((o) => o.status === "pending");
  const columnPreparing = orders.filter((o) => o.status === "preparing");
  const columnReady = orders.filter((o) => o.status === "ready");

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-black text-sky-500 animate-pulse text-2xl">
        GLOTO KDS...
      </div>
    );

  return (
    <div
      className="min-h-screen bg-slate-950 text-white flex flex-col"
      onClick={() => {
        audioRef.current
          .play()
          .then(() => {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          })
          .catch(() => {});
      }}
    >
      <header className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-sky-400">
            {businessName}
          </h1>
          <p className="text-[9px] text-sky-500/50 font-bold uppercase">
            Click para activar sonido 🔔
          </p>
        </div>
        <div className="bg-white/5 px-6 py-2 rounded-2xl border border-white/10 text-center">
          <span className="block text-[10px] text-slate-500 font-black">
            PEDIDOS ACTIVOS
          </span>
          <span className="text-2xl font-black">{orders.length}</span>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 overflow-hidden">
        <KDSColumn
          title="Nuevos"
          orders={columnNew}
          accentColor="bg-amber-400"
          btnText="Empezar Cocina"
          btnColor="bg-amber-500"
          onNext={(id) => updateStatus(id, "preparing")}
        />
        <KDSColumn
          title="En Proceso"
          orders={columnPreparing}
          accentColor="bg-sky-500"
          btnText="Pedido Listo"
          btnColor="bg-sky-500"
          onNext={(id) => updateStatus(id, "ready")}
          onBack={(id) => updateStatus(id, "pending")}
        />
        <KDSColumn
          title="Para Entrega"
          orders={columnReady}
          accentColor="bg-green-500"
          btnText="Despachar"
          btnColor="bg-green-600"
          onNext={(id) => updateStatus(id, "completed")}
          onBack={(id) => updateStatus(id, "preparing")}
        />
      </main>
    </div>
  );
}

function KDSColumn({
  title,
  orders,
  accentColor,
  btnText,
  btnColor,
  onNext,
  onBack,
}) {
  return (
    <div className="flex flex-col bg-slate-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
      <div className="p-6 flex items-center justify-between border-b border-white/5 bg-slate-900/30">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${accentColor} animate-pulse`}
          />
          <h2 className="font-black uppercase italic text-lg tracking-tight">
            {title}
          </h2>
        </div>
        <span className="bg-white/10 px-4 py-1 rounded-full text-xs font-black">
          {orders.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-[2.5rem] p-6 text-black shadow-xl border-t-[12px] border-slate-200"
          >
            {/* Cabecera del Ticket */}
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <span className="text-sm font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase">
                #{order.id.slice(0, 5).toUpperCase()}
              </span>
              {onBack && (
                <button
                  onClick={() => onBack(order.id)}
                  className="text-[10px] font-black text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors uppercase"
                >
                  <span>↺</span> Regresar
                </button>
              )}
            </div>

            {/* Ítems del Pedido */}
            <div className="space-y-4 mb-6">
              {order.order_items.map((item) => (
                <div key={item.id} className="border-l-4 border-slate-100 pl-4">
                  <p className="font-black text-xl uppercase italic leading-none">
                    {item.quantity}x {item.products?.name}
                  </p>

                  {/* Opciones del Producto */}
                  {item.options?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.options.map((opt) => (
                        <span
                          key={opt.id}
                          className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 uppercase"
                        >
                          + {opt.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* INDICACIONES POR PRODUCTO */}
                  {item.notes && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-[11px] font-black text-amber-700 leading-tight">
                        👉 NOTA: {item.notes.toUpperCase()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* INDICACIONES GENERALES DEL PEDIDO */}
            {order.notes && (
              <div className="mb-6 p-4 bg-red-600 rounded-2xl text-white animate-pulse">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1 italic">
                  Instrucción Especial Cliente:
                </p>
                <p className="text-sm font-black leading-tight uppercase italic underline decoration-2 underline-offset-4">
                  "{order.notes}"
                </p>
              </div>
            )}

            <button
              onClick={() => onNext(order.id)}
              className={`w-full ${btnColor} text-white py-5 rounded-[2rem] font-black uppercase text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl`}
            >
              {btnText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
