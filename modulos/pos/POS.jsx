import React, { useState, useRef } from "react";

const pasteToField = async (setter) => {
  if (!navigator?.clipboard) return;
  try {
    const text = await navigator.clipboard.readText();
    if (text) setter(text);
  } catch {
    // Clipboard may be blocked; ignore silently
  }
};

const TextField = ({
  label,
  value,
  setValue,
  placeholder,
  type = "text",
  inputRef,
  onChange,
}) => (
  <div>
    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={onChange ?? ((e) => setValue(e.target.value))}
        placeholder={placeholder}
        className="w-full bg-neutral-900 border border-white/5 rounded-lg p-2 pr-10 text-white text-xs focus:outline-none focus:border-violet-500"
      />
      <span
        role="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (value) setValue("");
          else pasteToField(setValue);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-base mt-2">
          {value ? "close" : "content_paste"}
        </span>
      </span>
    </div>
  </div>
);

const formatPrice = (price) => {
  return Math.round(price)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const numeroALetras = (num) => {
  if (num === 0) return "CERO PESOS";

  const unidades = [
    "",
    "UN",
    "DOS",
    "TRES",
    "CUATRO",
    "CINCO",
    "SEIS",
    "SIETE",
    "OCHO",
    "NUEVE",
  ];
  const decenas = [
    "",
    "DIEZ",
    "VEINTE",
    "TREINTA",
    "CUARENTA",
    "CINCUENTA",
    "SESENTA",
    "SETENTA",
    "OCHENTA",
    "NOVENTA",
  ];
  const especiales = [
    "DIEZ",
    "ONCE",
    "DOCE",
    "TRECE",
    "CATORCE",
    "QUINCE",
    "DIECISEIS",
    "DIECISIETE",
    "DIECIOCHO",
    "DIECINUEVE",
  ];
  const centenas = [
    "",
    "CIENTO",
    "DOSCIENTOS",
    "TRESCIENTOS",
    "CUATROCIENTOS",
    "QUINIENTOS",
    "SEISCIENTOS",
    "SETECIENTOS",
    "OCHOCIENTOS",
    "NOVECIENTOS",
  ];

  const convertirSeccion = (n) => {
    let output = "";
    if (n >= 100) {
      output += (n === 100 ? "CIEN" : centenas[Math.floor(n / 100)]) + " ";
      n %= 100;
    }
    if (n >= 10 && n <= 19) {
      output += especiales[n - 10];
    } else if (n >= 20) {
      const d = Math.floor(n / 10);
      const u = n % 10;
      if (n === 20) output += "VEINTE";
      else if (d === 2) output += "VEINTI" + unidades[u];
      else output += decenas[d] + (u > 0 ? " Y " + unidades[u] : "");
    } else if (n > 0) {
      output += unidades[n];
    }
    return output.trim();
  };

  let n = Math.floor(num);
  let letras = "";

  // Manejo de MILES DE MILLONES (Para el 1.000.000.000)
  if (n >= 1000000000) {
    const milMillones = Math.floor(n / 1000000000);
    letras +=
      milMillones === 1 ? "MIL " : convertirSeccion(milMillones) + " MIL ";
    n %= 1000000000;
  }

  // Manejo de MILLONES
  if (n >= 1000000) {
    const millones = Math.floor(n / 1000000);
    letras +=
      millones === 1 && letras === ""
        ? "UN MILLÓN "
        : convertirSeccion(millones) + " MILLONES ";
    n %= 1000000;
  } else if (letras.includes("MIL") && !letras.includes("MILLONES")) {
    // Si veníamos de miles de millones pero el residuo de millones es 0
    letras += "MILLONES ";
  }

  // Manejo de MILES
  if (n >= 1000) {
    const miles = Math.floor(n / 1000);
    letras += miles === 1 ? "MIL " : convertirSeccion(miles) + " MIL ";
    n %= 1000;
  }

  // Unidades finales
  letras += convertirSeccion(n);

  return `${letras.trim()} PESOS`.replace(/\s+/g, " ");
};

const POS = () => {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [removingItems, setRemovingItems] = useState(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [instruction, setInstruction] = useState("");
  const [showInfo, setShowInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobilePanel, setMobilePanel] = useState("products");
  const [toastItems, setToastItems] = useState([]);
  const toastTimers = useRef({});

  // Estado para el item que cambia de color
  const [highlightItem, setHighlightItem] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [address, setAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [referencePoint, setReferencePoint] = useState("");
  const [locationText, setLocationText] = useState("");
  const [moneyPaid, setMoneyPaid] = useState("");

  const normalizePhoneNumber = (value) => {
    const cleaned = value.replace(/[^\d+]/g, "");
    if (!cleaned) return "";
    const withPlus = cleaned.startsWith("+")
      ? "+" + cleaned.slice(1).replace(/\+/g, "")
      : cleaned.replace(/\+/g, "");
    return withPlus;
  };
  const [splitPayments, setSplitPayments] = useState([
    { method: "efectivo", amount: "" },
  ]);

  // Opciones de pago por método de entrega
  const paymentOptions = {
    pickup: ["efectivo", "tarjeta", "transferencia"],
    table: ["efectivo", "tarjeta", "transferencia"],
    delivery: ["efectivo", "tarjeta", "transferencia"],
    point: ["efectivo", "tarjeta", "transferencia"],
  };

  const deliveryLabels = {
    pickup: { label: "Recoger", icon: "flag" },
    table: { label: "Mesa", icon: "table_bar" },
    delivery: { label: "Domicilio", icon: "local_shipping" },
    point: { label: "En Punto", icon: "location_on" },
  };

  const paymentLabels = {
    efectivo: { label: "Efectivo", icon: "payments" },
    tarjeta: { label: "Tarjeta", icon: "credit_card" },
    transferencia: { label: "Transferencia", icon: "account_balance" },
    dividir: { label: "Dividir", icon: "call_split" }, // El nuevo método
  };

  const products = [
    {
      id: 1,
      name: "Pepperoni Pizza",
      category: "pizzas",
      price: 12000,
      desc: "Pepperoni premium.",
      icon: "local_pizza",
    },
    {
      id: 2,
      name: "Margherita Pizza",
      category: "pizzas",
      price: 10000,
      desc: "Albahaca fresca.",
      icon: "local_pizza",
    },
    {
      id: 3,
      name: "Truffle Burger",
      category: "burgers",
      price: 14000,
      desc: "Carne angus.",
      icon: "fastfood",
    },
    {
      id: 4,
      name: "Classic Burger",
      category: "burgers",
      price: 9000,
      desc: "Carne de res 150g.",
      icon: "fastfood",
    },
    {
      id: 5,
      name: "Garlic Knots",
      category: "appetizers",
      price: 5000,
      desc: "Nudos de masa.",
      icon: "bakery_dining",
    },
    {
      id: 6,
      name: "Sweet Potato Fries",
      category: "appetizers",
      price: 6000,
      desc: "Batatas fritas.",
      icon: "takeout_dining",
    },
    {
      id: 7,
      name: "Coke Zero",
      category: "drinks",
      price: 2990,
      desc: "Refresco sin azúcar.",
      icon: "local_drink",
    },
    {
      id: 8,
      name: "Orange Juice",
      category: "drinks",
      price: 3990,
      desc: "Zumo natural.",
      icon: "local_drink",
    },
  ];

  const categories = [
    { id: "all", name: "Todo" },
    { id: "pizzas", name: "Pizzas" },
    { id: "burgers", name: "Burgers" },
    { id: "appetizers", name: "Entrantes" },
    { id: "drinks", name: "Bebidas" },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchTerm === "" ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const addProductToast = (name) => {
    const id = Date.now() + Math.random(); // ID único para cada burbuja

    // Agregamos el nuevo toast a la lista
    setToastItems((prev) => [...prev, { id, name, exiting: false }]);

    // Programamos el inicio del desvanecimiento (fade-out) a los 2.2s
    setTimeout(() => {
      setToastItems((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
      );

      // Eliminamos el elemento del DOM después de que termine la animación (400ms después)
      setTimeout(() => {
        setToastItems((prev) => prev.filter((t) => t.id !== id));
      }, 400);
    }, 2200);
  };

  const addToCart = (product) => {
    // 1. DISPARAR EL TOAST UNA SOLA VEZ AL INICIO
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      addProductToast(product.name);
    }
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === product.id && !item.note,
      );

      if (existingItem) {
        // Efectos visuales de resaltado
        setHighlightItem(existingItem.cartId);
        setTimeout(() => setHighlightItem(null), 500);

        return prevCart.map((item) =>
          item.cartId === existingItem.cartId
            ? { ...item, qty: item.qty + 1 }
            : item,
        );
      }

      // Si es un producto nuevo
      const cartId = Date.now();
      setHighlightItem(cartId);
      setTimeout(() => setHighlightItem(null), 500);

      return [...prevCart, { ...product, cartId, qty: 1, note: "" }];
    });
  };

  const clearCart = () => {
    if (cart.length > 0) {
      setShowConfirmModal(true);
    }
  };

  const openNoteModal = (e, product, existingNote = "") => {
    e.stopPropagation();
    setActiveProduct(product);
    setInstruction(existingNote);
    setIsModalOpen(true);
  };

  const confirmWithNote = () => {
    if (activeProduct.cartId) {
      setCart(
        cart.map((item) =>
          item.cartId === activeProduct.cartId
            ? { ...item, note: instruction }
            : item,
        ),
      );
    } else {
      const cartId = Date.now();
      setCart([
        ...cart,
        { ...activeProduct, cartId, qty: 1, note: instruction },
      ]);
    }
    setIsModalOpen(false);
    setActiveProduct(null);
  };

  const removeFromCart = (cartId) => {
    setRemovingItems((prev) => new Set(prev).add(cartId));
    setTimeout(() => {
      setCart(cart.filter((item) => item.cartId !== cartId));
      setRemovingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    }, 300);
  };

  const updateQty = (cartId, qty) => {
    if (qty === 0) {
      removeFromCart(cartId);
    } else {
      if (qty > cart.find((i) => i.cartId === cartId).qty) {
        setHighlightItem(cartId);
        setTimeout(() => setHighlightItem(null), 500);
      }
      setCart(
        cart.map((item) => (item.cartId === cartId ? { ...item, qty } : item)),
      );
    }
  };

  const handleDeliveryChange = (method) => {
    if (deliveryMethod === method) {
      setDeliveryMethod("");
      handlePaymentMethodChange("");
    } else {
      setDeliveryMethod(method);
    }
  };

  const handlePaymentMethodChange = (newMethod) => {
    if (paymentMethod === newMethod) {
      setPaymentMethod("");
      setMoneyPaid("");
      setSplitPayments([{ method: "efectivo", amount: "" }]);
    } else {
      // Clear previous payment inputs when switching methods
      if (paymentMethod === "efectivo" && newMethod !== "efectivo") {
        setMoneyPaid("");
      }
      if (paymentMethod === "dividir" && newMethod !== "dividir") {
        setSplitPayments([{ method: "efectivo", amount: "" }]);
      }
      // If switching to dividir, ensure splitPayments is initialized
      if (newMethod === "dividir" && splitPayments.length === 0) {
        setSplitPayments([{ method: "efectivo", amount: "" }]);
      }
      setPaymentMethod(newMethod);
    }
  };

  const addPaymentRow = () => {
    setSplitPayments([...splitPayments, { method: "tarjeta", amount: "" }]);
  };

  const updateSplitPayment = (index, field, value) => {
    const newPayments = [...splitPayments];
    newPayments[index][field] = value;
    setSplitPayments(newPayments);
  };

  const removePaymentRow = (index) => {
    setSplitPayments(splitPayments.filter((_, i) => i !== index));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const assignedTotal = splitPayments.reduce(
    (acc, curr) => acc + (parseFloat(curr.amount) || 0),
    0,
  );
  const paidAmount =
    paymentMethod === "efectivo" ? parseFloat(moneyPaid) || 0 : 0;
  const remaining = paidAmount > 0 ? total - paidAmount : total - assignedTotal;
  const remainingLabel = remaining > 0 ? "Faltante" : "Cambio";
  const remainingDisplay = formatPrice(Math.abs(remaining));
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 h-screen bg-black text-white font-sans selection:bg-violet-500/30 pb-20 lg:pb-0">
        {/* Stacked product toasts - mobile only */}
        {/* Contenedor de Toasts con Orden Invertido - Mobile */}
        <div className="lg:hidden fixed top-6 left-0 right-0 z-50 flex flex-col-reverse items-center gap-2 pointer-events-none px-6">
          {toastItems.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-600/90 backdrop-blur-md px-5 py-3 text-white shadow-xl transition-all duration-400 ${
                toast.exiting
                  ? "opacity-0 -translate-y-4 scale-90"
                  : "opacity-100 translate-y-0 scale-100"
              }`}
              style={{
                // Mantenemos la animación de entrada desde arriba
                animation: !toast.exiting
                  ? "slideInFromTop 0.3s cubic-bezier(0.34,1.56,0.64,1) both"
                  : "",
              }}
            >
              <span className="material-symbols-outlined text-base text-emerald-200">
                check_circle
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider">
                {toast.name} añadido
              </span>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes slideInFromTop {
            from { opacity: 0; transform: translateY(-16px) scale(0.92); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
        {/* Listado de Productos */}
        <div
          className={`${mobilePanel !== "products" ? "hidden" : "block"} lg:block lg:col-span-2 overflow-y-auto`}
        >
          {/* Buscador Inteligente */}
          <div className="p-4 pb-0 sticky top-0 bg-black/90 backdrop-blur-md z-20">
            <h2 className="text-xl font-black uppercase tracking-tighter mb-2 ml-2 text-white">
              Productos
            </h2>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-violet-500 transition-colors">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedCategory("all");
                }}
                className="w-full ml-2 bg-neutral-900 border border-white/5 rounded-2xl py-2 pl-12 pr-4 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-violet-600/50 focus:ring-1 focus:ring-violet-600/50 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  <span className="material-symbols-outlined text-sm mt-2">
                    close
                  </span>
                </button>
              )}
            </div>
            <div className="flex gap-2 p-2 sticky top-0 bg-black/90 backdrop-blur-md z-10 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSearchTerm("");
                  }}
                  className={`flex-shrink-0 py-2 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                    selectedCategory === cat.id
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                      : "bg-neutral-900 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 p-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="group relative bg-neutral-900 border border-white/5 rounded-[2.5rem] p-3 hover:bg-neutral-800/50 hover:border-violet-600/40 transition-all duration-500 cursor-pointer flex flex-col active:scale-[0.97]"
              >
                {/* Botón Info - Elevado con Glassmorphism */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInfo(showInfo === product.id ? null : product.id);
                  }}
                  className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border ${
                    showInfo === product.id
                      ? "bg-white text-black border-white"
                      : "bg-violet-600/20 text-violet-400 border-violet-500/30 hover:bg-violet-600 hover:text-white"
                  } z-10`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {showInfo === product.id ? "close" : "info"}
                  </span>
                </button>

                {/* Contenedor del icono image */}
                <div className="bg-neutral-800/50 rounded-[1.8rem] h-32 mb-4 flex items-center justify-center border border-white/[0.03] overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="material-symbols-outlined text-5xl text-neutral-700 group-hover:text-violet-500 group-hover:scale-110 transition-all duration-500">
                    image
                  </span>
                </div>

                {/* Información de Producto */}
                <div className="px-1">
                  <p className="font-bold text-white text-sm mb-1 group-hover:text-violet-200 transition-colors">
                    {product.name}
                  </p>

                  <div className="flex items-center justify-between mt-1">
                    <p className="text-violet-500 font-black text-xl tracking-tight">
                      $ {formatPrice(product.price)}
                    </p>

                    <button
                      onClick={(e) => openNoteModal(e, product)}
                      className="w-10 h-10 flex items-center justify-center bg-neutral-800 hover:bg-violet-600 text-neutral-400 hover:text-white rounded-full transition-all border border-white/5 shadow-lg group-hover:border-violet-500/30"
                    >
                      <span className="material-symbols-outlined text-xl">
                        add_notes
                      </span>
                    </button>
                  </div>
                </div>

                {/* Descripción Expandible con Overlay */}
                {showInfo === product.id && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowInfo(null);
                    }}
                    className="absolute inset-0 bg-neutral-900/95 backdrop-blur-md rounded-[2.5rem] p-6 flex flex-col justify-center items-center text-center animate-in fade-in zoom-in-95 duration-300 z-20 cursor-pointer"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowInfo(null);
                      }}
                      className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">
                        close
                      </span>
                    </button>
                    <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">
                      Descripción
                    </p>
                    <p className="text-sm text-neutral-300 leading-relaxed italic">
                      {product.desc}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Barra de Método de Entrega Vertical */}
        <div
          className={`${mobilePanel !== "datos" ? "hidden" : "block"} lg:block bg-neutral-950 border-l border-white/10 p-4 w-full h-full overflow-y-auto`}
        >
          <h2 className="text-xl font-black uppercase tracking-tighter mb-4 ml-1 text-white">
            Método de Entrega
          </h2>

          {/* Botones en Grid Indestructible */}
          <div className="grid grid-cols-2 gap-2 w-full">
            {Object.entries(deliveryLabels).map(([key, { label, icon }]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleDeliveryChange(key)}
                className={`group relative p-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all duration-300 
      flex flex-col items-center justify-center gap-1 border w-full overflow-hidden min-h-[50px] ${
        deliveryMethod === key
          ? "bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-600/20"
          : "bg-neutral-900/50 border-white/5 text-neutral-500 hover:border-white/10 hover:text-neutral-200"
      }`}
              >
                {/* Brillo táctico */}
                {deliveryMethod === key && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                )}

                {/* Icono */}
                <span
                  className={`material-symbols-outlined text-lg transition-transform duration-300 flex-shrink-0 ${
                    deliveryMethod === key
                      ? "scale-110"
                      : "group-hover:scale-110"
                  }`}
                >
                  {icon}
                </span>

                {/* Texto - Quitamos flex-1 y text-left para que el justify-center del padre mande */}
                <span className="leading-none truncate">{label}</span>
              </button>
            ))}
          </div>

          {/* Inputs adicionales según método de entrega */}
          {deliveryMethod === "pickup" && (
            <div className="mt-3 space-y-2">
              <TextField
                label="Nombre"
                value={customerName}
                setValue={setCustomerName}
                placeholder="Ingresa el nombre"
              />
              <TextField
                label="Número"
                value={customerNumber}
                setValue={setCustomerNumber}
                placeholder="Ingresa el número"
                onChange={(e) =>
                  setCustomerNumber(normalizePhoneNumber(e.target.value))
                }
              />
            </div>
          )}

          {deliveryMethod === "table" && (
            <div className="mt-3 space-y-2">
              <TextField
                label="Nombre"
                value={customerName}
                setValue={setCustomerName}
                placeholder="Ingresa el nombre"
              />
              <TextField
                label="Número"
                value={customerNumber}
                setValue={setCustomerNumber}
                placeholder="Ingresa el número"
                onChange={(e) =>
                  setCustomerNumber(normalizePhoneNumber(e.target.value))
                }
              />
              <div>
                <TextField
                  label="Mesa"
                  value={selectedTable}
                  setValue={setSelectedTable}
                  placeholder="Número de mesa"
                />
                <div className="grid grid-cols-5 gap-1 mt-2">
                  {Array.from({ length: 10 }, (_, i) => i + 0).map((num) => (
                    <button
                      key={num}
                      onClick={() => setSelectedTable(num.toString())}
                      className={`p-2 rounded-lg font-bold text-xs border transition-all ${
                        selectedTable === num.toString()
                          ? "bg-violet-600 text-white border-violet-500"
                          : "bg-neutral-900 border-white/5 text-neutral-500 hover:border-white/10"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {deliveryMethod === "delivery" && (
            <div className="mt-3 space-y-2">
              <TextField
                label="Nombre"
                value={customerName}
                setValue={setCustomerName}
                placeholder="Ingresa el nombre"
              />
              <TextField
                label="Número"
                value={customerNumber}
                setValue={setCustomerNumber}
                placeholder="Ingresa el número"
                onChange={(e) =>
                  setCustomerNumber(normalizePhoneNumber(e.target.value))
                }
              />
              <TextField
                label="Dirección"
                value={address}
                setValue={setAddress}
                placeholder="Ingresa la dirección"
              />
              <TextField
                label="Punto de Referencia"
                value={referencePoint}
                setValue={setReferencePoint}
                placeholder="Ingresa el punto de referencia"
              />
            </div>
          )}

          {deliveryMethod === "point" && (
            <div className="mt-3 space-y-2">
              <TextField
                label="Nombre"
                value={customerName}
                setValue={setCustomerName}
                placeholder="Ingresa el nombre"
              />
              <TextField
                label="Número"
                value={customerNumber}
                setValue={setCustomerNumber}
                placeholder="Ingresa el número"
                onChange={(e) =>
                  setCustomerNumber(normalizePhoneNumber(e.target.value))
                }
              />
              <TextField
                label="Ubicación"
                value={locationText}
                setValue={setLocationText}
                placeholder="Ingresa la ubicación"
              />
            </div>
          )}
        </div>

        {/* Carrito Lateral - Contenedor Principal (DESKTOP) */}
        <div className="bg-neutral-950 border-l border-white/10 hidden lg:flex flex-col h-screen overflow-hidden">
          {/* Header: Título y Acción de Limpiar */}
          <div className="p-4 pb-2 flex justify-between items-center flex-shrink-0">
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">
              Resumen
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="group flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-all"
              >
                <span className="material-symbols-outlined text-sm text-neutral-500 group-hover:text-red-500">
                  delete_sweep
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 group-hover:text-red-500">
                  Vaciar
                </span>
              </button>
            )}
          </div>

          {/* Lista de Productos - Scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 custom-scrollbar py-4">
            {cart.map((item) => (
              <div
                key={item.cartId}
                data-cart-id={item.cartId}
                className={`relative border transition-all duration-300 rounded-2xl p-3 mb-2 ${
                  highlightItem === item.cartId
                    ? "bg-violet-600 border-violet-400 shadow-[0_8px_20px_rgba(139,92,246,0.15)] scale-[1.02] z-20"
                    : "bg-neutral-900/40 border-white/5 z-10 hover:border-white/10"
                }`}
              >
                <div className="flex gap-3 items-center">
                  {/* Miniatura / Icono */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                      highlightItem === item.cartId
                        ? "bg-white/20 border-white/20"
                        : "bg-neutral-800 border-white/5"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg opacity-50">
                      image
                    </span>
                  </div>

                  {/* Info del Producto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-[13px] uppercase tracking-tight truncate pr-2 text-white">
                        {item.name}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">
                          close
                        </span>
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      {/* Selector de Cantidad Estilizado */}
                      <div
                        className={`flex items-center gap-2 rounded-lg px-1 border ${
                          highlightItem === item.cartId
                            ? "bg-black/20 border-white/10"
                            : "bg-black/40 border-white/5"
                        }`}
                      >
                        <button
                          onClick={() => updateQty(item.cartId, item.qty - 1)}
                          className="text-white hover:text-violet-400 font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={item.qty}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 0;
                            updateQty(item.cartId, newQty);
                          }}
                          /* Añadimos appearance-none y clases para ocultar flechas en Chrome/Safari/Firefox */
                          className="text-[11px] font-black w-6 text-center bg-transparent border-none outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          onFocus={(e) => e.target.select()}
                          style={{ MozAppearance: "textfield" }} // Esto es para Firefox
                        />
                        <button
                          onClick={() => updateQty(item.cartId, item.qty + 1)}
                          className="text-white hover:text-violet-400 font-bold"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-black text-sm text-white">
                        $ {formatPrice(item.price * item.qty)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nota del Ítem */}
                <button
                  onClick={(e) => openNoteModal(e, item, item.note)}
                  className={`w-full mt-2 text-left p-1.5 rounded-lg border border-dashed transition-all ${
                    item.note
                      ? "bg-violet-500/10 border-violet-500/30"
                      : "border-white/5 hover:bg-white/5"
                  }`}
                >
                  <p
                    className={`text-[9px] font-medium truncate ${item.note ? "text-violet-300" : "text-neutral-500"}`}
                  >
                    {item.note ? `“${item.note}”` : "+ Agregar nota"}
                  </p>
                </button>
              </div>
            ))}
          </div>

          {/* Footer: Totales y Pago */}
          <div className="p-4 bg-neutral-900 border-t border-white/10 mt-auto flex-shrink-0 shadow-[0_-15px_30px_rgba(0,0,0,0.5)]">
            {/* Resumen Numérico */}
            <div className="space-y-1 mb-2">
              <div className="flex justify-between items-center opacity-60 m-0">
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Subtotal
                </span>
                <span className="text-sm font-bold">
                  $ {formatPrice(total)}
                </span>
              </div>

              {(paymentMethod === "efectivo" || paymentMethod === "dividir") &&
                (paidAmount > 0 || assignedTotal > 0) && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      {remainingLabel}
                    </span>
                    <span
                      className={`text-lg font-black ${
                        remaining > 0
                          ? "text-red-500"
                          : remaining < 0
                            ? "text-emerald-500"
                            : "text-violet-400"
                      }`}
                    >
                      $ {remainingDisplay}
                    </span>
                  </div>
                )}

              <div className="flex justify-between items-end">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-500">
                  Total a Pagar
                </span>
                <span className="text-4xl font-black text-white tracking-tighter">
                  $ {formatPrice(total)}
                </span>
              </div>
              {/* Lectura de número */}
              {total > 0 && (
                <p className="text-[10px] text-white text-right mt-1 uppercase  tracking-wider">
                  {numeroALetras(total)}
                </p>
              )}
            </div>

            {/* Métodos de Pago */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">
                  Método de Pago
                </label>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {["efectivo", "tarjeta", "transferencia", "dividir"].map(
                  (method) => (
                    <button
                      key={method}
                      onClick={() => handlePaymentMethodChange(method)}
                      className={`py-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === method
                          ? "bg-violet-600 border-violet-400 shadow-lg shadow-violet-900/40 text-white"
                          : "bg-neutral-950 border-white/5 text-neutral-500 hover:border-white/10"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {paymentLabels[method].icon}
                      </span>
                      <span className="text-[8px] font-black uppercase">
                        {paymentLabels[method].label}
                      </span>
                    </button>
                  ),
                )}
              </div>
              {paymentMethod === "efectivo" && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Etiqueta e Icono */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-violet-400 text-sm">
                            payments
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                            Efectivo
                          </span>
                        </div>
                        <p className="text-[9px] text-neutral-600 font-bold uppercase">
                          Monto recibido
                        </p>
                      </div>

                      {/* Input de Monto Formateado (Sin flechas y con puntos de mil) */}
                      <div className="relative flex-1 max-w-[180px]">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-500 font-black text-sm">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          /* CAMBIO AQUÍ: Si moneyPaid está vacío, mostramos string vacío, de lo contrario formateamos */
                          value={
                            moneyPaid
                              ? Number(moneyPaid).toLocaleString("es-CO")
                              : ""
                          }
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setMoneyPaid(val);
                          }}
                          placeholder="0" // El 0 se verá solo como placeholder (gris bajito)
                          className="w-full bg-neutral-950 border-2 border-white/5 rounded-xl py-3 pl-8 pr-4 text-right text-lg font-black text-white outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-neutral-800 appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Inputs de Pago Dividido */}
              {paymentMethod === "dividir" && (
                <div className="mt-3 space-y-2 max-h-[120px] overflow-y-auto pr-1">
                  {splitPayments.map((pay, index) => (
                    <div
                      key={index}
                      className="flex gap-2 items-center animate-in fade-in zoom-in duration-200"
                    >
                      <select
                        value={pay.method}
                        onChange={(e) =>
                          updateSplitPayment(index, "method", e.target.value)
                        }
                        className="bg-neutral-950 border border-white/10 text-white text-[10px] font-bold rounded-lg p-2 flex-1 outline-none focus:border-violet-500"
                      >
                        <option value="efectivo">EFECTIVO</option>
                        <option value="tarjeta">TARJETA</option>
                        <option value="transferencia">TRANSFERENCIA</option>
                      </select>
                      <div className="relative flex-1">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={pay.amount}
                          onChange={(e) =>
                            updateSplitPayment(index, "amount", e.target.value)
                          }
                          className="w-full bg-neutral-950 border border-white/10 rounded-lg py-2 pl-5 pr-2 text-[11px] font-black text-white outline-none focus:border-violet-500"
                          placeholder="0"
                        />
                      </div>
                      {splitPayments.length > 1 && (
                        <button
                          onClick={() => removePaymentRow(index)}
                          className="text-neutral-600 hover:text-red-500"
                        >
                          <span className="material-symbols-outlined text-base">
                            close
                          </span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {paymentMethod === "dividir" && (
                <button
                  onClick={addPaymentRow}
                  className="text-violet-500 text-[10px] font-black hover:underline"
                >
                  + AÑADIR
                </button>
              )}
            </div>

            {/* Botón de Acción Principal */}
            <button className="w-full bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white font-black py-4 rounded-2xl transition-all uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-violet-900/20">
              Confirmar
            </button>
          </div>
        </div>

        {/* Carrito Lateral - Contenedor Principal (MOBILE) */}
        <div
          className={`${mobilePanel !== "resumen" ? "hidden" : "block"} lg:hidden bg-neutral-950 border-l border-white/10 flex flex-col h-screen overflow-hidden`}
        >
          {/* Header: Título y Acción de Limpiar */}
          <div className="p-4 pb-2 flex justify-between items-center flex-shrink-0">
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">
              Resumen
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="group flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-500/10 transition-all"
              >
                <span className="material-symbols-outlined text-sm text-neutral-500 group-hover:text-red-500">
                  delete_sweep
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 group-hover:text-red-500">
                  Vaciar
                </span>
              </button>
            )}
          </div>

          {/* Lista de Productos - Scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 custom-scrollbar py-4">
            {cart.map((item) => (
              <div
                key={item.cartId}
                data-cart-id={item.cartId}
                className={`relative border transition-all duration-300 rounded-2xl p-3 mb-2 ${
                  highlightItem === item.cartId
                    ? "bg-violet-600 border-violet-400 shadow-[0_8px_20px_rgba(139,92,246,0.15)] scale-[1.02] z-20"
                    : "bg-neutral-900/40 border-white/5 z-10 hover:border-white/10"
                }`}
              >
                <div className="flex gap-3 items-center">
                  {/* Miniatura / Icono */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                      highlightItem === item.cartId
                        ? "bg-white/20 border-white/20"
                        : "bg-neutral-800 border-white/5"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg opacity-50">
                      image
                    </span>
                  </div>

                  {/* Info del Producto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-[13px] uppercase tracking-tight truncate pr-2 text-white">
                        {item.name}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">
                          close
                        </span>
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      {/* Selector de Cantidad Estilizado */}
                      <div
                        className={`flex items-center gap-5 rounded-lg px-1 border ${
                          highlightItem === item.cartId
                            ? "bg-black/20 border-white/10"
                            : "bg-black/40 border-white/5"
                        }`}
                      >
                        <button
                          onClick={() => updateQty(item.cartId, item.qty - 1)}
                          className="text-white hover:text-violet-400 font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={item.qty}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 0;
                            updateQty(item.cartId, newQty);
                          }}
                          className="text-[11px] font-black w-6 text-center bg-transparent border-none outline-none"
                          onFocus={(e) => e.target.select()}
                        />
                        <button
                          onClick={() => updateQty(item.cartId, item.qty + 1)}
                          className="text-white hover:text-violet-400 font-bold"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-black text-sm text-white">
                        $ {formatPrice(item.price * item.qty)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nota del Ítem */}
                <button
                  onClick={(e) => openNoteModal(e, item, item.note)}
                  className={`w-full mt-2 text-left p-1.5 rounded-lg border border-dashed transition-all ${
                    item.note
                      ? "bg-violet-500/10 border-violet-500/30"
                      : "border-white/5 hover:bg-white/5"
                  }`}
                >
                  <p
                    className={`text-[9px] font-medium truncate ${item.note ? "text-violet-300" : "text-neutral-500"}`}
                  >
                    {item.note
                      ? `"${item.note}"`
                      : "+ Agregar instrucción especial"}
                  </p>
                </button>
              </div>
            ))}
          </div>

          {/* Footer: Totales y Pago */}
          <div className="p-4 bg-neutral-900 border-t border-white/10 mt-auto flex-shrink-0 mb-20 shadow-[0_-15px_30px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[50%]">
            {/* Resumen Numérico */}
            <div className="space-y-1 mb-2">
              <div className="flex justify-between items-center opacity-60 m-0">
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Subtotal
                </span>
                <span className="text-sm font-bold">
                  $ {formatPrice(total)}
                </span>
              </div>

              {(paymentMethod === "efectivo" || paymentMethod === "dividir") &&
                (paidAmount > 0 || assignedTotal > 0) && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      {remainingLabel}
                    </span>
                    <span
                      className={`text-lg font-black ${
                        remaining > 0
                          ? "text-red-500"
                          : remaining < 0
                            ? "text-emerald-500"
                            : "text-violet-400"
                      }`}
                    >
                      $ {remainingDisplay}
                    </span>
                  </div>
                )}

              <div className="flex justify-between items-end">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-500">
                  Total a Pagar
                </span>
                <span className="text-2xl font-black text-white tracking-tighter">
                  $ {formatPrice(total)}
                </span>
              </div>
              {/* Lectura de número */}
              {total > 0 && (
                <p className="text-[10px]  text-white text-right mt-1 uppercase tracking-wider">
                  {numeroALetras(total)}
                </p>
              )}
            </div>

            {/* Métodos de Pago */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">
                  Método de Pago
                </label>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {["efectivo", "tarjeta", "transferencia", "dividir"].map(
                  (method) => (
                    <button
                      key={method}
                      onClick={() => handlePaymentMethodChange(method)}
                      className={`py-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === method
                          ? "bg-violet-600 border-violet-400 shadow-lg shadow-violet-900/40 text-white"
                          : "bg-neutral-950 border-white/5 text-neutral-500 hover:border-white/10"
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {paymentLabels[method].icon}
                      </span>
                      <span className="text-[7px] font-black uppercase">
                        {paymentLabels[method].label}
                      </span>
                    </button>
                  ),
                )}
              </div>
              {paymentMethod === "efectivo" && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      {/* Etiqueta e Icono */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-violet-400 text-xs">
                            payments
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">
                            Efectivo
                          </span>
                        </div>
                      </div>

                      {/* Input de Monto */}
                      <div className="relative flex-1 max-w-[120px]">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-violet-500 font-black text-xs">
                          $
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={Number(moneyPaid || 0).toLocaleString("es-CO")}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setMoneyPaid(val);
                          }}
                          placeholder="0"
                          className="w-full bg-neutral-950 border-2 border-white/5 rounded-lg py-2 pl-6 pr-2 text-right text-sm font-black text-white outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-neutral-800 appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {paymentMethod === "dividir" && (
                <div className="mt-2 space-y-1 max-h-[100px] overflow-y-auto pr-1">
                  {splitPayments.map((pay, index) => (
                    <div
                      key={index}
                      className="flex gap-1 items-center animate-in fade-in zoom-in duration-200"
                    >
                      <select
                        value={pay.method}
                        onChange={(e) =>
                          updateSplitPayment(index, "method", e.target.value)
                        }
                        className="bg-neutral-950 border border-white/10 text-white text-[8px] font-bold rounded-lg p-1 flex-1 outline-none focus:border-violet-500"
                      >
                        <option value="efectivo">EFECTIVO</option>
                        <option value="tarjeta">TARJETA</option>
                        <option value="transferencia">TRANSFERENCIA</option>
                      </select>
                      <div className="relative flex-1">
                        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] text-neutral-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={pay.amount}
                          onChange={(e) =>
                            updateSplitPayment(index, "amount", e.target.value)
                          }
                          className="w-full bg-neutral-950 border border-white/10 rounded-lg py-1 pl-4 pr-1 text-[9px] font-black text-white outline-none focus:border-violet-500"
                          placeholder="0.00"
                        />
                      </div>
                      {splitPayments.length > 1 && (
                        <button
                          onClick={() => removePaymentRow(index)}
                          className="text-neutral-600 hover:text-red-500"
                        >
                          <span className="material-symbols-outlined text-sm">
                            close
                          </span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {paymentMethod === "dividir" && (
                <button
                  onClick={addPaymentRow}
                  className="text-violet-500 text-[9px] font-black hover:underline mt-1"
                >
                  + AÑADIR
                </button>
              )}
            </div>

            {/* Botón de Acción Principal */}
            <button className="w-full bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white font-black py-3 rounded-2xl transition-all uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-violet-900/20">
              Finalizar Orden
            </button>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-20 right-0 z-40 bg-neutral-950/80 backdrop-blur-md border-t border-white/10 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "products", icon: "shopping_bag", label: "Productos" },
              { key: "datos", icon: "inventory", label: "Datos" },
              { key: "resumen", icon: "shopping_cart", label: "Resumen" },
            ].map(({ key, icon, label }) => {
              const isActive = mobilePanel === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMobilePanel(key)}
                  className={`relative flex flex-col items-center justify-center  rounded-xl py-2 transition-all duration-200 active:scale-95 ${
                    isActive
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-900/20"
                      : "bg-white/5 text-neutral-500 hover:bg-white/10"
                  }`}
                >
                  {/* Contenedor del Icono + Badge */}
                  <div className="relative">
                    <span
                      className={`material-symbols-outlined text-[22px] transition-transform ${isActive ? "scale-110" : ""}`}
                    >
                      {icon}
                    </span>

                    {/* Badge Flotante Estilizado */}
                    {key === "resumen" && totalItems > 0 && (
                      <span
                        className="absolute -top-1 -right-2.5 min-w-[18px] h-[18px] rounded-full bg-red-600 text-[9px] font-black text-white flex items-center justify-center leading-none"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span className="mt-[0.5px] mr-[1px]">
                          {totalItems}
                        </span>
                      </span>
                    )}
                  </div>

                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-neutral-900 border border-white/10 rounded-[2.5rem] w-full max-w-xs p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-white font-black text-xl uppercase italic mb-1">
                Instrucciones
              </h3>

              {/* NOMBRE DEL PRODUCTO */}
              <p className="text-violet-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-6">
                {activeProduct?.name || "Producto"}
              </p>

              <textarea
                autoFocus
                className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-violet-500 outline-none min-h-[100px] resize-none mb-8 transition-colors"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Nota..."
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setActiveProduct(null);
                  }}
                  className="py-4 text-[10px] font-black uppercase text-neutral-500 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={confirmWithNote}
                  className="py-4 text-[10px] font-black uppercase bg-violet-600 text-white rounded-xl shadow-lg shadow-violet-600/20 hover:bg-violet-500 transition-all"
                >
                  {activeProduct?.cartId ? "Guardar" : "Añadir"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación para limpiar carrito */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-white/10 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-white text-lg font-bold mb-4">
              ¿Estas seguro?
            </h3>
            <p className="text-neutral-400 mb-6">
              ¿Estás seguro de que quieres eliminar todos los productos?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCart([]);
                  setShowConfirmModal(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors"
              >
                Sí, limpiar
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default POS;
