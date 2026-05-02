import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  CreditCard,
  Banknote,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
  Lock,
  Unlock,
  Calculator,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  History,
  ChevronDown,
  ChevronUp,
  Calendar,
} from "lucide-react";

// ─── DATOS MOCK ───────────────────────────────────────────────────────────────

const BILLETES_COP = [
  { valor: 100000, label: "100K" },
  { valor: 50000, label: "50K" },
  { valor: 20000, label: "20K" },
  { valor: 10000, label: "10K" },
  { valor: 5000, label: "5K" },
  { valor: 2000, label: "2K" },
  { valor: 1000, label: "1K" },
  { valor: 500, label: "500" },
  { valor: 200, label: "200" },
  { valor: 100, label: "100" },
];

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
    metodo: "efectivo",
    total: 43000,
    estado: "anulado",
  },
  {
    id: "TRX-076",
    hora: "11:22",
    mesa: "09",
    metodo: "tarjeta",
    total: 98500,
    estado: "ok",
  },
  {
    id: "TRX-075",
    hora: "11:05",
    mesa: "04",
    metodo: "efectivo",
    total: 62000,
    estado: "ok",
  },
  {
    id: "TRX-074",
    hora: "10:48",
    mesa: "06",
    metodo: "tarjeta",
    total: 175000,
    estado: "ok",
  },
  {
    id: "TRX-073",
    hora: "10:30",
    mesa: "08",
    metodo: "efectivo",
    total: 39000,
    estado: "ok",
  },
  {
    id: "TRX-072",
    hora: "10:12",
    mesa: "03",
    metodo: "tarjeta",
    total: 121000,
    estado: "ok",
  },
];

// Historial de cierres demo (cierres anteriores)
const HISTORIAL_INICIAL = [
  {
    id: "CIE-003",
    fecha: "2025-05-01",
    horaApertura: "06:00",
    horaCierre: "22:15",
    cajero: "María López",
    fondoInicial: 200000,
    totalVentas: 1240000,
    totalEfectivo: 680000,
    totalTarjeta: 560000,
    totalAnulados: 85000,
    enCaja: 880000,
    totalContado: 875000,
    diferencia: -5000,
    transacciones: 18,
  },
  {
    id: "CIE-002",
    fecha: "2025-04-30",
    horaApertura: "06:00",
    horaCierre: "23:02",
    cajero: "Carlos Ruiz",
    fondoInicial: 200000,
    totalVentas: 980000,
    totalEfectivo: 510000,
    totalTarjeta: 470000,
    totalAnulados: 43000,
    enCaja: 710000,
    totalContado: 710000,
    diferencia: 0,
    transacciones: 14,
  },
  {
    id: "CIE-001",
    fecha: "2025-04-29",
    horaApertura: "06:00",
    horaCierre: "21:48",
    cajero: "María López",
    fondoInicial: 200000,
    totalVentas: 1560000,
    totalEfectivo: 820000,
    totalTarjeta: 740000,
    totalAnulados: 120000,
    enCaja: 1020000,
    totalContado: 1035000,
    diferencia: 15000,
    transacciones: 23,
  },
];

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

