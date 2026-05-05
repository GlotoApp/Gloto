import React, { useState } from "react";
import {
  Settings,
  User,
  Store,
  Bell,
  ShieldCheck,
  Globe,
  Save,
  Camera,
} from "lucide-react";

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState("perfil");

  const sections = [
    { id: "perfil", name: "Perfil", icon: User },
    { id: "local", name: "Mi Local", icon: Store },
    { id: "notificaciones", name: "Notificaciones", icon: Bell },
    { id: "seguridad", name: "Seguridad", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-violet-600/20 rounded-2xl border border-violet-500/20">
            <Settings className="text-violet-500" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">
              Configuración
            </h1>
            <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest">
              Ajustes del sistema y cuenta
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar de Configuración */}
          <div className="flex flex-col gap-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    activeTab === section.id
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-900/20"
                      : "text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-300"
                  }`}
                >
                  <Icon size={18} />
                  {section.name}
                </button>
              );
            })}
          </div>

          {/* Contenido Principal */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 md:p-8 backdrop-blur-md">
            {activeTab === "perfil" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/[0.06]">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-neutral-900 border-2 border-dashed border-neutral-700 flex items-center justify-center overflow-hidden">
                      <User size={40} className="text-neutral-700" />
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2 bg-violet-600 rounded-lg hover:bg-violet-500 transition-colors shadow-lg">
                      <Camera size={16} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold italic uppercase">
                      Foto de Perfil
                    </h3>
                    <p className="text-neutral-500 text-xs mt-1">
                      Recomendado: 400x400px (JPG o PNG)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup
                    label="Nombre de Usuario"
                    placeholder="Admin Gloto"
                  />
                  <InputGroup
                    label="Correo Electrónico"
                    placeholder="admin@gloto.com"
                    type="email"
                  />
                  <InputGroup label="Cargo" placeholder="Gerente General" />
                  <InputGroup label="Idioma" placeholder="Español (ES)" />
                </div>
              </div>
            )}

            {activeTab === "local" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                <InputGroup
                  label="Nombre del Restaurante"
                  placeholder="Gloto Grill & Bar"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup
                    label="Dirección"
                    placeholder="Av. Principal 123"
                  />
                  <InputGroup label="Moneda" placeholder="USD ($)" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-2 ml-1">
                    Bio del Local
                  </label>
                  <textarea
                    className="w-full bg-neutral-900/50 border border-white/[0.1] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors min-h-[100px]"
                    placeholder="Descripción breve del establecimiento..."
                  />
                </div>
              </div>
            )}

            {activeTab === "seguridad" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                <InputGroup label="Contraseña Actual" type="password" />
                <InputGroup label="Nueva Contraseña" type="password" />
                <div className="flex items-center justify-between p-4 bg-violet-600/5 rounded-2xl border border-violet-500/10 mt-8">
                  <div>
                    <p className="text-sm font-bold italic uppercase">
                      Autenticación en dos pasos
                    </p>
                    <p className="text-neutral-500 text-[11px] mt-1">
                      Añade una capa extra de seguridad a tu cuenta.
                    </p>
                  </div>
                  <div className="w-10 h-5 bg-neutral-800 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-violet-500 rounded-full" />
                  </div>
                </div>
              </div>
            )}

            {/* Botón Guardar (Global para el card) */}
            <div className="mt-10 pt-6 border-t border-white/[0.06] flex justify-end">
              <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-violet-900/30">
                <Save size={16} />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Helper para Inputs
const InputGroup = ({ label, placeholder, type = "text" }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest ml-1">
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      className="bg-neutral-900/50 border border-white/[0.1] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors placeholder:text-neutral-700"
    />
  </div>
);

export default Configuracion;
