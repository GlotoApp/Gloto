import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  X,
  ZoomIn,
  ZoomOut,
  Target,
  Receipt,
  RotateCcw,
  CheckCircle2,
  Plus,
  Map as MapIcon,
  Search,
  Trash2,
  ChefHat,
  DollarSign,
  ArrowRight,
  Minus,
  Edit3,
  Check,
  Users,
  GripVertical,
} from "lucide-react";

// ─── Detección de dispositivo ─────────────────────────────────────────────────
const isTouchDevice = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

// ─── Constantes ───────────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { nombre: "Pizza Pepperoni", precio: 45000, categoria: "Platos" },
  { nombre: "Pizza Margarita", precio: 38000, categoria: "Platos" },
  { nombre: "Pasta Carbonara", precio: 38000, categoria: "Platos" },
  { nombre: "Hamburguesa Master", precio: 35000, categoria: "Platos" },
  { nombre: "Parrillada Familiar", precio: 150000, categoria: "Platos" },
  { nombre: "Ensalada César", precio: 22000, categoria: "Platos" },
  { nombre: "Cerveza Club", precio: 12000, categoria: "Bebidas" },
  { nombre: "Jarra de Jugo", precio: 25000, categoria: "Bebidas" },
  { nombre: "Agua Mineral", precio: 6000, categoria: "Bebidas" },
  { nombre: "Gaseosa", precio: 8000, categoria: "Bebidas" },
  { nombre: "Tiramisú", precio: 18000, categoria: "Postres" },
  { nombre: "Brownie", precio: 15000, categoria: "Postres" },
];

const ESTADO_CONFIG = {
  libre: {
    color: "#4b5563",
    bg: "#111827",
    label: "Libre",
    dot: "bg-gray-500",
    ring: "rgba(75,85,99,0.4)",
  },
  ocupada: {
    color: "#f97316",
    bg: "#431407",
    label: "Ocupada",
    dot: "bg-orange-500",
    ring: "rgba(249,115,22,0.4)",
  },
  sucio: {
    color: "#ef4444",
    bg: "#450a0a",
    label: "Sucio",
    dot: "bg-red-500",
    ring: "rgba(239,68,68,0.4)",
  },
};

let NEXT_ID = 11;
const makeMesa = (x, y) => {
  const id = NEXT_ID++;
  return {
    id,
    numero: String(id).padStart(2, "0"),
    estado: "libre",
    personas: 0,
    startTime: null,
    total: 0,
    x,
    y,
    comanda: [],
    nota: "",
  };
};

const INITIAL_MESAS = [
  {
    id: 1,
    numero: "01",
    estado: "ocupada",
    personas: 4,
    startTime: Date.now() - 2700000,
    total: 125000,
    x: 1500,
    y: 1500,
    comanda: [
      { id: 1, item: "Pizza Pepperoni", precio: 45000, qty: 2 },
      { id: 2, item: "Cerveza Club", precio: 12000, qty: 3 },
    ],
    nota: "",
  },
  {
    id: 2,
    numero: "02",
    estado: "libre",
    personas: 0,
    startTime: null,
    total: 0,
    x: 1900,
    y: 1500,
    comanda: [],
    nota: "",
  },
  {
    id: 3,
    numero: "03",
    estado: "sucio",
    personas: 0,
    startTime: null,
    total: 0,
    x: 1500,
    y: 1900,
    comanda: [],
    nota: "",
  },
  {
    id: 4,
    numero: "04",
    estado: "ocupada",
    personas: 2,
    startTime: Date.now() - 4200000,
    total: 85000,
    x: 1900,
    y: 1900,
    comanda: [{ id: 1, item: "Pasta Carbonara", precio: 38000, qty: 1 }],
    nota: "Sin sal",
  },
  {
    id: 5,
    numero: "05",
    estado: "libre",
    personas: 0,
    startTime: null,
    total: 0,
    x: 2300,
    y: 1500,
    comanda: [],
    nota: "",
  },
  {
    id: 6,
    numero: "06",
    estado: "ocupada",
    personas: 6,
    startTime: Date.now() - 1500000,
    total: 210000,
    x: 2300,
    y: 1900,
    comanda: [
      { id: 1, item: "Parrillada Familiar", precio: 150000, qty: 1 },
      { id: 2, item: "Jarra de Jugo", precio: 25000, qty: 2 },
    ],
    nota: "",
  },
  {
    id: 7,
    numero: "07",
    estado: "sucio",
    personas: 0,
    startTime: null,
    total: 0,
    x: 1500,
    y: 2300,
    comanda: [],
    nota: "",
  },
  {
    id: 8,
    numero: "08",
    estado: "libre",
    personas: 0,
    startTime: null,
    total: 0,
    x: 1900,
    y: 2300,
    comanda: [],
    nota: "",
  },
  {
    id: 9,
    numero: "09",
    estado: "ocupada",
    personas: 3,
    startTime: Date.now() - 1800000,
    total: 95000,
    x: 2300,
    y: 2300,
    comanda: [{ id: 1, item: "Hamburguesa Master", precio: 35000, qty: 2 }],
    nota: "",
  },
  {
    id: 10,
    numero: "10",
    estado: "libre",
    personas: 0,
    startTime: null,
    total: 0,
    x: 2700,
    y: 1500,
    comanda: [],
    nota: "",
  },
];

