import { useEffect, useState } from "react";
import { supabase } from "../shared/lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  Utensils,
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

    // Traemos las órdenes y el nombre del negocio (usando la relación business_id)
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        businesses (
          name
        )
      `,
      )
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching orders:", error);
    else setOrders(data || []);

    setLoading(false);
  };

  // Configuración de colores y textos por estado
  const statusConfig = {
    pending: {
      label: "Pendiente",
      color: "text-amber-500",
      bg: "bg-amber-50",
      icon: <Clock size={16} />,
    },
    preparing: {
      label: "En Cocina",
      color: "text-sky-500",
      bg: "bg-sky-50",
      icon: <Utensils size={16} className="animate-bounce" />,
    },
    ready: {
      label: "Listo para recoger",
      color: "text-green-500",
      bg: "bg-green-50",
      icon: <CheckCircle2 size={16} />,
    },
    completed: {
      label: "Entregado",
      color: "text-slate-400",
      bg: "bg-slate-50",
      icon: <Package size={16} />,
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900">
            Mis <span className="text-sky-500">Pedidos</span>
          </h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">
            Historial de actividad en Gloto
          </p>
        </header>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
              <Package className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                Aún no has realizado pedidos
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-6 text-sky-500 font-black uppercase text-xs hover:underline"
              >
                Explorar restaurantes
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;

              return (
                <button
                  key={order.id}
                  onClick={() => navigate(`/order-status/${order.id}`)}
                  className="w-full flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-2xl hover:shadow-sky-100/50 hover:border-sky-100 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-5">
                    {/* Icono de estado */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status.bg} ${status.color} transition-colors`}
                    >
                      {status.icon}
                    </div>

                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}
                        >
                          {status.label}
                        </span>
                        <span className="text-[9px] font-bold text-slate-300 uppercase">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-black uppercase italic text-lg leading-tight text-slate-800">
                        {order.businesses?.name || "Restaurante"}
                      </h3>

                      <p className="text-xs font-bold text-slate-400 mt-1">
                        Total:{" "}
                        <span className="text-slate-900">
                          ${order.total_price.toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className="text-slate-200 group-hover:text-sky-500 group-hover:translate-x-1 transition-all"
                    size={20}
                  />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
