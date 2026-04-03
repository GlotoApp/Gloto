import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../shared/lib/supabase";
import { useAuth } from "../app/AuthProvider";
import { X, Package, Bell, Settings, User, LogOut } from "lucide-react";
import NotificationsPanel from "./NotificationsPanel";

export default function UserSidebar({
  isOpen,
  onClose,
  user,
  onNotificationsMarkedAsRead,
}) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Obtener cantidad de notificaciones sin leer
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    // Suscripción Realtime
    const channel = supabase
      .channel(`notifs-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount();
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // Actualizar contador cuando se marcan como leídas desde el panel
  useEffect(() => {
    if (onNotificationsMarkedAsRead) {
      setUnreadCount(0);
    }
  }, [onNotificationsMarkedAsRead]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const initials = profile
    ? (() => {
        const parts = profile.full_name?.split(" ") || [];
        return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
      })()
    : "U";

  return (
    <>
      {/* OVERLAY */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm animate-in fade-in"
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-screen w-80 bg-slate-950 border-l border-slate-800 z-[210] overflow-y-auto transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-black text-white">Mi Cuenta</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* PERFIL */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white font-black text-lg">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-white truncate">
                {profile?.full_name || "Usuario"}
              </p>
              <p className="text-xs text-slate-500 font-bold">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* OPCIONES */}
        <nav className="p-4 space-y-2">
          {/* MIS PEDIDOS */}
          <button
            onClick={() => {
              navigate("/orders");
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-900 rounded-xl transition-colors text-left"
          >
            <Package size={20} className="text-sky-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white">Mis Pedidos</p>
              <p className="text-xs text-slate-500">Ver historial</p>
            </div>
          </button>

          {/* NOTIFICACIONES */}
          <button
            onClick={() => setShowNotifications(true)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-900 rounded-xl transition-colors text-left relative"
          >
            <Bell size={20} className="text-orange-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white">Notificaciones</p>
              {unreadCount > 0 && (
                <p className="text-xs text-orange-500 font-bold">
                  {unreadCount} nuevas
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
            )}
          </button>

          {/* EDITAR PERFIL */}
          <button
            onClick={() => {
              navigate("/profile");
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-900 rounded-xl transition-colors text-left"
          >
            <User size={20} className="text-emerald-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white">Editar Perfil</p>
              <p className="text-xs text-slate-500">Tu información</p>
            </div>
          </button>

          {/* AJUSTES */}
          <button
            onClick={() => {
              navigate("/settings");
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-900 rounded-xl transition-colors text-left"
          >
            <Settings size={20} className="text-purple-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white">Ajustes</p>
              <p className="text-xs text-slate-500">Preferencias</p>
            </div>
          </button>
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors text-left text-red-500 font-bold"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* PANEL DE NOTIFICACIONES */}
      {showNotifications && user && (
        <NotificationsPanel
          userId={user.id}
          onClose={() => setShowNotifications(false)}
          onNotificationsMarkedAsRead={onNotificationsMarkedAsRead}
        />
      )}
    </>
  );
}
