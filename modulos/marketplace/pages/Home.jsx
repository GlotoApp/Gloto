import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  X,
  ArrowRight,

  // Categorías actuales
  Pizza,
  Coffee,
  IceCream,
  CakeSlice,
  Leaf,
  Fish,
  Beef,

  // Nuevas categorías
  ShoppingBasket,
  Cookie,
  Sandwich,
  Drumstick,
  ChefHat,
  Globe,
  Utensils,
  UtensilsCrossed,
  Timer,
} from "lucide-react";

// ─── Datos ──────────────────────────────────

const CATEGORIAS = [
  { n: "Desayuno", i: Coffee },

  { n: "Colombiana", i: UtensilsCrossed },
  { n: "Latina", i: UtensilsCrossed },
  { n: "Internacional", i: UtensilsCrossed },

  { n: "Postres", i: CakeSlice },
  { n: "Tortas", i: CakeSlice },
  { n: "Snacks", i: CakeSlice },
  { n: "Helados", i: CakeSlice },

  { n: "Súper", i: ShoppingBasket },

  { n: "Saludable", i: Leaf },

  { n: "Arepas", i: Sandwich },

  { n: "Salchipapa", i: Beef },
  { n: "Comida rápida", i: Beef },
  { n: "Hamburguesas", i: Beef },

  { n: "Pizza", i: Pizza },
  { n: "Italiana", i: Pizza },

  { n: "Pollo", i: Drumstick },

  { n: "Carne", i: Beef },
  { n: "Americana", i: Beef },

  { n: "Asiática", i: Fish },
  { n: "Mariscos", i: Fish },
];

// Relaciona cada categoría con el/los tipos de cocina de las tiendas (campo "tipo")
const CATEGORIA_TIPOS = {
  Burgers: ["Americana"],
  Café: ["Cafetería"],
  Pizza: ["Italiana"],
  Helados: ["Heladería"],
  Sushi: ["Japonesa"],
  Tacos: ["Mexicana"],
  Postres: ["Postres", "Repostería"],
  Saludable: ["Saludable", "Vegetariana", "Vegana"],
};

const PROMOS = [
  {
    id: 1,
    slug: "burger-house",
    tag: "PATROCINADO",
    oferta: "2×1 en combos",
    nombre: "Burger House",
    emoji: "🍔",
  },
  {
    id: 2,
    slug: "obsidian-brew",
    tag: "NUEVO",
    oferta: "Café gratis",
    nombre: "Obsidian Brew",
    emoji: "☕",
  },
  {
    id: 3,
    slug: "pizza-luna",
    tag: "TRENDING",
    oferta: "-30% hoy",
    nombre: "Pizza Luna",
    emoji: "🍕",
  },
];

