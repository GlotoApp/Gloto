import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="bg-neutral-950 min-h-screen flex font-manrope selection:bg-violet-500/30 text-white">
      <Sidebar
        isExpanded={isSidebarExpanded}
        toggleSidebar={() => setIsSidebarExpanded((prev) => !prev)}
      />
      <main
        className={`flex-1 p-0 overflow-y-auto min-h-screen ${
          isSidebarExpanded ? "ml-0" : "ml-20"
        }`}
      >
        <Outlet context={{ isSidebarExpanded }} />
      </main>
    </div>
  );
};

export default Layout;
