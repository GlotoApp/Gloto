// Checkout.jsx
import React from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  User,
  Phone,
  Armchair,
  MapPin,
  Store,
  Truck,
  Navigation,
  X,
} from "lucide-react";
import { useCart } from "./CartContext";

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);

// Capitaliza cada palabra: primera letra mayúscula, el resto en minúscula.
// Ej: "jorge puerta" -> "Jorge Puerta"
const capitalizarNombre = (texto) =>
  texto
    .toLowerCase()
    .split(" ")
    .map((palabra) =>
      palabra ? palabra.charAt(0).toUpperCase() + palabra.slice(1) : palabra,
    )
    .join(" ");

const METODOS_ENTREGA = [
  { id: "recoger", label: "Recoger", Icon: Store },
  { id: "mesa", label: "En mesa", Icon: Armchair },
  { id: "punto", label: "En punto", Icon: Navigation },
  { id: "domicilio", label: "Domicilio", Icon: Truck },
];

const clearButtonStyle = {
  position: "absolute",
  right: "14px",
  background: "none",
  border: "none",
  color: "rgba(255,255,255,0.3)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: 0,
};

const inputStyle = {
  width: "100%",
  background: "#131313",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  padding: "12px 14px 12px 42px",
  color: "#fff",
  fontSize: "16px",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const iconWrapStyle = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  marginBottom: "12px",
};

const iconInsideStyle = {
  position: "absolute",
  left: "14px",
  color: "rgba(255,255,255,0.35)",
  pointerEvents: "none",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 700,
  color: "rgba(255,255,255,0.7)",
  marginBottom: "10px",
};

