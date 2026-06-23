import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Home as HomeIcon,
  Search,
  User,
  MapPin,
  LogIn,
} from "lucide-react";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import { CartProvider } from "./pages/CartContext";

const Marketplace = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isShopPage = location.pathname.includes("/tienda/");

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* HEADER */}
      {!isShopPage && (
        <header className="sticky top-0 z-50 bg-background">
          <div className="px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} />
              </button>

              <h1 className="font-black text-2xl tracking-tighter text-primary-container">
                Gloto
              </h1>
            </div>

            <button className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-surface">
              <MapPin size={14} className="text-primary-container" />
              <span>Cartagena</span>
            </button>
          </div>
        </header>
      )}

      {/* OVERLAY (Fondo oscuro al abrir el sidebar) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-background z-[70] transform transition-transform duration-300 border-r border-outline ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-5 flex justify-end">
          <button onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="px-5 py-4">
          <button className="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-surface transition-colors">
            <LogIn size={20} />
            <span className="font-bold">Iniciar Sesión</span>
          </button>
        </nav>
      </aside>

      {/* CONTENIDO */}
      <main className="view-animate">
        <CartProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tienda/:slug" element={<Shop />} />
          </Routes>
        </CartProvider>
      </main>
    </div>
  );
};

export default Marketplace;
