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
  FileText,
} from "lucide-react";

export default function KitchenPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [timeUpdate, setTimeUpdate] = useState(0);

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

  const [itemsCompletos, setItemsCompletos] = useState({});

  // 4 Órdenes Base funcionales con Notas Generales, Notas por Producto y Precios
  const [ordenes, setOrdenes] = useState([
    {
      id: "ORD-992",
      mesa: "01",
      minutos: 14,
      estado: "preparando",
      tipoEntrega: "table",
      prioridad: "alta",
      notasGenerales: "Cliente tiene prisa. Entregar todo junto.",
      items: [
        {
          qty: 2,
          name: "Pizza Pepperoni",
          cat: "Horno",
          nota: "Bien tostada, borde crocante",
          price: 12000,
        },
        {
          qty: 1,
          name: "Refresco",
          cat: "Bar",
          nota: "Con mucho hielo y limón",
          price: 3500,
        },
      ],
    },
    {
      id: "ORD-995",
      mesa: "04",
      minutos: 3,
      estado: "nuevos",
      tipoEntrega: "pickup",
      prioridad: "normal",
      notasGenerales: "Llama al llegar al parqueadero.",
      items: [
        {
          qty: 1,
          name: "Pasta Carbonara",
          cat: "Fuego",
          nota: "Sin pimienta ni queso parmesano",
          price: 18500,
        },
      ],
    },
    {
      id: "ORD-990",
      mesa: "02",
      minutos: 22,
      estado: "listo",
      tipoEntrega: "delivery",
      prioridad: "normal",
      notasGenerales: "Dejar en portería si no contestan.",
      items: [
        {
          qty: 1,
          name: "Hamburguesa Gloto",
          cat: "Parrilla",
          nota: "Término 3/4, cambiar papas por aros de cebolla",
          price: 22000,
        },
      ],
    },
    {
      id: "ORD-998",
      mesa: "Barra 02",
      minutos: 1,
      estado: "nuevos",
      tipoEntrega: "point",
      prioridad: "alta",
      notasGenerales: "Consumo inmediato en estación de espera.",
      items: [
        {
          qty: 3,
          name: "Buñuelos Premium",
          cat: "Fritura",
          nota: "Recién salidos, muy calientes",
          price: 2500,
        },
        {
          qty: 1,
          name: "Café Americano",
          cat: "Bar",
          nota: "Sin azúcar, endulzante aparte",
          price: 4000,
        },
      ],
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

const TicketCard = ({
  orden,
  labelData,
  onNext,
  onPrev,
  type,
  itemsCompletos,
  toggleItemCompleto,
}) => {
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
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase text-slate-500 bg-white/5 px-2 py-0.5 rounded">
                {labelData?.label}
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tighter leading-none">
              {orden.id}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-slate-300 transition-all border border-white/5"
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
              <span className="font-bold uppercase text-[9px] tracking-wider text-amber-400 block mb-0.5">
                Nota:
              </span>
              {orden.notasGenerales}
            </p>
          </div>
        )}

        {/* Listado de Productos */}
        <div className="space-y-2.5 mb-5 border-t border-b border-white/5 py-3">
          {orden.items.map((item, i) => {
            const itemKey = `${orden.id}-${i}`;
            const isCompleto = itemsCompletos[itemKey];
            return (
              <div
                key={i}
                onClick={() => toggleItemCompleto(orden.id, i)}
                className="flex items-start gap-3 cursor-pointer group select-none"
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 flex-shrink-0 ${
                    isCompleto
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-white/10 group-hover:border-white/20"
                  }`}
                >
                  {isCompleto && (
                    <CheckCircle2
                      size={10}
                      className="text-white"
                      strokeWidth={3}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span
                        className={`text-2xl font-black font-mono transition-colors ${
                          isCompleto
                            ? "text-slate-600 line-through"
                            : "text-blue-400"
                        }`}
                      >
                        {item.qty}
                      </span>
                      <p
                        className={`text-sm font-bold uppercase truncate transition-colors ${
                          isCompleto
                            ? "text-slate-600 line-through"
                            : "text-white"
                        }`}
                      >
                        {item.name}
                      </p>
                    </div>

                    {/* Precio del producto alineado a la derecha */}
                    {item.price !== undefined && (
                      <span
                        className={`text-base font-black font-mono tracking-tight transition-colors flex-shrink-0 ${
                          isCompleto
                            ? "text-slate-600 line-through"
                            : "text-white px-1.5 py-0.5"
                        }`}
                      >
                        {new Intl.NumberFormat("es-CO", {
                          maximumFractionDigits: 0,
                        }).format(item.price * item.qty)}
                      </span>
                    )}
                  </div>

                  {/* NOTA ESPECÍFICA DEL PRODUCTO */}
                  {item.nota && (
                    <p
                      className={`text-[10px] font-mono mt-0.5 pl-5 transition-colors ${isCompleto ? "text-slate-700 line-through" : "text-violet-400/90"}`}
                    >
                      ↳ {item.nota}
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
