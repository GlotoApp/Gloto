import React, { useState } from "react";
import {
  BarChart3,
  Clock,
  Sparkles,
  DollarSign,
  ShoppingBag,
  Layers,
  Truck,
  Copy,
  Check,
  TrendingUp,
  User,
  Coffee,
  Calendar,
  Activity, // Icono para la sección semanal
} from "lucide-react";

const Estadisticas = () => {
  const [activePeriod, setActivePeriod] = useState("30 Días");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  // Rango de fechas personalizado
  const [customRange, setCustomRange] = useState({
    start: "",
    end: "",
  });

  // --- DATA FORMAT_BAR: MONITOREO SEMANAL EXACTAMENTE IGUAL AL DE HORAS ---
  const weeklyTrendsData = [
    { day: "Lunes", percentage: 45, vol: "$2.8M" },
    { day: "Martes", percentage: 50, vol: "$3.1M" },
    { day: "Miércoles", percentage: 46, vol: "$2.9M" },
    { day: "Jueves", percentage: 62, vol: "$3.9M" },
    { day: "Viernes", percentage: 87, vol: "$5.4M" },
    { day: "Sábado", percentage: 100, vol: "$6.2M", isPeak: true }, // Pico de carga / ventas
    { day: "Domingo", percentage: 77, vol: "$4.8M" },
  ];

  // --- DATA MASTER CENTRALIZADA ---
  const mainStats = [
    {
      label: "Total Vendido",
      value: "$ 24,183,900",
      sub: "+14.2% Eficiencia",
      icon: DollarSign,
      progress: 84,
      color: "bg-violet-500",
    },
    {
      label: "Pedidos Totales",
      value: "3,421",
      sub: "+6.8% Volumen",
      icon: ShoppingBag,
      progress: 68,
      color: "bg-emerald-500",
    },
    {
      label: "Ticket Promedio",
      value: "$ 7,069",
      sub: "+2.1% Retención",
      icon: Layers,
      progress: 55,
      color: "bg-orange-500",
    },
    {
      label: "Venta Domicilios",
      value: "$ 15,235,800",
      sub: "63% Tracción Total",
      icon: Truck,
      progress: 63,
      color: "bg-blue-500",
    },
  ];

  const hourly24hData = [
    { hour: "00h", percentage: 5, vol: "$110k" },
    { hour: "01h", percentage: 2, vol: "$45k" },
    { hour: "02h", percentage: 1, vol: "$20k" },
    { hour: "03h", percentage: 3, vol: "$60k" },
    { hour: "04h", percentage: 15, vol: "$320k" },
    { hour: "05h", percentage: 35, vol: "$740k" },
    { hour: "06h", percentage: 75, vol: "$1.6M" },
    { hour: "07h", percentage: 100, vol: "$2.4M", isPeak: true },
    { hour: "08h", percentage: 85, vol: "$1.9M" },
    { hour: "09h", percentage: 50, vol: "$1.1M" },
    { hour: "10h", percentage: 40, vol: "$850k" },
    { hour: "11h", percentage: 30, vol: "$650k" },
    { hour: "12h", percentage: 55, vol: "$1.2M" },
    { hour: "13h", percentage: 65, vol: "$1.4M" },
    { hour: "14h", percentage: 45, vol: "$980k" },
    { hour: "15h", percentage: 25, vol: "$510k" },
    { hour: "16h", percentage: 20, vol: "$420k" },
    { hour: "17h", percentage: 35, vol: "$790k" },
    { hour: "18h", percentage: 60, vol: "$1.3M" },
    { hour: "19h", percentage: 70, vol: "$1.5M" },
    { hour: "20h", percentage: 50, vol: "$1.1M" },
    { hour: "21h", percentage: 30, vol: "$680k" },
    { hour: "22h", percentage: 15, vol: "$340k" }, // Corregido: font -> vol
    { hour: "23h", percentage: 8, vol: "$180k" },
  ];

  const distributionData = [
    {
      label: "Domicilio",
      percentage: 63,
      amount: "$ 15,235,800",
      color: "#8b5cf6",
      strokeDash: "395 628",
      strokeOffset: "0",
    },
    {
      label: "En Punto",
      percentage: 18,
      amount: "$ 4,353,102",
      color: "#10b981",
      strokeDash: "113 628",
      strokeOffset: "-395",
    },
    {
      label: "Mesa",
      percentage: 12,
      amount: "$ 2,902,068",
      color: "#f97316",
      strokeDash: "75 628",
      strokeOffset: "-508",
    },
    {
      label: "Recoger",
      percentage: 7,
      amount: "$ 1,692,930",
      color: "#3b82f6",
      strokeDash: "45 628",
      strokeOffset: "-583",
    },
  ];

  const paymentData = [
    {
      label: "Efectivo",
      percentage: 55,
      amount: "$ 13,301,145",
      color: "#e5e5e5",
      strokeDash: "345 628",
      strokeOffset: "0",
    },
    {
      label: "Transferencia",
      percentage: 38,
      amount: "$ 9,189,882",
      color: "#7c3aed",
      strokeDash: "239 628",
      strokeOffset: "-345",
    },
    {
      label: "Tarjeta",
      percentage: 7,
      amount: "$ 1,692,930",
      color: "#404040",
      strokeDash: "44 628",
      strokeOffset: "-584",
    },
  ];

  const allProducts = [
    {
      name: "Buñuelo Tradicional",
      sales: 4120,
      total: "$ 8,240,000",
      share: 95,
      color: "bg-violet-500",
    },
    {
      name: "Tinto Campesino",
      sales: 2980,
      total: "$ 4,470,000",
      share: 72,
      color: "bg-emerald-500",
    },
    {
      name: "Pandebono",
      sales: 1850,
      total: "$ 4,625,000",
      share: 48,
      color: "bg-orange-500",
    },
    {
      name: "Café con Leche",
      sales: 1240,
      total: "$ 3,720,000",
      share: 32,
      color: "bg-blue-500",
    },
    {
      name: "Avena Helada",
      sales: 850,
      total: "$ 2,550,000",
      share: 22,
      color: "bg-neutral-600",
    },
    {
      name: "Empanada de Carne",
      sales: 620,
      total: "$ 1,860,000",
      share: 16,
      color: "bg-neutral-700",
    },
  ];

  const getPeriodString = () => {
    if (
      activePeriod === "Personalizado" &&
      customRange.start &&
      customRange.end
    ) {
      return `${customRange.start} HASTA ${customRange.end}`;
    }
    return activePeriod;
  };

  const rawReportText = `INFORME OPERATIVO EJECUTIVO - GLOTO INFRASTRUCTURE
Periodo Evaluado: ${getPeriodString()}
--------------------------------------------------
1. DIAGNÓSTICO FINANCIERO Y RENDIMIENTO
- Facturación Consolidada: $ 24,183,900 COP
- Volumen Transaccional: 3,421 Pedidos Exitosos
- Ticket Promedio General: $ 7,069 COP

2. LOGÍSTICA DE DESPACHO (CANALES DE CANALIZACIÓN)
- Domicilios (Líder): 63% ($ 15,235,800 COP)
- Venta en Punto: 18% ($ 4,353,102 COP)
- Consumo en Mesa: 12% ($ 2,902,068 COP)
- Recoger en Sucursal: 7% ($ 1,692,930 COP)

3. INTENSIDAD HORARIA OPERATIVA (MATRIZ 24 HORAS)
- Curva de Carga Máxima detectada entre las 06:00 AM y 09:00 AM.
- Pico Absoluto de Carga del Sistema: 07:00 AM - 08:00 AM (100% Capacidad).

4. MÉTODOS DE CAPTACIÓN DE FLUJO DE CAJA
- Efectivo Dominante: 55% del Volumen Líquido
- Transferencias Digitales: 38% del Volumen Líquido
- Pasarelas / Tarjetas: 7% del Volumen Líquido

5. AUDITORÍA DE PRODUCTO LÍDER
- SKU Principal: Buñuelo Tradicional (4,120 Unidades Despachadas)`;

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(rawReportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Fallo de API Portapapeles", err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-neutral-200 p-4 md:p-8 font-sans antialiased selection:bg-violet-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER CONTROLES */}
        <header className="flex flex-col xl:flex-row xl:items-center justify-between pb-6 border-b border-white/5 gap-6">
          <div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-black tracking-tighter">
                Estadísticas
              </h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            {showCustomPicker && (
              <div className="flex items-center gap-2 bg-neutral-950/80 border border-white/5 p-1 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200">
                <input
                  type="date"
                  value={customRange.start}
                  onChange={(e) =>
                    setCustomRange({ ...customRange, start: e.target.value })
                  }
                  className="bg-transparent border-0 text-[10px] font-mono font-bold uppercase text-neutral-200 focus:outline-none focus:ring-0 py-1 px-2 cursor-pointer [color-scheme:dark]"
                />
                <span className="text-[9px] font-black text-neutral-600 uppercase px-1">
                  A
                </span>
                <input
                  type="date"
                  value={customRange.end}
                  onChange={(e) =>
                    setCustomRange({ ...customRange, end: e.target.value })
                  }
                  className="bg-transparent border-0 text-[10px] font-mono font-bold uppercase text-neutral-200 focus:outline-none focus:ring-0 py-1 px-2 cursor-pointer [color-scheme:dark]"
                />
              </div>
            )}

            <div className="relative bg-neutral-900/80 rounded-xl border border-white/5 p-1 flex items-center w-full sm:w-auto">
              <select
                value={activePeriod}
                onChange={(e) => {
                  const period = e.target.value;
                  setActivePeriod(period);
                  setShowCustomPicker(period === "Personalizado");
                }}
                className="appearance-none bg-transparent pl-3 pr-8 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-neutral-200 hover:text-white transition-colors cursor-pointer focus:outline-none focus:ring-0 w-full sm:w-44 border-0"
              >
                <option
                  value="Hoy"
                  className="bg-neutral-950 text-neutral-200 uppercase font-sans font-bold"
                >
                  Hoy
                </option>
                <option
                  value="Últimos 7 Días"
                  className="bg-neutral-950 text-neutral-200 uppercase font-sans font-bold"
                >
                  Últimos 7 Días
                </option>
                <option
                  value="30 Días"
                  className="bg-neutral-950 text-neutral-200 uppercase font-sans font-bold"
                >
                  30 Días
                </option>
                <option
                  value="2 Meses"
                  className="bg-neutral-950 text-neutral-200 uppercase font-sans font-bold"
                >
                  2 Meses
                </option>
                <option
                  value="Personalizado"
                  className="bg-neutral-950 text-neutral-200 uppercase font-sans font-bold"
                >
                  Personalizado
                </option>
              </select>
              <div className="absolute right-3 pointer-events-none flex items-center justify-center text-neutral-500">
                <svg className="w-2 h-2 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* METRICAS PRINCIPALES */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainStats.map((kpi, idx) => (
            <div
              key={idx}
              className="bg-neutral-900/40 border border-white/5 p-5 rounded-3xl flex flex-col justify-between h-32"
            >
              <div className="flex justify-between items-start">
                <span className="text-neutral-500 text-[9px] font-black uppercase tracking-widest">
                  {kpi.label}
                </span>
                <div className="p-1.5 bg-neutral-950 rounded-lg border border-white/5 text-neutral-400">
                  <kpi.icon size={12} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white font-mono">
                  {kpi.value}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-[2px] bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${kpi.color}`}
                      style={{ width: `${kpi.progress}%` }}
                    />
                  </div>
                  <span className="text-[8px] font-bold uppercase text-neutral-600 tracking-tight whitespace-nowrap">
                    {kpi.sub}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* 📊 GRÁFICA SEMANAL: EXACTAMENTE RESPONSIVA E IGUAL A LA DE HORAS */}
        <section className="bg-neutral-900/40 border border-white/5 p-6 md:p-8 rounded-[2rem]">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-neutral-400">
                <Activity size={14} className="text-violet-500" />
                Flujo Analítico de Ventas Semanales
              </h3>
              <p className="text-neutral-600 text-[9px] uppercase font-bold mt-0.5">
                Volumen y Tracción Operativa por Día Calendario (Picos y Valles)
              </p>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-mono font-black uppercase text-neutral-400 bg-neutral-950 px-3 py-1 rounded border border-white/5">
                Ciclo Semanal Completo
              </span>
            </div>
          </div>

          {/* Cambios aquí: overflow-x-auto, scrollbar-none y pt-8 para evitar cortes del tooltip flotante */}
          <div className="h-44 flex items-end gap-3 sm:gap-4 border-b border-white/5 pb-2 pt-8 overflow-x-auto scrollbar-none">
            {weeklyTrendsData.map((bar, i) => (
              <div
                key={i}
                // Cambios aquí: Añadido min-w-[55px] sm:min-w-0 para garantizar tamaño estructurado en móviles
                className="flex-1 min-w-[55px] sm:min-w-0 flex flex-col items-center gap-2 group h-full justify-end relative"
              >
                {/* Tooltip flotante */}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 text-[8px] font-mono font-bold text-white bg-neutral-950 px-1.5 py-0.5 rounded border border-white/10 pointer-events-none z-10 whitespace-nowrap">
                  {bar.vol} ({bar.percentage}%)
                </span>

                {/* Contenedor de la barra */}
                <div className="w-full bg-neutral-950 rounded-t-md overflow-hidden h-full flex items-end border border-white/[0.02]">
                  <div
                    style={{ height: `${bar.percentage}%` }}
                    className={`w-full rounded-t-sm transition-all duration-500 ${
                      bar.isPeak
                        ? "bg-violet-500 shadow-md shadow-violet-500/20"
                        : "bg-neutral-800 group-hover:bg-violet-400/50"
                    }`}
                  />
                </div>

                {/* Eje X (Días) - truncate evita desbordamientos de texto */}
                <span
                  className={`text-[8px] font-mono font-black tracking-tighter uppercase w-full text-center truncate ${
                    bar.isPeak ? "text-violet-400" : "text-neutral-600"
                  }`}
                >
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* INTENSIDAD HORARIA */}
        <section className="bg-neutral-900/40 border border-white/5 p-6 md:p-8 rounded-[2rem]">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-neutral-400">
                <Clock size={14} className="text-violet-500" />
                Intensidad Horaria Operativa Transaccional
              </h3>
              <p className="text-neutral-600 text-[9px] uppercase font-bold mt-0.5">
                Rendimiento Técnico de Capacidad Instalada (24 Horas Continuas)
              </p>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-mono font-black uppercase text-neutral-400 bg-neutral-950 px-3 py-1 rounded border border-white/5">
                Ventana Operativa de 24H
              </span>
            </div>
          </div>

          <div className="h-44 flex items-end gap-1.5 sm:gap-2 border-b border-white/5 pb-2 pt-8 overflow-x-auto scrollbar-none">
            {hourly24hData.map((bar, i) => (
              <div
                key={i}
                className="flex-1 min-w-[20px] flex flex-col items-center gap-2 group h-full justify-end relative"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 text-[8px] font-mono font-bold text-white bg-neutral-950 px-1.5 py-0.5 rounded border border-white/10 pointer-events-none z-10 whitespace-nowrap">
                  {bar.vol} ({bar.percentage}%)
                </span>
                <div className="w-full bg-neutral-950 rounded-t-md overflow-hidden h-full flex items-end border border-white/[0.02]">
                  <div
                    style={{ height: `${bar.percentage}%` }}
                    className={`w-full rounded-t-sm transition-all duration-500 ${bar.isPeak ? "bg-violet-500 shadow-md shadow-violet-500/20" : "bg-neutral-800 group-hover:bg-violet-400/50"}`}
                  />
                </div>
                <span className="text-[8px] font-mono font-bold text-neutral-600 tracking-tighter">
                  {bar.hour}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* DONAS DE CONTROL */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-neutral-900/40 border border-white/5 p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="flex-1 space-y-4 w-full">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500" /> Rueda
                de Canales
              </h3>
              <div className="space-y-2">
                {distributionData.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-[10px] bg-neutral-950/60 border border-white/[0.02] p-2.5 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-neutral-300 font-bold uppercase">
                        {item.label}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-neutral-500 text-[9px] mr-2">
                        {item.amount}
                      </span>
                      <span className="text-white font-black">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 240 240"
              >
                <circle
                  cx="120"
                  cy="120"
                  r="100"
                  fill="transparent"
                  stroke="#161616"
                  strokeWidth="24"
                />
                {distributionData.map((item, i) => (
                  <circle
                    key={i}
                    cx="120"
                    cy="120"
                    r="100"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="24"
                    strokeDasharray={item.strokeDash}
                    strokeDashoffset={item.strokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                ))}
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xs font-black text-white font-mono">
                  63%
                </span>
                <span className="text-[7px] font-black tracking-widest text-neutral-600 uppercase">
                  Domicilio
                </span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/40 border border-white/5 p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="flex-1 space-y-4 w-full">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500" /> Flujo
                de Monetización
              </h3>
              <div className="space-y-2">
                {paymentData.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-[10px] bg-neutral-950/60 border border-white/[0.02] p-2.5 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-neutral-300 font-bold uppercase">
                        {item.label}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-neutral-500 text-[9px] mr-2">
                        {item.amount}
                      </span>
                      <span className="text-white font-black">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 240 240"
              >
                <circle
                  cx="120"
                  cy="120"
                  r="100"
                  fill="transparent"
                  stroke="#161616"
                  strokeWidth="24"
                />
                {paymentData.map((item, i) => (
                  <circle
                    key={i}
                    cx="120"
                    cy="120"
                    r="100"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="24"
                    strokeDasharray={item.strokeDash}
                    strokeDashoffset={item.strokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                ))}
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xs font-black text-white font-mono">
                  55%
                </span>
                <span className="text-[7px] font-black tracking-widest text-neutral-600 uppercase">
                  Efectivo
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* LISTAS DE CLIENTES Y CATÁLOGO DE PRODUCTOS */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-neutral-900/40 border border-white/5 p-6 md:p-8 rounded-[2rem] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <User size={14} className="text-violet-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                  Fidelización Core • Segmentación de Clientes
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-violet-400">
                      Alta Frecuencia (Recurrencia)
                    </span>
                    <span className="text-[8px] font-mono text-neutral-600 font-bold">
                      ORDEN: PEDIDOS
                    </span>
                  </div>
                  <div className="divide-y divide-white/[0.03] space-y-1">
                    {[
                      {
                        name: "Andrés Mendoza",
                        value: "48 pedidos",
                        total: "$ 384,000",
                      },
                      {
                        name: "Camila Torres",
                        value: "35 pedidos",
                        total: "$ 282,500",
                      },
                      {
                        name: "Restaurante El Centro",
                        value: "29 pedidos",
                        total: "$ 245,000",
                      },
                      {
                        name: "Sofía Martínez",
                        value: "24 pedidos",
                        total: "$ 189,200",
                      },
                    ].map((client, i) => (
                      <div
                        key={i}
                        className="py-2.5 flex justify-between items-center group"
                      >
                        <div>
                          <h4 className="text-[11px] font-black text-white uppercase group-hover:text-violet-400 transition-colors">
                            {client.name}
                          </h4>
                          <p className="text-[8px] font-mono text-neutral-500 mt-0.5">
                            {client.total} acumulado
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-black text-white bg-neutral-950 px-2 py-0.5 rounded border border-white/5">
                          {client.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                      Mayores Inversores (Volumen de Gasto)
                    </span>
                    <span className="text-[8px] font-mono text-neutral-600 font-bold">
                      ORDEN: MONTO
                    </span>
                  </div>
                  <div className="divide-y divide-white/[0.03] space-y-1">
                    {[
                      {
                        name: "Inversiones Bolívar",
                        value: "$ 1,240,000",
                        info: "12 pedidos",
                      },
                      {
                        name: "Andrés Mendoza",
                        value: "$ 384,000",
                        info: "48 pedidos",
                      },
                      {
                        name: "Hotel San Diego",
                        value: "$ 310,500",
                        info: "8 pedidos",
                      },
                      {
                        name: "Camila Torres",
                        value: "$ 282,500",
                        info: "35 pedidos",
                      },
                    ].map((client, i) => (
                      <div
                        key={i}
                        className="py-2.5 flex justify-between items-center group"
                      >
                        <div>
                          <h4 className="text-[11px] font-black text-white uppercase group-hover:text-emerald-400 transition-colors">
                            {client.name}
                          </h4>
                          <p className="text-[8px] font-mono text-neutral-500 mt-0.5">
                            {client.info}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                          {client.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/40 border border-white/5 p-6 md:p-8 rounded-[2rem]">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 text-neutral-400">
              <Coffee size={14} className="text-violet-500" /> Catálogo de
              Rendimiento Absoluto
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {allProducts.map((product, i) => (
                <div key={i} className="space-y-1 group">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                    <span className="text-white font-black group-hover:text-violet-400 transition-colors">
                      {product.name}
                    </span>
                    <div className="space-x-3 font-mono">
                      <span className="text-neutral-500">
                        {product.sales} uds
                      </span>
                      <span className="text-white font-black">
                        {product.total}
                      </span>
                    </div>
                  </div>
                  <div className="h-[5px] w-full bg-neutral-950 rounded-full overflow-hidden border border-white/[0.02]">
                    <div
                      className={`h-full ${product.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${product.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INFORME OPERATIVO COPIABLE */}
        <section className="bg-neutral-950 border-2 border-white/5 p-6 md:p-8 rounded-[2rem] space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-white">
                Informe Operativo Desglosado
              </h3>
              <p className="text-[9px] text-neutral-600 uppercase font-bold tracking-wider mt-0.5">
                Estructura limpia para copiar e integrar en minutas de control
              </p>
            </div>
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-2 px-3 py-2 bg-neutral-900 hover:bg-white hover:text-black border border-white/5 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest text-neutral-400"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-500" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copiar Informe</span>
                </>
              )}
            </button>
          </div>
          <div className="bg-neutral-900/20 rounded-2xl p-5 border border-white/[0.02] font-mono text-[10px] text-neutral-400 space-y-4 whitespace-pre-line leading-relaxed">
            {rawReportText}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Estadisticas;
