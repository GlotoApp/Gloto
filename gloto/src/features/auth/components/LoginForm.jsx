import { useState } from "react";
import { supabase } from "../../../shared/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*, businesses(*)")
        .eq("id", user.id)
        .single();

      if (profile) {
        sessionStorage.setItem("gloto_profile", JSON.stringify(profile));
      }

      // Revisar si hay una URL guardada para redirigir
      const redirectUrl = localStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectUrl);
      } else {
        navigate("/");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="w-full max-w-md space-y-4 bg-slate-900 p-8 rounded-2xl border border-slate-800"
    >
      <input
        type="email"
        name="email" // Añadido
        autoComplete="username" // Añadido
        placeholder="Tu email"
        className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-white"
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        name="password" // Añadido
        autoComplete="current-password" // Añadido (Soluciona el error de consola)
        placeholder="Tu contraseña"
        className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-white"
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        disabled={loading}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-lg transition-all"
      >
        {loading ? "Entrando..." : "Iniciar Sesión"}
      </button>
    </form>
  );
}
