// CartContext.jsx
import React, { createContext, useContext, useState, useMemo } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  // carrito: { [productoId]: cantidad }
  const [carrito, setCarrito] = useState({});
  // Catálogo de productos actualmente "activo" (de la tienda que se está viendo).
  // Carrito.jsx lo necesita para mostrar nombre, precio, emoji, etc.
  const [productos, setProductos] = useState([]);
  const [nombreTienda, setNombreTienda] = useState("");
  const [logoTienda, setLogoTienda] = useState("");
  const [tiendaSlug, setTiendaSlug] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [metodoPago, setMetodoPago] = useState([]);
  const [metodoEntrega, setMetodoEntrega] = useState(null); // 'recoger', 'mesa', 'domicilio', 'punto'
  const [datosCliente, setDatosCliente] = useState({
    nombre: "",
    telefono: "",
    mesa: "",
    direccion: "",
    puntoRetiro: "",
  });
  // Pedido ya confirmado, pendiente de seguimiento (cocina → camino → entregado)
  const [pedidoActivo, setPedidoActivo] = useState(null);
  // 'recibido' | 'preparando' | 'camino' | 'entregado'
  const [estadoPedido, setEstadoPedido] = useState("recibido");

  const agregar = (id) =>
    setCarrito((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  const quitar = (id) =>
    setCarrito((prev) => {
      const next = { ...prev };
      if (!next[id]) return prev;
      if (next[id] > 1) next[id]--;
      else delete next[id];
      return next;
    });

  const eliminar = (id) =>
    setCarrito((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  const vaciar = () => setCarrito({});

  const vaciarTodo = () => {
    setCarrito({});
    setObservaciones("");
    setMetodoPago([]); // <--- CORRECCIÓN AQUÍ
  };

  const abrirCarrito = () => setCartOpen(true);
  const cerrarCarrito = () => setCartOpen(false);

  const totalItems = useMemo(
    () => Object.values(carrito).reduce((a, b) => a + b, 0),
    [carrito],
  );

  const totalPrecio = useMemo(
    () =>
      productos.reduce((sum, p) => sum + (carrito[p.id] || 0) * p.precio, 0),
    [productos, carrito],
  );

  const totalPagado = metodoPago.reduce(
    (sum, item) => sum + (Number(item.monto) || 0),
    0,
  );
  const puedeHacerPedido =
    totalItems > 0 && metodoPago.length > 0 && totalPagado === totalPrecio;

  const agregarDivision = () => {
    setMetodoPago((prev) => {
      // Si el array está vacío o solo tiene 1 elemento (pago único),
      // forzamos la creación del par inicial con método vacío.
      if (prev.length <= 1) {
        return [
          { id: Date.now(), metodo: "", monto: "" }, // Metodo vacío
          { id: Date.now() + 1, metodo: "", monto: "" }, // Metodo vacío
        ];
      }
      // Si ya estábamos en modo dividir, solo añadimos una fila vacía extra
      return [...prev, { id: Date.now(), metodo: "", monto: "" }];
    });
  };

  const eliminarDivision = (id) => {
    setMetodoPago((prev) => prev.filter((item) => item.id !== id));
  };

  const actualizarDivision = (id, campo, valor) => {
    setMetodoPago((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [campo]: valor } : item)),
    );
  };

  // Hash corto y estable para distinguir notas distintas del mismo producto/variante
  const hashCorto = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h).toString(36);
  };

  // Resuelve la clave (id) que identifica una línea del carrito para un
  // producto dado, según su variante y notas.
  //
  // CLAVE: si no hay variante ni notas, la clave es simplemente el id del
  // producto base — la MISMA clave que usa el botón "+" directo en Shop.jsx
  // (agregar(producto.id)). Esto es lo que mantiene sincronizados el
  // contador de la lista de productos y el contador del detalle: agregar
  // "liso" desde cualquiera de los dos lugares suma sobre la misma línea.
  // Solo cuando el usuario elige una variante o escribe una nota se crea
  // una línea distinta (porque de verdad es un pedido distinto).
  const obtenerItemId = (productoId, variante, notas = "") => {
    const notasLimpias = (notas || "").trim();
    if (!variante && !notasLimpias) return productoId;
    const varianteKey = variante ? variante.id : "base";
    const notasKey = notasLimpias ? hashCorto(notasLimpias.toLowerCase()) : "0";
    return `${productoId}__${varianteKey}__${notasKey}`;
  };

  // Agrega un producto al carrito respetando variante (ej. tamaño) y notas/indicaciones.
  // Crea (o reutiliza) un "producto virtual" en `productos` para no romper la lógica
  // existente de Carrito.jsx, que indexa todo por producto.id.
  const agregarConVariante = ({
    productoBase,
    variante,
    notas = "",
    cantidad = 1,
  }) => {
    const itemId = obtenerItemId(productoBase.id, variante, notas);

    setProductos((prev) => {
      if (prev.some((p) => p.id === itemId)) return prev;
      const nuevo = {
        ...productoBase,
        id: itemId,
        productoBaseId: productoBase.id,
        nombre: variante
          ? `${productoBase.nombre} · ${variante.nombre}`
          : productoBase.nombre,
        precio: productoBase.precio + (variante?.precioExtra || 0),
        varianteNombre: variante?.nombre || null,
        notas: notas.trim(),
      };
      return [...prev, nuevo];
    });

    setCarrito((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + cantidad,
    }));
  };

  // Crea un pedido a partir del carrito actual (snapshot) y lo deja
  // listo para el seguimiento en pantalla.
  const crearPedido = () => {
    const items = productos
      .filter((p) => carrito[p.id] > 0)
      .map((p) => ({
        id: p.id,
        nombre: p.nombre,
        cantidad: carrito[p.id],
        precio: p.precio,
        notas: p.notas || "",
      }));

    const pedido = {
      numero: `#${Math.floor(1000 + Math.random() * 9000)}`,
      fecha: new Date(),
      items,
      total: totalPrecio,
      metodoEntrega,
      datosCliente: { ...datosCliente },
      observaciones,
      nombreTienda,
    };

    setPedidoActivo(pedido);
    setEstadoPedido("recibido");
    vaciarTodo();
    setMetodoEntrega(null);

    return pedido;
  };

  // Etapas disponibles por método de entrega. El pedido nunca pasa por "camino"
  // si es recoger/mesa, ni se queda en "listo" si es domicilio.
  const ETAPAS_POR_ENTREGA = {
    recoger: ["recibido", "preparando", "listo_recoger"],
    mesa: ["recibido", "preparando", "listo_entregar"],
    domicilio: ["recibido", "preparando", "camino", "entregado"],
    punto: ["recibido", "preparando", "listo_entregar", "entregado"],
  };

  const avanzarEstadoPedido = () => {
    setEstadoPedido((prev) => {
      const orden =
        ETAPAS_POR_ENTREGA[pedidoActivo?.metodoEntrega] ||
        ETAPAS_POR_ENTREGA.domicilio;
      const i = orden.indexOf(prev);
      if (i === -1 || i === orden.length - 1) return prev;
      return orden[i + 1];
    });
  };

  const finalizarPedido = () => {
    setPedidoActivo(null);
    setEstadoPedido("recibido");
  };

  const actualizarDatoCliente = (campo, valor) =>
    setDatosCliente((prev) => ({ ...prev, [campo]: valor }));

  const puedeConfirmarEntrega = (() => {
    if (!metodoEntrega) return false;
    if (!datosCliente.nombre.trim() || !datosCliente.telefono.trim())
      return false;
    if (metodoEntrega === "mesa" && !datosCliente.mesa.trim()) return false;
    if (metodoEntrega === "domicilio" && !datosCliente.direccion.trim())
      return false;
    if (metodoEntrega === "punto" && !datosCliente.puntoRetiro.trim())
      return false;
    return true;
  })();

  const value = {
    carrito,
    productos,
    setProductos,
    nombreTienda,
    setNombreTienda,
    logoTienda,
    setLogoTienda,
    tiendaSlug,
    setTiendaSlug,
    cartOpen,
    abrirCarrito,
    cerrarCarrito,
    agregar,
    quitar,
    eliminar,
    vaciar,
    vaciarTodo,
    observaciones,
    setObservaciones,
    metodoPago,
    agregarDivision,
    eliminarDivision,
    actualizarDivision,
    setMetodoPago,
    puedeHacerPedido,
    totalItems,
    totalPrecio,
    totalPagado,
    metodoEntrega,
    setMetodoEntrega,
    datosCliente,
    setDatosCliente,
    actualizarDatoCliente,
    puedeConfirmarEntrega,
    agregarConVariante,
    obtenerItemId,
    pedidoActivo,
    estadoPedido,
    setEstadoPedido,
    crearPedido,
    avanzarEstadoPedido,
    finalizarPedido,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de un <CartProvider>");
  }
  return ctx;
};