const fmtFecha = (fechaStr) => {
  const [y, m, d] = fechaStr.split("-");
  const meses = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  return `${d} ${meses[parseInt(m) - 1]} ${y}`;
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function Caja() {
  const [cajaAbierta, setCajaAbierta] = useState(true);
  const [seccion, setSeccion] = useState("resumen");
  const [showCierre, setShowCierre] = useState(false);
  const [showApertura, setShowApertura] = useState(false);
  const [conteo, setConteo] = useState(
    Object.fromEntries(BILLETES_COP.map((b) => [b.valor, 0])),
  );
  const [fondoInicial] = useState(200000);
  const [historial, setHistorial] = useState(HISTORIAL_INICIAL);
  const [cierreExpandido, setCierreExpandido] = useState(null);

  const transaccionesValidas = TRANSACCIONES_MOCK.filter(
    (t) => t.estado === "ok",
  );
  const totalEfectivo = transaccionesValidas
    .filter((t) => t.metodo === "efectivo")
    .reduce((a, t) => a + t.total, 0);
  const totalTarjeta = transaccionesValidas
    .filter((t) => t.metodo === "tarjeta")
    .reduce((a, t) => a + t.total, 0);
  const totalVentas = totalEfectivo + totalTarjeta;
  const totalAnulados = TRANSACCIONES_MOCK.filter(
    (t) => t.estado === "anulado",
  ).reduce((a, t) => a + t.total, 0);

  const totalConteo = Object.entries(conteo).reduce(
    (a, [val, qty]) => a + Number(val) * qty,
    0,
  );
  const enCaja = fondoInicial + totalEfectivo;
  const diferencia = totalConteo - enCaja;

  const secciones = [
    { id: "resumen", label: "Resumen", icon: TrendingUp },
    { id: "cuadre", label: "Cuadre", icon: Calculator },
    { id: "transacciones", label: "Movimientos", icon: Receipt },
    { id: "historial", label: "Historial", icon: History },
  ];

  const handleConfirmarCierre = () => {
    const ahora = new Date();
    const hora = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
    const fecha = ahora.toISOString().split("T")[0];
    const nuevoCierre = {
      id: `CIE-${String(historial.length + 4).padStart(3, "0")}`,
      fecha,
      horaApertura: "06:00",
      horaCierre: hora,
      cajero: "Cajero Activo",
      fondoInicial,
      totalVentas,
      totalEfectivo,
      totalTarjeta,
      totalAnulados,
      enCaja,
      totalContado: totalConteo,
      diferencia,
      transacciones: transaccionesValidas.length,
    };
    setHistorial([nuevoCierre, ...historial]);
    setCajaAbierta(false);
    setShowCierre(false);
  };

  return (
    <div className="h-screen bg-[#050505] text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* ── HEADER ── */}
      <header className="px-4 py-3 border-b border-white/5 bg-[#0A0A0A] flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#111] border border-white/10 rounded-xl flex items-center justify-center">
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none">
              GLOTO<span className="text-emerald-400">CAJA</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase ${
              cajaAbierta
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${cajaAbierta ? "bg-emerald-400" : "bg-red-400"}`}
            />
            {cajaAbierta ? "Abierta" : "Cerrada"}
          </div>

          {cajaAbierta ? (
            <button
              onClick={() => setShowCierre(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-[10px] font-black uppercase hover:bg-red-500/20 transition-all"
            >
              <Lock size={12} />
              Cerrar Caja
            </button>
          ) : (
            <button
              onClick={() => setShowApertura(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-black uppercase hover:bg-emerald-500/20 transition-all"
            >
              <Unlock size={12} />
              Abrir Caja
            </button>
          )}
        </div>
      </header>

      {/* ── NAV TABS ── */}
      <nav className="flex border-b border-white/5 bg-[#080808] shrink-0 overflow-x-auto">
        {secciones.map((s) => (
          <button
            key={s.id}
            onClick={() => setSeccion(s.id)}
            className={`flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all relative ${
              seccion === s.id
                ? "text-white"
                : "text-slate-600 hover:text-slate-400"
            }`}
          >
            <s.icon size={14} />
            {s.label}
            {s.id === "historial" && historial.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-slate-700 text-slate-300 text-[8px] font-black">
                {historial.length}
              </span>
            )}
            {seccion === s.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
              />
            )}
          </button>
        ))}
      </nav>

      {/* ── CONTENIDO ── */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* ════ RESUMEN ════ */}
          {seccion === "resumen" && (
            <motion.div
              key="resumen"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard
                  label="Total Ventas"
                  valor={fmt(totalVentas)}
                  icon={TrendingUp}
                  color="emerald"
                  sub={`${transaccionesValidas.length} órdenes`}
                />
                <KpiCard
                  label="Efectivo"
                  valor={fmt(totalEfectivo)}
                  icon={Banknote}
                  color="amber"
                  sub={`${transaccionesValidas.filter((t) => t.metodo === "efectivo").length} transacciones`}
                />
                <KpiCard
                  label="Tarjeta"
                  valor={fmt(totalTarjeta)}
                  icon={CreditCard}
                  color="blue"
                  sub={`${transaccionesValidas.filter((t) => t.metodo === "tarjeta").length} transacciones`}
                />
                <KpiCard
                  label="Anulados"
                  valor={fmt(totalAnulados)}
                  icon={XCircle}
                  color="red"
                  sub={`${TRANSACCIONES_MOCK.filter((t) => t.estado === "anulado").length} registros`}
                />
              </div>

              <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
                  Distribución por método de pago
                </p>
                <div className="flex h-3 rounded-full overflow-hidden gap-px mb-3">
                  <div
                    className="bg-amber-500 transition-all"
                    style={{ width: `${(totalEfectivo / totalVentas) * 100}%` }}
                  />
                  <div
                    className="bg-blue-500 transition-all"
                    style={{ width: `${(totalTarjeta / totalVentas) * 100}%` }}
                  />
                </div>
                <div className="flex gap-6 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-slate-400">Efectivo</span>
                    <span className="font-black text-amber-400">
                      {Math.round((totalEfectivo / totalVentas) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-slate-400">Tarjeta</span>
                    <span className="font-black text-blue-400">
                      {Math.round((totalTarjeta / totalVentas) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">
                    Fondo Inicial
                  </p>
                  <p className="text-2xl font-black tabular-nums">
                    {fmt(fondoInicial)}
                  </p>
                </div>
                <div className="bg-[#0F0F0F] border border-emerald-500/20 rounded-2xl p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">
                    En Caja (efectivo)
                  </p>
                  <p className="text-2xl font-black tabular-nums text-emerald-400">
                    {fmt(enCaja)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════ TRANSACCIONES ════ */}
          {seccion === "transacciones" && (
            <motion.div
              key="transacciones"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 md:p-6 max-w-5xl mx-auto space-y-2"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {TRANSACCIONES_MOCK.length} movimientos hoy
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase">
                    {transaccionesValidas.length} OK
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase">
                    {
                      TRANSACCIONES_MOCK.filter((t) => t.estado === "anulado")
                        .length
                    }{" "}
                    Anulados
                  </span>
                </div>
              </div>

              {TRANSACCIONES_MOCK.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    t.estado === "anulado"
                      ? "bg-red-500/5 border-red-500/15 opacity-60"
                      : "bg-[#0F0F0F] border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.metodo === "efectivo" ? "bg-amber-500/15 text-amber-400" : "bg-blue-500/15 text-blue-400"}`}
                    >
                      {t.metodo === "efectivo" ? (
                        <Banknote size={14} />
                      ) : (
                        <CreditCard size={14} />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black">{t.id}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-black">
                        Mesa {t.mesa} • {t.hora}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${t.estado === "anulado" ? "bg-red-500/15 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}
                    >
                      {t.estado === "anulado" ? "Anulado" : "OK"}
                    </span>
                    <p
                      className={`text-sm font-black tabular-nums ${t.estado === "anulado" ? "line-through text-slate-600" : ""}`}
                    >
                      {fmt(t.total)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ════ CUADRE ════ */}
          {seccion === "cuadre" && (
            <motion.div
              key="cuadre"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 md:p-6 max-w-5xl mx-auto"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
                    Conteo de billetes y monedas
                  </p>
                  <div className="space-y-2">
                    {BILLETES_COP.map((b) => (
                      <div
                        key={b.valor}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-xs font-black text-slate-400 w-14">
                          ${b.label}
                        </span>
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <button
                            onClick={() =>
                              setConteo((prev) => ({
                                ...prev,
                                [b.valor]: Math.max(0, prev[b.valor] - 1),
                              }))
                            }
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-all"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-black tabular-nums w-8 text-center">
                            {conteo[b.valor]}
                          </span>
                          <button
                            onClick={() =>
                              setConteo((prev) => ({
                                ...prev,
                                [b.valor]: prev[b.valor] + 1,
                              }))
                            }
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-all"
                          >
                            <Plus size={12} />
                          </button>
                          <span className="text-[10px] text-slate-600 tabular-nums w-24 text-right font-black">
                            {fmt(b.valor * conteo[b.valor])}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-500">
                      Total contado
                    </span>
                    <span className="text-xl font-black tabular-nums text-white">
                      {fmt(totalConteo)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-5 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Resultado del cuadre
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Fondo inicial</span>
                        <span className="font-black">{fmt(fondoInicial)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ventas efectivo</span>
                        <span className="font-black text-amber-400">
                          +{fmt(totalEfectivo)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-2">
                        <span className="text-slate-400 font-black">
                          Esperado en caja
                        </span>
                        <span className="font-black">{fmt(enCaja)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-black">
                          Contado
                        </span>
                        <span className="font-black">{fmt(totalConteo)}</span>
                      </div>
                    </div>

                    <div
                      className={`flex justify-between items-center p-3 rounded-xl border ${
                        diferencia === 0
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : diferencia > 0
                            ? "bg-blue-500/10 border-blue-500/20"
                            : "bg-red-500/10 border-red-500/20"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {diferencia === 0 ? (
                          <CheckCircle2
                            size={14}
                            className="text-emerald-400"
                          />
                        ) : diferencia > 0 ? (
                          <ArrowUpRight size={14} className="text-blue-400" />
                        ) : (
                          <ArrowDownRight size={14} className="text-red-400" />
                        )}
                        <span
                          className={`text-[10px] font-black uppercase ${diferencia === 0 ? "text-emerald-400" : diferencia > 0 ? "text-blue-400" : "text-red-400"}`}
                        >
                          {diferencia === 0
                            ? "Cuadre perfecto"
                            : diferencia > 0
                              ? "Sobrante"
                              : "Faltante"}
                        </span>
                      </div>
                      <span
                        className={`text-lg font-black tabular-nums ${diferencia === 0 ? "text-emerald-400" : diferencia > 0 ? "text-blue-400" : "text-red-400"}`}
                      >
                        {diferencia > 0 ? "+" : ""}
                        {fmt(diferencia)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCierre(true)}
                    className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 transition-all"
                  >
                    <Lock size={14} />
                    Cerrar caja con este cuadre
                  </button>

                  <button
                    onClick={() =>
                      setConteo(
                        Object.fromEntries(
                          BILLETES_COP.map((b) => [b.valor, 0]),
                        ),
                      )
                    }
                    className="w-full py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 text-slate-500 transition-all"
                  >
                    <RotateCcw size={12} />
                    Reiniciar conteo
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ════ HISTORIAL DE CIERRES ════ */}
          {seccion === "historial" && (
            <motion.div
              key="historial"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 md:p-6 max-w-5xl mx-auto space-y-4"
            >
              {/* Encabezado con resumen */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {historial.length} cierres registrados
                  </p>
                </div>
                {/* Stats rápidas */}
                <div className="flex gap-3">
                  <div className="text-right">
                    <p className="text-[8px] text-slate-600 uppercase font-black">
                      Promedio ventas
                    </p>
                    <p className="text-xs font-black text-emerald-400">
                      {fmt(
                        Math.round(
                          historial.reduce((a, c) => a + c.totalVentas, 0) /
                            historial.length,
                        ),
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-slate-600 uppercase font-black">
                      Cierres cuadrados
                    </p>
                    <p className="text-xs font-black text-blue-400">
                      {historial.filter((c) => c.diferencia === 0).length}/
                      {historial.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de cierres */}
              {historial.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                  <History size={36} className="mb-3 opacity-30" />
                  <p className="text-sm font-black uppercase tracking-widest">
                    Sin cierres registrados
                  </p>
                  <p className="text-[10px] mt-1">
                    Los cierres aparecerán aquí al finalizar el turno.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {historial.map((cierre, idx) => {
                    const expanded = cierreExpandido === cierre.id;
                    const diffColor =
                      cierre.diferencia === 0
                        ? "text-emerald-400"
                        : cierre.diferencia > 0
                          ? "text-blue-400"
                          : "text-red-400";
                    const diffBg =
                      cierre.diferencia === 0
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : cierre.diferencia > 0
                          ? "bg-blue-500/10 border-blue-500/20"
                          : "bg-red-500/10 border-red-500/20";
                    const isReciente = idx === 0;

                    return (
                      <motion.div
                        key={cierre.id}
                        layout
                        className={`rounded-2xl border overflow-hidden transition-all ${
                          expanded
                            ? "border-white/10 bg-[#0F0F0F]"
                            : "border-white/5 bg-[#0A0A0A] hover:border-white/10"
                        }`}
                      >
                        {/* Fila principal (siempre visible) */}
                        <button
                          onClick={() =>
                            setCierreExpandido(expanded ? null : cierre.id)
                          }
                          className="w-full flex items-center justify-between p-4 text-left gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Ícono estado diferencia */}
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${diffBg} border`}
                            >
                              {cierre.diferencia === 0 ? (
                                <CheckCircle2
                                  size={15}
                                  className="text-emerald-400"
                                />
                              ) : cierre.diferencia > 0 ? (
                                <ArrowUpRight
                                  size={15}
                                  className="text-blue-400"
                                />
                              ) : (
                                <ArrowDownRight
                                  size={15}
                                  className="text-red-400"
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black">
                                  {cierre.id}
                                </span>
                                {isReciente && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[8px] font-black uppercase">
                                    Reciente
                                  </span>
                                )}
                              </div>
                              <p className="text-[9px] text-slate-500 font-black uppercase mt-0.5">
                                {fmtFecha(cierre.fecha)} • {cierre.horaApertura}
                                –{cierre.horaCierre} • {cierre.cajero}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right hidden sm:block">
                              <p className="text-[8px] text-slate-600 uppercase font-black">
                                Ventas
                              </p>
                              <p className="text-sm font-black tabular-nums text-emerald-400">
                                {fmt(cierre.totalVentas)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[8px] text-slate-600 uppercase font-black">
                                Diferencia
                              </p>
                              <p
                                className={`text-sm font-black tabular-nums ${diffColor}`}
                              >
                                {cierre.diferencia > 0 ? "+" : ""}
                                {fmt(cierre.diferencia)}
                              </p>
                            </div>
                            <div className="text-slate-600">
                              {expanded ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Detalle expandible */}
                        <AnimatePresence>
                          {expanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 border-t border-white/5 pt-4 grid sm:grid-cols-2 gap-4">
                                {/* Columna izquierda: desglose financiero */}
                                <div className="space-y-2">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-3">
                                    Desglose del turno
                                  </p>
                                  <DetailRow
                                    label="Fondo inicial"
                                    valor={fmt(cierre.fondoInicial)}
                                  />
                                  <DetailRow
                                    label="Ventas efectivo"
                                    valor={`+${fmt(cierre.totalEfectivo)}`}
                                    colorValor="text-amber-400"
                                  />
                                  <DetailRow
                                    label="Ventas tarjeta"
                                    valor={`+${fmt(cierre.totalTarjeta)}`}
                                    colorValor="text-blue-400"
                                  />
                                  <DetailRow
                                    label="Anulados"
                                    valor={fmt(cierre.totalAnulados)}
                                    colorValor="text-red-400"
                                  />
                                  <div className="border-t border-white/5 pt-2">
                                    <DetailRow
                                      label="Esperado en caja"
                                      valor={fmt(cierre.enCaja)}
                                      bold
                                    />
                                    <DetailRow
                                      label="Total contado"
                                      valor={fmt(cierre.totalContado)}
                                      bold
                                    />
                                  </div>
                                </div>

                                {/* Columna derecha: métricas rápidas */}
                                <div className="space-y-2">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-3">
                                    Métricas
                                  </p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <MiniKpi
                                      label="Transacciones"
                                      valor={cierre.transacciones}
                                    />
                                    <MiniKpi
                                      label="Ticket promedio"
                                      valor={fmt(
                                        Math.round(
                                          cierre.totalVentas /
                                            cierre.transacciones,
                                        ),
                                      )}
                                    />
                                    <MiniKpi
                                      label="% Efectivo"
                                      valor={`${Math.round((cierre.totalEfectivo / cierre.totalVentas) * 100)}%`}
                                      color="text-amber-400"
                                    />
                                    <MiniKpi
                                      label="% Tarjeta"
                                      valor={`${Math.round((cierre.totalTarjeta / cierre.totalVentas) * 100)}%`}
                                      color="text-blue-400"
                                    />
                                  </div>

                                  {/* Resultado final */}
                                  <div
                                    className={`mt-2 p-3 rounded-xl border ${diffBg} flex justify-between items-center`}
                                  >
                                    <span className="text-[10px] font-black uppercase text-slate-400">
                                      {cierre.diferencia === 0
                                        ? "Cuadre perfecto"
                                        : cierre.diferencia > 0
                                          ? "Sobrante"
                                          : "Faltante"}
                                    </span>
                                    <span
                                      className={`text-base font-black tabular-nums ${diffColor}`}
                                    >
                                      {cierre.diferencia > 0 ? "+" : ""}
                                      {fmt(cierre.diferencia)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Totales globales */}
              {historial.length > 0 && (
                <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-5 mt-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4">
                    Acumulado histórico
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[8px] text-slate-600 uppercase font-black">
                        Total ventas
                      </p>
                      <p className="text-base font-black tabular-nums text-emerald-400 mt-0.5">
                        {fmt(historial.reduce((a, c) => a + c.totalVentas, 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-600 uppercase font-black">
                        Total efectivo
                      </p>
                      <p className="text-base font-black tabular-nums text-amber-400 mt-0.5">
                        {fmt(
                          historial.reduce((a, c) => a + c.totalEfectivo, 0),
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-600 uppercase font-black">
                        Total tarjeta
                      </p>
                      <p className="text-base font-black tabular-nums text-blue-400 mt-0.5">
                        {fmt(historial.reduce((a, c) => a + c.totalTarjeta, 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-600 uppercase font-black">
                        Dif. acumulada
                      </p>
                      <p
                        className={`text-base font-black tabular-nums mt-0.5 ${
                          historial.reduce((a, c) => a + c.diferencia, 0) >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {historial.reduce((a, c) => a + c.diferencia, 0) > 0
                          ? "+"
                          : ""}
                        {fmt(historial.reduce((a, c) => a + c.diferencia, 0))}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── MODAL CIERRE ── */}
      <AnimatePresence>
        {showCierre && (
          <Modal
            titulo="Cerrar Caja"
            subtitulo="Esta acción cerrará el turno actual y registrará el cuadre en el historial."
            icon={Lock}
            iconColor="text-red-400"
            onCancel={() => setShowCierre(false)}
            onConfirm={handleConfirmarCierre}
            confirmLabel="Confirmar cierre"
            confirmColor="bg-red-600 hover:bg-red-500"
          >
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Total ventas</span>
                <span className="font-black">{fmt(totalVentas)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Efectivo en caja</span>
                <span className="font-black text-amber-400">{fmt(enCaja)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tarjeta</span>
                <span className="font-black text-blue-400">
                  {fmt(totalTarjeta)}
                </span>
              </div>
              <div
                className={`flex justify-between pt-2 border-t border-white/5 ${diferencia < 0 ? "text-red-400" : "text-emerald-400"}`}
              >
                <span className="font-black">Diferencia</span>
                <span className="font-black">
                  {diferencia >= 0 ? "+" : ""}
                  {fmt(diferencia)}
                </span>
              </div>
              <p className="text-[9px] text-slate-600 text-center pt-1">
                Este cierre quedará registrado en el historial de caja.
              </p>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── MODAL APERTURA ── */}
      <AnimatePresence>
        {showApertura && (
          <Modal
            titulo="Abrir Caja"
            subtitulo="Confirma el fondo inicial para iniciar el turno."
            icon={Unlock}
            iconColor="text-emerald-400"
            onCancel={() => setShowApertura(false)}
            onConfirm={() => {
              setCajaAbierta(true);
              setShowApertura(false);
            }}
            confirmLabel="Confirmar apertura"
            confirmColor="bg-emerald-600 hover:bg-emerald-500"
          >
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Fondo inicial</span>
              <span className="font-black text-emerald-400">
                {fmt(fondoInicial)}
              </span>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────────

const colorKpi = {
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    icon: "text-emerald-400",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    icon: "text-amber-400",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
    icon: "text-blue-400",
  },
  red: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-400",
    icon: "text-red-400",
  },
};

function KpiCard({ label, valor, icon: Icon, color, sub }) {
  const c = colorKpi[color];
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-4`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
          {label}
        </p>
        <Icon size={14} className={c.icon} />
      </div>
      <p className={`text-xl font-black tabular-nums leading-none ${c.text}`}>
        {valor}
      </p>
      <p className="text-[9px] text-slate-600 mt-1.5 font-black uppercase">
        {sub}
      </p>
    </div>
  );
}

// ─── DETAIL ROW ───────────────────────────────────────────────────────────────

function DetailRow({
  label,
  valor,
  colorValor = "text-slate-200",
  bold = false,
}) {
  return (
    <div className="flex justify-between items-center text-[11px]">
      <span className="text-slate-500">{label}</span>
      <span
        className={`tabular-nums ${colorValor} ${bold ? "font-black" : "font-semibold"}`}
      >
        {valor}
      </span>
    </div>
  );
}

// ─── MINI KPI ─────────────────────────────────────────────────────────────────

function MiniKpi({ label, valor, color = "text-slate-200" }) {
  return (
    <div className="bg-black/30 rounded-xl p-2.5">
      <p className="text-[8px] text-slate-600 uppercase font-black">{label}</p>
      <p className={`text-sm font-black tabular-nums mt-0.5 ${color}`}>
        {valor}
      </p>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

function Modal({
  titulo,
  subtitulo,
  icon: Icon,
  iconColor,
  onCancel,
  onConfirm,
  confirmLabel,
  confirmColor,
  children,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0F0F0F] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <Icon size={18} className={iconColor} />
          </div>
          <div>
            <h2 className="text-base font-black">{titulo}</h2>
            <p className="text-[10px] text-slate-500">{subtitulo}</p>
          </div>
        </div>
        <div className="bg-black/30 rounded-xl p-4 space-y-2">{children}</div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-black uppercase text-[10px] text-slate-400 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] text-white transition-all ${confirmColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
