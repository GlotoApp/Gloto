import React, { useState, useEffect } from "react";
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
} from "lucide-react";

export default function KitchenPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [timeUpdate, setTimeUpdate] = useState(0);

  const deliveryLabels = {
    pickup: { label: "Recoger", icon: "takeout_dining", color: "amber" },
    point: { label: "En Punto", icon: "location_on", color: "violet" },
    table: { label: "Mesa", icon: "table_bar", color: "emerald" },
    delivery: { label: "Domicilio", icon: "local_shipping", color: "red" },
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

  const [itemsCompletos, setItemsCompletos] = useState({});

  const [ordenes, setOrdenes] = useState([
    {
      id: "ORD-992",
      mesa: "01",
      minutos: 14,
      estado: "preparando",
      tipoEntrega: "table",
      items: [
        { qty: 2, name: "Pizza Pepperoni", cat: "Horno" },
        { qty: 1, name: "Refresco", cat: "Bar" },
      ],
      prioridad: "alta",
    },
    {
      id: "ORD-995",
      mesa: "04",
      minutos: 3,
      estado: "nuevos",
      tipoEntrega: "pickup",
      items: [{ qty: 1, name: "Pasta Carbonara", cat: "Fuego" }],
      prioridad: "normal",
    },
    {
      id: "ORD-990",
      mesa: "02",
      minutos: 22,
      estado: "listo",
      tipoEntrega: "delivery",
      items: [{ qty: 1, name: "Hamburguesa Gloto", cat: "Parrilla" }],
      prioridad: "normal",
    },
  ]);

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

  const moverEstado = (id, nuevoEstado) => {
    setOrdenes(
      ordenes.map((o) => (o.id === id ? { ...o, estado: nuevoEstado } : o)),
    );
  };

  const despacharOrden = (id) => {
    setOrdenes(ordenes.filter((o) => o.id !== id));
  };

  const toggleFiltro = (tipo) => {
    setFiltros((prev) => ({
      ...prev,
      [tipo]: !prev[tipo],
    }));
  };

  const toggleItemCompleto = (ordenId, itemIndex) => {
    const key = `${ordenId}-${itemIndex}`;
    setItemsCompletos((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const ordenesFiltradasPorTipo = ordenes.filter((o) => {
    return filtros[o.tipoEntrega] || false;
  });

  const columnas = [
    {
      id: "nuevos",
      label: "Entrantes",
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
    <div className="h-screen bg-[#050505] text-slate-100 flex flex-col overflow-hidden font-sans">
      <header className="p-3 md:p-4 border-b border-white/5 bg-[#0A0A0A] relative z-10">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-3 md:gap-6">
          {/* Branding Compacto */}
          <div className="flex items-center gap-3 md:gap-5">
            <div className="relative w-8 h-8 md:w-12 md:h-12 bg-[#111] border border-white/10 rounded-lg md:rounded-xl flex items-center justify-center shadow-2xl">
              <Monitor size={16} className="text-blue-500 md:size-[22px]" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-lg md:text-2xl font-black tracking-tighter uppercase  leading-none">
                GLOTO<span className="text-blue-500">KDS</span>
              </h1>
              <p className="text-[7px] md:text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-0.5">
                SISTEMA DE CONTROL TÉRMICO
              </p>
            </div>
          </div>

          {/* Filtros Miniaturizados para Móvil */}
          <div className="flex items-center justify-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar py-1 md:py-0">
            {Object.entries(deliveryLabels).map(([key, data]) => {
              const c = colorMap[data.color];
              const active = filtros[key];
              return (
                <button
                  key={key}
                  onClick={() => toggleFiltro(key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 md:px-4 md:py-2.5 rounded-lg md:rounded-xl border font-black text-[8px] md:text-[10px] uppercase tracking-wide transition-all duration-200 whitespace-nowrap ${
                    active
                      ? `${c.bg} ${c.border} ${c.text}`
                      : "bg-white/[0.02] border-white/[0.06] text-white/20"
                  }`}
                >
                  {/* Icono de Material Symbols reducido */}
                  <span className="material-symbols-outlined text-base md:text-xl leading-none">
                    {data.icon}
                  </span>
                  <span className="hidden sm:inline lg:inline">
                    {data.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

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
                    <span className="text-2xl font-black  tabular-nums leading-none">
                      {
                        ordenesFiltradasPorTipo.filter(
                          (o) => o.estado === col.id,
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 md:pb-8 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {ordenesFiltradasPorTipo
                    .filter((o) => o.estado === col.id)
                    .sort((a, b) => b.minutos - a.minutos)
                    .map((o) => (
                      <TicketCard
                        key={o.id}
                        orden={o}
                        labelData={deliveryLabels[o.tipoEntrega]}
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
                        itemsCompletos={itemsCompletos}
                        toggleItemCompleto={toggleItemCompleto}
                      />
                    ))}
                </AnimatePresence>
              </div>
            </section>
          ))}
        </div>

        {/* Tab bar flotante — solo visible en móvil, respeta el sidebar (w-20 = 80px) */}
        <div className="fixed bottom-4 left-23 right-4 z-20 md:hidden flex items-center justify-center">
          <div className="flex items-center gap-4 bg-[#111]/90 backdrop-blur-md border border-white/10 rounded-4xl px-1 py-1 shadow-xl">
            {columnas.map((col, idx) => (
              <button
                key={col.id}
                onClick={() => setActiveTab(idx)}
                className={`p-3 rounded-4xl transition-all duration-200 ${
                  activeTab === idx
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-slate-600 hover:text-slate-400"
                }`}
              >
                <col.icon
                  size={22}
                  strokeWidth={activeTab === idx ? 2.5 : 1.8}
                />
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

const TicketCard = ({
  orden,
  labelData,
  onNext,
  onPrev,
  type,
  itemsCompletos,
  toggleItemCompleto,
}) => {
  const isDelayed = orden.minutos > 15;
  const isVeryDelayed = orden.minutos > 25;

  const handlePrint = () => {
    const itemsHtml = orden.items
      .map(
        (item) =>
          `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.qty}x</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.cat}</td>
      </tr>`,
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comanda ${orden.id}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              width: 80mm;
              margin: 0;
              padding: 10mm;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid black;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .order-id {
              font-size: 24px;
              font-weight: bold;
              margin: 10px 0;
            }
            .order-info {
              font-size: 12px;
              margin: 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            th {
              text-align: left;
              padding: 8px;
              border-bottom: 2px solid black;
              font-weight: bold;
              font-size: 12px;
            }
            td {
              padding: 8px;
              border-bottom: 1px solid #ddd;
              font-size: 12px;
            }
            .footer {
              text-align: center;
              margin-top: 15px;
              font-size: 11px;
              border-top: 2px solid black;
              padding-top: 10px;
            }
            .print-time {
              font-size: 10px;
              color: #666;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="order-id">${orden.id}</div>
            <div class="order-info"><strong>${labelData?.label || "Mesa"}</strong> • Mesa ${orden.mesa}</div>
            <div class="order-info">Tiempo: ${orden.minutos}m</div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 15%;">Cant.</th>
                <th style="width: 55%;">Descripción</th>
                <th style="width: 30%;">Categoría</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="footer">
            <p>------- FIN DE LA COMANDA -------</p>
            <div class="print-time">${new Date().toLocaleString("es-ES")}</div>
          </div>
        </body>
      </html>
    `;

    // Crear iframe oculto
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // Escribir contenido en el iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Imprimir cuando el contenido esté listo
    iframe.onload = () => {
      iframe.contentWindow.print();
      // Eliminar el iframe después de imprimir
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 100);
    };
  };

  return (
    <motion.div
      layout
      className={`bg-[#0F0F0F] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isVeryDelayed
          ? "border-red-600"
          : isDelayed
            ? "border-orange-500"
            : "border-blue-600/30"
      }`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-blue-400">
                {labelData?.icon}
              </span>
              <span className="text-[9px] font-black uppercase text-slate-500">
                {labelData?.label} • {orden.mesa}
              </span>
            </div>
            <h3 className="text-2xl font-black  tracking-tighter leading-none">
              {orden.id}
            </h3>
          </div>
          <div
            className={`p-2 rounded-xl text-center min-w-[50px] border ${isVeryDelayed ? "bg-red-600/10 border-red-500/20 text-red-500" : "bg-black/40 border-white/5 text-slate-400"}`}
          >
            <p className="text-[8px] font-black uppercase leading-none mb-1">
              Min
            </p>
            <p className="text-sm font-black font-mono leading-none">
              {orden.minutos}m
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {orden.items.map((item, i) => {
            const itemKey = `${orden.id}-${i}`;
            const isCompleto = itemsCompletos[itemKey];
            return (
              <div
                key={i}
                onClick={() => toggleItemCompleto(orden.id, i)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isCompleto ? "bg-emerald-500 border-emerald-500" : "border-white/10"}`}
                >
                  {isCompleto && (
                    <CheckCircle2
                      size={12}
                      className="text-white"
                      strokeWidth={3}
                    />
                  )}
                </div>
                <div className="flex-1 flex items-baseline gap-2">
                  <span
                    className={`text-sm font-black  ${isCompleto ? "text-slate-600 line-through" : "text-blue-500"}`}
                  >
                    {item.qty}x
                  </span>
                  <p
                    className={`text-sm font-bold uppercase ${isCompleto ? "text-slate-600 line-through" : "text-white"}`}
                  >
                    {item.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-slate-300 transition-all"
            title="Imprimir comanda"
          >
            <Printer size={16} />
          </button>
          {type !== "nuevos" && (
            <button
              onClick={onPrev}
              className="p-3 bg-white/5 rounded-xl text-slate-500"
            >
              <RotateCcw size={16} />
            </button>
          )}
          <button
            onClick={onNext}
            className={`flex-1 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-[0.1em] flex items-center justify-center gap-2 ${
              type === "nuevos"
                ? "bg-blue-600 shadow-lg shadow-blue-500/20"
                : type === "preparando"
                  ? "bg-orange-600"
                  : "bg-emerald-600"
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
