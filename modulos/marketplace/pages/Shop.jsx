// Shop.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search,
  Share2,
  Star,
  Clock3,
  Bike,
  X,
  MapPin,
  Home,
  ShoppingBag,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useCart } from "./CartContext";
import Carrito from "./Carrito";
import Checkout from "./Checkout";
import ProductoDetalle from "./ProductoDetalle";
import SeguimientoPedido from "./SeguimientoPedido";

const TIENDA_INFO = {
  nombre: "Burger House",
  tipo: "Americana · Comida rápida",
  horario: "Abierto · Cierra 11:00 PM",
  rating: 4.8,
  reviews: 540,
  tiempo: "25–35 min",
  domicilio: "$3.000",
  direccion: "Cra. 5 #34-21, El Centro",
  descripcion:
    "Las mejores burgers artesanales de la ciudad, preparadas al momento con ingredientes frescos.",
};

const CATEGORIAS_BASE = [
  "Populares",
  "Combos",
  "Burgers",
  "Bebidas",
  "Postres",
];
const CATEGORIAS_MENU = ["Todos", ...CATEGORIAS_BASE];

const PRODUCTOS = [
  {
    id: 1,
    cat: "Populares",
    nombre: "Burger Pro",
    desc: "Doble carne angus, tocino ahumado, queso cheddar, salsa especial de la casa.",
    precio: 28000,
    tag: "Más vendido",
    emoji: "🍔",
    rating: 4.9,
    variantes: [
      { id: "sencilla", nombre: "Sencilla", precioExtra: 0 },
      { id: "doble", nombre: "Doble carne", precioExtra: 8000 },
      { id: "triple", nombre: "Triple carne", precioExtra: 15000 },
    ],
  },
  {
    id: 2,
    cat: "Populares",
    nombre: "Crispy Deluxe",
    desc: "Pollo crocante, lechuga romana, pepinillos, mayo chipotle.",
    precio: 24000,
    tag: "Favorito",
    emoji: "🍗",
    rating: 4.7,
  },
  {
    id: 3,
    cat: "Combos",
    nombre: "Combo Destructor",
    desc: "Burger Pro + papas grandes + bebida 400ml.",
    precio: 38000,
    tag: "Ahorra $6k",
    emoji: "🔥",
    rating: 4.8,
  },
  {
    id: 4,
    cat: "Bebidas",
    nombre: "Limonada de coco",
    desc: "Hecha al momento, endulzada con panela.",
    precio: 9000,
    tag: null,
    emoji: "🥥",
    rating: 4.6,
    variantes: [
      { id: "personal", nombre: "Personal", precioExtra: 0 },
      { id: "grande", nombre: "Grande 1L", precioExtra: 6000 },
    ],
  },
  {
    id: 5,
    cat: "Postres",
    nombre: "Milkshake Oreo",
    desc: "Helado premium, galletas Oreo, crema chantilly.",
    precio: 14000,
    tag: "Nuevo",
    emoji: "🥤",
    rating: 4.9,
  },
];

const fmt = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);

/* ── Cart Portal ── */
const CartPortal = ({ totalItems, totalPrecio, fmt, onOpen }) =>
  createPortal(
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "12px 16px",
        paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
        zIndex: 50,
      }}
    >
      <button
        type="button"
        onClick={onOpen}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#7c3aed",
          borderRadius: "25px",
          padding: "14px 20px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 8px 32px rgba(124,58,237,0.45)",
        }}
        aria-label="Abrir carrito"
      >
        <span
          style={{
            background: "rgba(0,0,0,0.2)",
            borderRadius: "25px",
            padding: "4px 10px",
            fontSize: "13px",
            fontWeight: 800,
            color: "#fff",
          }}
        >
          {totalItems}
        </span>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: "15px" }}>
          Ver carrito
        </span>
        <span style={{ color: "#fff", fontWeight: 900, fontSize: "15px" }}>
          {fmt(totalPrecio)}
        </span>
      </button>
    </div>,
    document.body,
  );

