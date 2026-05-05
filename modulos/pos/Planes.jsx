import React, { useState } from "react";
import { Check, Zap, Crown, Rocket, Star } from "lucide-react";

const Planes = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Básico",
      price: isAnnual ? "29" : "35",
      description: "Ideal para pequeños emprendimientos o dark kitchens.",
      icon: Rocket,
      features: [
        "Hasta 500 órdenes/mes",
        "2 usuarios",
        "Soporte por email",
        "Reportes básicos",
      ],
      color: "border-neutral-800",
      buttonText: "Comenzar Gratis",
      highlight: false,
    },
    {
      name: "Pro",
      price: isAnnual ? "59" : "69",
      description: "Perfecto para restaurantes en crecimiento.",
      icon: Zap,
      features: [
        "Órdenes ilimitadas",
        "Usuarios ilimitados",
        "Inventario avanzado",
        "Soporte 24/7",
        "Integración con Delivery",
      ],
      color: "border-violet-500/50",
      buttonText: "Elegir Plan Pro",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: isAnnual ? "129" : "149",
      description: "Para franquicias y múltiples sucursales con control total.",
      icon: Crown,
      features: [
        "Multi-sucursal",
        "API personalizada",
        "Gestión avanzada",
        "Account Manager",
        "Personalización",
      ],
      color: "border-neutral-800",
      buttonText: "Contactar Ventas",
      highlight: false,
    },
  ];

  return (
    /* 
       Ajuste de margen: ml-20 para escritorio (sidebar colapsado) 
       y padding lateral para que no toque los bordes en móviles 
    */
    <div className="min-h-screen bg-neutral-950 text-white pt-24 pb-12 px-6 sm:px-10 md:ml-20 lg:ml-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter italic mb-4">
            Impulsa tu <span className="text-violet-500">Negocio</span>
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Selecciona el plan que mejor se adapte al ritmo de tu cocina. Cambia
            de nivel cuando lo necesites.
          </p>

          {/* Toggle Facturación */}
          <div className="flex items-center justify-center mt-10 gap-4">
            <span
              className={`text-[11px] font-black uppercase tracking-widest ${!isAnnual ? "text-white" : "text-neutral-500"}`}
            >
              Mensual
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-12 h-6 bg-neutral-900 border border-white/10 rounded-full p-1 relative transition-all"
            >
              <div
                className={`w-4 h-4 bg-violet-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-300 transform ${isAnnual ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
            <span
              className={`text-[11px] font-black uppercase tracking-widest ${isAnnual ? "text-white" : "text-neutral-500"}`}
            >
              Anual{" "}
              <span className="text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded ml-1">
                -20%
              </span>
            </span>
          </div>
        </div>

        {/* Grid de Tarjetas Responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6 xl:gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 hover:scale-[1.02] ${
                plan.highlight
                  ? "bg-violet-600/[0.03] border-violet-500/40 shadow-[0_20px_50px_rgba(124,58,237,0.1)]"
                  : "bg-white/[0.01] border-white/[0.06]"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full whitespace-nowrap">
                  Recomendado
                </div>
              )}

              <div className="mb-6">
                <div
                  className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center ${plan.highlight ? "bg-violet-600/20" : "bg-white/5"}`}
                >
                  <plan.icon
                    className={
                      plan.highlight ? "text-violet-400" : "text-neutral-500"
                    }
                    size={24}
                  />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight italic">
                  {plan.name}
                </h3>
                <p className="text-neutral-500 text-sm mt-2 leading-relaxed min-h-[40px]">
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black italic tracking-tighter">
                    ${plan.price}
                  </span>
                  <span className="text-neutral-500 text-sm font-bold uppercase tracking-widest">
                    /mes
                  </span>
                </div>
                <p className="text-[10px] text-neutral-600 uppercase font-black mt-2 tracking-widest">
                  {isAnnual ? "Pago único anual" : "Pago recurrente mensual"}
                </p>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm text-neutral-400"
                  >
                    <Check
                      size={16}
                      className="text-violet-500 mt-0.5 flex-shrink-0"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] transition-all duration-300 active:scale-95 ${
                  plan.highlight
                    ? "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_10px_25px_rgba(124,58,237,0.4)]"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-wrap justify-center items-center gap-4 px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-neutral-500 text-[10px] font-black uppercase tracking-[0.1em]">
            <div className="flex items-center gap-2">
              <Star size={14} className="text-yellow-500" />
              <span>Garantía de 14 días</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/10"></div>
            <span>Encriptación SSL de 256 bits</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planes;
