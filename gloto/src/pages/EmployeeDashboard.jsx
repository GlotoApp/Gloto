import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../shared/lib/supabase";
import { useAuth } from "../app/AuthProvider";
import { LogOut, Package, Truck, Utensils, DollarSign } from "lucide-react";

export default function EmployeeDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/employee-login");
      return;
    }
    if (user) fetchEmployeeData();
  }, [user, authLoading]);

  const fetchEmployeeData = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id,role,business_id,full_name")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }
      setProfile(profileData);

      // Obtener nombre del negocio
      if (profileData.business_id) {
        const { data: businessData } = await supabase
          .from("businesses")
          .select("name")
          .eq("id", profileData.business_id)
          .single();

        if (businessData) setBusinessName(businessData.name);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/employee-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  const getRoleInfo = () => {
    switch (profile?.role) {
      case "cajero":
        return {
          title: "Cajero",
          icon: DollarSign,
          color: "text-orange-500",
          bg: "bg-orange-500/10",
          description: "Gestiona pagos y transacciones",
        };
      case "mesero":
        return {
          title: "Mesero",
          icon: Utensils,
          color: "text-sky-500",
          bg: "bg-sky-500/10",
          description: "Toma y gestiona pedidos",
        };
      case "repartidor":
        return {
          title: "Repartidor",
          icon: Truck,
          color: "text-green-500",
          bg: "bg-green-500/10",
          description: "Entrega de pedidos",
        };
      default:
        return {
          title: "Empleado",
          icon: Package,
          color: "text-slate-400",
          bg: "bg-slate-500/10",
          description: "Acceso de empleado",
        };
    }
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-black text-white italic mb-2">
              Gloto Empleados
            </h1>
            <p className="text-slate-400 text-sm">{businessName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"
          >
            <LogOut size={16} />
            Salir
          </button>
        </div>

        {/* Profile Card */}
        <div
          className={`p-6 rounded-2xl border border-white/10 ${roleInfo.bg} mb-8`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-4 rounded-xl bg-slate-900 border border-white/10 ${roleInfo.color}`}
            >
              <RoleIcon size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                {roleInfo.title}
              </h2>
              <p className="text-slate-400 text-sm">{roleInfo.description}</p>
              <p className="text-xs text-slate-500 mt-2">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900 border border-white/5 p-6 rounded-xl">
            <div className="text-slate-400 text-xs uppercase font-bold mb-2">
              Rol
            </div>
            <div className="text-2xl font-black text-white capitalize">
              {profile?.role}
            </div>
          </div>
          <div className="bg-slate-900 border border-white/5 p-6 rounded-xl">
            <div className="text-slate-400 text-xs uppercase font-bold mb-2">
              Negocio
            </div>
            <div className="text-xl font-black text-sky-400">
              {businessName || "-"}
            </div>
          </div>
        </div>

        {/* Acciones según rol */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-white uppercase">
            Acciones Disponibles
          </h3>

          {profile?.role === "cajero" && (
            <div className="bg-slate-900 border border-white/10 p-6 rounded-xl hover:border-orange-500/50 transition-colors cursor-pointer">
              <h4 className="text-orange-500 font-black mb-2">
                💰 Gestión de Pagos
              </h4>
              <p className="text-slate-400 text-sm">
                Aquí se mostrarán los pedidos pendientes de pago
              </p>
            </div>
          )}

          {profile?.role === "mesero" && (
            <div className="bg-slate-900 border border-white/10 p-6 rounded-xl hover:border-sky-500/50 transition-colors cursor-pointer">
              <h4 className="text-sky-500 font-black mb-2">📋 Mis Pedidos</h4>
              <p className="text-slate-400 text-sm">
                Vista de pedidos para atender a clientes
              </p>
            </div>
          )}

          {profile?.role === "repartidor" && (
            <div className="bg-slate-900 border border-white/10 p-6 rounded-xl hover:border-green-500/50 transition-colors cursor-pointer">
              <h4 className="text-green-500 font-black mb-2">
                🚗 Entregas Pendientes
              </h4>
              <p className="text-slate-400 text-sm">
                Pedidos listos para entrega con rutas optimizadas
              </p>
            </div>
          )}

          {/* Universal options */}
          <div className="bg-slate-900 border border-white/10 p-6 rounded-xl hover:border-slate-700 transition-colors cursor-pointer">
            <h4 className="text-slate-300 font-black mb-2">📱 Mi Perfil</h4>
            <p className="text-slate-400 text-sm">
              Edita tu información personal
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-slate-500 text-xs">
          <p>Gloto © 2026 | Sistema de Gestión para Negocios</p>
        </div>
      </div>
    </div>
  );
}
