import { useEffect, useState } from "react";
import { supabase } from "../shared/lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  Utensils,
  ArrowLeft,
  ReceiptText,
} from "lucide-react";

export default function OrdersHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`*, businesses ( name )`)
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching orders:", error);
    else setOrders(data || []);
    setLoading(false);
  };

  const statusConfig = {
    pending: {
      label: "Pendiente",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      icon: <Clock size={18} />,
    },
    preparing: {
      label: "En Cocina",
      color: "text-sky-400",
      bg: "bg-sky-400/10",
      icon: <Utensils size={18} className="animate-pulse" />,
    },
    ready: {
      label: "¡Listo!",
      color: "text-green-400",
      bg: "bg-green-400/10",
      icon: <CheckCircle2 size={18} />,
    },
    completed: {
      label: "Entregado",
      color: "text-slate-500",
      bg: "bg-slate-800",
      icon: <Package size={18} />,
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-sky-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      {/* Navbar Superior */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-900 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-900 rounded-full transition-colors"
          >
            <ArrowLeft className="text-white" size={24} />
          </button>
          <h2 className="text-white font-black uppercase italic tracking-tighter text-xl">
            Mi Actividad
          </h2>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto pt-28 px-6">
        <header className="mb-10">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
            Historial de <br />
            <span className="text-sky-500 text-2xl">Pedidos</span>
          </h1>
          <div className="h-1 w-20 bg-sky-500 mt-4 rounded-full"></div>
        </header>

        <div className="grid gap-4">
          {orders.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-800">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <ReceiptText className="text-slate-600" size={40} />
              </div>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.2em]">
                No hay pedidos registrados
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-6 bg-white text-slate-950 px-8 py-3 rounded-full font-black uppercase text-xs hover:scale-105 transition-transform"
              >
                Empezar a comer
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;

              return (
                <button
                  key={order.id}
                  onClick={() => navigate(`/order-status/${order.id}`)}
                  className="w-full relative overflow-hidden group bg-slate-900 border border-slate-800 rounded-[2rem] p-5 transition-all hover:border-sky-500/50 hover:bg-slate-900/80 active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Badge con Icono */}
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${status.bg} ${status.color} shadow-inner transition-transform group-hover:rotate-6`}
                      >
                        {status.icon}
                      </div>

                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${status.bg} ${status.color}`}
                          >
                            {status.label}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {new Date(order.created_at).toLocaleDateString(
                              "es-CO",
                              { day: "numeric", month: "short" },
                            )}
                          </span>
                        </div>

                        <h3 className="font-black uppercase text-xs text-white group-hover:text-sky-500 transition-colors truncate max-w-[200px]">
                          {order.businesses?.name || "Restaurante"}
                        </h3>

                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs font-bold text-slate-400">
                            {order.total_price > 0
                              ? `$${Number(order.total_price).toLocaleString("es-CO")}`
                              : "Precio Variable"}
                          </p>
                          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                          <p className="text-[10px] text-slate-600 font-medium">
                            #{order.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="p-2 bg-slate-800 rounded-full text-slate-400 group-hover:text-white group-hover:bg-sky-500 transition-all">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>

                  {/* Efecto decorativo de fondo */}
                  <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-white group-hover:opacity-[0.05] transition-opacity">
                    <ReceiptText size={100} />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
