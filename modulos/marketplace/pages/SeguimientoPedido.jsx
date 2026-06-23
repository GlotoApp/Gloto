// SeguimientoPedido.jsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  Clock,
  Flame,
  Bike,
  PackageCheck,
  Store,
  User,
  Phone,
  MapPin,
  Armchair,
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

// Definición de cada posible etapa (icono + textos)
const DEFINICION_ETAPAS = {
  recibido: {
    label: "Pedido recibido",
    desc: "La tienda confirmó tu pedido.",
    Icon: Clock,
  },
  preparando: {
    label: "Preparando en cocina",
    desc: "Tu pedido se está preparando.",
    Icon: Flame,
  },
  camino: {
    label: "En camino",
    desc: "Tu pedido va en camino.",
    Icon: Bike,
  },
  listo_recoger: {
    label: "Listo para recoger",
    desc: "Ya puedes pasar a recogerlo a la tienda.",
    Icon: Store,
  },
  listo_entregar: {
    label: "Listo para entregar",
    desc: "Tu pedido está listo y será llevado a tu mesa.",
    Icon: PackageCheck,
  },
  entregado: {
    label: "Entregado",
    desc: "¡Disfruta tu pedido!",
    Icon: PackageCheck,
  },
};

// Secuencia de etapas según el método de entrega elegido por el cliente.
const ETAPAS_POR_ENTREGA = {
  recoger: ["recibido", "preparando", "listo_recoger"],
  mesa: ["recibido", "preparando", "listo_entregar"],
  domicilio: ["recibido", "preparando", "camino", "entregado"],
  punto: ["recibido", "preparando", "listo_entregar", "entregado"],
};

const ENTREGA_LABEL = {
  recoger: "Recoger en tienda",
  mesa: "En mesa",
  domicilio: "Domicilio",
  punto: "Punto de encuentro",
};

