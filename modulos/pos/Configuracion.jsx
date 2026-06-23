import React, { useState } from "react";
// Importamos todos los íconos necesarios para evitar fallos de renderizado
import {
  Settings,
  User,
  Store,
  Bell,
  Users,
  Save,
  Camera,
  X,
  Plus,
} from "lucide-react";

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState("general");

  const sections = [
    { id: "general", name: "General", icon: User },
    { id: "tienda", name: "Tienda", icon: Store },
    { id: "notificaciones", name: "Notificaciones", icon: Bell },
    { id: "usuarios", name: "Usuarios", icon: Users },
  ];

  return (
    // SE AGREGÓ 'font-sans' AQUÍ PARA IGUALAR LA TIPOGRAFÍA DE UTILIDADES
    <div className="min-h-screen bg-background text-white p-4 pt-4 sm:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-4 md:gap-6">
          <div className="flex flex-col gap-1">
            {/* CORRECCIÓN: Título cambiado de 'Utilidades' a 'Configuración' */}
            <h1 className="text-2xl font-black tracking-tighter">
              Configuración
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar de Navegación Interna */}
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

          {/* Contenedor del Componente Activo */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 md:p-8 backdrop-blur-md flex flex-col justify-between">
            {/* RENDERIZADO CONDICIONAL DE COMPONENTES */}
            <div>
              {activeTab === "general" && <ComponenteGeneral />}
              {activeTab === "tienda" && <ComponenteTienda />}
              {activeTab === "notificaciones" && <ComponenteNotificaciones />}
              {activeTab === "usuarios" && <ComponenteUsuarios />}
            </div>

            {/* Botón Guardar Cambios Único y Global */}
            <div className="mt-10 pt-6 border-t border-white/[0.06] flex justify-end">
              <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-violet-900/30">
                <Save size={16} />
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   1. COMPONENTE GENERAL: Específico de los datos del usuario logueado
   ========================================================================== */
const ComponenteGeneral = () => {
  const [datosUsuario, setDatosUsuario] = useState({
    nombre: "",
    cargo: "",
    email: "",
    telefono: "",
  });

  return (
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
          <h3 className="text-lg font-bold  uppercase">Foto del Usuario</h3>
          <p className="text-neutral-500 text-xs mt-1">
            Avatar personal en el sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup
          label="Nombre del Usuario"
          placeholder="Juan Pérez"
          value={datosUsuario.nombre}
          onChange={(e) =>
            setDatosUsuario({ ...datosUsuario, nombre: e.target.value })
          }
        />
        <InputGroup
          label="Cargo / Rol"
          placeholder="Administrador de Turno"
          value={datosUsuario.cargo}
          onChange={(e) =>
            setDatosUsuario({ ...datosUsuario, cargo: e.target.value })
          }
        />
        <InputGroup
          label="Correo Electrónico"
          placeholder="juan.perez@gloto.com"
          type="email"
          value={datosUsuario.email}
          onChange={(e) =>
            setDatosUsuario({ ...datosUsuario, email: e.target.value })
          }
        />
        <InputGroup
          label="Teléfono de Contacto"
          placeholder="300 123 4567"
          value={datosUsuario.telefono}
          onChange={(e) =>
            setDatosUsuario({ ...datosUsuario, telefono: e.target.value })
          }
        />
      </div>
    </div>
  );
};

/* ==========================================================================
   2. COMPONENTE TIENDA: Información comercial y operativa del restaurante
   ========================================================================== */
const ComponenteTienda = () => {
  const [hasNocturnalCharge, setHasNocturnalCharge] = useState(false);

  const [datosTienda, setDatosTienda] = useState({
    nombreNegocio: "",
    direccion: "",
    whatsappPedidos: "",
    latitud: "",
    longitud: "",
    costoPorKilometro: "",
    tarifaMinimaDomicilio: "",
    tarifaMaximaDomicilio: "",
    porcentajeNocturno: "",
    whatsappRed: "",
    facebook: "",
    tiktok: "",
    instagram: "",
  });

  const [customRedes, setCustomRedes] = useState([]);

  const manejarCambioFijo = (campo, valor) => {
    setDatosTienda({ ...datosTienda, [campo]: valor });
  };

  const agregarRedSocial = () => {
    setCustomRedes([
      ...customRedes,
      { id: Date.now(), plataforma: "", url: "" },
    ]);
  };

  const eliminarRedSocial = (id) => {
    setCustomRedes(customRedes.filter((red) => red.id !== id));
  };

  const manejarCambioCustom = (id, campo, valor) => {
    setCustomRedes(
      customRedes.map((red) =>
        red.id === id ? { ...red, [campo]: valor } : red,
      ),
    );
  };

  const obtenerTextoEjemplo = () => {
    const pct = parseFloat(datosTienda.porcentajeNocturno);
    const minima = parseFloat(datosTienda.tarifaMinimaDomicilio) || 4000;

    if (!pct || isNaN(pct)) {
      return `Ejemplo: Si un envío corto se liquida sobre la tarifa mínima de $${minima.toLocaleString()}, un recargo nocturno del 15% sumará $${(minima * 0.15).toLocaleString()} adicionales (Total: $${(minima * 1.15).toLocaleString()}).`;
    }

    const recargoCalculado = minima * (pct / 100);
    const totalCalculado = minima + recargoCalculado;

    return `Ejemplo: Si un envío corto se liquida sobre la tarifa mínima de $${minima.toLocaleString()}, el recargo nocturno del ${pct}% sumará $${recargoCalculado.toLocaleString()} adicionales (Total: $${totalCalculado.toLocaleString()}).`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
      {/* Identidad y Ubicación del Negocio */}
      <div>
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/[0.06]">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-neutral-900 border-2 border-dashed border-neutral-700 flex items-center justify-center overflow-hidden">
              <Store size={40} className="text-neutral-700" />
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-violet-600 rounded-lg hover:bg-violet-500 transition-colors shadow-lg">
              <Camera size={16} />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-bold  uppercase">
              Logotipo del Negocio
            </h3>
            <p className="text-neutral-500 text-xs mt-1">
              Se mostrará en el menú digital y facturas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup
            label="Nombre del Negocio"
            placeholder="Gloto Grill & Bar"
            value={datosTienda.nombreNegocio}
            onChange={(e) => manejarCambioFijo("nombreNegocio", e.target.value)}
          />
          <InputGroup
            label="Dirección Física"
            placeholder="Calle 10 # 4-25, Zona Centro"
            value={datosTienda.direccion}
            onChange={(e) => manejarCambioFijo("direccion", e.target.value)}
          />
          <InputGroup
            label="WhatsApp para recibir Pedidos"
            placeholder="Ej: 573001234567"
            type="tel"
            value={datosTienda.whatsappPedidos}
            onChange={(e) =>
              manejarCambioFijo("whatsappPedidos", e.target.value)
            }
          />
        </div>
      </div>

      {/* Geolocalización (Coordenadas Exactas) */}
      <div className="pt-6 border-t border-white/[0.06]">
        <div className="mb-4">
          <h4 className="text-sm font-black uppercase text-neutral-400 tracking-wider">
            Geolocalización del Negocio
          </h4>
          <p className="text-neutral-500 text-xs mt-0.5">
            Coordenadas geográficas para ubicar tu restaurante exactamente en el
            mapa.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup
            label="Latitud"
            placeholder="Ej: 7.89391"
            value={datosTienda.latitud}
            onChange={(e) => manejarCambioFijo("latitud", e.target.value)}
          />
          <InputGroup
            label="Longitud"
            placeholder="Ej: -72.50782"
            value={datosTienda.longitud}
            onChange={(e) => manejarCambioFijo("longitud", e.target.value)}
          />
        </div>
      </div>

      {/* Operación, Tarifas y Costos de Domicilio */}
      <div className="pt-6 border-t border-white/[0.06] space-y-6">
        <div>
          <h4 className="text-sm font-black uppercase text-neutral-400 tracking-wider">
            Logística y Domicilios
          </h4>
          <p className="text-neutral-500 text-xs mt-0.5">
            Configura el cálculo de envíos basado en la distancia recorrida y
            sus topes permitidos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputGroup
            label="Costo por Kilómetro (COP)"
            placeholder="1,200"
            type="number"
            value={datosTienda.costoPorKilometro}
            onChange={(e) =>
              manejarCambioFijo("costoPorKilometro", e.target.value)
            }
          />
          <InputGroup
            label="Tarifa Mínima de Domicilio (COP)"
            placeholder="4,000"
            type="number"
            value={datosTienda.tarifaMinimaDomicilio}
            onChange={(e) =>
              manejarCambioFijo("tarifaMinimaDomicilio", e.target.value)
            }
          />
          <InputGroup
            label="Tarifa Máxima de Domicilio (COP)"
            placeholder="15,000"
            type="number"
            value={datosTienda.tarifaMaximaDomicilio}
            onChange={(e) =>
              manejarCambioFijo("tarifaMaximaDomicilio", e.target.value)
            }
          />
        </div>

        <div className="space-y-4 pt-4 border-t border-white/[0.04]">
          <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
            <div>
              <p className="text-sm font-bold  uppercase">
                Recargo por Hora Nocturna
              </p>
              <p className="text-neutral-500 text-[11px] mt-1">
                Habilitar un cobro porcentual extra automatizado para envíos
                tarde en la noche.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHasNocturnalCharge(!hasNocturnalCharge)}
              className={`w-10 h-5 rounded-full p-0.5 relative transition-colors duration-300 flex-shrink-0 ${
                hasNocturnalCharge ? "bg-violet-600" : "bg-neutral-800"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${
                  hasNocturnalCharge ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {hasNocturnalCharge && (
            <div className="flex flex-col gap-3 p-5 bg-white/[0.01] border border-white/[0.04] rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
              <InputGroup
                label="Porcentaje del Recargo Nocturno (%)"
                placeholder="15"
                type="number"
                value={datosTienda.porcentajeNocturno}
                onChange={(e) =>
                  manejarCambioFijo("porcentajeNocturno", e.target.value)
                }
              />

              <div className="mt-1 p-3 bg-violet-600/10 border border-violet-500/20 rounded-xl">
                <p className="text-xs font-medium text-violet-300  tracking-wide leading-relaxed">
                  {obtenerTextoEjemplo()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canales Digitales y Redes Sociales */}
      <div className="pt-6 border-t border-white/[0.06] space-y-6">
        <div>
          <h4 className="text-sm font-black uppercase text-neutral-400 tracking-wider">
            Canales Digitales y Enlaces
          </h4>
          <p className="text-neutral-500 text-xs mt-0.5">
            Configura los accesos directos para que tus clientes te contacten o
            sigan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup
            label="Enlace de WhatsApp (Link de perfil público)"
            placeholder="https://wa.me/57300..."
            value={datosTienda.whatsappRed}
            onChange={(e) => manejarCambioFijo("whatsappRed", e.target.value)}
          />
          <InputGroup
            label="Enlace de Facebook"
            placeholder="https://facebook.com/tunegocio"
            value={datosTienda.facebook}
            onChange={(e) => manejarCambioFijo("facebook", e.target.value)}
          />
          <InputGroup
            label="Enlace de TikTok"
            placeholder="https://tiktok.com/@tunegocio"
            value={datosTienda.tiktok}
            onChange={(e) => manejarCambioFijo("tiktok", e.target.value)}
          />
          <InputGroup
            label="Enlace de Instagram"
            placeholder="https://instagram.com/tunegocio"
            value={datosTienda.instagram}
            onChange={(e) => manejarCambioFijo("instagram", e.target.value)}
          />
        </div>

        {customRedes.length > 0 && (
          <div className="space-y-4 pt-2 animate-in fade-in duration-300">
            <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest ml-1 block">
              Redes adicionales añadidas
            </label>
            {customRedes.map((red) => (
              <div
                key={red.id}
                className="flex gap-4 items-end bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl relative group"
              >
                <div className="w-1/3">
                  <label className="text-[9px] font-black uppercase text-neutral-600 tracking-wider block mb-1">
                    Plataforma (Ej: Twitter / X, Web)
                  </label>
                  <input
                    type="text"
                    placeholder="Twitter"
                    value={red.plataforma}
                    onChange={(e) =>
                      manejarCambioCustom(red.id, "plataforma", e.target.value)
                    }
                    className="w-full bg-neutral-900/50 border border-white/[0.1] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] font-black uppercase text-neutral-600 tracking-wider block mb-1">
                    URL del perfil o enlace
                  </label>
                  <input
                    type="text"
                    placeholder="https://x.com/tunegocio"
                    value={red.url}
                    onChange={(e) =>
                      manejarCambioCustom(red.id, "url", e.target.value)
                    }
                    className="w-full bg-neutral-900/50 border border-white/[0.1] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => eliminarRedSocial(red.id)}
                  className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white p-3 rounded-xl transition-all duration-200"
                  title="Eliminar esta red"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={agregarRedSocial}
            className="inline-flex items-center gap-2 border border-dashed border-violet-500/40 hover:border-violet-500 bg-violet-600/5 hover:bg-violet-600/10 text-violet-400 text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-all duration-300"
          >
            <Plus size={16} />
            Añadir otra red social
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   3. COMPONENTE NOTIFICACIONES: Alertas de sonido, pedidos y caja
   ========================================================================== */
const ComponenteNotificaciones = () => {
  const [notifs, setNotifs] = useState({
    comandas: true,
    stock: false,
    caja: true,
  });

  const toggleNotif = (key) => setNotifs({ ...notifs, [key]: !notifs[key] });

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-4">
      <h3 className="text-sm font-black uppercase text-neutral-400 tracking-wider mb-4">
        Preferencias de Alertas del Sistema
      </h3>

      <ToggleRow
        title="Nuevas Comandas (KDS)"
        description="Emitir sonido y alerta visual cuando ingrese un pedido a cocina."
        active={notifs.comandas}
        onToggle={() => toggleNotif("comandas")}
      />
      <ToggleRow
        title="Alertas de Stock Crítico"
        description="Notificar cuando un insumo o producto baje de su inventario mínimo."
        active={notifs.stock}
        onToggle={() => toggleNotif("stock")}
      />
      <ToggleRow
        title="Aperturas y Arqueos de Caja"
        description="Enviar un aviso al correo principal al cerrar la caja del turno."
        active={notifs.caja}
        onToggle={() => toggleNotif("caja")}
      />
    </div>
  );
};

/* ==========================================================================
   4. COMPONENTE USUARIOS: Gestión interna de cuentas de empleados
   ========================================================================== */
const ComponenteUsuarios = () => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-black uppercase text-neutral-400 tracking-wider">
        Administración de Personal de Cocina y Salón
      </h3>
    </div>

    <div className="border border-white/[0.06] bg-neutral-900/20 rounded-2xl overflow-hidden text-xs">
      <div className="grid grid-cols-3 p-3 bg-white/5 font-black text-neutral-400 uppercase tracking-widest border-b border-white/[0.06]">
        <span>Nombre</span>
        <span>Rol</span>
        <span>Estado</span>
      </div>
      <div className="grid grid-cols-3 p-3 border-b border-white/[0.04]">
        <span className="font-bold">Camilo Torres</span>
        <span className="text-violet-400">Mesero</span>
        <span className="text-emerald-400 font-bold">Activo</span>
      </div>
      <div className="grid grid-cols-3 p-3">
        <span className="font-bold">Diana Mendoza</span>
        <span className="text-violet-400">Chef de Cocina</span>
        <span className="text-emerald-400 font-bold">Activo</span>
      </div>
    </div>
  </div>
);

/* ==========================================================================
   COMPONENTES COMPARTIDOS / ATÓMICOS (HELPERS)
   ========================================================================== */
const InputGroup = ({ label, placeholder, type = "text", value, onChange }) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest ml-1">
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="bg-neutral-900/50 border border-white/[0.1] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-colors text-white placeholder:text-neutral-700 w-full"
    />
  </div>
);

const ToggleRow = ({ title, description, active, onToggle }) => (
  <div className="flex items-center justify-between p-4 bg-white/[0.01] rounded-2xl border border-white/[0.04]">
    <div>
      <p className="text-xs font-bold uppercase tracking-wide">{title}</p>
      <p className="text-neutral-500 text-[11px] mt-0.5">{description}</p>
    </div>
    <button
      type="button"
      onClick={onToggle}
      className={`w-10 h-5 rounded-full p-0.5 relative transition-colors duration-300 flex-shrink-0 ${
        active ? "bg-violet-600" : "bg-neutral-800"
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${
          active ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

export default Configuracion;
