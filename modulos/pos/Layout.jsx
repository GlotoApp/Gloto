import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Loading, LOADING_DURATION_MS } from "./Loading";

// Lógica de carga integrada globalmente en el Layout
const ReadyGate = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fontsWait = document.fonts.ready;
    const minWait =
      LOADING_DURATION_MS !== null
        ? new Promise((res) => setTimeout(res, LOADING_DURATION_MS))
        : Promise.resolve();

    Promise.all([minWait, fontsWait]).then(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsReady(true));
      });
    });
  }, []);

  if (!isReady) return <Loading />;
  return children;
};

const Layout = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="bg-neutral-950 min-h-screen flex font-manrope selection:bg-violet-500/30 text-white relative overflow-x-hidden">
      <div className="z-50 fixed top-0 left-0 h-screen transition-all duration-300">
        <Sidebar
          isExpanded={isSidebarExpanded}
          toggleSidebar={() => setIsSidebarExpanded((prev) => !prev)}
        />
      </div>

      <main className="flex-1 p-0 overflow-y-auto min-h-screen ml-20 w-[calc(100%-5rem)] transition-all duration-300">
        {/* Aquí la animación protege TODAS las rutas hijas automáticamente */}
        <ReadyGate>
          <Outlet context={{ isSidebarExpanded }} />
        </ReadyGate>
      </main>

      {isSidebarExpanded && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarExpanded(false)}
        />
      )}
    </div>
  );
};

export default Layout;
