      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black italic text-sky-500 tracking-tighter uppercase">
          Gloto Admin
        </h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">
          Portal de Administración de Negocios
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

      <div className="mt-8 text-center text-slate-500 text-xs space-y-2">
        <p>
          ¿Eres empleado?{" "}
          <span
            className="text-orange-400 hover:text-orange-300 cursor-pointer font-bold"
            onClick={() => navigate("/employee-login")}
          >
            Acceso Empleados
          </span>
        </p>
      </div>
    </div>
  );
}
