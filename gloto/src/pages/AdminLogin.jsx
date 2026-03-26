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
      // 1. Intentamos el login en Auth de Supabase
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Verificamos el ROL en la tabla de perfiles que actualizamos
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) throw new Error("No se pudo verificar el perfil");

      // 3. Si el rol NO es admin, cerramos la sesión y damos error
      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        alert(
          "ACCESO DENEGADO: Esta cuenta no tiene permisos de administrador.",
        );
        setLoading(false);
        return;
      }

      // 4. Si todo está bien, vamos al Admin
      navigate("/admin");
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
          Portal exclusivo para socios
        </p>
      </div>

      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-slate-900 border border-white/5 p-10 rounded-[2.5rem] shadow-2xl space-y-4"
      >
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
            Email Corporativo
          </label>
          <input
            type="email"
            placeholder="admin@gloto.com"
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
          {loading ? "Verificando Credenciales..." : "Entrar al Panel"}
        </button>
      </form>
    </div>
  );
}
