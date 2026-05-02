import React, { useState, useMemo } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  Globe,
  MessageSquare,
  Smartphone,
  Monitor,
  Timer,
  User,
  CreditCard,
  Calendar,
  Hash,
} from "lucide-react";

const Ordenes = () => {
  const currentMonthName = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(new Date());
  const formattedCurrentMonth =
    currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [activeTab, setActiveTab] = useState("todas");
  const [expandedMonths, setExpandedMonths] = useState([formattedCurrentMonth]);

  const ordenes = [
    {
      id: "ORD-7721",
      mesa: "Mesa 04",
      total: 45.5,
      status: "preparando",
      tiempo: "12 min",
      items: 3,
      origen: "ai",
      cliente: "Juan Pérez",
      pago: "Tarjeta",
      fecha: "2026-04-30",
    },
    {
      id: "ORD-7720",
      mesa: "Para llevar",
      total: 12.0,
      status: "listo",
      tiempo: "25 min",
      items: 1,
      origen: "web",
      cliente: "Ana López",
      pago: "Efectivo",
      fecha: "2026-04-28",
    },
    {
      id: "ORD-7600",
      mesa: "Mesa 01",
      total: 67.0,
      status: "listo",
      tiempo: "30 min",
      items: 4,
      origen: "app",
      cliente: "Mateo Díaz",
      pago: "Tarjeta",
      fecha: "2026-03-12",
    },
  ];

  const groupedOrders = useMemo(() => {
    const filtered = ordenes.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.cliente.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = activeTab === "todas" || o.status === activeTab;
      const matchDate = dateFilter === "" || o.fecha === dateFilter;
      return matchSearch && matchStatus && matchDate;
    });

    return filtered.reduce((acc, curr) => {
      const date = new Date(curr.fecha + "T00:00:00");
      const monthYear = date.toLocaleString("es-ES", {
        month: "long",
        year: "numeric",
      });
      const monthKey = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(curr);
      return acc;
    }, {});
  }, [searchTerm, activeTab, dateFilter]);

  const toggleMonth = (month) => {
    setExpandedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month],
    );
  };

  const origenConfig = {
    web: { icon: Globe, label: "WEB", color: "text-blue-400 bg-blue-400/10" },
    ai: {
      icon: MessageSquare,
      label: "AI_WA",
      color: "text-green-400 bg-green-400/10",
    },
    app: {
      icon: Smartphone,
      label: "APP",
      color: "text-orange-400 bg-orange-400/10",
    },
    pos: {
      icon: Monitor,
      label: "POS",
      color: "text-neutral-400 bg-neutral-400/10",
    },
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4  transition-all duration-500">
      {/* Header Técnico Adaptable */}
      <header className="mb-8 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight italic flex items-center gap-3">
              Orders
            </h1>
            <p className="text-neutral-600 font-mono text-[8px] md:text-[9px] uppercase tracking-[0.3em] mt-1">
              Core Data Terminal
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full xl:w-auto">
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
                size={14}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="BUSCAR ID / CLIENTE..."
                className="bg-neutral-900 border border-white/5 rounded-xl py-3 pl-9 pr-4 text-[10px] font-mono focus:outline-none focus:border-violet-500/40 w-full transition-all"
              />
            </div>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
                size={14}
              />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-neutral-900 border border-white/5 rounded-xl py-3 pl-9 pr-4 text-[10px] font-mono focus:outline-none focus:border-violet-500/40 text-neutral-400 w-full cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Status Pills con Scroll Horizontal en móvil */}
        <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-xl w-full overflow-x-auto no-scrollbar">
          {["todas", "pendiente", "preparando", "listo"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Lista de Meses */}
      <div className="space-y-4">
        {Object.entries(groupedOrders).map(([month, items]) => (
          <div
            key={month}
            className="border border-white/5 rounded-2xl overflow-hidden bg-neutral-900/20"
          >
            <button
              onClick={() => toggleMonth(month)}
              className="flex items-center justify-between w-full px-4 md:px-6 py-4 hover:bg-white/[0.02]"
            >
              <div className="flex items-center gap-3">
                <ChevronDown
                  size={16}
                  className={`text-violet-500 transition-transform ${expandedMonths.includes(month) ? "rotate-180" : ""}`}
                />
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest italic">
                  {month}
                </span>
              </div>
              <span className="text-[9px] font-mono text-neutral-600">
                [{items.length} REG]
              </span>
            </button>

            {expandedMonths.includes(month) && (
              <div className="px-3 md:px-4 pb-4 space-y-3">
                {items.map((orden) => {
                  const OrigenIcon = origenConfig[orden.origen].icon;
                  return (
                    <div
                      key={orden.id}
                      className="flex flex-col lg:grid lg:grid-cols-12 items-start lg:items-center bg-neutral-900/60 border border-white/5 rounded-xl p-4 gap-4 hover:border-violet-500/40 transition-all"
                    >
                      {/* Móvil: Header de tarjeta | Escritorio: Col 1-3 */}
                      <div className="col-span-3 flex items-center gap-4 w-full">
                        <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center border border-white/5 font-mono text-[10px] text-violet-400 shrink-0">
                          {orden.id.split("-")[1]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-black uppercase truncate">
                            {orden.cliente}
                          </p>
                          <p className="text-[9px] font-mono text-neutral-600">
                            {orden.id}
                          </p>
                        </div>
                        {/* Badge de Origen en móvil se mueve aquí al lado del nombre */}
                        <div className="lg:hidden ml-auto">
                          <span
                            className={`px-2 py-1 rounded text-[7px] font-black uppercase flex items-center gap-1 ${origenConfig[orden.origen].color}`}
                          >
                            <OrigenIcon size={8} />
                            {origenConfig[orden.origen].label}
                          </span>
                        </div>
                      </div>

                      {/* Escritorio: Origen | Móvil: Oculto (ya está arriba) */}
                      <div className="hidden lg:block col-span-2">
                        <span
                          className={`px-2 py-1 rounded text-[8px] font-black uppercase flex items-center gap-1.5 w-fit ${origenConfig[orden.origen].color}`}
                        >
                          <OrigenIcon size={10} />
                          {origenConfig[orden.origen].label}
                        </span>
                      </div>

                      {/* Grid de 3 columnas para datos secundarios en móvil */}
                      <div className="w-full lg:col-span-4 grid grid-cols-2 lg:grid-cols-2 gap-4 border-t lg:border-t-0 border-white/5 pt-3 lg:pt-0">
                        <div>
                          <p className="text-[8px] text-neutral-600 font-black uppercase mb-0.5">
                            Locación
                          </p>
                          <p className="text-[10px] font-bold text-neutral-300 uppercase italic truncate">
                            {orden.mesa}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] text-neutral-600 font-black uppercase mb-0.5">
                            Operación
                          </p>
                          <p className="text-[10px] font-bold text-neutral-300 uppercase">
                            {orden.pago} • {orden.items} ITM
                          </p>
                        </div>
                      </div>

                      {/* Total y Acción */}
                      <div className="w-full lg:col-span-3 flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-white/5 pt-3 lg:pt-0">
                        <div className="text-left lg:text-right">
                          <p className="text-[8px] text-violet-500/60 font-black uppercase mb-0.5 italic">
                            Total_Gross
                          </p>
                          <p className="text-lg font-black italic">
                            ${orden.total.toFixed(2)}
                          </p>
                        </div>
                        <button className="h-10 w-10 lg:h-8 lg:w-8 bg-violet-600/10 hover:bg-violet-600 rounded-lg text-violet-500 hover:text-white flex items-center justify-center transition-all">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ordenes;
