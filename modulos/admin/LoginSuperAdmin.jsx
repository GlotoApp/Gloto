import { useState } from "react";
import { supabase } from "../../src/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Loader2 } from "lucide-react"; // Si no tienes lucide, puedes usar emojis

const LoginSuperAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // FORZAMOS CIERRE DE CUALQUIER SESIÓN PREVIA
      await supabase.auth.signOut();

      // LLAMADA PURA Y LIMPIA
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setLoading(false);
        // Opcional: un mensaje genérico que no da pistas al atacante
        alert("Usuario o contraseña incorrectos");
        return;
      }

      // Verificación de ROL
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("rol")
        .eq("id", data.user.id);

      if (profile && profile.length > 0 && profile[0].rol === "superadmin") {
        navigate("/superadmin");
      } else {
        await supabase.auth.signOut();
      }
    } catch (err) {
      // El bloque catch evita que errores inesperados lleguen a la consola
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <Lock size={32} color="#fff" />
          </div>
          <h2 style={styles.title}>Panel Maestro</h2>
          <p style={styles.subtitle}>Acceso restringido para administradores</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email"
              style={styles.input}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.inputIcon} />
            <input
              type="password"
              placeholder="Clave maestra"
              style={styles.input}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button style={styles.button} disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Entrar al Sistema"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// Estilos en JS para un componente limpio y rápido
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
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
  },
  header: { textAlign: "center", marginBottom: "30px" },
  iconWrapper: {
    background: "#2563eb",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  title: { color: "#fff", margin: "0 0 10px", fontSize: "24px" },
  subtitle: { color: "rgba(255,255,255,0.4)", fontSize: "14px" },
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
    fontSize: "16px",
    outline: "none",
  },
  button: {
    padding: "15px",
    borderRadius: "12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
    transition: "background 0.3s",
  },
};

export default LoginSuperAdmin;
