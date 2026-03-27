import { useState } from "react";
import { supabase } from "../shared/lib/supabase";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock } from "lucide-react";

export default function SuperAdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Auth de Supabase
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Verificar ROL en la tabla 'profiles' (muy importante)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "superadmin") {
        await supabase.auth.signOut();
        throw new Error("Acceso denegado: No tienes permisos de Super Admin.");
      }

      // 3. Éxito
      navigate("/super-admin/dashboard");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-sky-500/10 rounded-3xl mb-4">
            <ShieldCheck className="text-sky-500" size={40} />
          </div>
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">
            Gloto <span className="text-sky-500">Nexus</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
            Terminal de Control Global
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              placeholder="USUARIO"
              className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-white font-bold focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="CONTRASEÑA"
              className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-white font-bold focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-400 text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(14,165,233,0.3)]"
          >
            {loading ? (
              "VALIDANDO..."
            ) : (
              <>
                <Lock size={14} /> ACCEDER AL SISTEMA
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