const Checkout = ({ onVolver, onConfirmar }) => {
  const {
    nombreTienda,
    logoTienda,
    totalPrecio,
    metodoEntrega,
    setMetodoEntrega,
    datosCliente,
    actualizarDatoCliente,
    puedeConfirmarEntrega,
  } = useCart();

  const handleConfirmar = () => {
    if (!puedeConfirmarEntrega) return;
    if (onConfirmar) onConfirmar();
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a0a0a",
        color: "#fff",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "11px 4px",
          borderBottom: "1px solid #1a1a1a",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onVolver}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-label="Volver al carrito"
        >
          <ChevronLeft size={20} color="#fff" />
        </button>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "#131313",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {logoTienda ? (
            <img
              src={logoTienda}
              alt={`Logo de ${nombreTienda}`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/default.png";
              }}
            />
          ) : (
            <Store size={24} style={{ color: "rgba(255,255,255,0.3)" }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>
            Entrega
          </h2>
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.45)",
              margin: 0,
            }}
          >
            {nombreTienda}
          </p>
        </div>
      </div>

      {/* Cuerpo scrolleable */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        <p style={labelStyle}>¿Cómo deseas recibir tu pedido?</p>

        <div
          style={{
            display: "grid",
            // Definimos las 4 columnas
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
            marginBottom: "24px",
            // Esto asegura que si los botones son más pequeños que su celda, se centren
            justifyItems: "center",
          }}
        >
          {METODOS_ENTREGA.map(({ id, label, Icon }) => {
            const activo = metodoEntrega === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setMetodoEntrega(id)}
                style={{
                  background: activo ? "rgba(124,58,237,0.15)" : "#131313",
                  color: activo ? "#fff" : "rgba(255,255,255,0.7)",
                  // Ajusté el padding horizontal un poco para que quepan mejor 4 en fila
                  padding: "12px 4px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center", // Centrado vertical del contenido del botón
                  gap: "6px",
                  fontSize: "11px", // Reducí un poco la fuente para que no se corte
                  fontWeight: 700,
                  width: "100%", // Asegura que ocupen el espacio de la columna
                }}
              >
                <Icon
                  size={20}
                  style={{ color: activo ? "#a78bfa" : "inherit" }}
                />
                {label}
              </button>
            );
          })}
        </div>

        {/* Datos comunes: solo se muestran tras elegir un método */}
        {metodoEntrega && (
          <>
            <p style={labelStyle}>Tus datos</p>

            <div style={iconWrapStyle}>
              <User size={16} style={iconInsideStyle} />
              <input
                style={inputStyle}
                placeholder="Nombre completo"
                value={datosCliente.nombre}
                onChange={(e) =>
                  actualizarDatoCliente(
                    "nombre",
                    capitalizarNombre(e.target.value),
                  )
                }
              />
              {/* Botón de borrado rápido */}
              {datosCliente.nombre && (
                <button
                  type="button"
                  style={clearButtonStyle}
                  onClick={() => actualizarDatoCliente("nombre", "")}
                  aria-label="Borrar nombre"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div style={iconWrapStyle}>
              <Phone size={16} style={iconInsideStyle} />
              <input
                style={inputStyle}
                placeholder="Teléfono de contacto"
                inputMode="tel"
                value={datosCliente.telefono}
                onChange={(e) => {
                  // Expresión regular: permite solo números y el signo +
                  const value = e.target.value.replace(/[^0-9+]/g, "");
                  actualizarDatoCliente("telefono", value);
                }}
              />
              {/* Botón de borrado rápido */}
              {datosCliente.telefono && (
                <button
                  type="button"
                  style={clearButtonStyle}
                  onClick={() => actualizarDatoCliente("telefono", "")}
                  aria-label="Borrar teléfono"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Mesa */}
            {metodoEntrega === "mesa" && (
              <div style={iconWrapStyle}>
                <Armchair size={16} style={iconInsideStyle} />
                <input
                  style={inputStyle}
                  placeholder="Número de mesa"
                  inputMode="numeric"
                  value={datosCliente.mesa}
                  onChange={(e) => {
                    // Expresión regular: permite solo números
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    actualizarDatoCliente("mesa", value);
                  }}
                />
                {datosCliente.mesa && (
                  <button
                    type="button"
                    style={clearButtonStyle}
                    onClick={() => actualizarDatoCliente("mesa", "")}
                    aria-label="Borrar número de mesa"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Domicilio */}
            {metodoEntrega === "domicilio" && (
              <>
                {/* Campo Dirección (Inteligente) */}
                <div style={iconWrapStyle}>
                  <MapPin size={16} style={iconInsideStyle} />
                  <input
                    style={inputStyle}
                    placeholder="Dirección de entrega"
                    value={datosCliente.direccion}
                    onChange={(e) =>
                      actualizarDatoCliente("direccion", e.target.value)
                    }
                  />
                  {datosCliente.direccion && (
                    <button
                      type="button"
                      style={clearButtonStyle}
                      onClick={() => actualizarDatoCliente("direccion", "")}
                      aria-label="Borrar dirección"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Campo Punto de Referencia */}
                <div style={iconWrapStyle}>
                  <Store size={16} style={iconInsideStyle} />
                  <input
                    style={inputStyle}
                    placeholder="Punto de referencia (ej. Casa color azul)"
                    value={datosCliente.referencia || ""}
                    onChange={(e) =>
                      actualizarDatoCliente("referencia", e.target.value)
                    }
                  />
                  {datosCliente.referencia && (
                    <button
                      type="button"
                      style={clearButtonStyle}
                      onClick={() => actualizarDatoCliente("referencia", "")}
                      aria-label="Borrar punto de referencia"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Mapa ilustrativo */}
                <div
                  style={{
                    height: "180px",
                    background: "#131313",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    marginTop: "4px",
                    marginBottom: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    color: "rgba(255,255,255,0.35)",
                    cursor: "pointer", // Indicamos que es interactivo
                  }}
                >
                  <MapPin size={28} />
                  <span style={{ fontSize: "12px" }}>
                    {datosCliente.direccion
                      ? "Ubicación seleccionada"
                      : "Seleccionar en el mapa"}
                  </span>
                </div>
              </>
            )}

            {/* Punto de encuentro */}
            {metodoEntrega === "punto" && (
              <div style={iconWrapStyle}>
                <Navigation size={16} style={iconInsideStyle} />
                <input
                  style={inputStyle}
                  placeholder="¿En qué punto te encuentras?"
                  value={datosCliente.puntoRetiro}
                  onChange={(e) =>
                    actualizarDatoCliente("puntoRetiro", e.target.value)
                  }
                />
                {datosCliente.puntoRetiro && (
                  <button
                    type="button"
                    style={clearButtonStyle}
                    onClick={() => actualizarDatoCliente("puntoRetiro", "")}
                    aria-label="Borrar punto de encuentro"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "16px 20px",
          paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
          borderTop: "1px solid #1a1a1a",
          flexShrink: 0,
        }}
      >
        {!puedeConfirmarEntrega && (
          <p
            style={{
              fontSize: "11.5px",
              color: "rgba(255,209,102,0.85)",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            {metodoEntrega
              ? "Completa tus datos para continuar"
              : "Selecciona un método de entrega"}
          </p>
        )}

        <button
          type="button"
          onClick={handleConfirmar}
          disabled={!puedeConfirmarEntrega}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "100px",
            background: puedeConfirmarEntrega
              ? "#7c3aed"
              : "rgba(124,58,237,0.25)",
            color: puedeConfirmarEntrega ? "#fff" : "rgba(255,255,255,0.5)",
            fontWeight: 800,
            fontSize: "14px",
            border: "none",
            cursor: puedeConfirmarEntrega ? "pointer" : "not-allowed",
            boxShadow: puedeConfirmarEntrega
              ? "0 8px 32px rgba(124,58,237,0.45)"
              : "none",
            transition: "all 0.15s",
          }}
        >
          Confirmar pedido · {fmt(totalPrecio)}
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default Checkout;
