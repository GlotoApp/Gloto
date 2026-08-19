import React, { useState, useMemo, memo, useEffect } from "react";
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
  Clipboard,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../src/lib/supabaseClient";
import { useAuth } from "../../src/components/AuthContext";

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
  { id: "recoger", label: "Recoger" },
  { id: "mesa", label: "En Mesa" },
  { id: "domicilio", label: "Domicilio" },
  { id: "punto", label: "En Punto" },
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

const NOMBRES_MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
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
const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const OrderCard = memo(
  ({ orden, onDelete, onPrint, onShare, onEdit, canDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const config = ORIGEN_CONFIG[orden.origen || "pos"];
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
          className="w-full p-4 text-left hover:bg-white/5 rounded-2xl transition-colors"
        >
          {/* 📱 MOBILE */}
          <div className="flex flex-col gap-1 lg:hidden">
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {orden.cliente}
                </p>
                <p className="text-xs text-neutral-500 font-mono truncate">
                  {orden.numeroFactura}
                </p>
              </div>
              <p className="text-lg font-bold text-emerald-400 whitespace-nowrap">
                {formatMoney(orden.total)}
              </p>
            </div>
            <div className="flex justify-between items-center text-xs text-neutral-400 ">
              <span className="truncate">
                {displayOrderType(orden.metodoEntrega)}
              </span>
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
            <div className="col-span-4 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {orden.cliente}
              </p>
              <p className="text-xs text-neutral-500 font-mono truncate">
                {orden.numeroFactura}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-neutral-500">Entrega</p>
              <p className="text-sm text-neutral-300 truncate">
                {displayOrderType(orden.metodoEntrega)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-neutral-500">Hora</p>
              <p className="text-sm text-neutral-300 truncate">
                {orden.horaIngreso}
              </p>
            </div>
            <div className="col-span-2 text-right">
              <p className="text-xs text-neutral-500">Total</p>
              <p className="text-lg font-bold text-emerald-400">
                {formatMoney(orden.total)}
              </p>
            </div>
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
                  <DetailBox label="Factura" value={orden.numeroFactura} />
                  <DetailBox label="Hora" value={orden.horaIngreso} />
                  <DetailBox label="Pago" value={orden.metodoPago} />
                  <DetailBox
                    label="Método de entrega"
                    value={
                      orden.metodoEntrega === "punto"
                        ? "En punto"
                        : orden.metodoEntrega === "recoger"
                          ? "Recoger"
                          : orden.metodoEntrega === "domicilio"
                            ? "Domicilio"
                            : orden.metodoEntrega === "mesa"
                              ? "En mesa"
                              : orden.metodoEntrega || "Sin información"
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailBox label="Cliente" value={orden.cliente} />
                  <DetailBox label="Teléfono" value={orden.telefono} />
                  {orden.deliveryDetails && orden.deliveryDetails.length > 0 ? (
                    <>
                      {orden.deliveryDetails.map((detail, index) => (
                        <DetailBox
                          key={`${detail.label}-${index}`}
                          label={detail.label}
                          value={detail.value}
                        />
                      ))}
                    </>
                  ) : null}
                  <DetailBox label="Total" value={formatMoney(orden.total)} />
                </div>

                {orden.metodoEntrega === "domicilio" && (
                  <div className="flex justify-end">
                    <ActionButton
                      icon={Globe}
                      label="Ver en mapa"
                      color="border-sky-500/20 bg-sky-500/5 text-sky-400 hover:bg-sky-500 hover:text-white"
                      onClick={() => handleOpenMap(orden)}
                    />
                  </div>
                )}

                {orden.items?.length > 0 && (
                  <div className="">
                    <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-3">
                      Productos
                    </p>
                    <div className="space-y-3">
                      {orden.items.map((item) => (
                        <div
                          key={
                            item.id || `${item.product_name}-${item.quantity}`
                          }
                          className="border border-white/5 rounded-lg p-3 bg-white/3"
                        >
                          <div className="flex justify-between gap-3 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <p className="text-sm font-semibold text-white truncate">
                                {item.product_name}
                              </p>
                              <span className="text-sm text-neutral-400 font-medium">
                                x{item.quantity}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-emerald-400">
                              {formatMoney(
                                item.subtotal ||
                                  item.unit_price * item.quantity,
                              )}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-400">
                            <span>
                              Precio c/u: {formatMoney(item.unit_price)}
                            </span>
                          </div>
                          {item.options?.length > 0 && (
                            <div className=" text-[10px] text-neutral-400">
                              Opciones: {item.options.join(", ")}
                            </div>
                          )}
                          {item.notes && (
                            <div className="text-[10px] text-neutral-400">
                              Observaciones: {item.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {orden.observaciones && (
                  <div className="rounded-xl  bg-neutral-950/40 p-3">
                    <p className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-2">
                      Observaciones
                    </p>
                    <p className="text-sm text-neutral-300">
                      {orden.observaciones}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {canDelete && (
                    <ActionButton
                      icon={Trash2}
                      label="Eliminar"
                      color="border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => onDelete(orden.id)}
                    />
                  )}
                  <ActionButton
                    icon={FileText}
                    label="Factura"
                    color="border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
                    onClick={() => onEdit(orden.id)}
                  />
                  <ActionButton
                    icon={Printer}
                    label="Imprimir"
                    color="border-violet-500/20 bg-violet-600/10 text-violet-400 hover:bg-violet-600 hover:text-white"
                    onClick={() => onPrint(orden.id)}
                  />
                  <ActionButton
                    icon={Clipboard}
                    label="Compartir"
                    color="border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                    onClick={() => onShare(orden)}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

const DetailBox = ({ label, value, color = "text-neutral-300" }) => (
  <div className="space-y-1">
    <p className="text-[7px] text-neutral-600 font-black uppercase tracking-[0.2em]">
      {label}
    </p>
    <p className={`text-[10px] font-bold uppercase ${color}`}>{value}</p>
  </div>
);

const normalizeStatus = (status) => {
  const key = String(status || "").toLowerCase();
  if (["listo", "ready"].includes(key)) {
    return "listo";
  }
  if (["dispatched", "despachado"].includes(key)) {
    return "despachado";
  }
  if (["delivered", "completado"].includes(key)) {
    return "entregado";
  }
  if (["preparando", "preparing"].includes(key)) {
    return "preparando";
  }
  if (["pending", "pendiente"].includes(key)) {
    return "pendiente";
  }
  if (["confirmed", "confirmado"].includes(key)) {
    return "confirmado";
  }
  if (["cancelled", "cancelado"].includes(key)) {
    return "cancelado";
  }
  return key || "pendiente";
};

const normalizeOrderType = (orderType) => {
  const key = String(orderType || "").toLowerCase();
  if (["delivery", "domicilio"].includes(key)) return "domicilio";
  if (["pickup", "recoger"].includes(key)) return "recoger";
  if (["table", "mesa"].includes(key)) return "mesa";
  if (["point", "punto", "dine_in", "en_punto", "in_point"].includes(key)) {
    return "punto";
  }
  return key || "punto";
};

const displayOrderType = (orderType) => {
  const normalized = normalizeOrderType(orderType);
  const map = {
    punto: "Punto",
    domicilio: "Domicilio",
    mesa: "Mesa",
    recoger: "Recoger",
  };

  return (
    map[normalized] || normalized.charAt(0).toUpperCase() + normalized.slice(1)
  );
};

const getDeliveryDetails = (order = {}) => {
  const method = normalizeOrderType(order.order_type);

  if (method === "recoger") {
    return [];
  }

  if (method === "punto") {
    const puntoValue =
      order.punto ||
      order.point ||
      order.location_name ||
      order.pickup_point_name;
    if (!puntoValue) return [];

    return [{ label: "Punto", value: puntoValue }];
  }

  if (method === "domicilio") {
    const details = [];

    if (order.delivery_address) {
      details.push({ label: "Dirección", value: order.delivery_address });
    }

    if (
      order.delivery_instructions ||
      order.delivery_reference ||
      order.reference
    ) {
      details.push({
        label: "Referencia",
        value:
          order.delivery_instructions ||
          order.delivery_reference ||
          order.reference,
      });
    }

    if (
      order.delivery_fee !== null &&
      order.delivery_fee !== undefined &&
      order.delivery_fee !== ""
    ) {
      details.push({
        label: "Costo de domicilio",
        value: formatMoney(order.delivery_fee),
      });
    } else {
      details.push({
        label: "Costo de domicilio",
        value: "Sin definir",
      });
    }

    details.push({
      label: "Total",
      value: formatMoney(Number(order.total || 0)),
    });

    return details;
  }

  if (method === "mesa") {
    const details = [];

    const mesaValue = order.table_number || order.mesa;
    if (mesaValue) {
      details.push({ label: "Mesa", value: `Mesa ${mesaValue}` });
    }

    const zonaValue = order.table_zone || order.zone || order.area;
    if (zonaValue) {
      details.push({ label: "Zona", value: zonaValue });
    }

    const instruccionesValue =
      order.table_instructions || order.delivery_instructions;
    if (instruccionesValue) {
      details.push({ label: "Instrucciones", value: instruccionesValue });
    }

    return details;
  }

  return [];
};

const normalizePaymentMethod = (paymentMethod) => {
  const key = String(paymentMethod || "").toLowerCase();
  if (["cash", "efectivo"].includes(key)) return "Efectivo";
  if (["card", "tarjeta"].includes(key)) return "Tarjeta";
  if (["transfer", "transferencia"].includes(key)) return "Transferencia";
  if (["split", "dividir", "dividido"].includes(key)) return "Dividido";
  return paymentMethod || "Sin pago";
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

const mapDatabaseOrderToUi = (order) => {
  const createdAt = order.created_at ? new Date(order.created_at) : new Date();
  const items = Array.isArray(order.order_items) ? order.order_items : [];
  const metodoEntrega = normalizeOrderType(order.order_type);

  return {
    id: order.id,
    numeroFactura:
      order.order_number || `ORD-${String(order.id).slice(0, 8).toUpperCase()}`,
    tipoEntrega: metodoEntrega,
    metodoEntrega: metodoEntrega,
    detalleEntrega:
      order.delivery_address ||
      order.delivery_instructions ||
      (order.mesa ? `Mesa ${order.mesa}` : "Sin detalle"),
    deliveryDetails: getDeliveryDetails(order),
    total: Number(order.total || 0),
    status: normalizeStatus(order.status),
    origen: "pos",
    cliente: order.customer_name || "Cliente",
    telefono: order.customer_phone || "Sin teléfono",
    pago: normalizePaymentMethod(order.payment_method),
    metodoPago: normalizePaymentMethod(order.payment_method),
    horaIngreso: formatDateTime(order.created_at),
    fecha: createdAt.toISOString().slice(0, 10),
    observaciones: order.notes || order.delivery_instructions || "",
    items: items.map((item) => ({
      id: item.id,
      product_name: item.product_name || "Producto",
      quantity: Number(item.quantity || 0),
      unit_price: Number(item.unit_price || 0),
      subtotal: Number(item.subtotal || 0),
      options: Array.isArray(item.options)
        ? item.options.map(getOptionLabel)
        : [],
      notes: item.notes || "",
    })),
  };
};

// --- COMPONENTE PRINCIPAL ---
const Ordenes = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
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

  const loadBusinessOrders = async () => {
    if (!user?.id) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    if (refreshing) return;

    setRefreshing(true);
    setLoadingOrders(true);

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("business_id, role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile?.business_id) {
        setOrders([]);
        setCanDelete(false);
        setLoadingOrders(false);
        return;
      }

      const isAdminRole = [
        "admin",
        "owner",
        "super_admin",
        "dueño",
        "dueno",
      ].includes(String(profile.role || "").toLowerCase());
      setCanDelete(isAdminRole);

      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("business_id", profile.business_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando órdenes por negocio:", error);
        setOrders([]);
        return;
      }

      setOrders((data || []).map(mapDatabaseOrderToUi));
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBusinessOrders();
  }, [user]);

  // Estado dinámico: se abre automáticamente el año-mes actual (ej: "2026-05")
  const [openMonths, setOpenMonths] = useState(() => {
    const d = new Date();
    const currentMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { [currentMonthKey]: true };
  });

  // 1. Filtrado, búsqueda y ordenamiento de registros totales
  const filteredOrdenes = useMemo(() => {
    let result = [...orders];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((o) => {
        const numeroPedido = String(o.numeroFactura || "").toLowerCase();
        const idOrden = String(o.id || "").toLowerCase();
        const cliente = String(o.cliente || "").toLowerCase();
        const detalle = String(o.detalleEntrega || "").toLowerCase();

        return (
          idOrden.includes(term) ||
          numeroPedido.includes(term) ||
          cliente.includes(term) ||
          detalle.includes(term)
        );
      });
    }

    if (deliveryFilter) {
      result = result.filter((o) => o.tipoEntrega === deliveryFilter);
    }

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
  }, [orders, searchTerm, deliveryFilter, dateFilter, customDateRange, sortBy]);

  const totalPages = Math.ceil(filteredOrdenes.length / itemsPerPage);

  // 2. Segmentación por páginas y agrupación limpia por meses para la UI
  const groupedOrdersByMonth = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginated = filteredOrdenes.slice(startIdx, startIdx + itemsPerPage);

    const groups = {};
    paginated.forEach((orden) => {
      if (!orden.fecha) return;
      const [year, month] = orden.fecha.split("-");
      const key = `${year}-${month}`; // Formato "2026-05"
      if (!groups[key]) groups[key] = [];
      groups[key].push(orden);
    });

    return groups;
  }, [filteredOrdenes, currentPage]);

  const toggleMonthAccordion = (monthKey) => {
    setOpenMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  const formatMonthSpan = (monthKey) => {
    const [year, month] = monthKey.split("-");
    const monthIndex = parseInt(month, 10) - 1;
    return `${NOMBRES_MESES[monthIndex]} ${year}`.toUpperCase();
  };

  const handleDelete = (id) => {
    if (!canDelete) {
      alert("Solo el administrador puede eliminar órdenes.");
      return;
    }

    if (window.confirm(`¿Eliminar orden ${id}?`)) {
      alert(`Orden ${id} eliminada`);
    }
  };

  const handlePrint = (id) => {
    alert(`Imprimiendo orden ${id}`);
  };

  const handleShare = async (orden) => {
    const text = `Factura ${orden.numeroFactura}\nCliente: ${orden.cliente}\nTotal: ${formatMoney(orden.total)}\nEntrega: ${orden.metodoEntrega}\nPago: ${orden.metodoPago}`;

    try {
      if (navigator?.share) {
        await navigator.share({
          title: `Factura ${orden.numeroFactura}`,
          text,
        });
        return;
      }

      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(text);
        alert("Datos compartidos copiados al portapapeles");
      }
    } catch (error) {
      console.error("Error al compartir:", error);
    }
  };

  const handleEdit = (id) => {
    alert(`Editar orden ${id}`);
  };

  const handleOpenMap = (orden) => {
    const lat = orden.latitude ?? orden.lat ?? orden.location_lat ?? null;
    const lng = orden.longitude ?? orden.lng ?? orden.location_lng ?? null;

    if (lat !== null && lng !== null) {
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=16`;
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (orden.delivery_address) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(orden.delivery_address)}`;
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
      return;
    }

    alert("Aún no hay coordenadas o dirección válida para este domicilio.");
  };

  return (
    <div className="min-h-screen bg-background text-white p-4 font-sans">
      <header className="max-w-7xl mx-auto mb-10 space-y-10">
        {/* Título y Buscador Dinámico */}
        <div className="flex flex-col gap-3 justify-between mb-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-black tracking-tighter">Órdenes</h1>
            <button
              type="button"
              onClick={loadBusinessOrders}
              disabled={refreshing}
              title={refreshing ? "Actualizando órdenes" : "Actualizar órdenes"}
              className="inline-flex items-center justify-center rounded-xl  p-2 text-violet-300 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
              size={14}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o número de pedido..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-neutral-900/50 border border-white/5 rounded-xl py-3 pl-10 pr-10 text-[10px] font-mono outline-none focus:border-violet-500/40 transition-all uppercase placeholder:text-neutral-700"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {searchTerm ? (
                  <motion.button
                    key="clear"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.12 }}
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                    className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                    title="Borrar búsqueda"
                  >
                    <X size={14} />
                  </motion.button>
                ) : (
                  <motion.button
                    key="paste"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.12 }}
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        setSearchTerm(text);
                        setCurrentPage(1);
                      } catch (err) {
                        console.error(
                          "Error al acceder al portapapeles: ",
                          err,
                        );
                      }
                    }}
                    className="text-neutral-600 hover:text-violet-400 transition-colors p-1"
                    title="Pegar desde el portapapeles"
                  >
                    <Clipboard size={14} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 bg-neutral-900/30 p-4 rounded-2xl border border-white/5">
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
          <TerminalSelect
            label="Fecha"
            value={dateFilter}
            options={PERIODOS_FECHA}
            onChange={(v) => {
              setDateFilter(v);
              setCurrentPage(1);
            }}
            onClear={() => setDateFilter("")}
            icon={CalendarIcon}
          />

          {dateFilter === "personalizado" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col w-100 gap-2"
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

      {/* Listado de Órdenes Organizado por Acordeones Mensuales */}
      <main className="max-w-7xl mx-auto space-y-4 pb-20">
        {loadingOrders ? (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg font-bold">Cargando…</p>
          </div>
        ) : filteredOrdenes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg font-bold">
              {searchTerm || deliveryFilter
                ? "No hay órdenes que coincidan"
                : "Sin órdenes"}
            </p>
          </div>
        ) : (
          <>
            {Object.keys(groupedOrdersByMonth).map((monthKey) => {
              const isOpen = !!openMonths[monthKey];
              const orders = groupedOrdersByMonth[monthKey];

              return (
                <div key={monthKey} className="space-y-3">
                  {/* Header del Acordeón del Mes */}
                  <div
                    onClick={() => toggleMonthAccordion(monthKey)}
                    className="w-full flex items-center justify-between bg-neutral-900/40 hover:bg-neutral-900/80 border border-white/5 px-4 py-3 rounded-xl cursor-pointer transition-all select-none"
                  >
                    <div className="flex items-center gap-3">
                      {/* Span indicador de mes pedido */}
                      <span className="text-[9px] font-black font-mono tracking-widest bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-1 rounded-md">
                        {formatMonthSpan(monthKey)}
                      </span>
                      <span className="text-[9px] text-neutral-500 font-mono">
                        {orders.length}{" "}
                        {orders.length === 1 ? "REGISTRO" : "REGISTROS"}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      className="text-neutral-500"
                    >
                      <ChevronDown size={14} />
                    </motion.div>
                  </div>

                  {/* Lista de Órdenes colapsable dentro del mes */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden space-y-3 pl-1"
                      >
                        {orders.map((orden) => (
                          <OrderCard
                            key={orden.id}
                            orden={orden}
                            onDelete={handleDelete}
                            onPrint={handlePrint}
                            onShare={handleShare}
                            onEdit={handleEdit}
                            canDelete={canDelete}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Paginación Completa */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10 pt-6 border-t border-white/5 flex-wrap">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-white/10 text-neutral-400 disabled:opacity-50 hover:bg-white/5 transition-all"
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
                  className="p-2 rounded-lg border border-white/10 text-neutral-400 disabled:opacity-50 hover:bg-white/5 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
                <span className="text-[9px] text-neutral-600 font-mono">
                  PÁGINA {currentPage} DE {totalPages}
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