/* ── Main ── */
const Shop = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [catActiva, setCatActiva] = useState("Todos");
  const {
    carrito,
    cartOpen,
    abrirCarrito,
    cerrarCarrito,
    agregar,
    quitar,
    totalItems,
    totalPrecio,
    setProductos,
    nombreTienda: nombreTiendaEnCarrito,
    setNombreTienda,
    setLogoTienda,
    tiendaSlug,
    setTiendaSlug,
    vaciar,
    crearPedido,
    finalizarPedido,
  } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [confirmCambioOpen, setConfirmCambioOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [seguimientoOpen, setSeguimientoOpen] = useState(false);
  const searchInputRef = useRef(null);

  const nombreTienda =
    slug
      ?.split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || TIENDA_INFO.nombre;

  // Sincroniza con el contexto del carrito para que Carrito.jsx
  // pueda mostrar nombre/precio/emoji de cada producto agregado.
  // Si el carrito ya tenía productos de OTRA tienda, primero se pide
  // confirmación antes de vaciarlo.
  useEffect(() => {
    if (tiendaSlug && tiendaSlug !== slug && totalItems > 0) {
      setConfirmCambioOpen(true);
      return;
    }

    // Aquí inicializas los datos de la tienda
    setProductos(PRODUCTOS);
    setNombreTienda(TIENDA_INFO.nombre); // Asegúrate de usar la propiedad correcta
    setLogoTienda("🍔"); // <--- ¡Faltaba esto!
    setTiendaSlug(slug);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const confirmarCambioTienda = () => {
    vaciar();
    setProductos(PRODUCTOS);
    setNombreTienda(nombreTienda);
    setTiendaSlug(slug);
    setConfirmCambioOpen(false);
  };

  const cancelarCambioTienda = () => {
    setConfirmCambioOpen(false);
    navigate(-1);
  };

  const productosPorCategoria =
    catActiva === "Todos"
      ? PRODUCTOS
      : PRODUCTOS.filter((p) => p.cat === catActiva);
  const displayedProducts =
    searchQuery.trim() === ""
      ? productosPorCategoria
      : productosPorCategoria.filter((p) => {
          const q = searchQuery.trim().toLowerCase();
          return (
            p.nombre.toLowerCase().includes(q) ||
            (p.desc && p.desc.toLowerCase().includes(q))
          );
        });

  // abrirCarrito ahora viene del CartContext (abre <Carrito /> de pantalla completa)

  const shareUrl = window.location.href;

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: nombreTienda,
      text: `Mira este local: ${nombreTienda}`,
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage("Compartido");
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setShareMessage("Enlace copiado");
      }
    } catch {
      setShareMessage("No se pudo compartir");
    }
    setTimeout(() => setShareMessage(""), 2500);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage("Enlace copiado");
    } catch {
      setShareMessage("No se pudo copiar");
    }
    setTimeout(() => setShareMessage(""), 2500);
  };

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  const TAG_MAP = {
    "Más vendido": "#7c3aed",
    Favorito: "#7c3aed",
    "Ahorra $6k": "#00c448",
    Nuevo: "#38bdf8",
  };

  return (
    <>
      <div
        style={{
          background: "#0a0a0a",
          minHeight: "100vh",
          color: "#fff",
          paddingBottom: "calc(88px + env(safe-area-inset-bottom))",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* ── HERO ── */}
        {/* Wrapper sin overflow:hidden para que el logo sobresalga */}
        <div style={{ position: "relative", height: "250px" }}>
          {/* Imagen recortada dentro de su propio div */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            <img
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800"
              alt={nombreTienda}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            {/* Gradiente oscuro */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(10,10,10,0.85) 85%, #0a0a0a 100%)",
              }}
            />
          </div>

          {/* Logo centrado, mitad dentro mitad fuera de la imagen */}
          <div
            style={{
              position: "absolute",
              bottom: "-36px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "20px",
                background: "#131313",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.7)",
              }}
            >
              🍔
            </div>
          </div>

          {/* Controles top */}
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              right: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 5,
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/")} // Redirige directamente al home/marketplace
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.55)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              aria-label="Ir al inicio"
            >
              <Home size={18} color="#fff" />
            </button>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setSearchOpen((s) => !s)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.55)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                aria-label="Buscar"
              >
                <Search size={17} color="#fff" />
              </button>
              <button
                type="button"
                onClick={handleShare}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.55)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                aria-label="Compartir"
              >
                <Share2 size={17} color="#fff" />
              </button>
            </div>
          </div>
        </div>

        {/* ── INFO DEL LOCAL ── */}
        <div style={{ padding: "48px 20px 0", textAlign: "center" }}>
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.45)",
              fontWeight: 500,
              marginBottom: "6px",
              letterSpacing: "0.02em",
            }}
          >
            {TIENDA_INFO.tipo}
          </p>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: "14px",
            }}
          >
            {nombreTienda}
          </h1>

          {/* Métricas en fila */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "16px",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Star size={13} fill="#FFD166" style={{ color: "#FFD166" }} />
              <span style={{ fontSize: "13px", fontWeight: 700 }}>
                {TIENDA_INFO.rating}
              </span>
              <span
                style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}
              >
                ({TIENDA_INFO.reviews})
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Clock3 size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
              <span
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 500,
                }}
              >
                {TIENDA_INFO.tiempo}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Bike size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
              <span
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 500,
                }}
              >
                {TIENDA_INFO.domicilio}
              </span>
            </div>
          </div>

          {/* Horario + dirección */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#00c448",
                boxShadow: "0 0 7px #00c448",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>
              {TIENDA_INFO.horario}
            </span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            <MapPin
              size={11}
              style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.4)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {TIENDA_INFO.direccion}
            </span>
          </div>
        </div>

        {/* Divisor */}
        <div style={{ height: "1px", background: "#1a1a1a" }} />

        {/* ── TABS + BÚSQUEDA (sticky) ── */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: "rgba(10,10,10,0.96)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid #1a1a1a",
            padding: "12px 16px",
          }}
        >
          {/* ── Categorías */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              scrollbarWidth: "none",
              marginBottom: searchOpen ? "10px" : "0",
            }}
          >
            {CATEGORIAS_MENU.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCatActiva(cat);
                  setSearchQuery("");
                }}
                style={{
                  padding: "7px 16px",
                  borderRadius: "100px",
                  fontSize: "12px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  // Eliminamos el borde permanentemente
                  border: "none",
                  // El color de fondo es el único indicador visual
                  background: catActiva === cat ? "#7c3aed" : "#1a1a1a",
                  color: catActiva === cat ? "#fff" : "rgba(255,255,255,0.45)",
                  cursor: "pointer",
                  letterSpacing: "0.01em",
                  flexShrink: 0,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Barra de búsqueda */}
          {searchOpen && (
            <div style={{ position: "relative" }}>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  catActiva === "Todos"
                    ? "Buscar en el menú..."
                    : `Buscar en ${catActiva}...`
                }
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 14px",
                  borderRadius: "25px",
                  background: "#131313",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                aria-label={`Buscar en ${catActiva}`}
              />
              <button
                type="button"
                onClick={() => {
                  if (searchQuery.trim()) {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  } else setSearchOpen(false);
                }}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Cerrar búsqueda"
              >
                <X size={15} color="rgba(255,255,255,0.5)" />
              </button>
            </div>
          )}
        </div>

        {/* ── LISTA DE PRODUCTOS ── */}
        <div style={{ padding: "8px 0" }}>
          {searchQuery.trim() !== "" && (
            <p
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.35)",
                padding: "8px 20px 4px",
              }}
            >
              {displayedProducts.length} resultado(s) para "{searchQuery}"
            </p>
          )}

          {displayedProducts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "56px 24px",
                color: "rgba(255,255,255,0.3)",
                fontSize: "13px",
              }}
            >
              <div
                style={{
                  marginBottom: "12px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <ShoppingBag
                  size={48}
                  strokeWidth={1}
                  color="rgba(255,255,255,0.2)"
                />
              </div>
              No hay productos para mostrar.
            </div>
          ) : (
            displayedProducts.map((p, idx) => {
              const qty = carrito[p.id] || 0;
              const isLast = idx === displayedProducts.length - 1;
              return (
                <div key={p.id}>
                  <div
                    onClick={() => setProductoDetalle(p)}
                    style={{
                      display: "flex",
                      gap: "14px",
                      padding: "16px 20px 24px",
                      alignItems: "flex-start",
                      cursor: "pointer",
                    }}
                  >
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {p.tag && (
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "10px",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: TAG_MAP[p.tag] || "#7c3aed",
                            marginBottom: "5px",
                          }}
                        >
                          {p.tag}
                        </span>
                      )}
                      <h4
                        style={{
                          fontWeight: 700,
                          fontSize: "14px",
                          marginBottom: "4px",
                          lineHeight: 1.3,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {p.nombre}
                      </h4>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.4)",
                          lineHeight: 1.55,
                          marginBottom: "12px",
                        }}
                      >
                        {p.desc}
                      </p>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: "15px",
                          color: "#fff",
                        }}
                      >
                        {fmt(p.precio)}
                      </span>
                    </div>

                    {/* Imagen + botón superpuesto */}
                    <div
                      style={{
                        position: "relative",
                        flexShrink: 0,
                        width: "88px",
                      }}
                    >
                      {/* Imagen */}
                      <div
                        style={{
                          width: "88px",
                          height: "88px",
                          borderRadius: "16px",
                          background: "#131313",
                          border: "1px solid rgba(255,255,255,0.06)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "38px",
                        }}
                      >
                        {p.emoji}
                      </div>

                      {/* Botón superpuesto en esquina inferior derecha */}
                      {qty === 0 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            agregar(p.id);
                          }}
                          style={{
                            position: "absolute",
                            bottom: "-10px",
                            right: "-10px",
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "#7c3aed",
                            color: "#fff",
                            fontSize: "22px",
                            fontWeight: 300,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(124,58,237,0.5)",
                            lineHeight: 1,
                          }}
                          aria-label={`Agregar ${p.nombre}`}
                        >
                          +
                        </button>
                      ) : (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "-14px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "#7c3aed",
                            padding: "4px 10px",
                            borderRadius: "100px",
                            boxShadow: "0 4px 12px rgba(124,58,237,0.5)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              quitar(p.id);
                            }}
                            style={{
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: "16px",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              lineHeight: 1,
                              padding: 0,
                            }}
                            aria-label={`Quitar ${p.nombre}`}
                          >
                            −
                          </button>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 800,
                              color: "#fff",
                              minWidth: "14px",
                              textAlign: "center",
                            }}
                          >
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              agregar(p.id);
                            }}
                            style={{
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: "16px",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              lineHeight: 1,
                              padding: 0,
                            }}
                            aria-label={`Agregar ${p.nombre}`}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Divisor entre items */}
                  {!isLast && (
                    <div
                      style={{
                        height: "1px",
                        background: "#131313",
                        margin: "0 20px",
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── CARRITO ── */}
      {totalItems > 0 && (
        <CartPortal
          totalItems={totalItems}
          totalPrecio={totalPrecio}
          fmt={fmt}
          onOpen={abrirCarrito}
        />
      )}

      {/* ── MODAL COMPARTIR CON QR ── */}
      {shareModalOpen &&
        createPortal(
          <div
            onClick={() => setShareModalOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(6px)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#131313",
                borderRadius: "20px",
                padding: "28px 24px",
                width: "100%",
                maxWidth: "340px",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                textAlign: "center",
                position: "relative",
              }}
            >
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                aria-label="Cerrar"
              >
                <X size={15} color="#fff" />
              </button>

              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#fff",
                  marginBottom: "4px",
                  letterSpacing: "-0.01em",
                }}
              >
                Compartir {nombreTienda}
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: "20px",
                }}
              >
                Escanea el código o usa el enlace
              </p>

              <div
                style={{
                  display: "inline-flex",
                  padding: "14px",
                  borderRadius: "16px",
                  background: "#fff",
                  marginBottom: "18px",
                }}
              >
                <QRCodeCanvas value={shareUrl} size={180} />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#0a0a0a",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "100px",
                  padding: "8px 6px 8px 14px",
                  marginBottom: "14px",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.6)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textAlign: "left",
                  }}
                >
                  {shareUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    flexShrink: 0,
                    padding: "7px 14px",
                    borderRadius: "100px",
                    background: "#7c3aed",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Copiar
                </button>
              </div>

              <button
                type="button"
                onClick={handleNativeShare}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "100px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Share2 size={15} />
                Más opciones
              </button>
            </div>
          </div>,
          document.body,
        )}

      {/* ── CONFIRMAR CAMBIO DE TIENDA (vacía el carrito) ── */}
      {confirmCambioOpen &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(6px)",
              zIndex: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                background: "#131313",
                borderRadius: "20px",
                padding: "26px 22px",
                width: "100%",
                maxWidth: "320px",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "34px", marginBottom: "10px" }}>🛒</div>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#fff",
                  marginBottom: "8px",
                }}
              >
                ¿Cambiar de tienda?
              </h3>
              <p
                style={{
                  fontSize: "12.5px",
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.5,
                  marginBottom: "22px",
                }}
              >
                Tienes productos de{" "}
                <strong style={{ color: "#fff" }}>
                  {nombreTiendaEnCarrito}
                </strong>{" "}
                en tu carrito. Si entras a{" "}
                <strong style={{ color: "#fff" }}>{nombreTienda}</strong>, se
                eliminarán y tu carrito quedará vacío.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={cancelarCambioTienda}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "100px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarCambioTienda}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "100px",
                    background: "#7c3aed",
                    border: "none",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Sí, vaciar
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* ── CARRITO (pantalla completa) ── */}
      {cartOpen && (
        <Carrito
          onIrAPagar={() => {
            cerrarCarrito();
            setCheckoutOpen(true);
          }}
        />
      )}

      {/* ── CHECKOUT / MÉTODO DE ENTREGA (pantalla completa) ── */}
      {checkoutOpen && (
        <Checkout
          onVolver={() => {
            setCheckoutOpen(false);
            abrirCarrito();
          }}
          onConfirmar={() => {
            crearPedido();
            setCheckoutOpen(false);
            setSeguimientoOpen(true);
          }}
        />
      )}

      {/* ── SEGUIMIENTO DEL PEDIDO (pantalla completa) ── */}
      {seguimientoOpen && (
        <SeguimientoPedido
          onCerrar={() => {
            setSeguimientoOpen(false);
            finalizarPedido();
          }}
        />
      )}

      {/* ── DETALLE DE PRODUCTO (imagen grande, variantes, indicaciones) ── */}
      {productoDetalle && (
        <ProductoDetalle
          producto={productoDetalle}
          onClose={() => setProductoDetalle(null)}
        />
      )}

      {/* ── MENSAJE COMPARTIR ── */}
      {shareMessage &&
        createPortal(
          <div
            style={{
              position: "fixed",
              bottom: "96px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 60,
              padding: "10px 20px",
              borderRadius: "100px",
              background: "#222",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.1)",
              whiteSpace: "nowrap",
              backdropFilter: "blur(12px)",
            }}
          >
            {shareMessage}
          </div>,
          document.body,
        )}
    </>
  );
};

export default Shop;
