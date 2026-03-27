import { useState } from "react";
import { supabase } from "../shared/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
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

      // 3. Definimos los roles permitidos en este portal (Cualquier empleado)
      const allowedRoles = [
        "admin",
        "cocinero",
        "cajero",
        "mesero",
        "repartidor",
        "superadmin",
      ];

      if (!allowedRoles.includes(profile.role)) {
        await supabase.auth.signOut();
        alert(
          "ACCESO DENEGADO: No tienes permisos para acceder al portal de negocios.",
        );
        setLoading(false);
        return;
      }

      // 4. GUARDADO INSTANTÁNEO: Guardamos en sessionStorage
      // para que el AuthProvider lo detecte sin ir a la red
      sessionStorage.setItem("gloto_profile", JSON.stringify(profile));

      // 5. REDIRECCIÓN SEGÚN ROL (Contexto de trabajo)
      if (profile.role === "superadmin") {
        navigate("/super-admin/dashboard");
      } else if (profile.role === "cocinero") {
        navigate(`/kitchen/${profile.business_id}`);
      } else {
        // Admins, Cajeros y Meseros van al panel principal por defecto
        navigate("/admin");
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
        <h1 className="text-4xl font-black italic text-sky-500 tracking-tighter uppercase">
          Gloto Business
        </h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">
          Portal de Gestión de Negocios
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
            placeholder="usuario@negocio.com"
            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-sky-500 text-white transition-all"
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
            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-sky-500 text-white transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-sky-500 hover:bg-sky-400 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-sky-500/20 uppercase text-xs tracking-widest active:scale-95 disabled:opacity-50 mt-4"
        >
          {loading ? "Verificando..." : "Entrar a mi Puesto"}
        </button>
      </form>
    </div>
  );
}