const SeguimientoPedido = ({ onCerrar }) => {
  const { pedidoActivo, estadoPedido, avanzarEstadoPedido } = useCart();

  // Simulación de avance automático del estado del pedido (demo).
  // En producción, este estado debería actualizarse desde el backend/tienda.
  useEffect(() => {
    if (!pedidoActivo) return;
    const secuencia =
      ETAPAS_POR_ENTREGA[pedidoActivo.metodoEntrega] ||
      ETAPAS_POR_ENTREGA.domicilio;
    if (estadoPedido === secuencia[secuencia.length - 1]) return;
    const t = setTimeout(() => avanzarEstadoPedido(), 9000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoPedido, pedidoActivo]);

  if (!pedidoActivo) return null;

  const secuencia =
    ETAPAS_POR_ENTREGA[pedidoActivo.metodoEntrega] ||
    ETAPAS_POR_ENTREGA.domicilio;
  const ETAPAS = secuencia.map((id) => ({ id, ...DEFINICION_ETAPAS[id] }));
  const indiceActual = ETAPAS.findIndex((e) => e.id === estadoPedido);
  const esEtapaFinal = indiceActual === ETAPAS.length - 1;
  const { datosCliente, metodoEntrega } = pedidoActivo;

  const obtenerPasos = (metodo) => {
    const base = ["Pedido recibido", "Preparando en cocina"];

    switch (metodo) {
      case "recoger":
        return [...base, "Listo para recoger"];
      case "mesa":
        return [...base, "Listo para entregar", "Entregado"];
      case "domicilio":
        return [...base, "En camino", "Entregado"];
      case "punto":
        return [...base, "Listo para entregar", "Entregado"];
      default:
        return base;
    }
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
          justifyContent: "space-between",
          gap: "12px",
          padding: "16px 20px",
          borderBottom: "1px solid #1a1a1a",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onCerrar}
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
          aria-label="Cerrar seguimiento"
        >
          <Store size={18} color="#fff" />
        </button>

        <div style={{ minWidth: 0, textAlign: "right" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>
            Pedido {pedidoActivo.numero}
          </h2>
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.45)",
              margin: 0,
            }}
          >
            {pedidoActivo.nombreTienda}
          </p>
        </div>
      </div>

      {/* Cuerpo */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
        {/* Línea de tiempo */}
        <div style={{ marginBottom: "28px" }}>
          {ETAPAS.map((etapa, i) => {
            const completada = i < indiceActual;
            const activa = i === indiceActual;
            const pendiente = i > indiceActual;
            const Icon = etapa.Icon;

            return (
              <div
                key={etapa.id}
                style={{ display: "flex", gap: "14px", position: "relative" }}
              >
                {/* Columna icono + línea */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: completada
                        ? "rgba(124,58,237,0.18)"
                        : activa
                          ? "#7c3aed"
                          : "#131313",
                      border: pendiente
                        ? "1px solid rgba(255,255,255,0.08)"
                        : "none",
                      boxShadow: activa
                        ? "0 0 0 4px rgba(124,58,237,0.18)"
                        : "none",
                      transition: "all 0.3s",
                    }}
                  >
                    {completada ? (
                      <CheckCircle2 size={18} color="#a78bfa" />
                    ) : (
                      <Icon
                        size={18}
                        color={activa ? "#fff" : "rgba(255,255,255,0.3)"}
                      />
                    )}
                  </div>
                  {i < ETAPAS.length - 1 && (
                    <div
                      style={{
                        width: "2px",
                        flex: 1,
                        minHeight: "32px",
                        background:
                          i < indiceActual
                            ? "#7c3aed"
                            : "rgba(255,255,255,0.08)",
                        margin: "2px 0",
                      }}
                    />
                  )}
                </div>

                {/* Texto */}
                <div style={{ paddingBottom: "28px" }}>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 800,
                      margin: 0,
                      marginBottom: "2px",
                      color: pendiente ? "rgba(255,255,255,0.35)" : "#fff",
                    }}
                  >
                    {etapa.label}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      margin: 0,
                      color: pendiente
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(255,255,255,0.45)",
                    }}
                  >
                    {activa ? etapa.desc : pendiente ? "Pendiente" : etapa.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Datos de entrega */}
        <div
          style={{
            background: "#131313",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "16px",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.7)",
              marginBottom: "12px",
            }}
          >
            {ENTREGA_LABEL[metodoEntrega] || "Entrega"}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <User size={14} color="rgba(255,255,255,0.4)" />
              <span style={{ fontSize: "13px" }}>{datosCliente?.nombre}</span>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Phone size={14} color="rgba(255,255,255,0.4)" />
              <span style={{ fontSize: "13px" }}>{datosCliente?.telefono}</span>
            </div>
            {metodoEntrega === "mesa" && datosCliente?.mesa && (
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <Armchair size={14} color="rgba(255,255,255,0.4)" />
                <span style={{ fontSize: "13px" }}>
                  Mesa {datosCliente.mesa}
                </span>
              </div>
            )}
            {metodoEntrega === "domicilio" && datosCliente?.direccion && (
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <MapPin size={14} color="rgba(255,255,255,0.4)" />
                <span style={{ fontSize: "13px" }}>
                  {datosCliente.direccion}
                </span>
              </div>
            )}
            {metodoEntrega === "punto" && datosCliente?.puntoRetiro && (
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <Navigation size={14} color="rgba(255,255,255,0.4)" />
                <span style={{ fontSize: "13px" }}>
                  {datosCliente.puntoRetiro}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Resumen del pedido */}
        <div
          style={{
            background: "#131313",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "16px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.7)",
              marginBottom: "12px",
            }}
          >
            Tu pedido
          </p>

          {pedidoActivo.items.map((it) => (
            <div
              key={it.id}
              style={{
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                  {it.cantidad}× {it.nombre}
                </span>
                <span style={{ fontWeight: 700, flexShrink: 0 }}>
                  {fmt(it.precio * it.cantidad)}
                </span>
              </div>
              {it.notas && (
                <p
                  style={{
                    fontSize: "11.5px",
                    color: "rgba(255,255,255,0.4)",
                    fontStyle: "italic",
                    margin: "3px 0 0",
                    lineHeight: 1.4,
                  }}
                >
                  "{it.notas}"
                </p>
              )}
            </div>
          ))}

          {pedidoActivo.observaciones && (
            <div
              style={{
                marginTop: "12px",
                paddingTop: "12px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "4px",
                }}
              >
                Observación general
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.45)",
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                "{pedidoActivo.observaciones}"
              </p>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "14px",
              paddingTop: "14px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              fontSize: "14px",
              fontWeight: 800,
            }}
          >
            <span>Total</span>
            <span>{fmt(pedidoActivo.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer: siempre visible, sin importar en qué paso esté la línea de tiempo */}
      <div
        style={{
          padding: "16px 20px",
          paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
          borderTop: "1px solid #1a1a1a",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onCerrar}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "100px",
            background: "#7c3aed",
            color: "#fff",
            fontWeight: 800,
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 8px 32px rgba(124,58,237,0.45)",
          }}
        >
          <Store size={18} />
          Volver a la tienda
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default SeguimientoPedido;
