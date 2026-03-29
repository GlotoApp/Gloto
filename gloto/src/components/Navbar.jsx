import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../shared/lib/supabase";
import { Bell, LogOut, Package } from "lucide-react";
import { useAuth } from "../app/AuthProvider";

export default function Navbar() {
  const { profile } = useAuth();
  const location = useLocation();

  // No mostrar navbar en páginas de negocio
  if (location.pathname.startsWith("/business/")) {
    return null;
  }

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) fetchNotifications(data.user.id);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) fetchNotifications(currentUser.id);
      },
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Suscripción Realtime para notificaciones del usuario
  /*useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifs-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
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
  }, [user]);*/

  const fetchNotifications = async (userId) => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    setNotifications(data || []);
  };

  const handleToggleNotifs = async () => {
    setShowNotifs(!showNotifs);

    if (!showNotifs && unreadCount > 0) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const initials = profile
    ? (() => {
        const parts = profile.full_name?.split(" ") || [];
        return `${parts[0]?.[0] || ""}${parts[2]?.[0] || ""}`.toUpperCase();
      })()
    : "";

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-slate-950 backdrop-blur-md border-b border-slate-100 z-[100] px-6">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-sky-500 rotate-45"></div>
          </div>
          <span className="font-black italic uppercase tracking-tighter text-2xl">
            GLOTO
          </span>
        </Link>

        {/* ACCIONES */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* CAMPANA DE NOTIFICACIONES */}
              <div className="relative">
                <button
                  onClick={handleToggleNotifs}
                  className="p-2 hover:bg-slate-50 rounded-full transition-all relative"
                >
                  <Bell
                    size={20}
                    className={
                      unreadCount > 0 ? "text-sky-500" : "text-slate-400"
                    }
                  />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-(-10) mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Notificaciones
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[9px] bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full font-bold uppercase">
                          Nuevas
                        </span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center text-xs text-slate-300 font-medium italic">
                          Sin actividad
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className="p-5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                          >
                            <p className="text-[10px] font-black text-sky-600 uppercase mb-1">
                              {n.title}
                            </p>
                            <p className="text-xs font-bold text-slate-800 leading-snug">
                              {n.message}
                            </p>
                            <p className="text-[9px] text-slate-300 mt-2 font-bold">
                              {new Date(n.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* AVATAR CON INICIALES */}
              <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
            </>
          ) : (
            <Link
              to="/auth"
              className="bg-sky-500 text-white px-6 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest   transition-all"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
