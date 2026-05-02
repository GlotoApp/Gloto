import React, { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Moon,
  Sun,
  Clock,
  Save,
  AlertCircle,
  Calendar,
} from "lucide-react";

const DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const TurnoRow = ({ turno, index, day, onUpdate, onRemove }) => {
  return (
    <div className="bg-neutral-900/30 p-4 md:p-6 rounded-2xl border border-neutral-700/50 hover:border-violet-500/50 transition-all group">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        {/* 1. INPUT: HORA APERTURA */}
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-[7px] md:text-[8px] font-black uppercase text-neutral-500 ml-1 tracking-wider">
            Apertura
          </label>
          <div className="relative">
            <Sun
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/70"
            />
            <input
              type="time"
              value={turno.open}
              onChange={(e) => onUpdate(day, index, "open", e.target.value)}
              className="w-full bg-neutral-900 border border-white/5 rounded-lg py-2.5 md:py-2 pl-10 pr-3 text-sm md:text-xs font-bold text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
          </div>
        </div>

        <div className="hidden lg:flex text-neutral-600 font-black text-lg">
          →
        </div>

        {/* 2. INPUT: HORA CIERRE */}
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-[7px] md:text-[8px] font-black uppercase text-neutral-500 ml-1 tracking-wider">
            Cierre
          </label>
          <div className="relative">
            <Moon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500/70"
            />
            <input
              type="time"
              value={turno.close}
              onChange={(e) => onUpdate(day, index, "close", e.target.value)}
              className="w-full bg-neutral-900 border border-white/5 rounded-lg py-2.5 md:py-2 pl-10 pr-3 text-sm md:text-xs font-bold text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
          </div>
        </div>

        {/* 3. SELECTOR DE CICLO OPERATIVO */}
        <div className="flex flex-col gap-2 w-full lg:w-auto">
          <label className="text-[7px] md:text-[8px] font-black uppercase text-neutral-500 tracking-widest ml-1 flex items-center gap-2">
            <div className="w-1 h-1 bg-violet-500 rounded-full animate-pulse" />
            Dia cierre
          </label>

          <div className="relative flex bg-black border border-white/10 p-1 rounded-xl overflow-hidden group/selector">
            <button
              onClick={() => onUpdate(day, index, "closeDay", "same")}
              className={`relative z-10 flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-tighter transition-all duration-300 ${
                turno.closeDay === "same"
                  ? "bg-neutral-100 text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Mismo
            </button>

            <button
              onClick={() => onUpdate(day, index, "closeDay", "next")}
              className={`relative z-10 flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-tighter transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 ${
                turno.closeDay === "next"
                  ? "bg-violet-600 text-white shadow-[0_0_25px_rgba(139,92,246,0.3)]"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {turno.closeDay === "next" && (
                <div className="w-1 h-1 bg-cyan-400 rounded-full" />
              )}
              Siguiente
            </button>
          </div>
        </div>

        <button
          onClick={() => onRemove(day, index)}
          className="relative flex items-center justify-center p-3 text-neutral-600 hover:text-red-500 bg-neutral-900/50 border border-white/5 hover:border-red-500/30 rounded-xl transition-all duration-300 md:ml-auto group/delete shadow-inner"
        >
          {/* Efecto de resplandor sutil al hover */}
          <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover/delete:opacity-100 rounded-xl transition-opacity" />

          <Trash2
            size={16}
            className="relative z-10 transition-transform group-active/delete:scale-90"
          />

          {/* Label táctico opcional para móvil si prefieres más claridad */}
          <span className="md:hidden ml-2 text-[8px] font-black uppercase tracking-widest relative z-10">
            Eliminar
          </span>
        </button>
      </div>
    </div>
  );
};

export default function Horarios() {
  const initialSchedule = DAYS.reduce(
    (acc, day) => ({
      ...acc,
      [day]: {
        isOpen: true,
        turnos: [{ open: "08:00", close: "22:00", closeDay: "same" }],
      },
    }),
    {},
  );

  const [schedule, setSchedule] = useState(initialSchedule);

  const hasChanges =
    JSON.stringify(schedule) !== JSON.stringify(initialSchedule);

  const updateTurno = (day, index, field, value) => {
    const newTurnos = [...schedule[day].turnos];
    newTurnos[index][field] = value;
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], turnos: newTurnos },
    }));
  };

  const addTurno = (day) => {
    if (schedule[day].turnos.length >= 2) return;
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        turnos: [
          ...prev[day].turnos,
          { open: "18:00", close: "02:00", closeDay: "same" },
        ],
      },
    }));
  };

  const removeTurno = (day, index) => {
    if (schedule[day].turnos.length <= 1) return;
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        turnos: prev[day].turnos.filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-4 md:p-8 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-4 md:gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter flex items-center gap-2 md:gap-3">
              <Calendar size={24} className="md:w-7 md:h-7 text-violet-500" />
              <span>Horarios</span>
            </h1>
            <p className="text-neutral-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] mt-2 md:mt-3">
              Gestiona ciclos operativos por día
            </p>
          </div>
          <button
            disabled={!hasChanges}
            className={`px-6 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl font-black uppercase text-[9px] md:text-xs shadow-lg transition-all whitespace-nowrap ${
              hasChanges
                ? "bg-violet-500 hover:bg-violet-600 text-white shadow-violet-500/30 active:scale-95 cursor-pointer"
                : "bg-neutral-700 text-neutral-500 shadow-neutral-700/30 cursor-not-allowed opacity-50"
            }`}
          >
            Guardar
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 md:gap-6">
          {DAYS.map((day) => (
            <div
              key={day}
              className="p-4 md:p-6 lg:p-8 bg-neutral-900/40 border border-white/5 rounded-xl md:rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4 md:mb-1 gap-3">
                <span className="text-[8px] md:text-xs font-black uppercase tracking-widest text-violet-400 bg-violet-500/10 px-3 md:px-4 py-1.5 md:py-2 rounded-lg">
                  {day}
                </span>
                <button
                  onClick={() =>
                    setSchedule((p) => ({
                      ...p,
                      [day]: { ...p[day], isOpen: !p[day].isOpen },
                    }))
                  }
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[7px] md:text-[9px] font-black uppercase transition-all border whitespace-nowrap ${
                    schedule[day].isOpen
                      ? "bg-violet-500/10 border-violet-500/50 text-violet-400 shadow-lg shadow-violet-500/10"
                      : "bg-red-500/10 border-red-500/50 text-red-400"
                  }`}
                >
                  {schedule[day].isOpen ? "Abierto" : "Cerrado"}
                </button>
              </div>

              {schedule[day].isOpen && (
                <div className="space-y-3 md:space-y-4">
                  {schedule[day].turnos.map((turno, idx) => (
                    <TurnoRow
                      key={idx}
                      index={idx}
                      day={day}
                      turno={turno}
                      onUpdate={updateTurno}
                      onRemove={removeTurno}
                    />
                  ))}
                  <button
                    onClick={() => addTurno(day)}
                    className="w-full py-2.5 md:py-3 border-2 border-dashed border-white/5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase text-neutral-500 hover:border-violet-500/50 hover:text-violet-400 hover:bg-violet-500/5 transition-all"
                  >
                    <Plus size={14} className="inline mr-1 md:mr-2" />
                    Añadir Turno
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
