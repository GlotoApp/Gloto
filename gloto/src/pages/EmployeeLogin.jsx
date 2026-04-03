import { useState } from "react";
import { supabase } from "../shared/lib/supabase";
import { useNavigate } from "react-router-dom";
import { ChefHat, Users } from "lucide-react";

export default function EmployeeLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Login en Auth de Supabase
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Traemos el perfil completo (incluyendo el negocio)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*, businesses(*)")
        .eq("id", user.id)
        .single();

      if (profileError || !profile)
        throw new Error("No se pudo verificar el perfil");

      // 3. Definimos los roles permitidos para empleados (NO admin, NO superadmin)
      const allowedRoles = ["cocinero", "cajero", "mesero", "repartidor"];

      if (!allowedRoles.includes(profile.role)) {
        await supabase.auth.signOut();
        alert(
          "ACCESO DENEGADO: Tu cuenta no tiene permisos de empleado. Por favor, contacta al administrador.",
        );
        setLoading(false);
        return;
      }

      // 4. GUARDADO INSTANTÁNEO: Guardamos en sessionStorage
      sessionStorage.setItem("gloto_profile", JSON.stringify(profile));

      // 5. REDIRECCIÓN SEGÚN ROL
      if (profile.role === "cocinero") {
        // Los cocineros van a la cocina
        navigate(`/kitchen/${profile.business_id}`);
      } else {
        // Cajeros, Meseros y Repartidores van al dashboard de empleados
        navigate("/employee-dashboard");
      }
    } catch (error) {
      alert("Error de acceso: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <ChefHat className="text-orange-500" size={32} />
          <Users className="text-orange-500" size={32} />
        </div>
        <h1 className="text-4xl font-black italic text-orange-500 tracking-tighter uppercase">
          Gloto Empleados
        </h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">
          Portal de Acceso para Personal
        </p>
      </div>

      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-slate-900 border border-white/5 p-10 rounded-[2.5rem] shadow-2xl space-y-4"
      >
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
            Email de Usuario
          </label>
          <input
            type="email"
            placeholder="empleado@negocio.com"
            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-orange-500 text-white transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
            Contraseña
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-orange-500 text-white transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all mt-6"
        >
          {loading ? "Validando..." : "Acceder como Empleado"}
        </button>
      </form>

      <div className="mt-8 text-center text-slate-500 text-xs">
        <p>¿Eres propietario? <span className="text-sky-400 hover:text-sky-300 cursor-pointer" onClick={() => navigate("/portal")}>Acceso Administrador</span></p>
      </div>
    </div>
  );
}