// ─── Utils ────────────────────────────────────────────────────────────────────
const fmtCOP = (n) => `$${Number(n).toLocaleString("es-CO")}`;
const calcTotal = (comanda) =>
  comanda.reduce((s, i) => s + i.precio * i.qty, 0);

function useTimer(startTime) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      return;
    }
    const tick = () => setElapsed(Math.floor((Date.now() - startTime) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.innerWidth < 768 || isTouchDevice()
      : false,
  );
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768 || isTouchDevice());
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

// ─── Mesa Node ────────────────────────────────────────────────────────────────
function MesaNode({
  mesa,
  isActive,
  isEditMode,
  isMobile,
  onTap,
  onHoverAction,
  onDragEnd,
  constraintsRef,
}) {
  const timer = useTimer(mesa.startTime);
  const cfg = ESTADO_CONFIG[mesa.estado];
  const isOcc = mesa.estado === "ocupada";
  const [hovered, setHovered] = useState(false);
  const showInline = !isMobile && hovered && !isEditMode;

  return (
    <motion.div
      drag={isEditMode}
      dragConstraints={constraintsRef}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={(_, info) => onDragEnd(mesa.id, info.offset)}
      initial={{ x: mesa.x, y: mesa.y, scale: 0.8, opacity: 0 }}
      animate={{ x: mesa.x, y: mesa.y, scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      onHoverStart={() => !isMobile && setHovered(true)}
      onHoverEnd={() => !isMobile && setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (!isEditMode) onTap(mesa);
      }}
      className="absolute flex items-center justify-center"
      style={{
        width: 164,
        height: 164,
        cursor: isEditMode ? "grab" : "pointer",
        touchAction: isEditMode ? "none" : "manipulation",
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Sillas */}
        {isOcc &&
          Array.from({ length: Math.min(mesa.personas, 10) }).map((_, i) => {
            const angle = (i * 360) / Math.min(mesa.personas, 10);
            return (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="absolute w-5 h-5 rounded-full border border-white/20 bg-white/8 z-10 flex items-center justify-center"
                style={{
                  transform: `rotate(${angle}deg) translateY(-60px)`,
                  transformOrigin: "center",
                }}
              >
                <div className="w-2 h-2 rounded-full bg-white/50" />
              </motion.div>
            );
          })}

        {/* Círculo mesa */}
        <motion.div
          whileHover={!isMobile ? { scale: 1.07 } : {}}
          whileTap={{ scale: 0.95 }}
          className="w-24 h-24 rounded-full border-2 flex flex-col items-center justify-center shadow-2xl relative z-20"
          style={{
            borderColor: cfg.color,
            background: `radial-gradient(circle at 35% 35%, ${cfg.bg}dd, #080808)`,
            boxShadow: `0 0 ${isActive || hovered ? "40px" : "20px"} ${cfg.ring}, 0 10px 40px #000`,
            transition: "box-shadow 0.3s",
          }}
        >
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: `2px solid ${cfg.color}` }}
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
            />
          )}
          <span className="text-xl font-black text-white tracking-tight z-10">
            #{mesa.numero}
          </span>
          {isOcc && (
            <>
              <span
                className="text-[8px] font-bold uppercase z-10"
                style={{ color: cfg.color }}
              >
                {mesa.personas} pax
              </span>
              <span className="text-[8px] font-mono text-white/35 mt-0.5 z-10">
                {timer}
              </span>
            </>
          )}
          {mesa.estado === "sucio" && (
            <span className="text-[8px] text-red-400 font-black mt-1 z-10 animate-pulse">
              LIMPIAR
            </span>
          )}
        </motion.div>

        {/* Total badge */}
        {isOcc && mesa.total > 0 && (
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black whitespace-nowrap z-30"
            style={{
              background: `${cfg.color}18`,
              border: `1px solid ${cfg.color}40`,
              color: cfg.color,
            }}
          >
            {fmtCOP(mesa.total)}
          </div>
        )}

        {/* PC: acciones inline al hover */}
        <AnimatePresence>
          {showInline && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.9 }}
              transition={{ duration: 0.13 }}
              className="absolute -top-14 left-1/2 -translate-x-1/2 flex gap-1.5 z-[200]"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onHoverAction(mesa, "detail");
                }}
                className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-full shadow-xl text-white text-[9px] font-black uppercase tracking-wide transition-colors"
              >
                Ver
              </button>
              {mesa.estado === "libre" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onHoverAction(mesa, "sentar");
                  }}
                  className="bg-orange-600/90 hover:bg-orange-500 px-3 py-1.5 rounded-full shadow-xl text-white text-[9px] font-black uppercase tracking-wide transition-colors"
                >
                  Sentar
                </button>
              )}
              {mesa.estado === "sucio" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onHoverAction(mesa, "limpiar");
                  }}
                  className="bg-green-700 hover:bg-green-600 px-3 py-1.5 rounded-full shadow-xl text-white text-[9px] font-black uppercase tracking-wide transition-colors"
                >
                  Limpia
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit handle */}
        {isEditMode && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center z-50 shadow-lg">
            <GripVertical size={10} className="text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Shared panel body ────────────────────────────────────────────────────────
function PanelBody({ mesa, onUpdate, onDelete, onClose, onToast, isMobile }) {
  const [tab, setTab] = useState("comanda");
  const [busqueda, setBusqueda] = useState("");
  const [editNota, setEditNota] = useState(false);
  const [nota, setNota] = useState(mesa.nota || "");
  const [personas, setPersonas] = useState(mesa.personas);
  const timer = useTimer(mesa.startTime);
  const cfg = ESTADO_CONFIG[mesa.estado];
  const total = calcTotal(mesa.comanda);
  const menuFiltrado = MENU_ITEMS.filter((i) =>
    i.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );
  const categorias = [...new Set(menuFiltrado.map((i) => i.categoria))];

  const addItem = (menuItem) => {
    const existing = mesa.comanda.find((c) => c.item === menuItem.nombre);
    const newComanda = existing
      ? mesa.comanda.map((c) =>
          c.item === menuItem.nombre ? { ...c, qty: c.qty + 1 } : c,
        )
      : [
          ...mesa.comanda,
          {
            id: Date.now(),
            item: menuItem.nombre,
            precio: menuItem.precio,
            qty: 1,
          },
        ];
    onUpdate({ ...mesa, comanda: newComanda, total: calcTotal(newComanda) });
    onToast(`✓ ${menuItem.nombre}`);
  };

  const changeQty = (id, delta) => {
    const item = mesa.comanda.find((c) => c.id === id);
    if (!item) return;
    const newComanda =
      item.qty + delta <= 0
        ? mesa.comanda.filter((c) => c.id !== id)
        : mesa.comanda.map((c) =>
            c.id === id ? { ...c, qty: c.qty + delta } : c,
          );
    onUpdate({ ...mesa, comanda: newComanda, total: calcTotal(newComanda) });
  };

  const handleEstado = (s) => {
    if (s === "ocupada")
      onUpdate({
        ...mesa,
        estado: s,
        startTime: Date.now(),
        personas: Math.max(personas, 1),
      });
    else if (s === "libre") {
      onUpdate({
        ...mesa,
        estado: s,
        startTime: null,
        personas: 0,
        comanda: [],
        total: 0,
        nota: "",
      });
      onToast("Mesa liberada");
      if (isMobile) onClose();
    } else onUpdate({ ...mesa, estado: s, startTime: null, personas: 0 });
  };

  const handleCobrar = () => {
    onToast(`💳 ${fmtCOP(total)} cobrado — Mesa ${mesa.numero}`);
    onUpdate({
      ...mesa,
      estado: "sucio",
      startTime: null,
      personas: 0,
      comanda: [],
      total: 0,
      nota: "",
    });
    onClose();
  };

  const btnSize = isMobile ? 12 : 9;
  const qtySize = isMobile ? 8 : 6;
  const itemSize = isMobile ? "py-3.5" : "py-2.5";
  const addBtnH = isMobile ? "py-4" : "py-2.5";

  return (
    <>
      {/* Header */}
      <div
        className={`${isMobile ? "px-5 pb-3" : "px-7 pt-7 pb-4"} border-b border-white/6 flex-shrink-0`}
      >
        {!isMobile && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 hover:bg-white/8 rounded-full transition-colors"
          >
            <X size={16} className="text-slate-400" />
          </button>
        )}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              <span
                className="text-[9px] font-black uppercase tracking-[0.35em]"
                style={{ color: cfg.color }}
              >
                {cfg.label}
              </span>
              {mesa.estado === "ocupada" && (
                <span className="text-[9px] font-mono text-white/35 ml-1 bg-white/5 px-2 py-0.5 rounded-full">
                  {timer}
                </span>
              )}
            </div>
            <h2
              className={`${isMobile ? "text-3xl" : "text-4xl"} font-black tracking-tighter text-white`}
            >
              MESA {mesa.numero}
            </h2>
          </div>
          {/* Acciones estado */}
          <div className="flex gap-1.5 mt-1 flex-wrap justify-end">
            {mesa.estado !== "ocupada" && (
              <button
                onClick={() => handleEstado("ocupada")}
                className="px-3 py-1.5 bg-orange-600/15 border border-orange-500/30 text-orange-400 text-[8px] font-black uppercase tracking-widest rounded-xl active:scale-95 hover:bg-orange-600/25 transition-all flex items-center gap-1"
              >
                <Users size={9} /> Sentar
              </button>
            )}
            {mesa.estado === "sucio" && (
              <button
                onClick={() => handleEstado("libre")}
                className="px-3 py-1.5 bg-green-600/15 border border-green-500/30 text-green-400 text-[8px] font-black uppercase tracking-widest rounded-xl active:scale-95 hover:bg-green-600/25 transition-all flex items-center gap-1"
              >
                <CheckCircle2 size={9} /> Limpia
              </button>
            )}
            {mesa.estado === "ocupada" && (
              <button
                onClick={() => handleEstado("sucio")}
                className="px-3 py-1.5 bg-red-600/15 border border-red-500/30 text-red-400 text-[8px] font-black uppercase tracking-widest rounded-xl active:scale-95 hover:bg-red-600/25 transition-all flex items-center gap-1"
              >
                <RotateCcw size={9} /> Desocup.
              </button>
            )}
            <button
              onClick={() => {
                if (window.confirm(`¿Eliminar Mesa ${mesa.numero}?`)) {
                  onDelete(mesa.id);
                  onClose();
                }
              }}
              className="px-2.5 py-1.5 bg-white/5 border border-white/8 text-slate-600 rounded-xl hover:bg-red-900/20 hover:border-red-500/30 hover:text-red-400 active:scale-95 transition-all"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/6 flex-shrink-0">
        {[
          ["comanda", "Comanda"],
          ["menu", "Agregar"],
          ["info", "Info"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 ${isMobile ? "py-3" : "py-2.5"} text-[9px] font-black uppercase tracking-widest transition-all ${tab === id ? "text-white border-b-2 border-blue-500" : "text-slate-600 hover:text-slate-400"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Comanda */}
        {tab === "comanda" && (
          <div className="p-5 space-y-0.5">
            {mesa.comanda.length === 0 ? (
              <div className="text-center py-12">
                <ChefHat
                  size={28}
                  className="mx-auto mb-2 text-slate-700 opacity-50"
                />
                <p className="text-sm font-bold text-slate-600 mb-3">
                  Comanda vacía
                </p>
                <button
                  onClick={() => setTab("menu")}
                  className="text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mx-auto"
                >
                  Agregar ítems <ArrowRight size={10} />
                </button>
              </div>
            ) : (
              mesa.comanda.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className={`flex items-center gap-3 ${itemSize} border-b border-white/5`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">
                      {item.item}
                    </p>
                    <p className="text-[10px] text-slate-600">
                      {fmtCOP(item.precio)} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => changeQty(item.id, -1)}
                      className={`w-${qtySize} h-${qtySize} rounded-full bg-white/8 active:bg-white/20 hover:bg-white/15 flex items-center justify-center text-slate-400 transition-colors`}
                      style={{
                        width: isMobile ? 32 : 24,
                        height: isMobile ? 32 : 24,
                      }}
                    >
                      <Minus size={btnSize} />
                    </button>
                    <span className="w-5 text-center text-sm font-black text-white">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => changeQty(item.id, 1)}
                      className="rounded-full bg-white/8 active:bg-white/20 hover:bg-white/15 flex items-center justify-center text-slate-400 transition-colors"
                      style={{
                        width: isMobile ? 32 : 24,
                        height: isMobile ? 32 : 24,
                      }}
                    >
                      <Plus size={btnSize} />
                    </button>
                  </div>
                  <span className="text-sm font-black text-white w-20 text-right">
                    {fmtCOP(item.precio * item.qty)}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Menú */}
        {tab === "menu" && (
          <div className="p-5 space-y-3">
            <div className="relative">
              <Search
                size={12}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
              />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar ítem..."
                className="w-full bg-white/5 border border-white/8 rounded-2xl pl-9 pr-4 py-3 text-sm text-white placeholder-slate-700 outline-none focus:border-blue-500/30 transition-colors"
              />
            </div>
            {categorias.map((cat) => (
              <div key={cat}>
                <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-2">
                  {cat}
                </p>
                <div className="space-y-1.5">
                  {menuFiltrado
                    .filter((i) => i.categoria === cat)
                    .map((item) => (
                      <button
                        key={item.nombre}
                        onClick={() => addItem(item)}
                        className={`w-full flex items-center justify-between px-4 ${addBtnH} bg-white/3 active:bg-white/10 hover:bg-white/7 border border-white/6 hover:border-white/10 rounded-2xl transition-all text-left active:scale-[0.98] group`}
                      >
                        <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                          {item.nombre}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-600">
                            {fmtCOP(item.precio)}
                          </span>
                          <div className="w-6 h-6 rounded-full bg-blue-600/20 group-hover:bg-blue-500 flex items-center justify-center transition-colors flex-shrink-0">
                            <Plus
                              size={10}
                              className="text-blue-300 group-hover:text-white"
                            />
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        {tab === "info" && (
          <div className="p-5 space-y-4">
            <div className="bg-white/3 border border-white/7 rounded-2xl p-4">
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-3">
                Personas
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPersonas((p) => Math.max(0, p - 1))}
                  className="rounded-full bg-white/8 active:bg-white/20 hover:bg-white/15 flex items-center justify-center text-white transition-colors"
                  style={{
                    width: isMobile ? 44 : 34,
                    height: isMobile ? 44 : 34,
                  }}
                >
                  <Minus size={isMobile ? 16 : 13} />
                </button>
                <span className="text-3xl font-black text-white flex-1 text-center">
                  {personas}
                </span>
                <button
                  onClick={() => setPersonas((p) => Math.min(12, p + 1))}
                  className="rounded-full bg-white/8 active:bg-white/20 hover:bg-white/15 flex items-center justify-center text-white transition-colors"
                  style={{
                    width: isMobile ? 44 : 34,
                    height: isMobile ? 44 : 34,
                  }}
                >
                  <Plus size={isMobile ? 16 : 13} />
                </button>
                <button
                  onClick={() => {
                    onUpdate({ ...mesa, personas });
                    onToast("Actualizado");
                  }}
                  className="rounded-full bg-blue-600/25 border border-blue-500/30 text-blue-300 flex items-center justify-center active:scale-95 hover:bg-blue-600/40 transition-all"
                  style={{
                    width: isMobile ? 44 : 34,
                    height: isMobile ? 44 : 34,
                  }}
                >
                  <Check size={isMobile ? 16 : 13} />
                </button>
              </div>
            </div>
            <div className="bg-white/3 border border-white/7 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                  Nota
                </p>
                <button
                  onClick={() => setEditNota((v) => !v)}
                  className="text-slate-600 hover:text-white active:text-white transition-colors p-1"
                >
                  <Edit3 size={12} />
                </button>
              </div>
              {editNota ? (
                <div className="space-y-2">
                  <textarea
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-700 outline-none focus:border-blue-500/30 resize-none"
                    placeholder="Alergias, preferencias..."
                  />
                  <button
                    onClick={() => {
                      onUpdate({ ...mesa, nota });
                      setEditNota(false);
                      onToast("Nota guardada");
                    }}
                    className="w-full py-2.5 bg-blue-600/25 border border-blue-500/30 text-blue-300 text-[9px] font-black rounded-xl uppercase tracking-wider active:scale-98"
                  >
                    Guardar
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-400 min-h-[20px]">
                  {mesa.nota || (
                    <span className="text-slate-700 italic text-xs">
                      Sin nota
                    </span>
                  )}
                </p>
              )}
            </div>
            {mesa.estado === "ocupada" && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["Tiempo", timer],
                  ["Personas", mesa.personas],
                  ["Ítems", mesa.comanda.reduce((s, i) => s + i.qty, 0)],
                ].map(([l, v]) => (
                  <div
                    key={l}
                    className="bg-white/3 border border-white/7 rounded-2xl p-3 text-center"
                  >
                    <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-0.5">
                      {l}
                    </p>
                    <p
                      className={`${isMobile ? "text-xl" : "text-lg"} font-black text-white`}
                    >
                      {v}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer cobro */}
      {mesa.estado === "ocupada" && (
        <div
          className={`${isMobile ? "p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]" : "p-5"} bg-black/50 border-t border-white/6 flex-shrink-0 space-y-3`}
        >
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
              Total
            </span>
            <span className="text-2xl font-black text-white tracking-tighter">
              {fmtCOP(total)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() =>
                onToast(`📄 Pre-cuenta Mesa ${mesa.numero}: ${fmtCOP(total)}`)
              }
              className={`${isMobile ? "py-4" : "py-3"} bg-white/5 border border-white/8 rounded-2xl text-[9px] font-black uppercase tracking-widest active:scale-98 hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 text-slate-300`}
            >
              <Receipt size={11} /> Pre-cuenta
            </button>
            <button
              onClick={handleCobrar}
              className={`${isMobile ? "py-4" : "py-3"} bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5`}
            >
              <DollarSign size={11} /> Cobrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Panel lateral PC ─────────────────────────────────────────────────────────
function PanelLateral({ mesa, onClose, onUpdate, onDelete, onToast }) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 34 }}
      className="absolute right-0 top-0 bottom-0 w-[380px] bg-[#060606]/98 backdrop-blur-3xl border-l border-white/6 z-[150] flex flex-col shadow-[-60px_0_120px_rgba(0,0,0,0.9)]"
    >
      <PanelBody
        mesa={mesa}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onClose={onClose}
        onToast={onToast}
        isMobile={false}
      />
    </motion.div>
  );
}

// ─── Bottom Sheet móvil ───────────────────────────────────────────────────────
function BottomSheet({ mesa, onClose, onUpdate, onDelete, onToast }) {
  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative bg-[#0a0a0a] border-t border-white/8 rounded-t-3xl z-10 flex flex-col max-h-[92dvh]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 36 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 80) onClose();
        }}
      >
        {/* Handle swipe */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-10 h-1 bg-white/15 rounded-full" />
        </div>
        <PanelBody
          mesa={mesa}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onClose={onClose}
          onToast={onToast}
          isMobile={true}
        />
      </motion.div>
    </motion.div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function MesasPOS() {
  const [mesas, setMesas] = useState(INITIAL_MESAS);
  const [isEditMode, setIsEditMode] = useState(false);
  const [detailMesa, setDetailMesa] = useState(null);
  const [viewport, setViewport] = useState({ x: -1100, y: -1100, zoom: 0.75 });
  const [showSearch, setShowSearch] = useState(false);
  const [busquedaMesa, setBusquedaMesa] = useState("");
  const [toast, setToast] = useState(null);
  const isMobile = useIsMobile();
  const constraintsRef = useRef(null);
  const toastRef = useRef(null);

  // Sincronizar panel con cambios en mesas
  useEffect(() => {
    if (!detailMesa) return;
    const updated = mesas.find((m) => m.id === detailMesa.id);
    if (updated) setDetailMesa(updated);
    else setDetailMesa(null);
  }, [mesas]);

  // Scroll = zoom (PC)
  useEffect(() => {
    if (isMobile) return;
    const onWheel = (e) => {
      e.preventDefault();
      setViewport((v) => ({
        ...v,
        zoom: Math.min(
          Math.max(v.zoom + (e.deltaY > 0 ? -0.08 : 0.08), 0.3),
          2.5,
        ),
      }));
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [isMobile]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const updateMesa = useCallback(
    (updated) =>
      setMesas((prev) => prev.map((m) => (m.id === updated.id ? updated : m))),
    [],
  );
  const deleteMesa = useCallback(
    (id) => setMesas((prev) => prev.filter((m) => m.id !== id)),
    [],
  );

  const addMesa = () => {
    const m = makeMesa(1600 + Math.random() * 900, 1600 + Math.random() * 900);
    setMesas((prev) => [...prev, m]);
    showToast(`Mesa ${m.numero} agregada`);
  };

  const handleDragEnd = useCallback((id, offset) => {
    setMesas((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, x: m.x + offset.x, y: m.y + offset.y } : m,
      ),
    );
  }, []);

  const handleTap = useCallback((mesa) => setDetailMesa(mesa), []);

  const handleHoverAction = useCallback(
    (mesa, action) => {
      if (action === "detail") {
        setDetailMesa(mesa);
        return;
      }
      if (action === "sentar")
        updateMesa({
          ...mesa,
          estado: "ocupada",
          startTime: Date.now(),
          personas: 2,
        });
      if (action === "limpiar")
        updateMesa({
          ...mesa,
          estado: "libre",
          startTime: null,
          personas: 0,
          comanda: [],
          total: 0,
        });
      showToast(action === "sentar" ? "Mesa ocupada" : "Mesa limpia ✓");
    },
    [updateMesa, showToast],
  );

  const handleZoom = (d) =>
    setViewport((v) => ({
      ...v,
      zoom: Math.min(Math.max(v.zoom + d, 0.3), 2.5),
    }));
  const mesasBusqueda = busquedaMesa
    ? mesas.filter((m) => m.numero.includes(busquedaMesa))
    : [];

  const kpis = {
    libres: mesas.filter((m) => m.estado === "libre").length,
    ocupadas: mesas.filter((m) => m.estado === "ocupada").length,
    sucias: mesas.filter((m) => m.estado === "sucio").length,
    caja: mesas
      .filter((m) => m.estado === "ocupada")
      .reduce((s, m) => s + m.total, 0),
  };

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden select-none flex font-sans">
      {/* KPIs */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[110] flex  gap-1 justify-center px-2 max-w-full overflow-x-auto">
        {[
          { label: "Libres", value: kpis.libres, color: "bg-gray-500" },
          { label: "Ocupadas", value: kpis.ocupadas, color: "bg-orange-500" },
          { label: "Sucias", value: kpis.sucias, color: "bg-red-500" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/65 backdrop-blur-xl border border-white/8 rounded-full shadow-xl"
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${color} flex-shrink-0`}
            />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
              {label}
            </span>
            <span className="text-xs font-black text-white">{value}</span>
          </div>
        ))}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 z-[200] px-5 py-2 bg-white/8 backdrop-blur-xl border border-white/12 rounded-full text-xs font-bold text-white shadow-2xl whitespace-nowrap pointer-events-none"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimap — solo PC */}
      {!isMobile && (
        <div className="absolute bottom-6 left-6 z-[120] p-3 bg-black/85 backdrop-blur-2xl border border-white/8 rounded-2xl shadow-2xl">
          <p className="text-[7px] font-black uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-1">
            <MapIcon size={8} /> Radar de Posición
          </p>
          <div className="w-32 h-32 bg-white/[0.02] rounded-lg relative border border-white/5 overflow-hidden">
            {/* ── INDICADOR DE TU POSICIÓN (EL "VISOR") ── */}
            <motion.div
              className="absolute border border-blue-500/50 bg-blue-500/10 z-10 pointer-events-none"
              animate={{
                // Mapeamos el movimiento del canvas (5000px) al tamaño del radar (128px)
                x: (Math.abs(viewport.x) / 5000) * 128,
                y: (Math.abs(viewport.y) / 5000) * 128,
                // El tamaño del visor cambia según el zoom
                width: (window.innerWidth / (5000 * viewport.zoom)) * 128,
                height: (window.innerHeight / (5000 * viewport.zoom)) * 128,
              }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            />

            {/* Mesas en el radar */}
            {mesas.map((m) => (
              <div
                key={m.id}
                className={`absolute w-1.5 h-1.5 rounded-full ${
                  m.estado === "ocupada"
                    ? "bg-orange-500"
                    : m.estado === "sucio"
                      ? "bg-red-500"
                      : "bg-gray-700"
                }`}
                style={{
                  left: `${(m.x / 5000) * 100}%`,
                  top: `${(m.y / 5000) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Controles PC: columna derecha ── */}
      {!isMobile && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-[120] flex flex-col items-center gap-2.5">
          <div className="flex flex-col gap-0.5 p-1.5 bg-black/85 backdrop-blur-3xl border border-white/8 rounded-[1.25rem] shadow-2xl">
            {[
              {
                icon: isEditMode ? <Unlock size={15} /> : <Lock size={15} />,
                label: "Layout",
                action: () => setIsEditMode((v) => !v),
                active: isEditMode,
                color: isEditMode ? "text-blue-400" : "text-slate-500",
              },
              null,
              {
                icon: <ZoomIn size={15} />,
                label: "Zoom+",
                action: () => handleZoom(0.2),
                color: "text-slate-500",
              },
              {
                icon: <ZoomOut size={15} />,
                label: "Zoom–",
                action: () => handleZoom(-0.2),
                color: "text-slate-500",
              },
              {
                icon: <Target size={15} />,
                label: "Centrar",
                action: () => setViewport({ x: -1100, y: -1100, zoom: 0.75 }),
                color: "text-slate-500",
              },
              null,
              {
                icon: <Search size={15} />,
                label: "Buscar",
                action: () => setShowSearch((v) => !v),
                active: showSearch,
                color: showSearch ? "text-blue-400" : "text-slate-500",
              },
            ].map((btn, i) =>
              btn === null ? (
                <div key={i} className="h-px bg-white/5 mx-2 my-0.5" />
              ) : (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  title={btn.label}
                  className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 group ${btn.active ? "bg-blue-600/15" : "hover:bg-white/6"}`}
                >
                  <div
                    className={`${btn.color} group-hover:text-slate-300 group-hover:scale-110 transition-all`}
                  >
                    {btn.icon}
                  </div>
                  <span className="text-[7px] font-black uppercase tracking-tighter text-slate-700 group-hover:text-slate-500">
                    {btn.label}
                  </span>
                </button>
              ),
            )}
          </div>
          <button
            onClick={addMesa}
            title="Nueva mesa"
            className="p-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-full shadow-xl shadow-emerald-600/30 text-white transition-all"
          >
            <Plus size={18} />
          </button>
        </div>
      )}

      {/* ── Controles Móvil: barra inferior ── */}
      {isMobile && (
        <div className="absolute bottom-0 left-0 right-0 z-[120] px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] bg-black/92 backdrop-blur-2xl border-t border-white/8 flex items-center gap-2 shadow-2xl overflow-x-auto">
          <button
            onClick={() => setIsEditMode((v) => !v)}
            className={`flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${isEditMode ? "bg-blue-600/25 border border-blue-500/40 text-blue-300" : "bg-white/5 border border-white/8 text-slate-400"}`}
          >
            {isEditMode ? <Unlock size={14} /> : <Lock size={14} />}{" "}
            {isEditMode ? "Edición" : "Layout"}
          </button>
          <button
            onClick={() => setViewport({ x: -1100, y: -1100, zoom: 0.75 })}
            className="flex-1 py-3.5 bg-white/5 border border-white/8 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Target size={14} /> Centrar
          </button>
          <button
            onClick={() => setShowSearch((v) => !v)}
            className={`flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all ${showSearch ? "bg-blue-600/25 border border-blue-500/40 text-blue-300" : "bg-white/5 border border-white/8 text-slate-400"}`}
          >
            <Search size={14} /> Buscar
          </button>
          <button
            onClick={addMesa}
            className="py-3.5 px-4 bg-emerald-600 rounded-2xl text-white active:scale-95 transition-all shadow-lg shadow-emerald-600/25"
          >
            <Plus size={16} />
          </button>
        </div>
      )}

      {/* Buscador flotante */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute z-[130] bg-black/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 w-56 ${
              isMobile
                ? "bottom-24 left-1/2 -translate-x-1/2"
                : "right-20 top-1/2 -translate-y-1/2"
            }`}
          >
            <input
              autoFocus
              value={busquedaMesa}
              onChange={(e) => setBusquedaMesa(e.target.value)}
              placeholder="Número de mesa..."
              className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/40"
            />
            {mesasBusqueda.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setViewport({
                    x: -(m.x * 0.75) + 600,
                    y: -(m.y * 0.75) + 400,
                    zoom: 0.75,
                  });
                  setShowSearch(false);
                  setBusquedaMesa("");
                  setTimeout(() => setDetailMesa(m), 350);
                }}
                className="w-full mt-1.5 px-3 py-2.5 bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-xl text-left text-sm font-bold text-white flex items-center justify-between transition-colors"
              >
                Mesa {m.numero}
                <span
                  className={`text-[8px] font-black ${ESTADO_CONFIG[m.estado].dot.replace("bg-", "text-")}`}
                >
                  {ESTADO_CONFIG[m.estado].label}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <motion.div
        className="flex-1"
        style={{
          cursor: isEditMode ? "default" : isMobile ? "default" : "grab",
        }}
        drag={!isEditMode}
        dragConstraints={{
          left: -4000,
          right: 600,
          top: -4000,
          bottom: isMobile ? 90 : 600,
        }}
        dragMomentum={isMobile}
        dragElastic={isMobile ? 0.05 : 0}
        animate={{ scale: viewport.zoom, x: viewport.x, y: viewport.y }}
        transition={{ type: "spring", damping: 28, stiffness: 160 }}
        onClick={() => !isEditMode && setDetailMesa(null)}
      >
        <div
          ref={constraintsRef}
          className="w-[5000px] h-[5000px] relative"
          style={{
            backgroundColor: "black",
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        >
          <AnimatePresence>
            {mesas.map((mesa) => (
              <MesaNode
                key={mesa.id}
                mesa={mesa}
                isActive={detailMesa?.id === mesa.id}
                isEditMode={isEditMode}
                isMobile={isMobile}
                onTap={handleTap}
                onHoverAction={handleHoverAction}
                onDragEnd={handleDragEnd}
                constraintsRef={constraintsRef}
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Panel / Sheet */}
      <AnimatePresence>
        {detailMesa &&
          (isMobile ? (
            <BottomSheet
              key={`s-${detailMesa.id}`}
              mesa={detailMesa}
              onClose={() => setDetailMesa(null)}
              onUpdate={updateMesa}
              onDelete={deleteMesa}
              onToast={showToast}
            />
          ) : (
            <PanelLateral
              key={`p-${detailMesa.id}`}
              mesa={detailMesa}
              onClose={() => setDetailMesa(null)}
              onUpdate={updateMesa}
              onDelete={deleteMesa}
              onToast={showToast}
            />
          ))}
      </AnimatePresence>

      {/* Banner modo edición */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            className="flex-1 origin-center" // Añadimos origin-center para que el zoom sea simétrico
            style={{
              cursor: isEditMode ? "default" : isMobile ? "default" : "grab",
              // MOVEMOS EL FONDO AQUÍ:
              backgroundColor: "black",
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.2) 1.5px, transparent 1.5px)",
              backgroundSize: "60px 60px",
            }}
            drag={!isEditMode}
            dragConstraints={{
              left: -4000,
              right: 600,
              top: -4000,
              bottom: isMobile ? 90 : 600,
            }}
            dragMomentum={isMobile}
            dragElastic={isMobile ? 0.05 : 0}
            animate={{
              scale: viewport.zoom,
              x: viewport.x,
              y: viewport.y,
            }}
            transition={{ type: "spring", damping: 28, stiffness: 160 }}
            onClick={() => !isEditMode && setDetailMesa(null)}
          >
            {/* El contenedor interno ahora es transparente para mostrar el fondo del padre */}
            <div
              ref={constraintsRef}
              className="w-[5000px] h-[5000px] relative"
            >
              <AnimatePresence>
                {mesas.map((mesa) => (
                  <MesaNode
                    key={mesa.id}
                    mesa={mesa}
                    isActive={detailMesa?.id === mesa.id}
                    isEditMode={isEditMode}
                    isMobile={isMobile}
                    onTap={handleTap}
                    onHoverAction={handleHoverAction}
                    onDragEnd={handleDragEnd}
                    constraintsRef={constraintsRef}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
