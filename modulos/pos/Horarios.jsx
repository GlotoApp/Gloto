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
          <div className="relative flex items-center">
            <Sun
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500/70 z-10 pointer-events-none"
            />
            {/* Clases Webkit añadidas para anular desajustes nativos de iPhone/Android */}
            <input
              type="time"
              value={turno.open}
              onChange={(e) => onUpdate(day, index, "open", e.target.value)}
              className="w-full h-11 md:h-10 bg-neutral-900 border border-white/5 rounded-lg pl-10 pr-3 text-sm md:text-xs font-bold text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all appearance-none leading-none flex items-center [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-datetime-edit]:flex [&::-webkit-datetime-edit]:items-center [&::-webkit-datetime-edit]:p-0"
            />
          </div>
        </div>

        <div className="hidden lg:flex text-neutral-600 font-black text-lg pb-2">
          →
        </div>

        {/* 2. INPUT: HORA CIERRE */}
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-[7px] md:text-[8px] font-black uppercase text-neutral-500 ml-1 tracking-wider">
            Cierre
          </label>
          <div className="relative flex items-center">
            <Moon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500/70 z-10 pointer-events-none"
            />
            {/* Clases Webkit añadidas para anular desajustes nativos de iPhone/Android */}
            <input
              type="time"
              value={turno.close}
              onChange={(e) => onUpdate(day, index, "close", e.target.value)}
              className="w-full h-11 md:h-10 bg-neutral-900 border border-white/5 rounded-lg pl-10 pr-3 text-sm md:text-xs font-bold text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all appearance-none leading-none flex items-center [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-datetime-edit]:flex [&::-webkit-datetime-edit]:items-center [&::-webkit-datetime-edit]:p-0"
            />
          </div>
        </div>

        {/* 3. SELECTOR DE CICLO OPERATIVO */}
        <div className="flex flex-col gap-2 w-full lg:w-auto">
          <label className="text-[7px] md:text-[8px] font-black uppercase text-neutral-500 tracking-widest ml-1 flex items-center gap-2">
            <div className="w-1 h-1 bg-violet-500 rounded-full animate-pulse" />
            Dia cierre
          </label>

          <div className="relative flex bg-black border border-white/10 p-1 rounded-3xl overflow-hidden group/selector h-11 md:h-10 items-center">
            <button
              onClick={() => onUpdate(day, index, "closeDay", "same")}
              className={`relative z-10 flex-1 px-3 md:px-4 h-full rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-tighter transition-all duration-300 ${
                turno.closeDay === "same"
                  ? "bg-neutral-100 text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Mismo
            </button>

            <button
              onClick={() => onUpdate(day, index, "closeDay", "next")}
              className={`relative z-10 flex-1 px-3 md:px-4 h-full rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-tighter transition-all duration-300 flex items-center justify-center gap-1 md:gap-2 ${
                turno.closeDay === "next"
                  ? "bg-violet-600 text-white shadow-[0_0_25px_rgba(139,92,246,0.3)]"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>

        <button
          onClick={() => onRemove(day, index)}
          className="relative flex items-center justify-center h-11 w-full lg:w-11 lg:h-11 text-neutral-600 hover:text-red-500  rounded-xl transition-all duration-300 group/delete shadow-inner"
        >
          <div className="absolute inset-0  opacity-0 group-hover/delete:opacity-100 rounded-xl transition-opacity" />
          <Trash2
            size={16}
            className="relative z-10 transition-transform group-active/delete:scale-90"
          />
          <span className="lg:hidden ml-2 text-[8px] font-black uppercase tracking-widest relative z-10">
            Eliminar Turno
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
    <div className="min-h-screen bg-background text-neutral-200 p-4 md:p-4 lg:p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-row items-center justify-between mb-8 md:mb-12 gap-4">
          {/* BLOQUE DE TITULACIÓN */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter text-white">
              Horarios
            </h1>
          </div>

          {/* BOTÓN ALINEADO AL EXTREMO DERECHO */}
          <button
            disabled={!hasChanges}
            className={`px-5 md:px-8 py-2.5 md:py-3 rounded-xl font-black uppercase text-[9px] md:text-xs shadow-lg transition-all whitespace-nowrap ${
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
                <span className="text-[8px] md:text-xs font-black uppercase tracking-widest text-fff  px-3 md:px-4 py-1.5 md:py-2 rounded-lg">
                  {day}
                </span>

                {/* CONTENEDOR DEL SWITCH */}
                <div className="flex items-center gap-3  px-3 py-1.5  select-none">
                  {/* Label de Estado Técnico */}
                  <span
                    className={`text-[8px] md:text-[9px] font-black uppercase tracking-wider transition-colors duration-200 ${
                      schedule[day].isOpen ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {schedule[day].isOpen ? "Abierto" : "Cerrado"}
                  </span>

                  {/* Botón Switch Deslizante */}
                  <button
                    type="button"
                    onClick={() =>
                      setSchedule((p) => ({
                        ...p,
                        [day]: { ...p[day], isOpen: !p[day].isOpen },
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 cursor-pointer outline-none ${
                      schedule[day].isOpen ? "bg-green-500 " : "bg-red-800 "
                    }`}
                  >
                    {/* Esfera / Diodo deslizante interno */}
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-md ${
                        schedule[day].isOpen
                          ? "translate-x-6"
                          : "translate-x-1 bg-neutral-400"
                      }`}
                    />
                  </button>
                </div>
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
