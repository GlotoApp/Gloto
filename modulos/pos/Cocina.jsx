import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Flame,
  CheckCircle2,
  RotateCcw,
  ChevronRight,
  Monitor,
  Hash,
  Printer,
  FileText,
  Volume2,
  X,
} from "lucide-react";
import { supabase } from "../../src/lib/supabaseClient";
import { useAuth } from "../../src/components/AuthContext";

const normalizeDeliveryType = (order) => {
  const metadataMethod = order.metadata?.metodoEntrega;
  const type = String(
    metadataMethod || order.order_type || "pickup",
  ).toLowerCase();

  if (["delivery", "domicilio"].includes(type)) return "delivery";
  if (["pickup", "recoger"].includes(type)) return "pickup";
  if (["table", "mesa"].includes(type)) return "table";
  if (["point", "punto", "en_punto", "in_point"].includes(type)) return "point";
  return "table";
};

const normalizeKitchenStatus = (status) => {
  if (
    ["pending", "confirmed", "nuevos", "pendiente", "confirmado"].includes(
      status,
    )
  ) {
    return "nuevos";
  }
  if (["preparing", "preparando"].includes(status)) return "preparando";
  if (["ready", "complete", "completado", "listo"].includes(status)) {
    return "listo";
  }
  return null;
};

const getOptionLabel = (option) => {
  if (typeof option === "string") return option;
  if (!option || typeof option !== "object") return "Opción";
  return (
    option.name ||
    option.nombre ||
    option.label ||
    option.option_name ||
    option.title ||
    option.text ||
    option.value ||
    "Opción"
  );
};

const mapOrderToKitchen = (order) => ({
  id: order.order_number || order.id,
  databaseId: order.id,
  cliente: order.customer_name || "Consumidor Final",
  mesa: order.mesa || order.punto || order.metadata?.puntoRetiro || "-",
  minutos: Math.max(
    0,
    Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000),
  ),
  estado: normalizeKitchenStatus(
    String(order.status || "pending").toLowerCase(),
  ),
  tipoEntrega: normalizeDeliveryType(order),
  prioridad: "normal",
  notasGenerales: order.notes || "",
  items: (order.order_items || []).map((item) => ({
    qty: Number(item.quantity) || 0,
    name: item.product_name || item.name || "Producto",
    cat: item.category || "",
    nota: item.notes || "",
    opciones: Array.isArray(item.options)
      ? item.options.map(getOptionLabel)
      : [],
    price: Number(item.unit_price) || 0,
  })),
});

