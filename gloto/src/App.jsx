import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// Componentes de Layout
import Navbar from "./components/Navbar";

import Marketplace from "./pages/Marketplace";
import BusinessDetail from "./pages/BusinessDetail";
import Checkout from "./pages/Checkout";
import OrderStatus from "./pages/OrderStatus";
import OrdersHistory from "./pages/OrdersHistory";
import Admin from "./pages/Admin";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Kitchen from "./pages/Kitchen";
import SuperAdmin from "./pages/SuperAdmin";

function App() {
  return (
    <BrowserRouter>
      <main className="min-h-screen bg-slate-950">
        <Routes>
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
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-status/:orderId" element={<OrderStatus />} />
          <Route path="/orders" element={<OrdersHistory />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/kitchen/:businessId" element={<Kitchen />} />
          <Route path="/super-admin/dashboard" element={<SuperAdmin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
