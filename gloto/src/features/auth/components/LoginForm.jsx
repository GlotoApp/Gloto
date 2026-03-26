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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else navigate("/"); // Si entra bien, va al Marketplace
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleLogin}
      className="w-full max-w-md space-y-4 bg-slate-900 p-8 rounded-2xl border border-slate-800"
    >
      <input
        type="email"
        placeholder="Tu email"
        className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-white"
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
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
