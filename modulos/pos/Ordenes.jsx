import React, { useState, useMemo, memo, useCallback } from "react";
import {
  Search,
  ChevronDown,
  Globe,
  MessageSquare,
  Smartphone,
  Monitor,
  Trash2,
  FileText,
  Printer,
  Calendar as CalendarIcon,
  Filter,
  X,
  TrendingUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- CONFIGURACIÓN DE CONSTANTES ---
const ORIGEN_CONFIG = {
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

const METODOS_ENTREGA = [
  { id: "mesa", label: "En Mesa" },
  { id: "punto", label: "En Punto" },
  { id: "domicilio", label: "Domicilio" },
  { id: "recoger", label: "Recoger" },
];

const PERIODOS_FECHA = [
  { id: "hoy", label: "Hoy" },
  { id: "ayer", label: "Ayer" },
  { id: "esta_semana", label: "Esta Semana" },
  { id: "ultimos_7", label: "Últimos 7 Días" },
  { id: "ultimos_30", label: "Últimos 30 Días" },
  { id: "este_mes", label: "Este Mes" },
  { id: "mes_anterior", label: "Mes Anterior" },
  { id: "personalizado", label: "Personalizado" },
];

// --- COMPONENTE SELECT PERSONALIZADO ---
const TerminalSelect = ({
  label,
  value,
  options,
  onChange,
  onClear,
  icon: Icon,
}) => (
  <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
    <label className="text-[8px] font-black text-neutral-600 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500/50 group-hover:text-violet-500 transition-colors">
        <Icon size={12} />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-neutral-900 border border-white/5 rounded-xl py-2.5 pl-9 pr-10 text-[10px] font-mono text-neutral-300 appearance-none focus:border-violet-500/40 outline-none transition-all cursor-pointer uppercase"
      >
        <option value="">TODOS_LOS_REGISTROS</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label.toUpperCase()}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {value && (
          <button
            onClick={onClear}
            className="text-neutral-600 hover:text-red-400 transition-colors"
          >
            <X size={12} />
          </button>
        )}
        <ChevronDown
          size={12}
          className="text-neutral-600 pointer-events-none"
        />
      </div>
    </div>
  </div>
);

// --- HELPER: Filtrar por fechas ---
const getDateRange = (period) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  switch (period) {
    case "hoy":
      return { start: today, end: tomorrow };
    case "ayer": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: today };
    }
    case "esta_semana": {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return { start: weekStart, end: tomorrow };
    }
    case "ultimos_7": {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      return { start: sevenDaysAgo, end: tomorrow };
    }
    case "ultimos_30": {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return { start: thirtyDaysAgo, end: tomorrow };
    }
    case "este_mes": {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: monthStart, end: tomorrow };
    }
    case "mes_anterior": {
      const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: prevMonth, end: thisMonthStart };
    }
    default:
      return { start: null, end: null };
  }
};

