import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
// Importamos el proveedor de autenticación
import { AuthProvider } from "./app/AuthProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Envolvemos App para que toda la lógica de usuario esté disponible */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
