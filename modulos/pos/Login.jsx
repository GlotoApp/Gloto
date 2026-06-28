import { useState } from "react";
import { supabase } from "../../src/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { User, Lock, Loader2 } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Consultamos sin .single() para evitar el error 406
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", username);

      // 2. Si hay error de base de datos O no hay usuarios, mensaje genérico
      // NUNCA digas "usuario no encontrado" específicamente
      if (profileError || !profiles || profiles.length === 0) {
        alert("Usuario o contraseña incorrectos");
        setLoading(false);
        return;
      }

      // 3. Si llega aquí, es que el usuario existe (tomamos el primero)
      const email = profiles[0].email;

      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        // 4. Mismo mensaje genérico para no dar pistas
        alert("Usuario o contraseña incorrectos");
      } else {
        navigate("/pos");
      }
    } catch (err) {
      alert("Ocurrió un error al intentar entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Bienvenido a Gloto</h2>
        <p style={styles.subtitle}>Ingresa tus credenciales de cajero</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <User size={18} style={styles.inputIcon} />
            <input
              type="text"
              placeholder="Usuario"
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.inputIcon} />
            <input
              type="password"
              placeholder="Contraseña"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button style={styles.button} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Entrar al POS"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Reutilizamos la misma lógica de estilos para mantener consistencia
const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#0a0a0a",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#131313",
    padding: "40px",
    borderRadius: "20px",
    border: "1px solid #222",
    textAlign: "center",
  },
  title: { color: "#fff", marginBottom: "10px" },
  subtitle: { color: "#666", marginBottom: "30px", fontSize: "14px" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  inputGroup: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: "15px", color: "#666" },
  input: {
    width: "100%",
    padding: "15px 15px 15px 45px",
    borderRadius: "12px",
    background: "#1a1a1a",
    border: "1px solid #333",
    color: "#fff",
  },
  button: {
    padding: "15px",
    borderRadius: "12px",
    background: "#059669", // Verde para el POS
    color: "#fff",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Login;
