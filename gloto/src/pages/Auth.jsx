import { useState } from "react";
import RegisterForm from "../features/auth/components/RegisterForm";
import LoginForm from "../features/auth/components/LoginForm"; // Importa el nuevo

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true); // Estado para cambiar entre login y registro

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-black text-white italic mb-2 tracking-tighter">
          GLOTO
        </h1>
        <p className="text-slate-400">
          {isLogin ? "Bienvenido de nuevo" : "Únete a la nueva era de pedidos"}
        </p>
      </div>

      {/* Renderizamos uno u otro según el estado */}
      {isLogin ? <LoginForm /> : <RegisterForm />}

      <button
        onClick={() => setIsLogin(!isLogin)}
        className="mt-6 text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors"
      >
        {isLogin
          ? "¿No tienes cuenta? Regístrate gratis"
          : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </div>
  );
}
