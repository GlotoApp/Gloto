import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "../modulos/pos/Layout";
import POS from "../modulos/pos/POS";
import Mesas from "../modulos/pos/Mesas";
import Ordenes from "../modulos/pos/Ordenes";
import Cocina from "../modulos/pos/Cocina";
import Caja from "../modulos/pos/Caja";
import Nomina from "../modulos/pos/Nomina";
import Horarios from "../modulos/pos/Horarios";
import Catalogo from "../modulos/pos/Catalogo";
import Inventario from "../modulos/pos/inventario"; // He puesto la i minúscula según tu última lista
import Estadisticas from "../modulos/pos/Estadisticas";
import Utilidades from "../modulos/pos/Utilidades"; // Corregida a U mayúscula
import Planes from "../modulos/pos/Planes";
import Configuracion from "../modulos/pos/Configuracion";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<POS />} />
          <Route path="pos" element={<POS />} />
          <Route path="mesas" element={<Mesas />} />
          <Route path="ordenes" element={<Ordenes />} />
          <Route path="cocina" element={<Cocina />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="caja" element={<Caja />} />
          <Route path="horarios" element={<Horarios />} />
          <Route path="estadisticas" element={<Estadisticas />} />
          <Route path="utilidades" element={<Utilidades />} />
          <Route path="planes" element={<Planes />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="nomina" element={<Nomina />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
