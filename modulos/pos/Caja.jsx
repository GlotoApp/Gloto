import React, { useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  XCircle,
  Lock,
  Calculator,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  History,
  ChevronDown,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import CierresEliminados from "./CierresEliminados";

// ─── CONSTANTES MOCK ─────────────────────────────────────────────────────────
const TRANSACCIONES_MOCK = [
  {
    id: "TRX-081",
    hora: "12:43",
    mesa: "03",
    metodo: "efectivo",
    total: 87500,
    estado: "ok",
  },
  {
    id: "TRX-080",
    hora: "12:31",
    mesa: "07",
    metodo: "tarjeta",
    total: 134000,
    estado: "ok",
  },
  {
    id: "TRX-079",
    hora: "12:18",
    mesa: "01",
    metodo: "tarjeta",
    total: 56000,
    estado: "ok",
  },
  {
    id: "TRX-078",
    hora: "11:55",
    mesa: "05",
    metodo: "efectivo",
    total: 210000,
    estado: "ok",
  },
  {
    id: "TRX-077",
    hora: "11:40",
    mesa: "02",
    metodo: "transferencia",
    total: 43000,
    estado: "ok",
  },
];

const HISTORIAL_INICIAL = [
  {
    id: "CIE-003",
    fecha: "2026-05-20",
    horaApertura: "06:00",
    horaCierre: "22:15",
    cajero: "María López",
    fondoInicial: 200000,
    totalVentas: 1240000,
    totalEfectivo: 680000,
    totalTarjeta: 560000,
    totalTransferencia: 43000,
    enCaja: 880000,
    totalContado: 875000,
    diferencia: -5000,
    transacciones: 18,
  },
];

// ─── HELPERS FORMATO ─────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

const fmtFecha = (fechaStr) => {
  if (!fechaStr) return "";
  const parts = fechaStr.split("-");
  if (parts.length !== 3) return fechaStr;
  const [y, m, d] = parts;
  const meses = [
    "ENE",
    "FEB",
    "MAR",
    "ABR",
    "MAY",
    "JUN",
    "JUL",
    "AGO",
    "SEP",
    "OCT",
    "NOV",
    "DIC",
  ];
  return `${d} ${meses[parseInt(m, 10) - 1]} ${y}`;
};

const obtenerFechaActualLocal = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
};

// ─── COMPONENTES REUTILIZABLES (ESTILO ÓRDENES) ──────────────────────────────
const DetailBox = ({ label, value, color = "text-neutral-300" }) => (
  <div className="space-y-1.5">
    <p className="text-[10px] sm:text-xs text-neutral-600 font-black uppercase tracking-[0.2em]">
      {label}
    </p>
    <p className={`text-xs sm:text-sm font-bold uppercase font-mono ${color}`}>
      {value}
    </p>
  </div>
);

