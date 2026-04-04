import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../shared/lib/supabase";
import { Menu, X, ChevronRight } from "lucide-react"; // Importamos iconos para un look más pro

// --- CONFIGURACIÓN DE IDENTIDAD VISUAL (MÉTODOS DE ENTREGA) ---
const DELIVERY_STYLES = {
  Domicilio: {
    bg: "bg-purple-500",
    text: "text-purple-400",
    badge: "bg-purple-500 border-purple-500",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.4)]",
    light: "text-purple-400/50 hover:text-purple-400 hover:bg-purple-500/5",
  },
  Recoger: {
    bg: "bg-blue-500",
    text: "text-blue-400",
    badge: "bg-blue-500 border-blue-500",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.4)]",
    light: "text-blue-400/50 hover:text-blue-400 hover:bg-blue-500/5",
  },
  "En Punto": {
    bg: "bg-amber-500",
    text: "text-amber-400",
    badge: "bg-amber-500 border-amber-500",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.4)]",
    light: "text-amber-400/50 hover:text-amber-400 hover:bg-amber-500/5",
  },
  default: {
    bg: "bg-slate-500",
    text: "text-slate-400",
    badge: "bg-slate-500 border-slate-500",
    glow: "shadow-[0_0_20px_rgba(100,116,139,0.4)]",
    light: "text-slate-400/50 hover:text-slate-400 hover:bg-slate-500/5",
  },
};

const SECTION_ITEMS = [
  { key: "orders", label: "Órdenes", hint: "Pedidos en tiempo real" },
  { key: "history", label: "Historial", hint: "Órdenes previas" },
  { key: "menu", label: "Menú", hint: "Ver el menú" },
  { key: "settings", label: "Ajustes", hint: "Preferencias" },
  {
    key: "logout",
    label: "Cerrar sesión",
    hint: "Próximamente",
    disabled: true,
  },
];

// --- COMPONENTES DE UI ATÓMICOS ---

