import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../shared/lib/supabase";
import { useAuth } from "../app/AuthProvider";
import { Bell } from "lucide-react";
import UserSidebar from "./UserSidebar";
import NotificationsPanel from "./NotificationsPanel";

export default function Navbar() {
  const { profile } = useAuth();
  const location = useLocation();

  // No mostrar navbar en páginas de negocio ni en checkout
  if (
    location.pathname.startsWith("/business/") ||
    location.pathname === "/checkout"
  ) {
    return null;
  }

  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Función para obtener notificaciones sin leer
  const fetchUnreadCount = async (userId) => {
    if (!userId) return;
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    setUnreadCount(count || 0);
  };

  // Manejar cuando se marcan como leídas
  const handleNotificationsMarkedAsRead = () => {
    setUnreadCount(0);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        fetchUnreadCount(data.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchUnreadCount(session.user.id);
        } else {
          setUser(null);
        }
      },
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const initials = profile
    ? (() => {
        const parts = profile.full_name?.split(" ") || [];
        return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
      })()
    : "U";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-20 bg-slate-950 backdrop-blur-md border-b border-slate-800 z-[100] px-6">
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
                <button
                  onClick={() => setShowNotifications(true)}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors relative"
                >
                  <Bell
                    size={20}
                    className={
                      unreadCount > 0 ? "text-orange-500" : "text-slate-400"
                    }
                  />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                  )}
                </button>

                {/* AVATAR */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-black text-sm hover:bg-sky-600 transition-colors"
                >
                  {initials}
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-sky-500 text-white px-6 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest transition-all hover:bg-sky-600"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* USER SIDEBAR */}
      {user && (
        <UserSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
          onNotificationsMarkedAsRead={handleNotificationsMarkedAsRead}
        />
      )}

      {/* NOTIFICATIONS PANEL */}
      {showNotifications && user && (
        <NotificationsPanel
          userId={user.id}
          onClose={() => setShowNotifications(false)}
          onNotificationsMarkedAsRead={handleNotificationsMarkedAsRead}
        />
      )}
    </>
  );
}
