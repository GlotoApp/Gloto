import React, { useState, useRef, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Receipt,
  RotateCcw,
  CheckCircle2,
  Plus,
  Search,
  Trash2,
  ChefHat,
  DollarSign,
  ArrowRight,
  Minus,
  Edit3,
  Check,
  Users,
  Calendar,
  Phone,
  Mail,
  Clock,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
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

const ESTADO = {
  libre: {
    color: "#6b7280",
    glow: "#6b728030",
    border: "#6b728060",
    label: "Libre",
    pulse: false,
  },
  ocupada: {
    color: "#f97316",
    glow: "#f9731622",
    border: "#f9731665",
    label: "Ocupada",
    pulse: false,
  },
  reservada: {
    color: "#3b82f6",
    glow: "#3b82f622",
    border: "#3b82f665",
    label: "Reservada",
    pulse: true,
  },
  sucio: {
    color: "#ef4444",
    glow: "#ef444422",
    border: "#ef444455",
    label: "Limpiar",
    pulse: true,
  },
};

let NEXT_ID = 11;
const newMesa = () => {
  const id = NEXT_ID++;
  return {
    id,
    numero: String(id).padStart(2, "0"),
    estado: "libre",
    personas: 0,
    startTime: null,
    total: 0,
    comanda: [],
    nota: "",
    reserva: {
      nombre: "",
      telefono: "",
      email: "",
      hora: "",
      personas: 0,
      activa: false,
    },
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
    comanda: [
      { id: 1, item: "Pizza Pepperoni", precio: 45000, qty: 2 },
      { id: 2, item: "Cerveza Club", precio: 12000, qty: 3 },
    ],
    nota: "",
    reserva: {
      nombre: "",
      telefono: "",
      email: "",
      hora: "",
      personas: 0,
      activa: false,
    },
  },
  {
    id: 2,
    numero: "02",
    estado: "libre",
    personas: 0,
    startTime: null,
    total: 0,
    comanda: [],
    nota: "",
    reserva: {
      nombre: "",
      telefono: "",
      email: "",
      hora: "",
      personas: 0,
      activa: false,
    },
  },
  {
    id: 3,
    numero: "03",
    estado: "sucio",
    personas: 0,
    startTime: null,
    total: 0,
    comanda: [],
    nota: "",
    reserva: {
      nombre: "",
      telefono: "",
      email: "",
      hora: "",
      personas: 0,
      activa: false,
    },
  },
  {
    id: 4,
    numero: "04",
    estado: "ocupada",
    personas: 2,
    startTime: Date.now() - 4200000,
    total: 85000,
    comanda: [{ id: 1, item: "Pasta Carbonara", precio: 38000, qty: 1 }],
    nota: "Sin sal",
    reserva: {
      nombre: "",
      telefono: "",
      email: "",
      hora: "",
      personas: 0,
      activa: false,
    },
  },
  {
    id: 5,
    numero: "05",
    estado: "libre",
    personas: 0,
    startTime: null,
    total: 0,
    comanda: [],
    nota: "",
    reserva: {
      nombre: "",
      telefono: "",
      email: "",
      hora: "",
      personas: 0,
      activa: false,
    },
  },
  {
    id: 6,
    numero: "06",
    estado: "ocupada",
    personas: 6,
    startTime: Date.now() - 1500000,
    total: 210000,
    comanda: [
      { id: 1, item: "Parrillada Familiar", precio: 150000, qty: 1 },
      { id: 2, item: "Jarra de Jugo", precio: 25000, qty: 2 },
    ],
    nota: "",
    reserva: {
      nombre: "",
      telefono: "",
      email: "",
      hora: "",
      personas: 0,
      activa: false,
    },
  },
  {
    id: 7,
    numero: "07",
    estado: "sucio",
    personas: 0,
    startTime: null,
    total: 0,
    comanda: [],
    nota: "",
    reserva: {
      nombre: "",
      telefono: "",
      email: "",
      hora: "",
      personas: 0,
      activa: false,
    },
  },
  {
    id: 8,
    numero: "08",
    estado: "libre",
    personas: 0,
    startTime: null,
    total: 0,
    comanda: [],
    nota: "",
    reserva: {
      nombre: "",
      telefono: "",
      email: "",
      hora: "",
      personas: 0,
      activa: false,
    },
  },
  {
    id: 9,
    numero: "09",
    estado: "ocupada",
    personas: 3,
    startTime: Date.now() - 1800000,
    total: 95000,
    comanda: [{ id: 1, item: "Hamburguesa Master", precio: 35000, qty: 2 }],
    nota: "",
    reserva: {
      nombre: "",
      telefono: "",
      email: "",
      hora: "",
      personas: 0,
      activa: false,
    },
  },
  {
    id: 10,
    numero: "10",
    estado: "libre",
    personas: 0,
    startTime: null,
    total: 0,
    comanda: [],
    nota: "",
    reserva: {
      nombre: "",
      telefono: "",
      email: "",
      hora: "",
      personas: 0,
      activa: false,
    },
  },
];

// ─── Utils ────────────────────────────────────────────────────────────────────
const fmt = (n) => `$${Number(n).toLocaleString("es-CO")}`;
const calc = (c) => c.reduce((s, i) => s + i.precio * i.qty, 0);

function useTimer(startTime) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!startTime) {
      setT(0);
      return;
    }
    const tick = () => setT(Math.floor((Date.now() - startTime) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);
  const h = Math.floor(t / 3600),
    m = Math.floor((t % 3600) / 60),
    s = t % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ─── Add Mesa Tile ────────────────────────────────────────────────────────────
function AddMesaTile({ onAdd }) {
  return (
    <motion.button
      onClick={onAdd}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative flex flex-col items-center justify-center rounded-2xl overflow-hidden transition-all duration-100 focus:outline-none"
      style={{
        background: "linear-gradient(145deg, #22c55e15, #0c0c0c)",
        border: "1.5px dashed #22c55e50",
        minHeight: 130,
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: "#22c55e20",
            border: "2px solid #22c55e60",
          }}
        >
          <Plus size={24} className="text-emerald-400" />
        </div>
        <span className="text-xs font-black text-emerald-600/80 uppercase tracking-widest">
          Nueva Mesa
        </span>
      </div>
    </motion.button>
  );
}

// ─── Mesa Tile ────────────────────────────────────────────────────────────────
function MesaTile({ mesa, onOpen }) {
  const cfg = ESTADO[mesa.estado];
  const timer = useTimer(mesa.startTime);
  const total = calc(mesa.comanda);
  const isOcc = mesa.estado === "ocupada";
  const isSuc = mesa.estado === "sucio";

  return (
    <button
      onClick={() => onOpen(mesa)}
      className="relative flex flex-col rounded-2xl overflow-hidden transition-transform duration-100 active:scale-[0.95] focus:outline-none text-left"
      style={{
        background: `linear-gradient(145deg, ${cfg.glow}, #0c0c0c)`,
        border: `1.5px solid ${cfg.border}`,
        minHeight: 130,
      }}
    >
      {/* Color bar top */}
      <div
        className="h-[3px] w-full"
        style={{ background: cfg.color, opacity: isOcc ? 1 : 0.4 }}
      />

      {/* Pulse dot */}
      {(isSuc || mesa.estado === "reservada") && (
        <span className="absolute top-3 right-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
      )}

      <div className="flex flex-col flex-1 p-3 gap-2">
        {/* Number row */}
        <div className="flex items-start justify-between">
          <span className="text-2xl font-black tracking-tighter text-white leading-none">
            {mesa.numero}
          </span>
          <span
            className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md"
            style={{ background: `${cfg.color}22`, color: cfg.color }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-end gap-1">
          {isOcc && (
            <>
              <div className="flex items-center gap-1 text-slate-500">
                <Users size={9} />
                <span className="text-[9px] font-bold">
                  {mesa.personas} persona{mesa.personas !== 1 && "s"}
                </span>
              </div>
              <div className="text-[9px] font-mono text-slate-600 tabular-nums">
                {timer}
              </div>
            </>
          )}
          {mesa.estado === "reservada" && mesa.reserva?.activa && (
            <>
              <span className="text-[9px] font-bold text-blue-400 truncate">
                {mesa.reserva.nombre}
              </span>
              <span className="text-[8px] text-slate-500 flex items-center gap-1">
                <Clock size={7} /> {mesa.reserva.hora}
              </span>
            </>
          )}
          {isSuc && (
            <span className="text-[9px] font-black text-red-500 uppercase tracking-wide">
              Limpiar
            </span>
          )}
          {mesa.estado === "libre" && (
            <span className="text-[9px] text-slate-700 font-bold">
              Disponible
            </span>
          )}
        </div>

        {/* Total */}
        {isOcc && total > 0 && (
          <div className="text-sm font-black text-white">{fmt(total)}</div>
        )}
      </div>
    </button>
  );
}

// ─── Panel Body ───────────────────────────────────────────────────────────────
function PanelBody({ mesa, onUpdate, onDelete, onClose, onToast }) {
  const [tab, setTab] = useState("comanda");
  const [busqueda, setBusqueda] = useState("");
  const [editNota, setEditNota] = useState(false);
  const [nota, setNota] = useState(mesa.nota || "");
  const [personas, setPersonas] = useState(mesa.personas);
  const [showReservaForm, setShowReservaForm] = useState(false);
  const [reservaNombre, setReservaNombre] = useState(
    mesa.reserva?.nombre || "",
  );
  const [reservaTelefono, setReservaTelefono] = useState(
    mesa.reserva?.telefono || "",
  );
  const [reservaEmail, setReservaEmail] = useState(mesa.reserva?.email || "");
  const [reservaHora, setReservaHora] = useState(mesa.reserva?.hora || "");
  const [reservaPersonas, setReservaPersonas] = useState(
    mesa.reserva?.personas || 1,
  );
  const timer = useTimer(mesa.startTime);
  const cfg = ESTADO[mesa.estado];
  const total = calc(mesa.comanda);
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
    onUpdate({ ...mesa, comanda: newComanda, total: calc(newComanda) });
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
    onUpdate({ ...mesa, comanda: newComanda, total: calc(newComanda) });
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
      onClose();
    } else onUpdate({ ...mesa, estado: s, startTime: null, personas: 0 });
  };

  const handleCobrar = () => {
    onToast(`💳 ${fmt(total)} cobrado — Mesa ${mesa.numero}`);
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

  const handleCrearReserva = () => {
    if (!reservaNombre || !reservaTelefono || !reservaHora) {
      onToast("⚠️ Completa los campos requeridos");
      return;
    }
    onUpdate({
      ...mesa,
      estado: "reservada",
      reserva: {
        nombre: reservaNombre,
        telefono: reservaTelefono,
        email: reservaEmail,
        hora: reservaHora,
        personas: reservaPersonas,
        activa: true,
      },
    });
    setShowReservaForm(false);
    onToast(`✓ Reserva creada para ${reservaNombre}`);
  };

  const handleCancelarReserva = () => {
    onUpdate({
      ...mesa,
      estado: "libre",
      reserva: {
        nombre: "",
        telefono: "",
        email: "",
        hora: "",
        personas: 0,
        activa: false,
      },
    });
    setShowReservaForm(false);
    onToast("Reserva cancelada");
  };

  const handleConvertirReservaEnClientes = () => {
    if (mesa.reserva?.activa) {
      onUpdate({
        ...mesa,
        estado: "ocupada",
        personas: mesa.reserva.personas,
        startTime: Date.now(),
        reserva: { ...mesa.reserva, activa: false },
      });
      onToast(`✓ ${mesa.reserva.nombre} sentado`);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-white/6 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: cfg.color }}
              />
              <span
                className="text-[9px] font-black uppercase tracking-[0.3em]"
                style={{ color: cfg.color }}
              >
                {cfg.label}
              </span>
              {mesa.estado === "ocupada" && (
                <span className="text-[9px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded-full ml-1">
                  {timer}
                </span>
              )}
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-white">
              MESA {mesa.numero}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/8 rounded-xl transition-colors"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="flex gap-1.5 mt-3 flex-wrap">
          {mesa.estado !== "ocupada" && (
            <button
              onClick={() => handleEstado("ocupada")}
              className="px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-1"
              style={{
                background: "#f9731615",
                borderColor: "#f9731640",
                color: "#f97316",
              }}
            >
              <Users size={9} /> Sentar
            </button>
          )}
          {mesa.estado === "sucio" && (
            <button
              onClick={() => handleEstado("libre")}
              className="px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-1"
              style={{
                background: "#22c55e15",
                borderColor: "#22c55e40",
                color: "#22c55e",
              }}
            >
              <CheckCircle2 size={9} /> Limpia
            </button>
          )}
          {mesa.estado === "ocupada" && (
            <button
              onClick={() => handleEstado("sucio")}
              className="px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-1"
              style={{
                background: "#ef444415",
                borderColor: "#ef444440",
                color: "#ef4444",
              }}
            >
              <RotateCcw size={9} /> Desocupar
            </button>
          )}
          {mesa.estado === "libre" && (
            <button
              onClick={() => setShowReservaForm(true)}
              className="px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-1"
              style={{
                background: "#3b82f615",
                borderColor: "#3b82f640",
                color: "#3b82f6",
              }}
            >
              <Calendar size={9} /> Reservar
            </button>
          )}
          {mesa.estado === "reservada" && (
            <>
              <button
                onClick={handleConvertirReservaEnClientes}
                className="px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-1"
                style={{
                  background: "#f9731615",
                  borderColor: "#f9731640",
                  color: "#f97316",
                }}
              >
                <Users size={9} /> Sentar
              </button>
              <button
                onClick={handleCancelarReserva}
                className="px-3 py-1.5 rounded-xl border text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-1"
                style={{
                  background: "#ef444415",
                  borderColor: "#ef444440",
                  color: "#ef4444",
                }}
              >
                <X size={9} /> Cancelar
              </button>
            </>
          )}
          <button
            onClick={() => {
              if (window.confirm(`¿Eliminar Mesa ${mesa.numero}?`)) {
                onDelete(mesa.id);
                onClose();
              }
            }}
            className="px-2.5 py-1.5 bg-white/4 border border-white/8 text-slate-600 rounded-xl hover:bg-red-900/20 hover:border-red-500/30 hover:text-red-400 active:scale-95 transition-all ml-auto"
          >
            <Trash2 size={11} />
          </button>
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
            className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all ${tab === id ? "text-white border-b-2 border-blue-500" : "text-slate-600 hover:text-slate-400"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {tab === "comanda" && (
          <div className="p-5 space-y-0.5">
            {mesa.comanda.length === 0 ? (
              <div className="text-center py-14">
                <ChefHat
                  size={28}
                  className="mx-auto mb-3 text-slate-700 opacity-40"
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
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-3 border-b border-white/5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">
                      {item.item}
                    </p>
                    <p className="text-[10px] text-slate-600">
                      {fmt(item.precio)} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeQty(item.id, -1)}
                      className="w-8 h-8 rounded-full bg-white/8 active:bg-white/20 flex items-center justify-center text-slate-400"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-6 text-center text-sm font-black text-white">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => changeQty(item.id, 1)}
                      className="w-8 h-8 rounded-full bg-white/8 active:bg-white/20 flex items-center justify-center text-slate-400"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="text-sm font-black text-white w-20 text-right">
                    {fmt(item.precio * item.qty)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "menu" && (
          <div className="p-5 space-y-4">
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
                        className="w-full flex items-center justify-between px-4 py-3.5 bg-white/3 active:bg-white/10 border border-white/6 rounded-2xl transition-all active:scale-[0.98] group text-left"
                      >
                        <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
                          {item.nombre}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-600">
                            {fmt(item.precio)}
                          </span>
                          <div className="w-6 h-6 rounded-full bg-blue-600/20 group-hover:bg-blue-500 flex items-center justify-center transition-colors">
                            <Plus
                              size={10}
                              className="text-blue-400 group-hover:text-white"
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

        {tab === "info" && (
          <div className="p-5 space-y-3">
            <div className="bg-white/3 border border-white/7 rounded-2xl p-4">
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-3">
                Personas
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPersonas((p) => Math.max(0, p - 1))}
                  className="w-11 h-11 rounded-full bg-white/8 active:bg-white/20 flex items-center justify-center text-white"
                >
                  <Minus size={14} />
                </button>
                <span className="text-3xl font-black text-white flex-1 text-center">
                  {personas}
                </span>
                <button
                  onClick={() => setPersonas((p) => Math.min(12, p + 1))}
                  className="w-11 h-11 rounded-full bg-white/8 active:bg-white/20 flex items-center justify-center text-white"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => {
                    onUpdate({ ...mesa, personas });
                    onToast("Actualizado");
                  }}
                  className="w-11 h-11 rounded-full bg-blue-600/25 border border-blue-500/30 text-blue-300 flex items-center justify-center active:scale-95"
                >
                  <Check size={14} />
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
                  className="text-slate-600 hover:text-white p-1"
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500/30 resize-none"
                    placeholder="Alergias, preferencias..."
                  />
                  <button
                    onClick={() => {
                      onUpdate({ ...mesa, nota });
                      setEditNota(false);
                      onToast("Nota guardada");
                    }}
                    className="w-full py-2.5 bg-blue-600/25 border border-blue-500/30 text-blue-300 text-[9px] font-black rounded-xl uppercase tracking-wider"
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
              <div className="grid grid-cols-1 gap-2">
                {[
                  ["Productos", mesa.comanda.reduce((s, i) => s + i.qty, 0)],
                ].map(([l, v]) => (
                  <div
                    key={l}
                    className="bg-white/3 border border-white/7 rounded-2xl p-3 text-center"
                  >
                    <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-0.5">
                      {l}
                    </p>
                    <p className="text-xl font-black text-white">{v}</p>
                  </div>
                ))}
              </div>
            )}
            {mesa.estado === "reservada" && mesa.reserva?.activa && (
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-2xl p-4 space-y-2">
                <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">
                  📅 Información de Reserva
                </p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Nombre:</span>
                    <span className="font-bold text-white">
                      {mesa.reserva.nombre}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Teléfono:</span>
                    <span className="font-bold text-white">
                      {mesa.reserva.telefono}
                    </span>
                  </div>
                  {mesa.reserva.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="font-bold text-white text-xs">
                        {mesa.reserva.email}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Hora:</span>
                    <span className="font-bold text-white">
                      {mesa.reserva.hora}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Personas:</span>
                    <span className="font-bold text-white">
                      {mesa.reserva.personas}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {mesa.estado === "ocupada" && (
        <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-black/40 border-t border-white/6 flex-shrink-0 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
              Total
            </span>
            <span className="text-2xl font-black text-white tracking-tighter">
              {fmt(total)}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={handleCobrar}
              className="py-4 bg-emerald-600 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <DollarSign size={11} /> Cobrar
            </button>
          </div>
        </div>
      )}

      {/* Modal Reserva */}
      <AnimatePresence>
        {showReservaForm && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
              onClick={() => setShowReservaForm(false)}
            />
            <motion.div
              className="relative bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Calendar size={20} className="text-blue-400" />
                Nueva Reserva
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                    Nombre *
                  </label>
                  <input
                    value={reservaNombre}
                    onChange={(e) => setReservaNombre(e.target.value)}
                    placeholder="Nombre del cliente"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/30"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-1">
                    <Phone size={10} /> Teléfono *
                  </label>
                  <input
                    value={reservaTelefono}
                    onChange={(e) => setReservaTelefono(e.target.value)}
                    placeholder="Ej: +57 300 123 4567"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/30"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-1">
                    <Mail size={10} /> Email
                  </label>
                  <input
                    value={reservaEmail}
                    onChange={(e) => setReservaEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    type="email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/30"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-1">
                    <Clock size={10} /> Hora *
                  </label>
                  <input
                    value={reservaHora}
                    onChange={(e) => setReservaHora(e.target.value)}
                    placeholder="18:30"
                    type="time"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/30"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-1">
                    <Users size={10} /> Personas
                  </label>
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                    <button
                      onClick={() =>
                        setReservaPersonas(Math.max(1, reservaPersonas - 1))
                      }
                      className="w-8 h-8 rounded-full bg-white/8 active:bg-white/20 flex items-center justify-center"
                    >
                      <Minus size={12} className="text-slate-400" />
                    </button>
                    <span className="flex-1 text-center font-black text-white">
                      {reservaPersonas}
                    </span>
                    <button
                      onClick={() =>
                        setReservaPersonas(Math.min(12, reservaPersonas + 1))
                      }
                      className="w-8 h-8 rounded-full bg-white/8 active:bg-white/20 flex items-center justify-center"
                    >
                      <Plus size={12} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowReservaForm(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-black text-slate-300 uppercase tracking-wider active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearReserva}
                  className="flex-1 py-3 bg-blue-600 rounded-xl text-sm font-black text-white uppercase tracking-wider active:scale-95 shadow-lg shadow-blue-600/20"
                >
                  Reservar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Panel / Bottom Sheet (responsive) ───────────────────────────────────────
function MesaPanel({ mesa, onClose, onUpdate, onDelete, onToast }) {
  return (
    <AnimatePresence>
      {mesa && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-stretch justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel — bottom sheet on mobile, side panel on sm+ */}
          <motion.div
            className="relative z-10 flex flex-col bg-[#080808] border-white/8
              w-full sm:w-[400px]
              rounded-t-3xl sm:rounded-none
              max-h-[92dvh] sm:max-h-full sm:h-full
              border-t sm:border-t-0 sm:border-l
              shadow-2xl overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 38 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80) onClose();
            }}
            style={{ touchAction: "pan-x" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0 sm:hidden">
              <div className="w-10 h-1 bg-white/15 rounded-full" />
            </div>
            <PanelBody
              mesa={mesa}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onClose={onClose}
              onToast={onToast}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function MesasPOS() {
  try {
    useOutletContext();
  } catch (_) {}

  const [mesas, setMesas] = useState(INITIAL_MESAS);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);

  // Keep panel in sync with state changes
  useEffect(() => {
    if (!selected) return;
    const updated = mesas.find((m) => m.id === selected.id);
    if (updated) setSelected(updated);
    else setSelected(null);
  }, [mesas]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const updateMesa = useCallback((updated) => {
    setMesas((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }, []);

  const deleteMesa = useCallback((id) => {
    setMesas((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addMesa = () => {
    const m = newMesa();
    setMesas((prev) => [...prev, m]);
    showToast(`Mesa ${m.numero} creada`);
  };

  const kpis = {
    total: mesas.length,
    libres: mesas.filter((m) => m.estado === "libre").length,
    ocupadas: mesas.filter((m) => m.estado === "ocupada").length,
    reservadas: mesas.filter((m) => m.estado === "reservada").length,
    sucias: mesas.filter((m) => m.estado === "sucio").length,
  };

  const visible = mesas.filter((m) => {
    const matchF = filter === "all" || m.estado === filter;
    const matchS = !search || m.numero.includes(search);
    return matchF && matchS;
  });

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* ── Header ── */}
      <div className="sticky top-0 z-40 bg-black/97 backdrop-blur-xl border-b border-white/6 px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-black tracking-tighter">Mesas</h1>
        </div>

        {/* KPIs con Wrap Optimizado - Mobile First */}
        <div className="flex flex-wrap w-full gap-2 mb-3 overflow-visible py-1.5 px-0.5">
          {[
            {
              id: "all",
              label: "Todas",
              value: kpis.total,
              color: "text-white",
              activeBorder: "border-white/40",
            },
            {
              id: "libre",
              label: "Libres",
              value: kpis.libres,
              color: "text-gray-400",
              activeBorder: "border-gray-500/50",
            },
            {
              id: "ocupada",
              label: "Ocupadas",
              value: kpis.ocupadas,
              color: "text-orange-400",
              activeBorder: "border-orange-500/50",
            },
            {
              id: "reservada",
              label: "Reservas",
              value: kpis.reservadas,
              color: "text-blue-400",
              activeBorder: "border-blue-500/50",
            },
            {
              id: "sucio",
              label: "Limpiar",
              value: kpis.sucias,
              color: "text-red-400",
              activeBorder: "border-red-500/50",
            },
          ].map(({ id, label, value, color, activeBorder }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`
        relative flex-1 min-w-[70px] flex flex-col items-center justify-center 
        bg-white/3 border rounded-xl py-3 px-2 text-center transition-all active:scale-95
        ${filter === id ? `${activeBorder} bg-white/10` : "border-white/6"}
      `}
            >
              <p className={`text-lg font-black ${color} leading-none`}>
                {value}
              </p>
              <p className="text-[7px] font-black uppercase tracking-widest mt-1 text-slate-500">
                {label}
              </p>

              {filter === id && (
                <motion.div
                  layoutId="filter-dot"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: "currentColor" }}
                />
              )}
            </button>
          ))}
        </div>
        {/* Filters + Search simplificado */}
        <div className="flex gap-2 items-center justify-between">
          <div className="flex-1">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
              Filtrando por:{" "}
              <span className="text-white">
                {filter === "all" ? "Todas" : filter}
              </span>
            </p>
          </div>

          <div className="relative flex-shrink-0">
            <Search
              size={11}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar mesa..."
              className="w-40 bg-white/5 border border-white/8 rounded-full pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-700 outline-none focus:border-white/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="flex-1 p-4 overflow-y-auto">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-700">
            <Search size={32} className="mb-3 opacity-30" />
            <p className="font-bold text-sm">Sin mesas</p>
          </div>
        ) : (
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            }}
          >
            {visible.map((mesa) => (
              <MesaTile key={mesa.id} mesa={mesa} onOpen={setSelected} />
            ))}
            <AddMesaTile onAdd={addMesa} />
          </div>
        )}
      </div>

      {/* ── Panel ── */}
      <MesaPanel
        mesa={selected}
        onClose={() => setSelected(null)}
        onUpdate={updateMesa}
        onDelete={deleteMesa}
        onToast={showToast}
      />

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-2.5 bg-white/10 backdrop-blur-xl border border-white/15 rounded-full text-xs font-bold text-white shadow-2xl whitespace-nowrap pointer-events-none"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
