import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Plus,
  ChefHat,
  BookOpen,
  Package,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Wallet,
  ClipboardList,
  CalendarDays,
  PencilRuler,
  Users,
  CreditCard,
} from "lucide-react";

const Sidebar = ({ isExpanded, toggleSidebar }) => {
  const location = useLocation();
  const [configOpen, setConfigOpen] = useState(false);

  // Cerrar submenu si se colapsa el sidebar
  useEffect(() => {
    if (!isExpanded) setConfigOpen(false);
  }, [isExpanded]);

  const menuItems = [
    // --- NIVEL 1: OPERACIÓN EN VIVO (Uso constante) ---
    { name: "POS", path: "/", icon: Plus },
    { name: "Mesas", path: "/mesas", icon: "table_bar" },
    { name: "Órdenes", path: "/ordenes", icon: ClipboardList },
    { name: "Cocina", path: "/cocina", icon: ChefHat },

    // --- NIVEL 2: GESTIÓN DE RECURSOS (Cierre y Personal) ---
    { name: "Inventario", path: "/inventario", icon: Package },
    { name: "Caja", path: "/caja", icon: "point_of_sale" },
    { name: "Catálogo", path: "/catalogo", icon: BookOpen },
    { name: "Horarios", path: "/horarios", icon: CalendarDays },

    // --- NIVEL 3: BACK-OFFICE Y CONTROL (Administración) ---
    { name: "Nomina", path: "/nomina", icon: Users },
    { name: "Estadísticas", path: "/estadisticas", icon: BarChart3 },
    { name: "Utilidades", path: "/utilidades", icon: PencilRuler },

    // --- NIVEL 4: SISTEMA ---
    { name: "Planes", path: "/planes", icon: CreditCard },
  ];

  const configSubMenu = [
    { name: "General", path: "/configuracion" },
    { name: "Tienda", path: "/configuracion/tienda" },
    { name: "Notificaciones", path: "/configuracion/notificaciones" },
    { name: "Usuarios", path: "/configuracion/usuarios" },
  ];

  const isConfigActive = location.pathname.includes("/configuracion");

  return (
    <>
      {/* Overlay con efecto blur */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 ${
          isExpanded
            ? "bg-black/30 backdrop-blur-sm opacity-100 pointer-events-auto"
            : "bg-black/0 backdrop-blur-0 opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      />

      <aside
        className={`flex flex-col fixed left-0 top-0 h-full border-r border-white/[0.06] bg-neutral-950 z-50 transition-all duration-500 ease-in-out ${
          isExpanded ? "w-64" : "w-20"
        }`}
      >
        {/* Header con Botón de Toggle */}
        <div
          className={`h-20 flex items-center border-b border-white/[0.06] transition-all duration-300 ${
            isExpanded ? "px-6 justify-between" : "justify-center px-0"
          }`}
        >
          {isExpanded && (
            <div className="flex items-center gap-3 animate-in fade-in duration-500">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center font-black text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]">
                G
              </div>
              <span className="text-white font-bold tracking-tight text-lg italic">
                Gloto
              </span>
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg hover:bg-white/[0.05] text-neutral-500 transition-colors ${!isExpanded ? "scale-110" : ""}`}
          >
            {isExpanded ? (
              <PanelLeftClose size={18} />
            ) : (
              <PanelLeftOpen size={22} className="text-violet-500" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden custom-sidebar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isGoogleIcon = typeof item.icon === "string";
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center rounded-xl transition-all duration-300 ${
                  isExpanded
                    ? "w-full px-4 py-3 gap-3"
                    : "w-14 h-14 justify-center py-0 px-0"
                } ${
                  isActive
                    ? "bg-violet-600/10 text-white shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]"
                    : "text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.02]"
                }`}
              >
                {isActive && (
                  <div className="absolute left-[-12px] w-1 h-5 bg-violet-500 rounded-r-full shadow-[0_0_15px_#8b5cf6]" />
                )}

                {/* Contenedor del Icono */}
                <div
                  className={`flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                    !isExpanded && "group-hover:scale-110"
                  } ${isActive ? "text-violet-400" : "group-hover:text-neutral-300"}`}
                >
                  {isGoogleIcon ? (
                    <span className="material-symbols-outlined !text-[22px]">
                      {item.icon}
                    </span>
                  ) : (
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  )}
                </div>

                {/* Texto (Solo si está expandido) */}
                {isExpanded && (
                  <span className="text-sm font-bold uppercase tracking-tight truncate flex-1 animate-in fade-in slide-in-from-left-2 duration-300">
                    {item.name}
                  </span>
                )}

                {/* Tooltip para modo colapsado */}
                {!isExpanded && (
                  <div className="fixed left-20 ml-2 px-3 py-1 bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] shadow-lg shadow-violet-900/20">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}

          {/* Configuración con Submenu */}
          <div className="flex flex-col">
            <button
              onClick={() => {
                if (!isExpanded) {
                  toggleSidebar();
                  setConfigOpen(true);
                } else {
                  setConfigOpen(!configOpen);
                }
              }}
              className={`group relative flex items-center rounded-xl transition-all duration-300 ${
                isExpanded
                  ? "w-full px-4 py-3 gap-3"
                  : "w-14 h-14 justify-center py-0 px-0"
              } ${
                isConfigActive
                  ? "bg-violet-600/10 text-white shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]"
                  : "text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.02]"
              }`}
            >
              {isConfigActive && (
                <div className="absolute left-[-12px] w-1 h-5 bg-violet-500 rounded-r-full shadow-[0_0_15px_#8b5cf6]" />
              )}

              {/* Contenedor del Icono */}
              <div
                className={`flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                  !isExpanded && "group-hover:scale-110"
                } ${isConfigActive ? "text-violet-400" : "group-hover:text-neutral-300"}`}
              >
                <Settings size={20} strokeWidth={isConfigActive ? 2.5 : 2} />
              </div>

              {/* Texto (Solo si está expandido) */}
              {isExpanded && (
                <>
                  <span className="text-sm font-bold uppercase tracking-tight flex-1 animate-in fade-in slide-in-from-left-2 duration-300">
                    Configuración
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-violet-400/50 transition-transform duration-300 ${
                      configOpen ? "rotate-180" : ""
                    }`}
                  />
                </>
              )}

              {/* Tooltip para modo colapsado */}
              {!isExpanded && (
                <div className="fixed left-20 ml-2 px-3 py-1 bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] shadow-lg shadow-violet-900/20">
                  Configuración
                </div>
              )}
            </button>

            {/* Submenu de Configuración */}
            {configOpen && isExpanded && (
              <div className="mt-2 ml-4 flex flex-col border-l border-violet-500/30 space-y-1 pl-3 animate-in slide-in-from-top-2 duration-300">
                {configSubMenu.map((sub) => {
                  const isSubActive = location.pathname === sub.path;
                  return (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      onClick={() =>
                        window.innerWidth < 1024 && toggleSidebar()
                      }
                      className={`flex items-center rounded-lg transition-all duration-300 px-3 py-2 text-xs font-bold uppercase tracking-tight ${
                        isSubActive
                          ? "bg-violet-500/20 text-violet-300"
                          : "text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.03]"
                      }`}
                    >
                      {isSubActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mr-2" />
                      )}
                      {sub.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Footer Profile */}
        <div
          className={`p-5  flex transition-all ${isExpanded ? "justify-start" : "justify-center"}`}
        >
          <div
            className={`flex items-center rounded-xl  transition-all ${
              isExpanded ? "p-2 gap-3 w-full" : "p-2"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600/20 to-neutral-900 border border-white/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[14px] text-violet-400 font-variation-fill">
                shield_person
              </span>
            </div>

            {isExpanded && (
              <div className="flex-1 min-w-0 animate-in fade-in duration-500">
                <p className="text-white text-[11px] font-black uppercase tracking-tighter truncate italic">
                  Admin Local
                </p>
                <p className="text-violet-500 text-[9px] uppercase font-black tracking-[0.1em]">
                  Premium
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
