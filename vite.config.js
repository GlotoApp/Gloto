import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Esto obliga a Vite a usar una sola copia de React y React-DOM
    // Evita el error de "Invalid Hook Call" y conflictos de useContext
    dedupe: ["react", "react-dom"],
  },
  // Opcional: Asegura que los módulos en carpetas personalizadas se procesen bien
  optimizeDeps: {
    include: ["framer-motion", "lucide-react"],
  },
});
