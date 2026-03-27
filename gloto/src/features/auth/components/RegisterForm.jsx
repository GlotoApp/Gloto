import { useState } from "react";
import { useAuthActions } from "../hooks/useAuthActions";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const { signUp, loading, error } = useAuthActions();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signUp(email, password, fullName);

    if (result?.user) {
      const tempProfile = {
        id: result.user.id,
        full_name: fullName,
        role: "customer",
        avatar_url: null,
      };

      sessionStorage.setItem("gloto_profile", JSON.stringify(tempProfile));
      navigate("/");
    }
  };

  return (
    <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-white mb-2">Crear cuenta</h2>

        <input
          type="text"
          name="full_name" // Añadido
          autoComplete="name" // Añadido
          placeholder="Nombre completo"
          className="bg-slate-950 border border-slate-700 p-3 rounded-lg text-white focus:outline-none focus:border-sky-500 transition-colors"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <input
          type="email"
          name="email" // Añadido
          autoComplete="email" // Añadido
          placeholder="Correo electrónico"
          className="bg-slate-950 border border-slate-700 p-3 rounded-lg text-white focus:outline-none focus:border-sky-500 transition-colors"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          name="password" // Añadido
          autoComplete="new-password" // Añadido (Para registros nuevos)
          placeholder="Contraseña"
          className="bg-slate-950 border border-slate-700 p-3 rounded-lg text-white focus:outline-none focus:border-sky-500 transition-colors"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          disabled={loading}
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold p-3 rounded-lg transition-all disabled:opacity-50 mt-2"
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
}