const TIENDAS = [
  {
    slug: "sushi-bar",
    nombre: "Sushi Bar",
    tipo: "Japonesa",
    logo: "🍣",
    rating: 4.8,
    reviews: 312,
    tiempo: "20–30 min",
    domicilio: "$2.500",
    distancia: "1.2 km",
    badge: "Más pedido",
  },
  {
    slug: "tacos-locos",
    nombre: "Tacos Locos",
    tipo: "Mexicana",
    logo: "🌮",
    rating: 4.5,
    reviews: 198,
    tiempo: "15–25 min",
    domicilio: "Gratis",
    distancia: "0.8 km",
    badge: null,
  },
  {
    slug: "burger-house",
    nombre: "Burger House",
    tipo: "Americana",
    logo: "🍔",
    rating: 4.7,
    reviews: 540,
    tiempo: "25–35 min",
    domicilio: "$3.000",
    distancia: "2.1 km",
    badge: "Top rated",
  },
  {
    slug: "pizza-luna",
    nombre: "Pizza Luna",
    tipo: "Italiana",
    logo: "🍕",
    rating: 4.9,
    reviews: 421,
    tiempo: "18–25 min",
    domicilio: "$2.000",
    distancia: "1.4 km",
    badge: "Popular",
  },
  {
    slug: "pollos-reales",
    nombre: "Pollos Reales",
    tipo: "Pollo",
    logo: "🍗",
    rating: 4.6,
    reviews: 284,
    tiempo: "20–30 min",
    domicilio: "$2.500",
    distancia: "1.8 km",
    badge: "Popular",
  },
  {
    slug: "wok-express",
    nombre: "Wok Express",
    tipo: "China",
    logo: "🥡",
    rating: 4.7,
    reviews: 412,
    tiempo: "25–35 min",
    domicilio: "$3.000",
    distancia: "2.4 km",
    badge: null,
  },
  {
    slug: "cafe-central",
    nombre: "Café Central",
    tipo: "Café",
    logo: "☕",
    rating: 4.9,
    reviews: 190,
    tiempo: "10–20 min",
    domicilio: "Gratis",
    distancia: "0.7 km",
    badge: "Top rated",
  },
  {
    slug: "panaderia-del-sol",
    nombre: "Panadería del Sol",
    tipo: "Panadería",
    logo: "🥐",
    rating: 4.5,
    reviews: 156,
    tiempo: "15–25 min",
    domicilio: "$2.000",
    distancia: "1.1 km",
    badge: null,
  },
  {
    slug: "arepas-colombia",
    nombre: "Arepas Colombia",
    tipo: "Colombiana",
    logo: "🫓",
    rating: 4.8,
    reviews: 367,
    tiempo: "20–30 min",
    domicilio: "$2.500",
    distancia: "1.5 km",
    badge: "Más pedido",
  },
  {
    slug: "parrilla-premium",
    nombre: "Parrilla Premium",
    tipo: "Parrilla",
    logo: "🥩",
    rating: 4.7,
    reviews: 520,
    tiempo: "30–40 min",
    domicilio: "$4.000",
    distancia: "3.2 km",
    badge: "Popular",
  },
  {
    slug: "fit-bowl",
    nombre: "Fit Bowl",
    tipo: "Saludable",
    logo: "🥗",
    rating: 4.9,
    reviews: 243,
    tiempo: "15–25 min",
    domicilio: "$2.000",
    distancia: "1.3 km",
    badge: "Nuevo",
  },
  {
    slug: "dulce-mania",
    nombre: "Dulce Manía",
    tipo: "Postres",
    logo: "🍰",
    rating: 4.8,
    reviews: 274,
    tiempo: "15–20 min",
    domicilio: "$2.500",
    distancia: "0.9 km",
    badge: null,
  },
  {
    slug: "helados-polar",
    nombre: "Helados Polar",
    tipo: "Helados",
    logo: "🍦",
    rating: 4.6,
    reviews: 211,
    tiempo: "10–15 min",
    domicilio: "$1.500",
    distancia: "0.6 km",
    badge: null,
  },
  {
    slug: "empanadas-criollas",
    nombre: "Empanadas Criollas",
    tipo: "Colombiana",
    logo: "🥟",
    rating: 4.7,
    reviews: 301,
    tiempo: "15–25 min",
    domicilio: "Gratis",
    distancia: "1.0 km",
    badge: "Popular",
  },
  {
    slug: "shawarma-house",
    nombre: "Shawarma House",
    tipo: "Árabe",
    logo: "🌯",
    rating: 4.8,
    reviews: 198,
    tiempo: "20–30 min",
    domicilio: "$2.500",
    distancia: "1.7 km",
    badge: null,
  },
  {
    slug: "ceviches-del-mar",
    nombre: "Ceviches del Mar",
    tipo: "Mariscos",
    logo: "🦐",
    rating: 4.9,
    reviews: 489,
    tiempo: "25–35 min",
    domicilio: "$3.500",
    distancia: "2.2 km",
    badge: "Top rated",
  },
  {
    slug: "donut-factory",
    nombre: "Donut Factory",
    tipo: "Postres",
    logo: "🍩",
    rating: 4.5,
    reviews: 144,
    tiempo: "10–20 min",
    domicilio: "$2.000",
    distancia: "0.8 km",
    badge: null,
  },
  {
    slug: "lasagna-mia",
    nombre: "Lasagna Mía",
    tipo: "Italiana",
    logo: "🍝",
    rating: 4.8,
    reviews: 253,
    tiempo: "25–35 min",
    domicilio: "$3.000",
    distancia: "1.9 km",
    badge: "Popular",
  },
  {
    slug: "fruteria-fresh",
    nombre: "Frutería Fresh",
    tipo: "Saludable",
    logo: "🍉",
    rating: 4.7,
    reviews: 176,
    tiempo: "15–20 min",
    domicilio: "$2.000",
    distancia: "1.1 km",
    badge: null,
  },
  {
    slug: "bbq-smoke",
    nombre: "BBQ Smoke",
    tipo: "Americana",
    logo: "🍖",
    rating: 4.8,
    reviews: 445,
    tiempo: "30–40 min",
    domicilio: "$4.000",
    distancia: "2.8 km",
    badge: "Top rated",
  },
  {
    slug: "green-vegan",
    nombre: "Green Vegan",
    tipo: "Vegana",
    logo: "🌱",
    rating: 4.9,
    reviews: 222,
    tiempo: "20–30 min",
    domicilio: "$2.500",
    distancia: "1.4 km",
    badge: "Nuevo",
  },
  {
    slug: "sandwich-club",
    nombre: "Sandwich Club",
    tipo: "Sandwiches",
    logo: "🥪",
    rating: 4.6,
    reviews: 187,
    tiempo: "15–25 min",
    domicilio: "$2.000",
    distancia: "1.2 km",
    badge: null,
  },
  {
    slug: "churros-city",
    nombre: "Churros City",
    tipo: "Postres",
    logo: "🍫",
    rating: 4.7,
    reviews: 132,
    tiempo: "10–15 min",
    domicilio: "$1.500",
    distancia: "0.5 km",
    badge: null,
  },
  {
    slug: "poke-paradise",
    nombre: "Poke Paradise",
    tipo: "Japonesa",
    logo: "🍱",
    rating: 4.9,
    reviews: 338,
    tiempo: "20–30 min",
    domicilio: "$3.000",
    distancia: "1.6 km",
    badge: "Popular",
  },
];

