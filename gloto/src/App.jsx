import { BrowserRouter, Routes, Route } from "react-router-dom";
import Marketplace from "./pages/Marketplace";
import Auth from "./pages/Auth";
import BusinessDetail from "./pages/BusinessDetail";
import { AuthProvider } from "./app/AuthProvider";
import Navbar from "./components/Navbar";
import Checkout from "./pages/Checkout";
import Kitchen from "./pages/Kitchen";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <main className="min-h-screen bg-slate-950">
          <Routes>
            {/* --- RUTAS DE CLIENTE (Llevan Navbar) --- */}
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <Marketplace />
                </>
              }
            />
            <Route
              path="/business/:slug"
              element={
                <>
                  <Navbar />
                  <BusinessDetail />
                </>
              }
            />
            <Route
              path="/checkout"
              element={
                <>
                  <Navbar />
                  <Checkout />
                </>
              }
            />

            {/* --- RUTAS LIMPIAS (Sin Navbar de cliente) --- */}

            {/* Login/Registro */}
            <Route path="/auth" element={<Auth />} />

            {/* Cocina: Necesita pantalla completa, sin distracciones */}
            <Route path="/kitchen/:businessId" element={<Kitchen />} />
            <Route path="/portal" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
