import { useState } from "react";
import { supabase } from "../../../shared/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Autenticación en Supabase Auth
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Obtener el perfil del usuario con columnas específicas
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id,role,business_id,full_name")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        throw new Error("No se encontró el perfil del usuario");
      }

      // Validar que solo clientes puedan entrar aquí
      if (profile.role !== "cliente") {
        await supabase.auth.signOut();
        setErrorMsg("Acceso denegado: solo clientes pueden entrar aquí.");
        setLoading(false);
        return;
      }

      // 3. Intentar cargar el negocio SOLO si el perfil tiene un business_id
      // Esto evita el error 500 si un cliente (sin negocio) intenta loguearse
      let fullProfile = { ...profile };

      if (profile.business_id) {
        const { data: business } = await supabase
          .from("businesses")
          .select("*")
          .eq("id", profile.business_id)
          .single();

        if (business) {
          fullProfile.businesses = business;
        }
      }

      // Guardar en sessionStorage para acceso rápido en la App
      sessionStorage.setItem("gloto_profile", JSON.stringify(fullProfile));

      // 4. Redirección lógica
      const redirectUrl = localStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectUrl);
      } else {
        // Redirección por defecto según rol
        if (profile.role === "admin" || profile.role === "superadmin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      setErrorMsg(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="w-full max-w-md space-y-4 bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-sm shadow-2xl"
    >
      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {errorMsg}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-500 ml-1 uppercase tracking-wider">
          Email
        </label>
        <input
          type="email"
          name="email"
          autoComplete="username"
          placeholder="tu@email.com"
          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-500 ml-1 uppercase tracking-wider">
          Contraseña
        </label>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        disabled={loading}
        className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-sky-500/10 mt-2 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            Entrando...
          </>
        ) : (
          "Iniciar Sesión"
        )}
      </button>
    </form>
  );
}
