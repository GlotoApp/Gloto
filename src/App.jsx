import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Marketplace from "../modulos/marketplace/Marketplace";
import Layout from "../modulos/pos/Layout";
import { Loading } from "../modulos/pos/Loading"; // Asegúrate de importar el componente renombrado

const POS = lazy(() => import("../modulos/pos/POS"));
const Mesas = lazy(() => import("../modulos/pos/Mesas"));
const Ordenes = lazy(() => import("../modulos/pos/Ordenes"));
const Cocina = lazy(() => import("../modulos/pos/Cocina"));
const Caja = lazy(() => import("../modulos/pos/Caja"));
const CierresEliminados = lazy(
  () => import("../modulos/pos/CierresEliminados"),
);
const Horarios = lazy(() => import("../modulos/pos/Horarios"));
const Productos = lazy(() => import("../modulos/pos/Productos"));
const Inventario = lazy(() => import("../modulos/pos/inventario"));
const Estadisticas = lazy(() => import("../modulos/pos/Estadisticas"));
const Utilidades = lazy(() => import("../modulos/pos/Utilidades"));
const Planes = lazy(() => import("../modulos/pos/Planes"));
const Configuracion = lazy(() => import("../modulos/pos/Configuracion"));

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/marketplace" replace />} />
          <Route path="/marketplace/*" element={<Marketplace />} />

          {/* Todas estas rutas usan el Layout, que ahora gestiona la carga internamente */}
          <Route path="/pos" element={<Layout />}>
            <Route index element={<POS />} />
            <Route path="pos" element={<POS />} />
            <Route path="mesas" element={<Mesas />} />
            <Route path="ordenes" element={<Ordenes />} />
            <Route path="cocina" element={<Cocina />} />
            <Route
              path="productos"
              element={<Productos section="productos" />}
            />
            <Route
              path="categorias"
              element={<Productos section="categorias" />}
            />
            <Route path="inventario" element={<Inventario />} />
            <Route path="caja" element={<Caja />} />
            <Route
              path="caja/CierresEliminados"
              element={<CierresEliminados />}
            />
            <Route path="horarios" element={<Horarios />} />
            <Route path="estadisticas" element={<Estadisticas />} />
            <Route path="utilidades" element={<Utilidades />} />
            <Route path="planes" element={<Planes />} />
            <Route path="configuracion" element={<Configuracion />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