export default function KitchenPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [timeUpdate, setTimeUpdate] = useState(0);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundModalOpen, setSoundModalOpen] = useState(false);
  const soundEnabledRef = useRef(false);
  const businessIdRef = useRef(null);
  const despachandoIds = useRef(new Set());
  const audioContextRef = useRef(null);
  const knownOrderIdsRef = useRef(new Set());
  const initializedOrdersRef = useRef(false);

  const deliveryLabels = {
    table: { label: "Mesa", icon: "table_bar", color: "emerald" },
    pickup: { label: "Recoger", icon: "takeout_dining", color: "amber" },
    delivery: { label: "Domicilio", icon: "local_shipping", color: "red" },
    point: { label: "En Punto", icon: "location_on", color: "violet" },
  };

  const colorMap = {
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      dot: "bg-emerald-400",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/25",
      text: "text-amber-400",
      dot: "bg-amber-400",
    },
    red: {
      bg: "bg-red-500/10",
      border: "border-red-500/25",
      text: "text-red-400",
      dot: "bg-red-400",
    },
    violet: {
      bg: "bg-violet-500/10",
      border: "border-violet-500/30",
      text: "text-violet-400",
      dot: "bg-violet-400",
    },
  };

  const [filtros, setFiltros] = useState({
    pickup: true,
    point: true,
    table: true,
    delivery: true,
  });

  const [ordenes, setOrdenes] = useState([]);

  const reproducirAlerta = () => {
    if (typeof window === "undefined") return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audioContext = audioContextRef.current || new AudioContext();
    audioContextRef.current = audioContext;

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const ahora = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 820;
    gain.gain.setValueAtTime(0.0001, ahora);
    gain.gain.exponentialRampToValueAtTime(0.18, ahora + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ahora + 0.2);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(ahora);
    oscillator.stop(ahora + 0.21);
  };

  const probarSonido = () => {
    reproducirAlerta();
  };

  const cambiarSonido = () => {
    const nextValue = !soundEnabledRef.current;
    soundEnabledRef.current = nextValue;
    setSoundEnabled(nextValue);

    guardarPreferenciaSonido(nextValue);
  };

  const guardarPreferenciaSonido = async (enabled) => {
    if (!businessIdRef.current) return;

    const { error } = await supabase
      .from("businesses")
      .update({ sound_enabled: enabled })
      .eq("id", businessIdRef.current);

    if (error) {
      console.error("Error guardando preferencia de sonido:", error);
    }
  };

  const cargarOrdenes = async () => {
    if (!user?.id) {
      setOrdenes([]);
      setLoadingOrders(false);
      return;
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile?.business_id) {
        setOrdenes([]);
        return;
      }
      businessIdRef.current = profile.business_id;

      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .select("sound_enabled")
        .eq("id", profile.business_id)
        .maybeSingle();

      if (businessError) {
        console.error("Error cargando preferencia de sonido:", businessError);
      } else if (typeof business?.sound_enabled === "boolean") {
        soundEnabledRef.current = business.sound_enabled;
        setSoundEnabled(business.sound_enabled);
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("business_id", profile.business_id)
        .in("status", ["pending", "confirmed", "preparing", "complete"])
        .order("created_at", { ascending: true });

      if (error) throw error;
      const nuevosPedidos = (data || []).filter((order) => {
        const status = String(order.status || "").toLowerCase();
        return (
          ["pending", "confirmed"].includes(status) &&
          !knownOrderIdsRef.current.has(order.id)
        );
      });
      const orderIds = new Set((data || []).map((order) => order.id));
      knownOrderIdsRef.current = orderIds;
      if (
        initializedOrdersRef.current &&
        nuevosPedidos.length > 0 &&
        soundEnabledRef.current
      ) {
        reproducirAlerta();
      }
      initializedOrdersRef.current = true;
      setOrdenes(
        (data || [])
          .map(mapOrderToKitchen)
          .filter(
            (order) =>
              order.estado && !despachandoIds.current.has(order.databaseId),
          ),
      );
    } catch (error) {
      console.error("Error cargando órdenes de cocina:", error);
      setOrdenes([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    cargarOrdenes();
    const interval = setInterval(cargarOrdenes, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUpdate((t) => t + 1);
      setOrdenes((prevOrdenes) =>
        prevOrdenes.map((o) => ({
          ...o,
          minutos: o.minutos + 1,
        })),
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const moverEstado = async (id, nuevoEstado) => {
    const order = ordenes.find((item) => item.id === id);
    const databaseStatusByKitchenStatus = {
      nuevos: "pending",
      preparando: "preparing",
      listo: "complete",
    };
    const databaseStatus = databaseStatusByKitchenStatus[nuevoEstado];

    if (!databaseStatus) return;

    setOrdenes((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, estado: nuevoEstado } : order,
      ),
    );

    const { error } = await supabase
      .from("orders")
      .update({ status: databaseStatus, updated_at: new Date().toISOString() })
      .eq("id", order?.databaseId);

    if (error) {
      console.error("Error actualizando estado de cocina:", error);
      await cargarOrdenes();
    }
  };

  const despacharOrden = async (id) => {
    const order = ordenes.find((item) => item.id === id);
    if (!order?.databaseId || despachandoIds.current.has(order.databaseId))
      return;

    despachandoIds.current.add(order.databaseId);
    setOrdenes((prev) => prev.filter((item) => item.id !== id));

    const { error } = await supabase
      .from("orders")
      .update({ status: "dispatched", updated_at: new Date().toISOString() })
      .eq("id", order?.databaseId);

    if (error) {
      console.error("Error despachando orden de cocina:", error);
      despachandoIds.current.delete(order.databaseId);
      await cargarOrdenes();
    } else {
      despachandoIds.current.delete(order.databaseId);
    }
  };

  const toggleFiltro = (tipo) => {
    setFiltros((prev) => ({
      ...prev,
      [tipo]: !prev[tipo],
    }));
  };

  const ordenesFiltradasPorTipo = ordenes.filter((o) => {
    return filtros[o.tipoEntrega] || false;
  });

  const columnas = [
    {
      id: "nuevos",
      label: "Nuevos",
      icon: Clock,
      color: "from-blue-600 to-blue-500",
      bgBase: "bg-blue-500/5",
    },
    {
      id: "preparando",
      label: "En Proceso",
      icon: Flame,
      color: "from-orange-600 to-orange-500",
      bgBase: "bg-orange-500/5",
    },
    {
      id: "listo",
      label: "Completado",
      icon: CheckCircle2,
      color: "from-emerald-600 to-emerald-500",
      bgBase: "bg-emerald-500/5",
    },
  ];

  return (
    <div className="h-screen bg-background text-slate-100 flex flex-col overflow-hidden font-sans">
      <header className="p-3 md:p-4 bg-background relative z-10">
        <div className="max-w-[1800px] mx-auto flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 ">
          {/* Branding Compacto & KPIs Tácticos */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tighter">Cocina</h1>
            </div>
          </div>

          {/* Filtros de Métodos de Entrega */}
          <div className="flex items-center justify-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar py-1 md:py-0">
            <button
              type="button"
              onClick={() => setSoundModalOpen(true)}
              title="Probar sonido de nuevos pedidos"
              className={`flex items-center justify-center gap-1.5 p-2.5 md:px-4 md:py-2.5 rounded-xl border font-black text-[10px] uppercase tracking-wide transition-all whitespace-nowrap ${
                soundEnabled
                  ? "bg-sky-500/10 border-sky-500/30 text-sky-300"
                  : "bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white"
              }`}
            >
              <Volume2 size={17} />
              <span className="hidden md:inline">Sonido</span>
            </button>
            {Object.entries(deliveryLabels).map(([key, data]) => {
              const c = colorMap[data.color];
              const active = filtros[key];
              return (
                <button
                  key={key}
                  onClick={() => toggleFiltro(key)}
                  className={`flex items-center justify-center gap-0 md:gap-1.5 p-2.5 md:px-4 md:py-2.5 rounded-xl border font-black text-[10px] uppercase tracking-wide transition-all duration-200 whitespace-nowrap ${
                    active
                      ? `${c.bg} ${c.border} ${c.text}`
                      : "bg-white/[0.02] border-white/[0.06] text-white/20"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg md:text-xl leading-none">
                    {data.icon}
                  </span>
                  <span className="hidden md:inline">{data.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {soundModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setSoundModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sound-modal-title"
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                  <Volume2 size={19} />
                </div>
                <div>
                  <h2
                    id="sound-modal-title"
                    className="text-lg font-black text-white"
                  >
                    Sonido de Cocina
                  </h2>
                  <p className="mt-1 text-xs text-white/45">
                    Configura las alertas de nuevos pedidos.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoundModalOpen(false)}
                aria-label="Cerrar configuración de sonido"
                className="flex items-center justify-center rounded-xl p-2 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 px-5 py-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                Preferencia del negocio
              </p>
              <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div>
                  <p className="text-sm font-bold text-white">
                    Alertas automáticas
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    {soundEnabled
                      ? "Sonará cuando llegue un pedido nuevo"
                      : "No se reproducirán alertas automáticas"}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={soundEnabled}
                  onClick={cambiarSonido}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                    soundEnabled ? "bg-sky-500" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      soundEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                  Comprobación
                </p>
                <button
                  type="button"
                  onClick={probarSonido}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-sm font-black text-sky-300 transition-colors hover:bg-sky-500/20"
                >
                  <Volume2 size={17} />
                  Probar sonido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-hidden">
        <div
          className={`flex h-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] md:grid md:grid-cols-3 md:gap-px md:bg-white/5 ${
            activeTab === 0
              ? "translate-x-0"
              : activeTab === 1
                ? "-translate-x-full md:translate-x-0"
                : "-translate-x-[200%] md:translate-x-0"
          }`}
        >
          {columnas.map((col, idx) => (
            <section
              key={col.id}
              className={`flex flex-col bg-[#080808] ${col.bgBase} w-full min-w-full md:min-w-0 min-h-0 overflow-hidden`}
            >
              <div className="p-4 border-b border-white/5 relative">
                <div
                  className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${col.color}`}
                ></div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg text-white/80">
                    <col.icon size={18} />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
                      {col.label}
                    </h2>
                    <span className="text-2xl font-black tabular-nums leading-none">
                      {
                        ordenesFiltradasPorTipo.filter(
                          (o) => o.estado === col.id,
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 md:pb-8 cocina-scrollbar">
                <AnimatePresence mode="popLayout">
                  {ordenesFiltradasPorTipo
                    .filter((o) => o.estado === col.id)
                    .sort((a, b) => b.minutos - a.minutos)
                    .map((o) => (
                      <TicketCard
                        key={o.id}
                        orden={o}
                        labelData={deliveryLabels[o.tipoEntrega]}
                        colorData={
                          colorMap[deliveryLabels[o.tipoEntrega]?.color]
                        }
                        onNext={() => {
                          const nextState =
                            col.id === "nuevos"
                              ? "preparando"
                              : col.id === "preparando"
                                ? "listo"
                                : null;
                          if (nextState) moverEstado(o.id, nextState);
                          else despacharOrden(o.id);
                        }}
                        onPrev={() => {
                          const prevState =
                            col.id === "preparando" ? "nuevos" : "preparando";
                          moverEstado(o.id, prevState);
                        }}
                        type={col.id}
                      />
                    ))}
                </AnimatePresence>
              </div>
            </section>
          ))}
        </div>

        {/* Tab bar flotante en móvil - Centrado en el área de contenido */}
        <div className="fixed left-20 right-0 bottom-0 z-20 md:hidden flex items-end justify-center p-4 pb-6 pointer-events-none">
          <div className="flex items-center gap-4 bg-[#111]/95 backdrop-blur-lg  rounded-4xl px-2 py-2 shadow-2xl pointer-events-auto">
            {columnas.map((col, idx) => (
              <button
                key={col.id}
                onClick={() => setActiveTab(idx)}
                className={`p-2.5 rounded-3xl transition-all duration-200 ${
                  activeTab === idx
                    ? "bg-primary-container/20 text-primary-container"
                    : "text-slate-600 hover:text-slate-400"
                }`}
              >
                <col.icon
                  size={20}
                  strokeWidth={activeTab === idx ? 2.5 : 1.8}
                />
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Gradiente de transición opcional */}
      <div className="fixed left-20 right-0 bottom-0 h-32 bg-gradient-to-t from-background/80 to-transparent pointer-events-none md:hidden z-10"></div>
    </div>
  );
}

const TicketCard = ({ orden, labelData, colorData, onNext, onPrev, type }) => {
  const handlePrint = () => {
    const itemsHtml = orden.items
      .map(
        (item) =>
          `<tr>
        <td style="font-size: 30px; font-weight: bold; padding: 8px; border-bottom: 1px solid #ddd;">${item.qty}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">
          <div><strong>${item.name}</strong></div>
          ${item.nota ? `<div style="font-size: 10px; color: #555; margin-top: 2px;">${item.nota}</div>` : ""}
        </td>
      </tr>`,
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comanda ${orden.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; width: 80mm; margin: 0; padding: 10mm; background: white; }
            .header { text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 10px; }
            .order-id { font-size: 24px; font-weight: bold; margin: 10px 0; }
            .order-info { font-size: 25px; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th { text-align: left; padding: 8px; border-bottom: 2px solid black; font-weight: bold; font-size: 12px; }
            td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 12px; }
            .notes-block { border: 1px dashed black; padding: 6px; margin: 10px 0; font-size: 11px; }
            .footer { text-align: center; margin-top: 15px; font-size: 11px; border-top: 2px solid black; padding-top: 10px; }
            .print-time { font-size: 10px; color: #666; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="order-id">${orden.id}</div>
            <div class="order-info"><strong>${labelData?.label || "Mesa"}</strong></div>
          </div>
          ${orden.notasGenerales ? `<div class="notes-block"><strong>NOTA:</strong> ${orden.notasGenerales}</div>` : ""}
          <table>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="footer">
            <p>------- FIN DE LA COMANDA -------</p>
          </div>
        </body>
      </html>
    `;

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    iframe.onload = () => {
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 100);
    };
  };

  return (
    <motion.div
      layout
      className={`bg-[#0F0F0F] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 border border-white/10`}
    >
      <div className="p-4">
        {/* Encabezado del Ticket */}
        <div className="flex justify-between items-center gap-3 mb-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`inline-flex max-w-full text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                  colorData?.bg || "bg-white/5"
                } ${colorData?.border || "border-white/10"} ${
                  colorData?.text || "text-slate-500"
                }`}
              >
                {labelData?.label || "Mesa"}
              </span>
              <p className="text-xs font-mono font-semibold text-white/50 truncate">
                #{orden.id}
              </p>
            </div>
            <h3 className="text-2xl font-black tracking-tight leading-tight truncate text-white">
              {orden.cliente}
            </h3>
          </div>

          <div className="flex items-center gap-2 self-center">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-slate-300 transition-all border border-white/5"
              title="Imprimir comanda"
            >
              <Printer size={14} />
            </button>
          </div>
        </div>

        {/* NOTAS GENERALES DE LA ORDEN (Si existen) */}
        {orden.notasGenerales && (
          <div className="mb-3 p-2 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-2">
            <FileText
              size={12}
              className="text-amber-400 mt-0.5 flex-shrink-0"
            />
            <p className="text-[10px] text-amber-300/90 font-medium leading-normal">
              <span className="font-bold uppercase text-[10px] tracking-wider text-amber-400 block mb-0.5">
                {orden.notasGenerales}
              </span>
            </p>
          </div>
        )}

        {/* Listado de Productos */}
        <div className="space-y-2.5 mb-5 border-t border-b border-white/5 py-3">
          {orden.items.map((item, i) => {
            return (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-3xl font-black font-mono text-white">
                        {item.qty}
                      </span>
                      <p className="text-sm font-bold uppercase truncate text-white">
                        {item.name}
                      </p>
                    </div>

                    {/* Precio del producto alineado a la derecha */}
                    {item.price !== undefined && (
                      <span className="text-base font-black font-mono tracking-tight text-white px-1.5 py-0.5 flex-shrink-0">
                        {new Intl.NumberFormat("es-CO", {
                          maximumFractionDigits: 0,
                        }).format(item.price * item.qty)}
                      </span>
                    )}
                  </div>

                  {/* NOTA ESPECÍFICA DEL PRODUCTO */}
                  {item.opciones?.length > 0 && (
                    <div className="mt-1 pl-5 space-y-0.5">
                      {item.opciones.map((opcion, optionIndex) => (
                        <p
                          key={`${i}-opcion-${optionIndex}`}
                          className="text-[16px] font-mono text-sky-300/90"
                        >
                          • {opcion}
                        </p>
                      ))}
                    </div>
                  )}

                  {item.nota && (
                    <p className="text-[16px] font-mono mt-0.5 pl-5 text-yellow-300/90">
                      *{item.nota}*
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Acciones de Flujo */}
        <div className="flex gap-2">
          {type !== "nuevos" && (
            <button
              onClick={onPrev}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 transition-colors border border-white/5"
            >
              <RotateCcw size={16} />
            </button>
          )}
          <button
            onClick={onNext}
            className={`flex-1 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-[0.1em] flex items-center justify-center gap-2 transition-all ${
              type === "nuevos"
                ? "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/10"
                : type === "preparando"
                  ? "bg-orange-600 hover:bg-orange-500"
                  : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            <span>
              {type === "nuevos"
                ? "INICIAR"
                : type === "preparando"
                  ? "LISTO"
                  : "DESPACHAR"}
            </span>
            <ChevronRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