function StatusBadge({ type }) {
  const style = DELIVERY_STYLES[type] || DELIVERY_STYLES.default;
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${style.badge} text-white`}
    >
      {type}
    </span>
  );
}

const Timer = ({ startTime }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(startTime);
      const diff = Math.floor((now - start) / 1000);
      setTime(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (time < 300) return "text-blancopuro"; // < 5 min
    if (time < 600) return "text-yellow-500"; // 5-10 min
    return "text-red-500"; // > 10 min
  };

  return (
    <div
      className={`text-[10px] font-black uppercase tracking-widest ${getTimeColor()}`}
    >
      {formatTime(time)}
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("orders");
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const audioRef = useRef(null);

  // Inicializar audio
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.volume = 0.8; // Volumen más alto
    audioRef.current.preload = "auto";

    // Manejar errores de carga
    audioRef.current.addEventListener("error", (e) => {
      // Error loading audio
    });

    audioRef.current.addEventListener("canplaythrough", () => {
      // Audio loaded successfully
    });
  }, []);

  useEffect(() => {
    if (!businessId) return;

    const fetchInitialData = async () => {
      const { data } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();
      if (data) setBusinessName(data.name);

      // Cargar órdenes iniciales (esto establecerá el contador sin reproducir sonido)
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
        (payload) => {
          // Real-time change detected

          // Si es una nueva orden (INSERT), reproducir sonido inmediatamente
          if (payload.eventType === "INSERT") {
            playNotification();
          }

          fetchOrders(payload.eventType);
        },
      )
      .subscribe((status) => {
        // Subscription status
      });

    return () => supabase.removeChannel(channel);
  }, [businessId]);

  const fetchOrders = async (eventType = "manual") => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`*, order_items (options, notes, *, products ( name, price ))`)
        .eq("business_id", businessId)
        .neq("status", "completed")
        .order("created_at", { ascending: true });

      if (error) {
        // Error fetching orders
        return;
      }

      if (data) {
        const currentCount = data.length;

        // Solo reproducir sonido si NO es la carga inicial y hay más órdenes que antes
        // Y no es un evento INSERT (ya se manejó arriba)
        if (
          !isInitialLoad &&
          currentCount > previousOrderCount &&
          eventType !== "INSERT"
        ) {
          playNotification();
        }

        // Si es la carga inicial, marcar como completada
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }

        setPreviousOrderCount(currentCount);
        setOrders(data);
      }
    } catch (error) {
      // Error in fetchOrders
    }
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
      // Error updating status
    }
    setUpdatingOrder(null);
  };

  // Función para simular nueva orden (solo para testing)
  const simulateNewOrder = () => {
    setPreviousOrderCount((prev) => prev - 1); // Forzar que parezca que hay menos órdenes
    setTimeout(() => {
      fetchOrders("simulated");
    }, 500);
  };

  // Función para reproducir notificación de nueva orden
  const playNotification = async () => {
    if (!audioRef.current) {
      // Audio not initialized
      // Intentar crear nuevo audio
      try {
        audioRef.current = new Audio("/notification.mp3");
        audioRef.current.volume = 0.8;
      } catch (e) {
        // Error creating audio
        return;
      }
    }

    try {
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (error) {
      // Error playing audio

      // Fallback: crear nuevo audio
      try {
        const fallbackAudio = new Audio("/notification.mp3");
        fallbackAudio.volume = 0.8;
        await fallbackAudio.play();
      } catch (fallbackError) {
        // Error in fallback
      }
    }
  };

  const filteredOrders = useMemo(
    () => orders.filter((o) => activeFilters.includes(o.delivery_type)),
    [orders, activeFilters],
  );

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        {/* Contenedor con perspective para un sutil efecto 3D si se rota */}
        <div className="relative group perspective">
          {/* Efecto de resplandor difuso de fondo (halo) */}
          <div className="absolute -inset-4 bg-sky-500 rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-500 animate-pulse-slow"></div>

          {/* Contenedor del logo con el efecto de neón principal */}
          <div
            className="relative font-black text-sky-400 text-4xl tracking-tighter leading-none
                    /* Resplandor exterior nítido */
                    drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]
                    /* Resplandor exterior amplio */
                    drop-shadow-[0_0_20px_rgba(14,165,233,0.5)]
                    animate-pulse"
          >
            <img
              src="/logo.png"
              alt="Logo"
              /* Asegura que la imagen herede el color si es un SVG o tiene transparencia */
              className="h-16 w-auto brightness-110 contrast-125"
            />
          </div>
        </div>
      </div>
    );

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden selection:bg-sky-500/30 font-sans">
      {/* HEADER */}
      <header className="px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-slate-900/50 backdrop-blur-2xl border-b border-white/10 z-30">
        {/* justify-between en móvil, justify-start (default) en tablets/PC */}
        <div className="flex w-full md:w-auto items-center justify-between md:justify-start gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="h-12 w-12 flex items-center justify-center bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all active:scale-95"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-black tracking-tighter uppercase">
            {businessName}
          </h1>
        </div>

        {activeSection === "orders" && (
          <nav className="flex flex-wrap items-center gap-2 p-2 rounded-3xl shadow-sm shadow-slate-950/20 justify-center md:justify-start bg-slate-900/30 backdrop-blur-sm">
            {["En Punto", "Recoger", "Domicilio"].map((type) => {
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
                  className={`px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all duration-300 ${
                    isActive
                      ? `${style.bg} text-white shadow-[0_0_20px_rgba(255,255,255,0.08)]`
                      : `${style.light} border-white/10 hover:bg-white/5`
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </nav>
        )}
      </header>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-950 border-r border-white/10 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <span className="font-black tracking-widest text-sky-400 text-sm uppercase">
            Menú Principal
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {SECTION_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveSection(item.key);
                setSidebarOpen(false);
              }}
              className={`w-full p-4 rounded-2xl text-left transition-all border ${activeSection === item.key ? "bg-sky-500/10 border-sky-500/40 text-white" : "border-transparent text-slate-400 hover:bg-white/5"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-tighter">
                    {item.label}
                  </p>
                  <p className="text-[10px] opacity-60">{item.hint}</p>
                </div>
                <ChevronRight
                  size={16}
                  className={
                    activeSection === item.key
                      ? "text-sky-400"
                      : "text-slate-600"
                  }
                />
              </div>
            </button>
          ))}
        </nav>
      </aside>
      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      <main className="flex-1 overflow-hidden relative">
        {activeSection !== "orders" ? (
          <div className="h-full flex items-center justify-center p-8">
            <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-2xl shadow-slate-950/60 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
                {
                  SECTION_ITEMS.find((item) => item.key === activeSection)
                    ?.label
                }
              </p>
              <h2 className="mt-6 text-4xl font-black text-white">
                Sección próximamente
              </h2>
              <p className="mt-4 text-slate-300 leading-relaxed text-lg">
                Esta vista aún no está implementada en la cocina. Por ahora
                puedes seguir usando la sección de Órdenes para gestionar los
                pedidos en vivo.
              </p>
              {activeSection === "logout" && (
                <p className="mt-4 text-amber-300 font-semibold">
                  Cerrar sesión estará disponible en una próxima versión.
                </p>
              )}
            </div>
          </div>
        ) : (
          /* CONTENEDOR RESPONSIVE CON SNAP SCROLL */
          <div className="h-full flex md:grid md:grid-cols-3 md:divide-x md:divide-white/5 overflow-x-auto snap-x snap-mandatory no-scrollbar">
            <KDSColumn
              title="Nuevos"
              orders={filteredOrders.filter((o) => o.status === "pending")}
              btnText="Preparar"
              btnColor="bg-amber-500"
              onNext={(id) => updateStatus(id, "preparing")}
              updatingOrder={updatingOrder}
            />
            <KDSColumn
              title="Preparación"
              orders={filteredOrders.filter((o) => o.status === "preparing")}
              btnText="Despachar"
              btnColor="bg-sky-500"
              onNext={(id) => updateStatus(id, "ready")}
              onBack={(id) => updateStatus(id, "pending")}
              updatingOrder={updatingOrder}
            />
            <KDSColumn
              title="Despacho"
              orders={filteredOrders.filter((o) => o.status === "ready")}
              btnText="Entregar"
              btnColor="bg-emerald-500"
              onNext={(id) => updateStatus(id, "completed")}
              onBack={(id) => updateStatus(id, "preparing")}
              updatingOrder={updatingOrder}
            />
          </div>
        )}
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
    <div className="min-w-full md:min-w-0 flex flex-col h-full bg-slate-950/20 snap-center">
      <div className="p-2 flex items-center justify-between bg-slate-900/30 backdrop-blur-sm border-b border-white/5 justify-center">
        <h2
          className={`text-xs font-black uppercase tracking-tighter ${accent}`}
        >
          {title}{" "}
          <span className="ml-2 text-slate-600 text-sm font-mono ">
            / {orders.length}
          </span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/30">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/50"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Timer startTime={order.created_at} />
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge type={order.delivery_type} />
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">
                      #{order.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
                {onBack && (
                  <button
                    onClick={() => onBack(order.id)}
                    className="p-3 rounded-2xl text-slate-400 hover:text-red-500 transition-all active:scale-90"
                  >
                    ↺
                  </button>
                )}
              </div>

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
                    <div key={item.id} className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-3xl leading-none">
                          {item.quantity}
                        </span>
                        <span className="font-black text-slate-900 text-2xs uppercase tracking-tighter flex-1 leading-tight">
                          {item.products?.name}
                        </span>
                        <span className="text-2xs font-black text-slate-700 rounded-lg ">
                          ${unitPrice.toLocaleString("es-CO")}
                        </span>
                      </div>

                      {/* DETALLES EN COLUMNA (Opciones y Notas) */}
                      <div className="ml-6 mt-2 flex flex-col gap-2">
                        {options.length > 0 && (
                          <div className="flex flex-col border-l-2 border-orange-400 pl-3">
                            <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">
                              Opciones:
                            </span>
                            <span className="text-[11px] text-slate-900 font-bold">
                              {options.map((opt) => opt.name).join(", ")}
                            </span>
                          </div>
                        )}

                        {item.notes && item.notes.trim() !== "" && (
                          <div className="flex flex-col border-l-2 border-amber-400 pl-3">
                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">
                              Indicaciones:
                            </span>
                            <span className="text-[11px] text-slate-900  font-medium leading-tight">
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
                className={`w-full ${btnColor} text-white py-4 rounded-[1.8rem] font-black uppercase text-sm tracking-widest shadow-xl transition-all hover:brightness-110 active:scale-95 disabled:opacity-50`}
              >
                {updatingOrder === order.id ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  btnText
                )}
              </button>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-700 opacity-20 flex-col py-20">
            <p className="font-black text-2xl uppercase tracking-widest leading-none">
              Vacio
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
