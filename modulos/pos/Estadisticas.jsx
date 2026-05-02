import React from "react";
import {
  TrendingUp,
  Users,
  DollarSign,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar,
  BarChart3,
  Coffee,
} from "lucide-react";

const Estadisticas = () => {
  // Datos simulados basados en tu operación de desayunos
  const mainStats = [
    {
      id: 1,
      label: "Ventas Hoy",
      value: "$ 840,200",
      growth: "+12.5%",
      icon: DollarSign,
      trend: "up",
    },
    {
      id: 2,
      label: "Pedidos",
      value: "142",
      growth: "+8.2%",
      icon: ShoppingBag,
      trend: "up",
    },
    {
      id: 3,
      label: "Ticket Promedio",
      value: "$ 5,900",
      growth: "-2.1%",
      icon: Users,
      trend: "down",
    },
    {
      id: 4,
      label: "Hora Pico",
      value: "07:30 AM",
      growth: "Estable",
      icon: Clock,
      trend: "neutral",
    },
  ];

  const topProducts = [
    {
      name: "Buñuelo Tradicional",
      sales: 450,
      growth: 85,
      color: "bg-violet-500",
    },
    {
      name: "Tinto Campesino",
      sales: 320,
      growth: 60,
      color: "bg-emerald-500",
    },
    { name: "Pandebono", sales: 210, growth: 45, color: "bg-orange-500" },
    { name: "Café con Leche", sales: 180, growth: 30, color: "bg-blue-500" },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
              <BarChart3 className="text-violet-500" size={32} />
              <span>Business Intelligence</span>
            </h1>
            <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
              Análisis de rendimiento operativo • Cartagena
            </p>
          </div>
          <div className="flex gap-2 bg-neutral-900/50 p-1 rounded-xl border border-white/5">
            {["Día", "Semana", "Mes"].map((period) => (
              <button
                key={period}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${period === "Día" ? "bg-white text-black" : "text-neutral-500 hover:text-white"}`}
              >
                {period}
              </button>
            ))}
          </div>
        </header>

        {/* CARTAS DE MÉTRICAS PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {mainStats.map((stat) => (
            <div
              key={stat.id}
              className="bg-neutral-900/40 border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-violet-500/30 transition-all"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-black/40 rounded-2xl border border-white/5 group-hover:text-violet-400 transition-colors">
                    <stat.icon size={20} />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-[10px] font-black uppercase ${stat.trend === "up" ? "text-emerald-500" : stat.trend === "down" ? "text-red-500" : "text-neutral-500"}`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight size={12} />
                    ) : stat.trend === "down" ? (
                      <ArrowDownRight size={12} />
                    ) : null}
                    {stat.growth}
                  </div>
                </div>
                <p className="text-neutral-500 text-[9px] font-black uppercase tracking-widest mb-1">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-black tracking-tighter text-white">
                  {stat.value}
                </h3>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <stat.icon size={100} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* GRÁFICA DE VENTAS POR HORA (SIMULADA) */}
          <div className="lg:col-span-2 bg-neutral-900/40 border border-white/5 p-8 rounded-[2.5rem]">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-neutral-400">
                <TrendingUp size={14} className="text-violet-500" />
                Flujo de Ventas (4:00 AM - 12:00 PM)
              </h3>
              <span className="text-[9px] font-black uppercase text-violet-500 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
                En Vivo
              </span>
            </div>

            <div className="h-64 flex items-end gap-3 md:gap-6">
              {[40, 65, 85, 100, 90, 70, 45, 30].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-4 group"
                >
                  <div className="w-full relative">
                    <div
                      style={{ height: `${height}%` }}
                      className={`w-full rounded-t-xl transition-all duration-1000 group-hover:brightness-125 ${i === 3 ? "bg-violet-500 shadow-lg shadow-violet-500/20" : "bg-neutral-800"}`}
                    />
                  </div>
                  <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-tighter">
                    {i + 4}h
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* TOP PRODUCTOS */}
          <div className="bg-neutral-900/40 border border-white/5 p-8 rounded-[2.5rem]">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-10 flex items-center gap-2 text-neutral-400">
              <Coffee size={14} className="text-violet-500" />
              Más Vendidos
            </h3>

            <div className="space-y-8">
              {topProducts.map((prod, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-black uppercase tracking-tight">
                      {prod.name}
                    </p>
                    <p className="text-[10px] font-bold text-neutral-500 italic">
                      {prod.sales} u.
                    </p>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${prod.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${prod.growth}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-12 py-4 border border-white/5 rounded-2xl text-[9px] font-black uppercase text-neutral-500 tracking-[0.2em] hover:bg-white hover:text-black transition-all">
              Ver Reporte Completo
            </button>
          </div>
        </div>

        {/* ACTIVIDAD RECIENTE */}
        <div className="mt-8 bg-neutral-900/20 border border-white/5 p-6 rounded-3xl">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-neutral-600" />
            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest italic">
              Último cierre de caja: Ayer 01:30 PM • Auditoría por: Admin_Gloto
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;