const KPICard = memo(({ label, value, sub, color }) => (
  <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
    <p className="text-[10px] sm:text-xs text-neutral-600 font-black uppercase tracking-widest mb-2">
      {label}
    </p>
    <p className={`text-xl sm:text-2xl font-black font-mono ${color}`}>
      {value}
    </p>
    {sub && (
      <span className="text-[10px] sm:text-xs text-neutral-500 font-bold block mt-1.5 uppercase font-mono">
        {sub}
      </span>
    )}
  </div>
));

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
export default function Caja() {
  const [seccion, setSeccion] = useState("resumen");
  const [showNovedad, setShowNovedad] = useState(false);
  const [nombreCajero, setNombreCajero] = useState("");
  const [cierreExpandido, setCierreExpandido] = useState(null);

  // Control de Fecha Operativa (Global)
  const [fechaFiltro, setFechaFiltro] = useState(obtenerFechaActualLocal());

  const [historial, setHistorial] = useState(HISTORIAL_INICIAL);
  const [novedades, setNovedades] = useState([
    {
      id: "NOV-001",
      tipo: "egreso",
      concepto: "Compra de hielo de urgencia",
      monto: 12000,
      hora: "10:15",
      fecha: obtenerFechaActualLocal(),
      metodo: "efectivo",
    },
  ]);

  const [nuevaNovedad, setNuevaNovedad] = useState({
    tipo: "egreso",
    concepto: "",
    monto: "",
    metodo: "efectivo",
  });

  const [metodosPagoReales, setMetodosPagoReales] = useState({
    efectivo: "",
    transferencia: "",
    tarjeta: "",
  });

  // Estados para eliminación de cierre
  const [showModalEliminacion, setShowModalEliminacion] = useState(false);
  const [cierreAEliminar, setCierreAEliminar] = useState(null);
  const [motivoEliminacion, setMotivoEliminacion] = useState("");
  const [registroEliminaciones, setRegistroEliminaciones] = useState([]);

  // Filtrado reactivo de novedades por fecha
  const novedadesFiltradas = useMemo(() => {
    return novedades.filter((n) => n.fecha === fechaFiltro);
  }, [novedades, fechaFiltro]);

  // Filtrado reactivo del historial de cierres por fecha
  const historialFiltrado = useMemo(() => {
    return historial.filter((c) => c.fecha === fechaFiltro);
  }, [historial, fechaFiltro]);

  // ─── LÓGICA DE COMPAGINACIÓN FINANCIERA RECONCILIADA ─────────────────────────
  const transaccionesValidas = TRANSACCIONES_MOCK.filter(
    (t) => t.estado === "ok",
  );

  // 1. Ventas brutas del sistema por método
  const ventasEfectivo = transaccionesValidas
    .filter((t) => t.metodo === "efectivo")
    .reduce((a, t) => a + t.total, 0);
  const ventasTarjeta = transaccionesValidas
    .filter((t) => t.metodo === "tarjeta")
    .reduce((a, t) => a + t.total, 0);
  const ventasTransferencia = transaccionesValidas
    .filter((t) => t.metodo === "transferencia")
    .reduce((a, t) => a + t.total, 0);

  // 2. Desglose de novedades filtradas por método de pago para afectar los esperados
  const novedadesPorMetodo = useMemo(() => {
    const desglose = {
      efectivo: { ingresos: 0, egresos: 0 },
      tarjeta: { ingresos: 0, egresos: 0 },
      transferencia: { ingresos: 0, egresos: 0 },
    };
    novedadesFiltradas.forEach((n) => {
      const m = n.metodo || "efectivo";
      if (desglose[m]) {
        if (n.tipo === "ingreso") desglose[m].ingresos += n.monto;
        if (n.tipo === "egreso") desglose[m].egresos += n.monto;
      }
    });
    return desglose;
  }, [novedadesFiltradas]);

  const fondoInicial = 200000;

  // 3. Valores Esperados Finales Reconciliados (Venta + Ingresos Manuales - Egresos Manuales)
  const esperadoEfectivo =
    fondoInicial +
    ventasEfectivo +
    novedadesPorMetodo.efectivo.ingresos -
    novedadesPorMetodo.efectivo.egresos;
  const esperadoTarjeta =
    ventasTarjeta +
    novedadesPorMetodo.tarjeta.ingresos -
    novedadesPorMetodo.tarjeta.egresos;
  const esperadoTransferencia =
    ventasTransferencia +
    novedadesPorMetodo.transferencia.ingresos -
    novedadesPorMetodo.transferencia.egresos;

  const totalVentas = ventasEfectivo + ventasTarjeta + ventasTransferencia;
  const enCajaEsperadoGlobal =
    esperadoEfectivo + esperadoTarjeta + esperadoTransferencia;

  const totalConteo = Object.values(metodosPagoReales).reduce(
    (a, b) => a + (Number(b) || 0),
    0,
  );

  const diferenciaGlobal = totalConteo - enCajaEsperadoGlobal;

  // Helper dinámico para renderizar las propiedades del botón de cierre
  const configuracionBotonCierre = useMemo(() => {
    if (!nombreCajero.trim()) {
      return {
        texto: "INGRESE NOMBRE DEL CAJERO",
        estilo:
          "border-neutral-800 bg-neutral-900/40 text-neutral-600 cursor-not-allowed",
        icon: Lock,
      };
    }
    if (diferenciaGlobal === 0) {
      return {
        texto: "CAJA PERFECTA • CERRAR CAJA",
        estilo:
          "border-emerald-500/30 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white",
        icon: CheckCircle2,
      };
    }
    if (diferenciaGlobal > 0) {
      return {
        texto: `SOBRAN ${fmt(diferenciaGlobal)} • CERRAR CAJA`,
        estilo:
          "border-emerald-500/30 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white",
        icon: AlertCircle,
      };
    }
    return {
      texto: `FALTAN ${fmt(Math.abs(diferenciaGlobal))} • ASUMIR FALTANTE Y CERRAR CAJA`,
      estilo:
        "border-red-500/30 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white",
      icon: XCircle,
    };
  }, [diferenciaGlobal, nombreCajero]);

  const secciones = [
    { id: "resumen", label: "GENERAL", icon: TrendingUp },
    { id: "historial", label: "HISTORIAL", icon: History },
  ];

  const handleConfirmarCierre = () => {
    if (!nombreCajero.trim()) return;
    const horaCierre = `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`;

    const nuevoCierre = {
      id: `CIE-${String(historial.length + 4).padStart(3, "0")}`,
      fecha: fechaFiltro,
      horaApertura: "06:00",
      horaCierre,
      cajero: nombreCajero,
      fondoInicial,
      totalVentas,
      totalEfectivo: esperadoEfectivo,
      totalTarjeta: esperadoTarjeta,
      totalTransferencia: esperadoTransferencia,
      enCaja: enCajaEsperadoGlobal,
      totalContado: totalConteo,
      diferencia: diferenciaGlobal,
      transacciones: transaccionesValidas.length,
    };

    setHistorial([nuevoCierre, ...historial]);
    setNombreCajero("");
    setMetodosPagoReales({ efectivo: "", transferencia: "", tarjeta: "" });
  };

  const handleAbrirModalEliminacion = (cierre) => {
    setCierreAEliminar(cierre);
    setMotivoEliminacion("");
    setShowModalEliminacion(true);
  };

  const handleConfirmarEliminacion = () => {
    if (!motivoEliminacion.trim()) return;
    const ahora = new Date();
    const fechaHoraEliminacion = `${ahora.toLocaleDateString("es-CO")} ${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;

    // Registrar eliminación en auditoría
    const registroEliminacion = {
      id: `DEL-${registroEliminaciones.length + 1}`,
      cierreId: cierreAEliminar.id,
      fechaHoraEliminacion,
      motivo: motivoEliminacion,
      datosCierre: cierreAEliminar,
    };
    setRegistroEliminaciones([registroEliminacion, ...registroEliminaciones]);

    // Eliminar cierre del historial
    setHistorial(historial.filter((c) => c.id !== cierreAEliminar.id));

    // Cerrar modal
    setShowModalEliminacion(false);
    setCierreAEliminar(null);
    setMotivoEliminacion("");
  };

  return (
    <div className="min-h-screen bg-background text-white p-4 font-sans selection:bg-violet-500/30">
      {/* ════ HEADER ════ */}
      <header className="max-w-7xl mx-auto mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tighter">Caja</h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-neutral-900 border border-white/5 rounded-xl px-3 py-2 w-full sm:w-auto">
            <Calendar size={16} className="text-neutral-500" />
            <input
              type="date"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-mono text-neutral-300 outline-none uppercase [color-scheme:dark]"
            />
          </div>

          {seccion === "resumen" && (
            <button
              onClick={() => setShowNovedad(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-violet-500/20 bg-violet-600/10 text-violet-400 hover:bg-violet-600 hover:text-white transition-all text-xs font-black uppercase tracking-wider w-full sm:w-auto justify-center"
            >
              <PlusCircle size={16} />
              REGISTRAR NOVEDAD
            </button>
          )}
        </div>
      </header>

      {/* ════ NAVEGACIÓN ════ */}
      <nav className="max-w-7xl mx-auto mb-6 flex bg-neutral-900/30 p-1.5 rounded-2xl border border-white/5 w-fit relative">
        {secciones.map((s) => {
          const isActive = seccion === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSeccion(s.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors duration-200 relative ${
                isActive
                  ? "text-violet-400"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {/* Fondo animado premium para evitar saltos y parpadeos */}
              {isActive && (
                <motion.div
                  layoutId="activeNavBg"
                  className="absolute inset-0 bg-neutral-900 border border-white/5 rounded-xl shadow-md z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Contenido por encima del fondo animado */}
              <span className="relative z-10 flex items-center gap-2">
                <s.icon size={14} />
                {s.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ════ CONTENIDO PRINCIPAL ════ */}
      <main className="max-w-7xl mx-auto">
        <>
          {seccion === "resumen" && (
            <div key="resumen" className="space-y-6">
              {/* Grid KPIs Reconciliados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  label="TOTAL VENTA"
                  value={fmt(totalVentas)}
                  sub={`${transaccionesValidas.length} órdenes`}
                  color="text-violet-400"
                />
                <KPICard
                  label="EFECTIVO ESPERADO"
                  value={fmt(esperadoEfectivo)}
                  sub="Ventas efectivo ± Novedades"
                  color="text-amber-400"
                />
                <KPICard
                  label="TRANSF. ESPERADA"
                  value={fmt(esperadoTransferencia)}
                  sub="Bancos digitales ± Novedades"
                  color="text-emerald-400"
                />
                <KPICard
                  label="TARJETA ESPERADO"
                  value={fmt(esperadoTarjeta)}
                  sub="Cuenta ± Novedades"
                  color="text-blue-400"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Movimientos Manuales */}
                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-neutral-400 text-xs font-black tracking-widest uppercase">
                      <Receipt size={16} className="text-amber-500" />
                      NOVEDADES ({fmtFecha(fechaFiltro)})
                    </div>
                  </div>

                  {novedadesFiltradas.length === 0 ? (
                    <p className="text-center py-6 text-neutral-600 text-sm font-mono uppercase">
                      SIN REGISTROS PARA ESTA FECHA
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {novedadesFiltradas.map((n) => (
                        <div
                          key={n.id}
                          className="flex justify-between items-center p-3 bg-black/30 border border-white/5 rounded-xl"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className={`p-1.5 rounded-lg ${n.tipo === "egreso" ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}
                            >
                              {n.tipo === "egreso" ? (
                                <ArrowDownRight size={16} />
                              ) : (
                                <ArrowUpRight size={16} />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-white uppercase tracking-tight">
                                {n.concepto}
                              </p>
                              <p className="text-[10px] sm:text-xs text-neutral-500 font-mono mt-0.5">
                                {n.hora} • {n.id} •{" "}
                                <span className="text-violet-400 font-bold uppercase">
                                  {n.metodo || "efectivo"}
                                </span>
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-sm font-black font-mono whitespace-nowrap ml-2 ${n.tipo === "egreso" ? "text-red-400" : "text-emerald-400"}`}
                          >
                            {n.tipo === "egreso" ? "−" : "+"}
                            {fmt(n.monto)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Formulario de Cierre Dinámico */}
                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2  text-xs font-black tracking-widest uppercase">
                    <Lock size={16} />
                    CIERRE DE CAJA ({fmtFecha(fechaFiltro)})
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-xs font-black text-neutral-500 uppercase tracking-widest ml-1 block mb-2">
                      RESPONSABLE CAJERO
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: JUAN PÉREZ"
                      value={nombreCajero}
                      onChange={(e) => setNombreCajero(e.target.value)}
                      className="w-full bg-neutral-900  rounded-xl py-3 px-4 text-xs sm:text-sm font-mono text-neutral-300 outline-none focus:border border-white/5 transition-all uppercase placeholder:text-neutral-700"
                    />
                  </div>

                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <p className="text-[10px] sm:text-xs font-black text-neutral-500 uppercase tracking-widest ml-1">
                      VALORES ESPERADOS CON NOVEDADES
                    </p>
                    {["efectivo", "tarjeta", "transferencia"].map((method) => {
                      const esperado =
                        method === "efectivo"
                          ? esperadoEfectivo
                          : method === "tarjeta"
                            ? esperadoTarjeta
                            : esperadoTransferencia;

                      const declarado = Number(metodosPagoReales[method]) || 0;
                      const diferenciaIndividual = declarado - esperado;

                      const textColor =
                        diferenciaIndividual > 0
                          ? "text-emerald-400"
                          : diferenciaIndividual < 0
                            ? "text-red-400"
                            : "text-neutral-500";

                      return (
                        <div
                          key={method}
                          className="grid grid-cols-1 gap-2 p-3 rounded-xl border border-white/5 bg-black/20 transition-all"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-mono font-bold text-neutral-400 uppercase">
                              {method}{" "}
                            </span>
                            {diferenciaIndividual !== 0 && (
                              <span
                                className={`text-xs sm:text-sm font-bold uppercase text-center ${textColor}`}
                              >
                                {diferenciaIndividual > 0 ? "Sobra" : "Falta"}{" "}
                                {fmt(Math.abs(diferenciaIndividual))}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            value={
                              metodosPagoReales[method]
                                ? `${Number(metodosPagoReales[method]).toLocaleString("es-CO")}`
                                : ""
                            }
                            onChange={(e) => {
                              const valorLimpio = e.target.value.replace(
                                /\D/g,
                                "",
                              );
                              setMetodosPagoReales({
                                ...metodosPagoReales,
                                [method]: valorLimpio,
                              });
                            }}
                            className="w-full bg-neutral-900 text-right border border-white/10 rounded-lg p-2 text-base sm:text-lg font-mono font-bold text-white outline-none focus:border-white/20 transition-all"
                          />
                        </div>
                      );
                    })}

                    {/* Resumen General */}
                    <div
                      className={`mt-4 p-4 rounded-xl border-2 flex justify-between items-center ${
                        diferenciaGlobal === 0
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : diferenciaGlobal > 0
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-red-500/30 bg-red-500/5"
                      }`}
                    >
                      <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                        TOTAL
                      </span>
                      <span
                        className={`text-lg font-black font-mono ${
                          diferenciaGlobal === 0
                            ? "text-emerald-400"
                            : diferenciaGlobal > 0
                              ? "text-emerald-400"
                              : "text-red-400"
                        }`}
                      >
                        {diferenciaGlobal === 0
                          ? "✓ PERFECTO"
                          : diferenciaGlobal > 0
                            ? `+ ${fmt(diferenciaGlobal)}`
                            : `− ${fmt(Math.abs(diferenciaGlobal))}`}
                      </span>
                    </div>
                  </div>

                  {/* Botón Inteligente Reconciliado */}
                  <button
                    onClick={handleConfirmarCierre}
                    disabled={!nombreCajero.trim()}
                    className={`w-full mt-2 py-3.5 rounded-xl border flex items-center justify-center gap-2 transition-all text-xs font-black uppercase tracking-widest ${configuracionBotonCierre.estilo}`}
                  >
                    <configuracionBotonCierre.icon size={16} />
                    {configuracionBotonCierre.texto}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── SECCIÓN: HISTORIAL DE CIERRES FILTRADO ── */}
          {seccion === "historial" && (
            <div key="historial" className="space-y-3">
              <div className="flex justify-between items-center bg-neutral-900/20 border border-white/5 p-4 rounded-xl">
                <p className="text-xs font-black font-mono tracking-widest uppercase text-neutral-400">
                  CIERRES DEL DÍA ({fmtFecha(fechaFiltro)})
                </p>
                <p className="text-xs font-mono text-neutral-500">
                  {historialFiltrado.length} ENCONTRADOS • {historial.length}{" "}
                  TOTAL
                </p>
              </div>

              {historialFiltrado.length === 0 ? (
                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-8 text-center">
                  <p className="text-sm font-mono text-neutral-500 uppercase">
                    NO SE REGISTRARON CIERRES EN ESTA FECHA
                  </p>
                </div>
              ) : (
                historialFiltrado.map((cierre) => {
                  const isExpanded = cierreExpandido === cierre.id;
                  return (
                    <div
                      key={cierre.id}
                      className={`border rounded-2xl transition-all duration-300 ${isExpanded ? "bg-neutral-900/80 border-violet-500/30" : "bg-neutral-900/40 border-white/5 hover:border-white/10"}`}
                    >
                      <button
                        onClick={() =>
                          setCierreExpandido(isExpanded ? null : cierre.id)
                        }
                        className="w-full p-4 text-left grid grid-cols-2 md:grid-cols-12 items-center gap-4"
                      >
                        <div className="col-span-2 md:col-span-4">
                          <p className="text-base font-semibold text-white font-mono">
                            {cierre.id}
                          </p>
                          <p className="text-xs sm:text-sm text-neutral-500 font-mono uppercase mt-0.5">
                            {cierre.cajero} • {cierre.horaApertura}-
                            {cierre.horaCierre}
                          </p>
                        </div>
                        <div className="col-span-1 md:col-span-3">
                          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-0.5">
                            FECHA LOG
                          </p>
                          <span className="text-xs sm:text-sm font-mono font-bold text-neutral-300">
                            {fmtFecha(cierre.fecha)}
                          </span>
                        </div>
                        <div className="col-span-1 md:col-span-3 text-right md:text-left">
                          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-0.5">
                            DIFERENCIA
                          </p>
                          <span
                            className={`text-xs sm:text-sm font-bold font-mono ${cierre.diferencia === 0 ? "text-emerald-400" : cierre.diferencia > 0 ? "text-blue-400" : "text-red-400"}`}
                          >
                            {cierre.diferencia > 0 ? "+" : ""}
                            {fmt(cierre.diferencia)}
                          </span>
                        </div>
                        <div className="col-span-2 md:col-span-2 flex justify-end">
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            className="p-2 bg-white/5 rounded-full text-neutral-500"
                          >
                            <ChevronDown size={16} />
                          </motion.div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-white/5 bg-black/20"
                          >
                            <div className="p-6 space-y-5">
                              {/* Encabezado */}
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm text-neutral-400 uppercase tracking-wider mb-2">
                                    Cierre del {fmtFecha(cierre.fecha)} a las{" "}
                                    {cierre.horaCierre}
                                  </p>
                                  <p className="text-xs text-neutral-500">
                                    Responsable:{" "}
                                    <span className="text-white font-semibold">
                                      {cierre.cajero}
                                    </span>
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p
                                    className={`text-lg font-black font-mono ${
                                      cierre.diferencia === 0
                                        ? "text-emerald-400"
                                        : cierre.diferencia > 0
                                          ? "text-blue-400"
                                          : "text-red-400"
                                    }`}
                                  >
                                    {cierre.diferencia > 0
                                      ? "+ SOBRA "
                                      : cierre.diferencia < 0
                                        ? "- FALTA "
                                        : "✓ "}
                                    {fmt(Math.abs(cierre.diferencia))}
                                  </p>
                                  <button
                                    onClick={() =>
                                      handleAbrirModalEliminacion(cierre)
                                    }
                                    className="text-xs text-red-400 hover:text-red-300 uppercase tracking-wider mt-2 font-bold"
                                  >
                                    🗑️ Eliminar
                                  </button>
                                </div>
                              </div>

                              {/* Tabla de Métodos */}
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b border-white/5">
                                      <th className="text-left py-2 px-2 text-neutral-500 font-black uppercase">
                                        Método
                                      </th>
                                      <th className="text-right py-2 px-2 text-neutral-500 font-black uppercase">
                                        Esperado
                                      </th>
                                      <th className="text-right py-2 px-2 text-neutral-500 font-black uppercase">
                                        Contado
                                      </th>
                                      <th className="text-right py-2 px-2 text-neutral-500 font-black uppercase">
                                        Diferencia
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {[
                                      "Efectivo",
                                      "Transferencia",
                                      "Tarjeta",
                                    ].map((method, idx) => {
                                      const esperado =
                                        idx === 0
                                          ? cierre.totalEfectivo
                                          : idx === 1
                                            ? cierre.totalTransferencia
                                            : cierre.totalTarjeta;
                                      const contado = esperado; // Aquí irían los valores contados reales
                                      const diff = contado - esperado;
                                      return (
                                        <tr
                                          key={method}
                                          className="border-b border-white/5"
                                        >
                                          <td className="py-2 px-2 font-mono text-neutral-300">
                                            {method}
                                          </td>
                                          <td className="text-right py-2 px-2 font-mono text-neutral-400">
                                            {fmt(esperado)}
                                          </td>
                                          <td className="text-right py-2 px-2 font-mono text-amber-400">
                                            {fmt(contado)}
                                          </td>
                                          <td
                                            className={`text-right py-2 px-2 font-mono font-bold ${
                                              diff === 0
                                                ? "text-neutral-400"
                                                : diff > 0
                                                  ? "text-blue-400"
                                                  : "text-red-400"
                                            }`}
                                          >
                                            {diff > 0
                                              ? "+ "
                                              : diff < 0
                                                ? "- "
                                                : ""}
                                            {fmt(Math.abs(diff))}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {/* Novedades del Día */}
                              <div className="bg-neutral-900/40 rounded-lg p-3 border border-white/5">
                                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black mb-3">
                                  Novedades Registradas
                                </p>
                                {(() => {
                                  const novedadesDelDia = novedades.filter(
                                    (n) => n.fecha === cierre.fecha,
                                  );
                                  return novedadesDelDia.length === 0 ? (
                                    <p className="text-xs text-neutral-500 font-mono">
                                      Sin novedades registradas
                                    </p>
                                  ) : (
                                    <div className="space-y-2">
                                      {novedadesDelDia.map((n) => (
                                        <div
                                          key={n.id}
                                          className="flex justify-between items-start p-2 bg-black/30 rounded-lg border border-white/5"
                                        >
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span
                                                className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                                                  n.tipo === "egreso"
                                                    ? "bg-red-500/10 text-red-400"
                                                    : "bg-emerald-500/10 text-emerald-400"
                                                }`}
                                              >
                                                {n.tipo}
                                              </span>
                                              <span className="text-xs text-neutral-400 font-mono">
                                                {n.hora}
                                              </span>
                                            </div>
                                            <p className="text-xs text-white font-semibold uppercase">
                                              {n.concepto}
                                            </p>
                                            <p className="text-[10px] text-neutral-500 mt-1">
                                              Método:{" "}
                                              <span className="text-violet-400 font-bold">
                                                {n.metodo}
                                              </span>
                                            </p>
                                          </div>
                                          <span
                                            className={`text-xs font-black font-mono whitespace-nowrap ml-2 ${
                                              n.tipo === "egreso"
                                                ? "text-red-400"
                                                : "text-emerald-400"
                                            }`}
                                          >
                                            {n.tipo === "egreso" ? "−" : "+"}
                                            {fmt(n.monto)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      </main>

      {/* ════ MODAL DE ELIMINACIÓN DE CIERRE ════ */}
      <AnimatePresence>
        {showModalEliminacion && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowModalEliminacion(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 border border-red-500/20 rounded-2xl p-6 w-full max-w-sm space-y-4"
            >
              <div>
                <h3 className="text-sm sm:text-base font-black text-red-400 uppercase tracking-widest">
                  ⚠️ ELIMINAR CIERRE DE CAJA
                </h3>
                <p className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider font-mono mt-0.5">
                  {cierreAEliminar?.id} • {fmtFecha(cierreAEliminar?.fecha)}
                </p>
              </div>

              {/* Info del cierre a eliminar */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Responsable:</span>
                  <span className="text-white font-bold">
                    {cierreAEliminar?.cajero}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Diferencia:</span>
                  <span
                    className={`font-bold ${
                      cierreAEliminar?.diferencia === 0
                        ? "text-emerald-400"
                        : cierreAEliminar?.diferencia > 0
                          ? "text-blue-400"
                          : "text-red-400"
                    }`}
                  >
                    {fmt(cierreAEliminar?.diferencia || 0)}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3">
                <label className="text-[10px] sm:text-xs font-black text-neutral-500 uppercase tracking-widest mb-2 block">
                  📝 MOTIVO DE ELIMINACIÓN
                </label>
                <textarea
                  placeholder="Explique el motivo de la eliminación de este cierre..."
                  value={motivoEliminacion}
                  onChange={(e) => setMotivoEliminacion(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-mono text-neutral-300 outline-none focus:border-red-500/40 placeholder:text-neutral-800 resize-none h-24"
                />
              </div>

              <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-widest">
                ✓ Esta acción quedará registrada en auditoría para el
                administrador
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowModalEliminacion(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/5 text-neutral-400 text-xs font-black uppercase tracking-wider hover:bg-white/5 transition-all"
                >
                  CANCELAR
                </button>
                <button
                  onClick={handleConfirmarEliminacion}
                  disabled={!motivoEliminacion.trim()}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    motivoEliminacion.trim()
                      ? "bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white"
                      : "bg-neutral-900/40 text-neutral-600 border border-neutral-800 cursor-not-allowed"
                  }`}
                >
                  CONFIRMAR ELIMINACIÓN
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════ MODAL DE NOVEDADES ════ */}
      <AnimatePresence>
        {showNovedad && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowNovedad(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4"
            >
              <div>
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-widest">
                  NUEVO MOVIMIENTO MANUAL
                </h3>
                <p className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider font-mono mt-0.5">
                  Registrando en: {fmtFecha(fechaFiltro)}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/5">
                <div>
                  <label className="text-[10px] sm:text-xs font-black text-neutral-500 uppercase tracking-widest mb-2 block">
                    NATURALEZA FLUJO
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        setNuevaNovedad({ ...nuevaNovedad, tipo: "egreso" })
                      }
                      className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                        nuevaNovedad.tipo === "egreso"
                          ? "bg-red-500/10 border-red-500/30 text-red-400"
                          : "bg-black/20 border-white/5 text-neutral-500"
                      }`}
                    >
                      <MinusCircle size={12} className="inline mr-1" /> SALIDA
                    </button>
                    <button
                      onClick={() =>
                        setNuevaNovedad({ ...nuevaNovedad, tipo: "ingreso" })
                      }
                      className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                        nuevaNovedad.tipo === "ingreso"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-black/20 border-white/5 text-neutral-500"
                      }`}
                    >
                      <PlusCircle size={12} className="inline mr-1" /> ENTRADA
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5 block">
                    CONCEPTO DESCRIPCIÓN
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: COMPRA DE INSUMOS"
                    value={nuevaNovedad.concepto}
                    onChange={(e) =>
                      setNuevaNovedad({
                        ...nuevaNovedad,
                        concepto: e.target.value,
                      })
                    }
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-mono text-neutral-300 outline-none focus:border-violet-500/40 uppercase placeholder:text-neutral-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5 block">
                    MÉTODO AFECTADO
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {["efectivo", "tarjeta", "transferencia"].map((m) => (
                      <button
                        key={m}
                        onClick={() =>
                          setNuevaNovedad({ ...nuevaNovedad, metodo: m })
                        }
                        className={`py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase border transition-all ${
                          nuevaNovedad.metodo === m
                            ? "bg-violet-500/20 border-violet-500/40 text-violet-400"
                            : "bg-black/20 border-white/5 text-neutral-500"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-black text-neutral-500 uppercase tracking-widest mb-1.5 block">
                    MONTO COP
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={
                      nuevaNovedad.monto
                        ? `${Number(nuevaNovedad.monto).toLocaleString("es-CO")}`
                        : ""
                    }
                    onChange={(e) => {
                      const valorLimpio = e.target.value.replace(/\D/g, "");
                      setNuevaNovedad({
                        ...nuevaNovedad,
                        monto: valorLimpio,
                      });
                    }}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-mono text-white font-bold outline-none focus:border-violet-500/40 placeholder:text-neutral-800"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowNovedad(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/5 text-neutral-400 text-xs font-black uppercase tracking-wider hover:bg-white/5 transition-all"
                  >
                    CANCELAR
                  </button>
                  <button
                    onClick={() => {
                      if (!nuevaNovedad.concepto || !nuevaNovedad.monto) return;
                      const ahora = new Date();
                      const hora = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
                      setNovedades([
                        ...novedades,
                        {
                          ...nuevaNovedad,
                          id: `NOV-${novedades.length + 1}`,
                          hora: hora,
                          fecha: fechaFiltro,
                          monto: Number(nuevaNovedad.monto),
                        },
                      ]);
                      setNuevaNovedad({
                        tipo: "egreso",
                        concepto: "",
                        monto: "",
                        metodo: "efectivo",
                      });
                      setShowNovedad(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 text-xs font-black uppercase tracking-wider hover:bg-violet-600 hover:text-white transition-all"
                  >
                    REGISTRAR
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
