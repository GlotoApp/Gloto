import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// Componentes de Layout
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute"; // Asegúrate de que la ruta sea correcta

// Páginas de Cliente
import Marketplace from "./pages/Marketplace";
import BusinessDetail from "./pages/BusinessDetail";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import OrderStatus from "./pages/OrderStatus";
import OrdersHistory from "./pages/OrdersHistory";

// Páginas de Administración de Negocio
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";

// Páginas de Empleados
import EmployeeLogin from "./pages/EmployeeLogin";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Kitchen from "./pages/Kitchen";

// Páginas de Super Admin
import SuperAdminLogin from "./pages/SuperAdminLogin";
import SuperAdmin from "./pages/SuperAdmin";

function App() {
  return (
    <BrowserRouter>
      <main className="min-h-screen bg-slate-950">
        <Routes>
          {/* --- RUTAS PÚBLICAS / CLIENTE --- */}
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
          <Route path="/auth" element={<Auth />} />

          {/* Rutas de cliente que requieren estar logueado */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["customer", "admin", "superadmin"]}
              />
            }
          >
            <Route
              path="/checkout"
              element={
                <>
                  <Navbar />
                  <Checkout />
                </>
              }
            />
            <Route path="/order-status/:orderId" element={<OrderStatus />} />
            <Route path="/orders" element={<OrdersHistory />} />
          </Route>

          {/* --- RUTAS DE NEGOCIO (ADMIN) --- */}
          <Route path="/portal" element={<AdminLogin />} />

          <Route
            element={
              <ProtectedRoute allowedRoles={["admin"]} />
            }
          >
            <Route path="/admin" element={<Admin />} />
          </Route>

          {/* --- RUTAS DE EMPLEADOS --- */}
          <Route path="/employee-login" element={<EmployeeLogin />} />

          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "cocinero",
                  "cajero",
                  "mesero",
                  "repartidor",
                ]}
              />
            }
          >
            <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
            <Route path="/kitchen/:businessId" element={<Kitchen />} />
          </Route>

          {/* --- RUTAS DE SUPER ADMIN --- */}
          <Route path="/SuperAdminLogin" element={<SuperAdminLogin />} />

          <Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
            <Route path="/super-admin/dashboard" element={<SuperAdmin />} />
          </Route>

          {/* Redirección por defecto si la ruta no existe */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
