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
} from "lucide-react";
import { useCart } from "./CartContext";

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);

const METODOS_ENTREGA = [
  { id: "recoger", label: "Recoger", Icon: Store },
  { id: "mesa", label: "En mesa", Icon: Armchair },
  { id: "domicilio", label: "Domicilio", Icon: Truck },
  { id: "punto", label: "Punto de encuentro", Icon: Navigation },
];

const inputStyle = {
  width: "100%",
  background: "#131313",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  padding: "12px 14px 12px 42px",
  color: "#fff",
  fontSize: "13px",
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
          padding: "16px 20px",
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
            background: "rgba(255,255,255,0.06)",
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
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "24px",
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
                  border: activo
                    ? "1px solid #7c3aed"
                    : "1px solid rgba(255,255,255,0.08)",
                  color: activo ? "#fff" : "rgba(255,255,255,0.7)",
                  padding: "14px 10px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
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
                  actualizarDatoCliente("nombre", e.target.value)
                }
              />
            </div>

            <div style={iconWrapStyle}>
              <Phone size={16} style={iconInsideStyle} />
              <input
                style={inputStyle}
                placeholder="Teléfono de contacto"
                inputMode="tel"
                value={datosCliente.telefono}
                onChange={(e) =>
                  actualizarDatoCliente("telefono", e.target.value)
                }
              />
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
                  onChange={(e) =>
                    actualizarDatoCliente("mesa", e.target.value)
                  }
                />
              </div>
            )}

            {/* Domicilio */}
            {metodoEntrega === "domicilio" && (
              <>
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
                </div>
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
                  }}
                >
                  <MapPin size={28} />
                  <span style={{ fontSize: "12px" }}>
                    Mapa ilustrativo de entrega
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