const FILTROS = ["Relevancia", "Más cerca", "Calificación", "Precio", "Rápido"];

const FRASES = [
  "¿Qué vas a pedir?",
  "Antojos de hoy",
  "¿Qué comeremos hoy?",
  "¿Qué buscas?",
  "¿Algo rico para ordenar?",
];

const FRASES_LOOP = [...FRASES, ...FRASES];

const Home = () => {
  const nombreUsuario = "Juan";

  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("Relevancia");
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [textoIndex, setTextoIndex] = useState(0);
  const [animando, setAnimando] = useState(true);
  const [verTodasPromos, setVerTodasPromos] = useState(false);
  const [busquedaPromo, setBusquedaPromo] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setTextoIndex((prev) => prev + 1);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (textoIndex === FRASES.length) {
      const timeout = setTimeout(() => {
        setAnimando(false);
        setTextoIndex(0);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimando(true);
          });
        });
      }, 700);

      return () => clearTimeout(timeout);
    }
  }, [textoIndex]);

  // Normaliza texto para comparar sin tildes/mayúsculas
  const normalizar = (str) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const tiendasFiltradas = TIENDAS.filter((t) => {
    const pasaBusqueda =
      busqueda.trim() === "" ||
      (() => {
        const q = normalizar(busqueda);

        return (
          normalizar(t.nombre).includes(q) || normalizar(t.tipo).includes(q)
        );
      })();

    const pasaCategoria =
      !categoriaActiva ||
      (CATEGORIA_TIPOS[categoriaActiva] || []).some(
        (tipo) => normalizar(t.tipo) === normalizar(tipo),
      );

    return pasaBusqueda && pasaCategoria;
  });

  // ← AQUÍ AFUERA
  const promocionesFiltradas = PROMOS.filter((promo) => {
    const q = normalizar(busquedaPromo);

    return (
      busquedaPromo.trim() === "" ||
      normalizar(promo.nombre).includes(q) ||
      normalizar(promo.oferta).includes(q) ||
      normalizar(promo.tag).includes(q)
    );
  });

  const buscando = busqueda.trim().length > 0;

  const modoCategoria = categoriaActiva !== null && !buscando;

  // Selecciona/deselecciona una categoría (toggle)
  const toggleCategoria = (nombreCategoria) => {
    setCategoriaActiva((prev) =>
      prev === nombreCategoria ? null : nombreCategoria,
    );
  };

  return (
    <div className="max-w-6xl mx-auto bg-background min-h-screen">
      {/* HERO */}
      <section className="px-4 pt-4 pb-4">
        {!buscando && !modoCategoria && !verTodasPromos && (
          <>
            <p className="text-[16px] mb-1 text-on-surface-variant/60">
              ¡Hola, {nombreUsuario}!
            </p>

            <div className="h-[72px] overflow-hidden mb-5">
              <div
                className={
                  animando
                    ? "transition-transform duration-700 ease-in-out"
                    : ""
                }
                style={{
                  transform: `translateY(-${textoIndex * 72}px)`,
                }}
              >
                {FRASES_LOOP.map((frase, index) => (
                  <h1
                    key={index}
                    className="h-[72px] flex items-center font-black leading-none tracking-tighter text-[clamp(2rem,8vw,2.75rem)] text-on-surface"
                  >
                    <span className="text-primary">{frase}</span>
                  </h1>
                ))}
              </div>
            </div>
          </>
        )}

        {/* BUSCADOR SIEMPRE VISIBLE */}
        {!verTodasPromos && !modoCategoria && (
          <div className="flex items-center rounded-3xl bg-surface px-4 h-10">
            <Search size={18} className="opacity-50" />

            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 bg-transparent px-3 text-base outline-none text-on-surface caret-primary-container"
            />

            {busqueda.length > 0 && (
              <button
                onClick={() => setBusqueda("")}
                className="p-1 rounded-full hover:bg-black/5 transition-colors"
              >
                <X size={16} className="opacity-50" />
              </button>
            )}
          </div>
        )}
      </section>

      {/* BANNER CATEGORÍA ACTIVA */}
      {modoCategoria && (
        <section className="px-4 pt-4 pb-4">
          <div className="flex items-center justify-between rounded-3xl border border-primary-container/20 bg-primary-container/10 px-5 py-4 transition-all duration-300">
            <div>
              <h2 className="text-2xl font-black text-on-surface">
                {categoriaActiva}
              </h2>
            </div>

            <button
              onClick={() => setCategoriaActiva(null)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-surface hover:bg-surface/80 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </section>
      )}

      {/* CATEGORÍAS (se ocultan mientras se busca) */}
      {!buscando && !verTodasPromos && (
        <section className="px-2 mb-4">
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIAS.map((cat) => {
              const Icon = cat.i;
              const activa = categoriaActiva === cat.n;
              return (
                <button
                  key={cat.n}
                  onClick={() => toggleCategoria(cat.n)}
                  className={`flex-shrink-0 flex flex-col items-center gap-2 px-4 py-3 rounded-2xl min-w-[72px] transition-all ${
                    activa
                      ? "bg-primary-container text-white"
                      : "bg-surface/60 text-on-surface-variant"
                  }`}
                >
                  <Icon size={22} />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide ${
                      activa ? "text-white" : "text-on-surface-variant"
                    }`}
                  >
                    {cat.n}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* PROMOCIONES (se ocultan mientras se busca) */}
      {!buscando && !modoCategoria && !verTodasPromos && (
        <div className="flex gap-3 overflow-x-auto px-2 no-scrollbar pb-4">
          {promocionesFiltradas.map((promo) => (
            <Link
              key={promo.id}
              to={`/marketplace/tienda/${promo.slug}`}
              className="relative flex-shrink-0 w-[190px] h-[105px] rounded-3xl bg-primary-container/80 overflow-hidden"
            >
              <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-[8px] font-bold bg-white/10 text-white/70">
                {promo.tag}
              </div>
              <div className="absolute right-3 bottom-2 text-4xl opacity-70">
                {promo.emoji}
              </div>
              <div className="absolute left-3 bottom-3 text-white">
                <p className="font-black text-base">{promo.oferta}</p>
                <p className="text-[11px] opacity-70">{promo.nombre}</p>
              </div>
            </Link>
          ))}

          <button
            onClick={() => setVerTodasPromos(true)}
            className="flex-shrink-0 w-[120px] h-[105px] rounded-3xl bg-surface flex flex-col items-center justify-center gap-2 hover:border-primary-container hover:text-primary-container transition-all"
          >
            <ArrowRight size={24} />
            <span className="text-xs font-bold">Ver más</span>
          </button>
        </div>
      )}

      {/* FILTROS (STICKY SE COMPORTA COMO PARTE DEL HEADER, se oculta mientras se busca) */}
      {!buscando && !modoCategoria && !verTodasPromos && (
        <section className="sticky top-[54px] bg-background z-40 px-2 pt-2">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-2">
            {FILTROS.map((f) => (
              <button
                key={f}
                onClick={() => setFiltroActivo(f)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  filtroActivo === f
                    ? "bg-primary-container text-white"
                    : "bg-surface text-on-surface-variant/60"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>
      )}

      {verTodasPromos && (
        <section className="px-4 pb-8">
          <div className="flex items-center rounded-3xl bg-surface px-4 h-11 mb-5">
            <Search size={18} className="opacity-50" />

            <input
              type="text"
              placeholder="Buscar promociones..."
              value={busquedaPromo}
              onChange={(e) => setBusquedaPromo(e.target.value)}
              className="flex-1 bg-transparent px-3 text-base outline-none"
            />

            {busquedaPromo && (
              <button onClick={() => setBusquedaPromo("")}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-black">Todas las promociones</h2>

            <button
              onClick={() => setVerTodasPromos(false)}
              className="w-10 h-10 rounded-full bg-surface flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-4">
            {promocionesFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 text-on-surface-variant/60">
                <Search size={28} className="mb-3 opacity-50" />

                <p className="text-base font-bold">
                  No encontramos promociones para "{busquedaPromo}"
                </p>

                <p className="text-xs mt-1">Intenta con otro nombre u oferta</p>
              </div>
            ) : (
              promocionesFiltradas.map((promo) => (
                <Link
                  key={promo.id}
                  to={`/marketplace/tienda/${promo.slug}`}
                  className="relative h-36 rounded-3xl bg-primary-container overflow-hidden p-5"
                >
                  <div className="absolute right-4 bottom-2 text-6xl opacity-20">
                    {promo.emoji}
                  </div>

                  <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 text-white">
                    {promo.tag}
                  </span>

                  <h3 className="mt-4 text-2xl font-black text-white">
                    {promo.oferta}
                  </h3>

                  <p className="text-white/70">{promo.nombre}</p>
                </Link>
              ))
            )}
          </div>
        </section>
      )}

      {!verTodasPromos && (
        <section className="px-5">
          {tiendasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 text-on-surface-variant/60">
              <Search size={28} className="mb-2 opacity-50" />
              <p className="text-base font-bold">
                {buscando
                  ? `No encontramos resultados para "${busqueda}"`
                  : `No hay tiendas en "${categoriaActiva}" por ahora`}
              </p>
              <p className="text-xs mt-1">
                Intenta con otro nombre o categoría
              </p>
            </div>
          ) : buscando ? (
            // ── MODO BÚSQUEDA: tarjetas horizontales, compitiendo por la mirada del usuario ──
            <div className="flex flex-col gap-3 pb-8">
              {tiendasFiltradas.map((t) => (
                <Link
                  key={t.slug}
                  to={`/marketplace/tienda/${t.slug}`}
                  className="group relative flex items-center gap-3 rounded-3xl bg-surface border border-outline/30 p-3 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                >
                  {/* Logo */}
                  <div className="relative flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-2xl bg-background border border-outline/10 overflow-hidden">
                    <span className="text-4xl">{t.logo}</span>

                    {t.badge && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-primary-container text-white text-[7px] font-bold uppercase tracking-wider shadow-sm">
                        {t.badge}
                      </div>
                    )}
                  </div>

                  {/* Información */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-base text-on-surface truncate">
                      {t.nombre}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                      {t.tipo}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <div className="px-2 py-0.5 rounded-md bg-background border border-outline/10 text-[10px] font-bold text-on-surface flex items-center gap-1">
                        <span className="text-yellow-500">★</span> {t.rating}
                      </div>
                      <div className="px-2 py-0.5 rounded-md bg-background border border-outline/10 text-[10px] font-medium text-on-surface-variant">
                        {t.tiempo}
                      </div>
                    </div>

                    <div className="mt-1.5 text-[11px] font-bold flex items-center gap-1">
                      <span
                        className={
                          t.domicilio === "Gratis"
                            ? "text-success"
                            : "text-on-surface-variant"
                        }
                      >
                        🛵{" "}
                        {t.domicilio === "Gratis"
                          ? "Envío Gratis"
                          : t.domicilio}
                      </span>
                    </div>
                  </div>

                  <ArrowRight
                    size={18}
                    className="flex-shrink-0 opacity-30 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 pb-8">
              {tiendasFiltradas.map((t) => (
                <Link
                  key={t.slug}
                  to={`/marketplace/tienda/${t.slug}`}
                  className="group relative flex flex-col rounded-3xl bg-surface border border-outline/30 p-3 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                >
                  {/* Contenedor del Logo con fondo sutil */}
                  <div className="relative flex items-center justify-center h-24 rounded-2xl bg-background border border-outline/10 mb-3 overflow-hidden">
                    <span className="text-5xl">{t.logo}</span>

                    {/* Badge de estado, si tuviera un badge personalizado */}
                    {t.badge && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-primary-container text-white text-[9px] font-bold uppercase tracking-wider shadow-sm">
                        {t.badge}
                      </div>
                    )}
                  </div>

                  {/* Información de la tienda */}
                  <div className="flex-1">
                    <h4 className="font-extrabold text-base text-on-surface truncate pr-2">
                      {t.nombre}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                      {t.tipo}
                    </p>
                  </div>

                  {/* Métricas: Usamos un contenedor tipo "chip" para organizar mejor */}
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    <div className="px-2 py-1 rounded-md bg-background border border-outline/10 text-[10px] font-bold text-on-surface flex items-center gap-1">
                      <span className="text-yellow-500">★</span> {t.rating}
                    </div>
                    <div className="px-2 py-1 rounded-md bg-background border border-outline/10 text-[10px] font-medium text-on-surface-variant">
                      {t.tiempo}
                    </div>
                  </div>

                  {/* Envío: Más destacado */}
                  <div className="mt-2 text-[11px] font-bold flex items-center gap-1">
                    <span
                      className={
                        t.domicilio === "Gratis"
                          ? "text-success"
                          : "text-on-surface-variant"
                      }
                    >
                      🛵{" "}
                      {t.domicilio === "Gratis" ? "Envío Gratis" : t.domicilio}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Home;
