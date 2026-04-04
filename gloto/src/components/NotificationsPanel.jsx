import { useEffect, useState } from "react";
import { supabase } from "../shared/lib/supabase";
import { X, Check, CheckCheck } from "lucide-react";

export default function NotificationsPanel({
  userId,
  onClose,
  onNotificationsMarkedAsRead,
}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Obtener notificaciones
  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("id,user_id,title,message,type,is_read,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Notifications error:", error);
        setNotifications([]);
      } else {
        setNotifications(data || []);
      }
    } catch (err) {
      console.error("Error en fetchNotifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  // Marcar UNA notificación como leída
  const markSingleAsRead = async (notificationId) => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .select();

      if (error) {
        console.error("Error al marcar como leída:", error);
        return;
      }

      console.log("Notificación actualizada en BD:", data);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
    } catch (err) {
      console.error("Error inesperado:", err);
    }
  };

  // Marcar TODAS como leídas
  const markAllAsRead = async () => {
    if (!userId || unreadCount === 0) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false)
        .select();

      if (error) {
        console.error("Error al marcar todos como leído:", error);
        return;
      }

      console.log("Notificaciones actualizadas en BD:", data);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

      // Notificar al Navbar
      if (onNotificationsMarkedAsRead) {
        onNotificationsMarkedAsRead();
      }
    } catch (err) {
      console.error("Error inesperado:", err);
    }
  };

  // Suscripción Realtime
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifs-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          new Audio(
            "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
          )
            .play()
            .catch(() => {});
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId]);

  return (
    <div className="fixed inset-0 z-[220] bg-black/40 backdrop-blur-sm flex items-end animate-in fade-in">
      <div className="w-full bg-slate-950 rounded-t-[2.5rem] border-t border-slate-800 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* HEADER */}
        <div className="border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center justify-between p-6">
            <div>
              <h2 className="text-2xl font-black text-white">Notificaciones</h2>
              {unreadCount > 0 && (
                <span className="text-xs text-orange-500 font-black uppercase tracking-widest mt-1 block">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          {/* Botón "Marcar como leído todos" */}
          {unreadCount > 0 && (
            <div className="px-6 pb-4">
              <button
                onClick={markAllAsRead}
                className="w-full bg-orange-500 hover:bg-orange-600 text-slate-950 font-black py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
              >
                <CheckCheck size={18} />
                Marcar todos como leído
              </button>
            </div>
          )}
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-slate-400 animate-pulse">Cargando...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm">Sin notificaciones</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-6 hover:bg-slate-900/50 transition-colors flex items-start justify-between gap-4 ${
                    !n.is_read
                      ? "bg-slate-900/30 border-l-2 border-orange-500"
                      : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      {n.title}
                      {!n.is_read && (
                        <span className="inline-block w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
                      )}
                    </p>
                    <p className="text-sm font-bold text-white leading-relaxed mb-3">
                      {n.message}
                    </p>
                    <p className="text-xs text-slate-500 font-bold">
                      {new Date(n.created_at).toLocaleString("es-CO", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Botón marcar como leída */}
                  {!n.is_read && (
                    <button
                      onClick={() => markSingleAsRead(n.id)}
                      className="flex-shrink-0 mt-1 p-2 hover:bg-slate-800 rounded-lg transition-colors group"
                      title="Marcar como leído"
                    >
                      <Check
                        size={18}
                        className="text-orange-500 group-hover:text-orange-400"
                      />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