// --- COMPONENTE DE BOTÓN REUTILIZABLE ---
const ActionButton = ({ icon: Icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all text-[9px] font-black uppercase ${color}`}
  >
    <Icon size={14} /> {label}
  </button>
);

// --- COMPONENTE DE TARJETA ---
const OrderCard = memo(({ orden, onDelete, onPrint }) => {
  const [isOpen, setIsOpen] = useState(false);
  const config = ORIGEN_CONFIG[orden.origen];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      className={`border rounded-2xl transition-all duration-300 ${
        isOpen
          ? "bg-neutral-900/80 border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.05)]"
          : "bg-neutral-900/40 border-white/5 hover:border-white/10"
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-left hover:bg-white/5 transition-colors"
      >
        {/* 📱 MOBILE */}
        <div className="flex flex-col gap-1 lg:hidden">
          {/* Top */}
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {orden.cliente}
              </p>
              <p className="text-xs text-neutral-500 font-mono truncate">
                {orden.id}
              </p>
            </div>

            <p className="text-lg font-bold text-emerald-400 whitespace-nowrap">
              ${orden.total.toFixed(0)}
            </p>
          </div>

          {/* Bottom */}
          <div className="flex justify-between items-center text-xs text-neutral-400 ">
            <span className="truncate uppercase">{orden.tipoEntrega}</span>

            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                className="p-1.5 bg-white/5 rounded-full"
              >
                <ChevronDown size={14} />
              </motion.div>
            </div>
          </div>
        </div>

        {/* 💻 DESKTOP */}
        <div className="hidden lg:grid grid-cols-12 items-center gap-4">
          {/* Cliente */}
          <div className="col-span-4 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {orden.cliente}
            </p>
            <p className="text-xs text-neutral-500 font-mono truncate">
              {orden.id}
            </p>
          </div>

          {/* Método */}
          <div className="col-span-2">
            <p className="text-xs text-neutral-500">Método</p>
            <p className="text-sm text-neutral-300 truncate">
              {orden.tipoEntrega}
            </p>
          </div>

          {/* Origen */}
          <div className="col-span-2">
            <p className="text-xs text-neutral-500">Origen</p>
            <span
              className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 w-fit ${config.color}`}
            >
              <Icon size={12} /> {config.label}
            </span>
          </div>

          {/* Total */}
          <div className="col-span-2 text-right">
            <p className="text-xs text-neutral-500">Total</p>
            <p className="text-lg font-bold text-emerald-400">
              ${orden.total.toFixed(0)}
            </p>
          </div>

          {/* Actions */}
          <div className="col-span-2 flex justify-end items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                orden.status === "listo"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : orden.status === "preparando"
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-neutral-500/20 text-neutral-400"
              }`}
            >
              {orden.status}
            </span>

            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              className="p-2 bg-white/5 rounded-full"
            >
              <ChevronDown size={16} />
            </motion.div>
          </div>
        </div>
      </button>

      {/* EXPAND */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5 bg-black/20"
          >
            <div className="p-4 sm:p-6 space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DetailBox label="Fecha" value={orden.fecha} />
                <DetailBox label="Pago" value={orden.pago} />
                <DetailBox label="Estado" value={orden.status} />
                <DetailBox label="Detalle" value={orden.detalleEntrega} />
              </div>

              <div className="flex gap-2 flex-wrap">
                <ActionButton
                  icon={Trash2}
                  label="Eliminar"
                  color="border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={() => onDelete(orden.id)}
                />

                <ActionButton
                  icon={FileText}
                  label="Factura"
                  color="border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
                  onClick={() => {}}
                />

                <ActionButton
                  icon={Printer}
                  label="Imprimir"
                  color="border-violet-500/20 bg-violet-600/10 text-violet-400 hover:bg-violet-600 hover:text-white"
                  onClick={() => onPrint(orden.id)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const DetailBox = ({ label, value, color = "text-neutral-300" }) => (
  <div className="space-y-1">
    <p className="text-[7px] text-neutral-600 font-black uppercase tracking-[0.2em]">
      {label}
    </p>
    <p className={`text-[10px] font-bold uppercase ${color}`}>{value}</p>
  </div>
);

// --- COMPONENTE PRINCIPAL OPTIMIZADO ---
const Ordenes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Datos más realistas
  const allOrdenes = useMemo(
    () => [
      {
        id: "ORD-7721",
        tipoEntrega: "mesa",
        detalleEntrega: "Zona A - Mesa 04",
        total: 45.5,
        status: "preparando",
        origen: "ai",
        cliente: "Juan Pérez",
        pago: "Tarjeta",
        fecha: "2026-05-05",
      },
      {
        id: "ORD-7720",
        tipoEntrega: "punto",
        detalleEntrega: "Barra Principal",
        total: 12.0,
        status: "listo",
        origen: "web",
        cliente: "Ana López",
        pago: "Efectivo",
        fecha: "2026-05-05",
      },
      {
        id: "ORD-7719",
        tipoEntrega: "domicilio",
        detalleEntrega: "Cra 5 #10-20",
        total: 89.0,
        status: "listo",
        origen: "app",
        cliente: "Mateo Díaz",
        pago: "Tarjeta",
        fecha: "2026-05-04",
      },
      {
        id: "ORD-7718",
        tipoEntrega: "recoger",
        detalleEntrega: "Mostrador",
        total: 34.2,
        status: "listo",
        origen: "pos",
        cliente: "Carlos Ruiz",
        pago: "Efectivo",
        fecha: "2026-05-04",
      },
      {
        id: "ORD-7717",
        tipoEntrega: "mesa",
        detalleEntrega: "Zona B - Mesa 07",
        total: 156.8,
        status: "preparando",
        origen: "web",
        cliente: "María González",
        pago: "Tarjeta",
        fecha: "2026-05-03",
      },
      {
        id: "ORD-7716",
        tipoEntrega: "domicilio",
        detalleEntrega: "Cra 7 #5-15",
        total: 76.5,
        status: "listo",
        origen: "app",
        cliente: "Roberto Sánchez",
        pago: "Tarjeta",
        fecha: "2026-05-03",
      },
      {
        id: "ORD-7715",
        tipoEntrega: "punto",
        detalleEntrega: "Barra Principal",
        total: 23.0,
        status: "listo",
        origen: "ai",
        cliente: "Laura Martínez",
        pago: "Efectivo",
        fecha: "2026-05-02",
      },
      {
        id: "ORD-7714",
        tipoEntrega: "mesa",
        detalleEntrega: "Zona A - Mesa 02",
        total: 98.3,
        status: "completado",
        origen: "pos",
        cliente: "Fernando López",
        pago: "Tarjeta",
        fecha: "2026-05-01",
      },
    ],
    [],
  );

  // Filtrado y búsqueda
  const filteredOrdenes = useMemo(() => {
    let result = allOrdenes;

    // Búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(term) ||
          o.cliente.toLowerCase().includes(term) ||
          o.detalleEntrega.toLowerCase().includes(term),
      );
    }

    // Filtro de entrega
    if (deliveryFilter) {
      result = result.filter((o) => o.tipoEntrega === deliveryFilter);
    }

    // Filtro de fechas
    if (
      dateFilter === "personalizado" &&
      customDateRange.start &&
      customDateRange.end
    ) {
      const start = new Date(customDateRange.start);
      const end = new Date(customDateRange.end);
      end.setHours(23, 59, 59, 999);
      result = result.filter((o) => {
        const orderDate = new Date(o.fecha);
        return orderDate >= start && orderDate <= end;
      });
    } else if (dateFilter && dateFilter !== "personalizado") {
      const { start, end } = getDateRange(dateFilter);
      result = result.filter((o) => {
        const orderDate = new Date(o.fecha);
        return orderDate >= start && orderDate < end;
      });
    }

    // Ordenamiento
    result.sort((a, b) => {
      switch (sortBy) {
        case "reciente":
          return new Date(b.fecha) - new Date(a.fecha);
        case "antiguo":
          return new Date(a.fecha) - new Date(b.fecha);
        case "mayor_precio":
          return b.total - a.total;
        case "menor_precio":
          return a.total - b.total;
        case "cliente":
          return a.cliente.localeCompare(b.cliente);
        default:
          return 0;
      }
    });

    return result;
  }, [
    allOrdenes,
    searchTerm,
    deliveryFilter,
    dateFilter,
    customDateRange,
    sortBy,
  ]);

  // Paginación
  const totalPages = Math.ceil(filteredOrdenes.length / itemsPerPage);
  const paginatedOrdenes = filteredOrdenes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Estadísticas
  const stats = useMemo(() => {
    const total = filteredOrdenes.reduce((sum, o) => sum + o.total, 0);
    const listos = filteredOrdenes.filter((o) => o.status === "listo").length;
    const preparando = filteredOrdenes.filter(
      (o) => o.status === "preparando",
    ).length;
    const completados = filteredOrdenes.filter(
      (o) => o.status === "completado",
    ).length;

    return { total, listos, preparando, completados };
  }, [filteredOrdenes]);

  const handleDelete = (id) => {
    if (window.confirm(`¿Eliminar orden ${id}?`)) {
      alert(`Orden ${id} eliminada`);
    }
  };

  const handlePrint = (id) => {
    alert(`Imprimiendo orden ${id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <header className="max-w-7xl mx-auto mb-10 space-y-10">
        {/* Título */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-2 border-b border-white/5 pb-8 ">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
              Órdenes
            </h1>
            <p className="text-[9px] font-mono text-violet-500 uppercase tracking-[0.5em] mt-2">
              Sistema de Gestión de Órdenes
            </p>
          </div>
          <div className="relative w-full lg:max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
              size={14}
            />
            <input
              type="text"
              placeholder="Buscar por ID, cliente..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-neutral-900/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-[10px] font-mono outline-none focus:border-violet-500/40 transition-all uppercase placeholder:text-neutral-700"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 bg-neutral-900/30 p-4 rounded-2xl border border-white/5">
          <TerminalSelect
            label="Fecha"
            value={dateFilter}
            options={PERIODOS_FECHA}
            onChange={(v) => {
              setDateFilter(v);
              setCurrentPage(1);
            }}
            onClear={() => setDateFilter("hoy")}
            icon={CalendarIcon}
          />
          <TerminalSelect
            label="Ordenar Por"
            value={sortBy}
            options={[
              { id: "reciente", label: "Más Reciente" },
              { id: "antiguo", label: "Más Antiguo" },
              { id: "mayor_precio", label: "Mayor Precio" },
              { id: "menor_precio", label: "Menor Precio" },
              { id: "cliente", label: "Por Cliente" },
            ]}
            onChange={setSortBy}
            onClear={() => setSortBy("reciente")}
            icon={ArrowUpDown}
          />
          <TerminalSelect
            label="Método de Entrega"
            value={deliveryFilter}
            options={METODOS_ENTREGA}
            onChange={(v) => {
              setDeliveryFilter(v);
              setCurrentPage(1);
            }}
            onClear={() => setDeliveryFilter("")}
            icon={Filter}
          />

          {/* Filtro de fechas personalizado */}
          {dateFilter === "personalizado" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex gap-2 items-end"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-black text-neutral-600 uppercase tracking-widest ml-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) =>
                    setCustomDateRange({
                      ...customDateRange,
                      start: e.target.value,
                    })
                  }
                  className="bg-neutral-900 border border-white/5 rounded-xl p-2.5 text-[10px] font-mono text-neutral-300 outline-none focus:border-violet-500/40"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] font-black text-neutral-600 uppercase tracking-widest ml-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) =>
                    setCustomDateRange({
                      ...customDateRange,
                      end: e.target.value,
                    })
                  }
                  className="bg-neutral-900 border border-white/5 rounded-xl p-2.5 text-[10px] font-mono text-neutral-300 outline-none focus:border-violet-500/40"
                />
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Órdenes */}
      <main className="max-w-7xl mx-auto space-y-4 pb-20">
        {paginatedOrdenes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg font-bold">
              {searchTerm || deliveryFilter
                ? "No hay órdenes que coincidan"
                : "Sin órdenes"}
            </p>
          </div>
        ) : (
          <>
            {paginatedOrdenes.map((orden) => (
              <OrderCard
                key={orden.id}
                orden={orden}
                onDelete={handleDelete}
                onPrint={handlePrint}
              />
            ))}
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10 pt-6 border-t border-white/5 flex-wrap">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-white/10 text-neutral-400 disabled:opacity-50 hover:bg-white/5"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg font-bold text-[9px] transition-all ${
                          currentPage === page
                            ? "bg-violet-600 text-white"
                            : "border border-white/10 text-neutral-400 hover:bg-white/5"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-white/10 text-neutral-400 disabled:opacity-50 hover:bg-white/5"
                >
                  <ChevronRight size={18} />
                </button>
                <span className="text-[9px] text-neutral-600">
                  Página {currentPage} de {totalPages}
                </span>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

// --- COMPONENTE KPI CARD ---
const KPICard = memo(({ label, value, color }) => (
  <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all">
    <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest mb-2">
      {label}
    </p>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
  </div>
));

export default Ordenes;
