// ProductoDetalle.jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Minus, Plus } from "lucide-react";
import { useCart } from "./CartContext";

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);

// producto.variantes (opcional): [{ id, nombre, precioExtra }]
const ProductoDetalle = ({ producto, onClose }) => {
  const { agregarConVariante } = useCart();
  const [varianteId, setVarianteId] = useState(
    producto?.variantes?.[0]?.id || null,
  );
  const [notas, setNotas] = useState("");
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    setVarianteId(producto?.variantes?.[0]?.id || null);
    setNotas("");
    setCantidad(1);
  }, [producto]);

  if (!producto) return null;

  const variante = producto.variantes?.find((v) => v.id === varianteId) || null;
  const precioUnitario = producto.precio + (variante?.precioExtra || 0);
  const precioTotal = precioUnitario * cantidad;

  const handleAgregar = () => {
    agregarConVariante({
      productoBase: producto,
      variante,
      notas,
      cantidad,
    });
    onClose();
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a0a0a",
        color: "#fff",
        zIndex: 250,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Imagen / emoji grande */}
      <div
        style={{
          position: "relative",
          height: "42vh",
          minHeight: "240px",
          flexShrink: 0,
          background:
            "radial-gradient(circle at 50% 30%, #1d1d1d 0%, #0a0a0a 70%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(0,0,0,0.45)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 1,
          }}
          aria-label="Cerrar"
        >
          <X size={18} color="#fff" />
        </button>

        {producto.imagen ? (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: "110px", lineHeight: 1 }}>
            {producto.emoji}
          </span>
        )}
      </div>

      {/* Cuerpo scrolleable */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {producto.tag && (
          <span
            style={{
              display: "inline-block",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#a78bfa",
              marginBottom: "6px",
            }}
          >
            {producto.tag}
          </span>
        )}

        <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 6px" }}>
          {producto.nombre}
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.6,
            marginBottom: "20px",
          }}
        >
          {producto.desc}
        </p>

        {/* Variantes (tamaños, presentaciones, etc.) */}
        {producto.variantes && producto.variantes.length > 0 && (
          <div style={{ marginBottom: "22px" }}>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.7)",
                marginBottom: "10px",
              }}
            >
              Elige el tamaño
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${producto.variantes.length}, 1fr)`,
                gap: "10px",
              }}
            >
              {producto.variantes.map((v) => {
                const activo = v.id === varianteId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVarianteId(v.id)}
                    style={{
                      background: activo ? "rgba(124,58,237,0.15)" : "#131313",
                      border: activo
                        ? "1px solid #7c3aed"
                        : "1px solid rgba(255,255,255,0.08)",
                      color: activo ? "#fff" : "rgba(255,255,255,0.7)",
                      borderRadius: "12px",
                      padding: "12px 6px",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: 700 }}>
                      {v.nombre}
                    </div>
                    {v.precioExtra ? (
                      <div
                        style={{
                          fontSize: "11px",
                          color: activo ? "#a78bfa" : "rgba(255,255,255,0.4)",
                          marginTop: "2px",
                        }}
                      >
                        +{fmt(v.precioExtra)}
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.4)",
                          marginTop: "2px",
                        }}
                      >
                        Incluido
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Indicaciones / notas para este producto */}
        <div style={{ marginBottom: "12px" }}>
          <label
            htmlFor="notas-producto"
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.7)",
              marginBottom: "8px",
            }}
          >
            Indicaciones para este producto
          </label>
          <textarea
            id="notas-producto"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Ej: sin cebolla, salsa aparte, bien cocido..."
            rows={3}
            style={{
              width: "100%",
              resize: "vertical",
              background: "#131313",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              padding: "12px 14px",
              color: "#fff",
              fontSize: "13px",
              fontFamily: "inherit",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Footer: cantidad + agregar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 20px",
          paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
          borderTop: "1px solid #1a1a1a",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            background: "#131313",
            borderRadius: "100px",
            padding: "8px 14px",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
            }}
            aria-label="Quitar uno"
          >
            <Minus size={16} />
          </button>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 800,
              minWidth: "16px",
              textAlign: "center",
            }}
          >
            {cantidad}
          </span>
          <button
            type="button"
            onClick={() => setCantidad((c) => c + 1)}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
            }}
            aria-label="Agregar uno"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAgregar}
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "100px",
            background: "#7c3aed",
            color: "#fff",
            fontWeight: 800,
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(124,58,237,0.45)",
          }}
        >
          Agregar · {fmt(precioTotal)}
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default ProductoDetalle;
