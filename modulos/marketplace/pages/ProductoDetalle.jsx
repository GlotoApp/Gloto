// ProductoDetalle.jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Minus, Plus } from "lucide-react";
import { supabase } from "../../../src/lib/supabaseClient";
import { useCart } from "./CartContext";

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);

const normalizeOptionItem = (item) => ({
  id: item.id,
  nombre:
    item.nombre ||
    item.name ||
    item.title ||
    item.label ||
    item.option_name ||
    item.option ||
    item.text ||
    item.value ||
    `Opción ${item.id}`,
  precioExtra:
    Number(item.precio_extra ?? item.price ?? item.price_extra ?? item.extra_price ?? item.monto ?? 0) ||
    0,
  obligatorio:
    item.es_opcion_obligatoria ??
    item.mandatory ??
    item.is_mandatory ??
    item.required ??
    item.is_required ??
    false,
  tags: item.tags ?? item.tag ?? item.categories ?? null,
});

const ProductoDetalle = ({ producto, onClose }) => {
  const { agregarConVariante, obtenerItemId, carrito } = useCart();
  const [opciones, setOpciones] = useState(
    (producto.variantes || producto.products_items || producto.options || []).map(
      normalizeOptionItem,
    ),
  );
  const [varianteId, setVarianteId] = useState(
    opciones?.[0]?.id || null,
  );
  const [notas, setNotas] = useState("");
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    const initialOptions =
      (producto.variantes || producto.products_items || producto.options || []).map(
        normalizeOptionItem,
      );
    setOpciones(initialOptions);
    setNotas("");
    setCantidad(1);
  }, [producto]);

  useEffect(() => {
    if (opciones.length > 0) {
      setVarianteId(opciones[0].id);
    } else {
      setVarianteId(null);
    }
  }, [opciones]);

  useEffect(() => {
    const cargarOpciones = async () => {
      if ((producto.variantes || producto.products_items || producto.options || []).length > 0) {
        return;
      }

      const { data, error } = await supabase
        .from("products_items")
        .select("*")
        .eq("product_id", producto.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error cargando opciones de producto:", error);
      }

      if (!error && Array.isArray(data) && data.length > 0) {
        setOpciones(data.map(normalizeOptionItem));
      }
    };

    if (producto?.id) {
      cargarOpciones();
    }
  }, [producto]);

  if (!producto) return null;

  const variante = opciones.find((v) => v.id === varianteId) || null;
  const precioUnitario = producto.precio + (variante?.precioExtra || 0);
  const precioTotal = precioUnitario * cantidad;
  const stockDisponible =
    typeof producto.stock === "number" ? producto.stock : Infinity;

  // Clave exacta que ocupará esta combinación de variante + notas en el
  // carrito. Es la MISMA función que usa CartContext al agregar, así que
  // esta pantalla siempre lee el número real que ya hay en esa línea del
  // carrito — sin importar si se agregó desde aquí o desde el botón "+"
  // de la lista de la tienda.
  const itemId = obtenerItemId(producto.id, variante, notas);
  const yaEnCarrito = carrito[itemId] || 0;

  const agotado = stockDisponible <= 0;
  const limiteAlcanzado = !agotado && yaEnCarrito >= stockDisponible;
  const restanteParaAgregar = Math.max(0, stockDisponible - yaEnCarrito);
  const alcanzoStock = cantidad >= restanteParaAgregar;
  const noSePuedeAgregar = agotado || limiteAlcanzado;

  const handleAgregar = () => {
    if (noSePuedeAgregar) return;
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

        {producto.image ? (
          <img
            src={producto.image}
            alt={producto.nombre}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/default.png";
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: "64px", fontWeight: 700, color: "#fff" }}>
            {producto.nombre?.charAt(0).toUpperCase() || "?"}
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
            marginBottom: agotado || stockDisponible <= 5 ? "8px" : "20px",
          }}
        >
          {producto.desc}
        </p>

        {agotado ? (
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#e53e3e",
              marginBottom: "20px",
            }}
          >
            Producto agotado
          </p>
        ) : (
          stockDisponible <= 5 && (
            <p
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#f6e05e",
                marginBottom: "20px",
              }}
            >
              ¡Solo quedan {stockDisponible} unidades!
            </p>
          )
        )}

        {!agotado && yaEnCarrito > 0 && (
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#a78bfa",
              marginBottom: "20px",
            }}
          >
            Ya tienes {yaEnCarrito} en tu carrito
            {limiteAlcanzado ? " (máximo disponible)" : ""}
          </p>
        )}

        {/* Variantes (tamaños, presentaciones, etc.) */}
        {opciones && opciones.length > 0 && (
          <div style={{ marginBottom: "22px" }}>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.7)",
                marginBottom: "10px",
              }}
            >
              Elige una opción
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${opciones.length}, 1fr)`,
                gap: "10px",
              }}
            >
              {opciones.map((v) => {
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
            onClick={() =>
              setCantidad((c) => (c < restanteParaAgregar ? c + 1 : c))
            }
            disabled={alcanzoStock}
            style={{
              background: "none",
              border: "none",
              color: alcanzoStock ? "rgba(255,255,255,0.3)" : "#fff",
              cursor: alcanzoStock ? "not-allowed" : "pointer",
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
          disabled={noSePuedeAgregar}
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "100px",
            background: noSePuedeAgregar ? "rgba(124,58,237,0.25)" : "#7c3aed",
            color: noSePuedeAgregar ? "rgba(255,255,255,0.5)" : "#fff",
            fontWeight: 800,
            fontSize: "14px",
            border: "none",
            cursor: noSePuedeAgregar ? "not-allowed" : "pointer",
            boxShadow: noSePuedeAgregar
              ? "none"
              : "0 8px 32px rgba(124,58,237,0.45)",
          }}
        >
          {agotado
            ? "Agotado"
            : limiteAlcanzado
              ? "Máximo alcanzado"
              : `Agregar · ${fmt(precioTotal)}`}
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default ProductoDetalle;
