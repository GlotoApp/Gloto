import React, { useState, useRef, useEffect } from "react";
import SplitPaymentModal from "./SplitPaymentModal";
import { supabase } from "../../src/lib/supabaseClient";
import { useAuth } from "../../src/components/AuthContext";

const pasteToField = async (setter) => {
  if (!navigator?.clipboard) return;
  try {
    const text = await navigator.clipboard.readText();
    if (text) setter(text);
  } catch {}
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
    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
      {label}
    </label>
    <div className="relative">
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={onChange ?? ((e) => setValue(e.target.value))}
        placeholder={placeholder}
        className="w-full bg-surface  border-outline rounded-lg p-2 pr-10 text-on-surface text-xs focus:outline-none focus:border-primary"
      />
      <span
        role="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (value) setValue("");
          else pasteToField(setValue);
        }}
        onFocus={() => {
          if (!value) pasteToField(setValue);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
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

const normalizeOptionGroup = (group, items = []) => {
  const isRequired =
    group.is_required ?? group.es_requerido ?? group.required ?? false;
  const selectionType =
    group.selection_type ?? group.selectionType ?? group.type ?? "single";

  const opciones = (items || [])
    .map((item) => ({
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
      precio_extra:
        Number(
          item.precio_extra ??
            item.price ??
            item.price_extra ??
            item.extra_price ??
            0,
        ) || 0,
      obligatorio:
        item.es_opcion_obligatoria ??
        item.mandatory ??
        item.is_mandatory ??
        item.required ??
        item.is_required ??
        false,
      order: Number(item.order_index ?? item.order ?? 0),
    }))
    .sort((a, b) => a.order - b.order);

  return {
    id: group.id,
    nombre: group.name || group.nombre || group.title || `Grupo ${group.id}`,
    descripcion: group.description || group.descripcion || group.hint || "",
    obligatorio: Boolean(isRequired),
    selectionType,
    order: Number(group.order_index ?? group.orderIndex ?? group.order ?? 0),
    opciones,
  };
};

const initializeOptionSelections = (product) => {
  const selections = {};
  (product.optionGroups || []).forEach((group) => {
    const includedOptions = (group.opciones || []).filter(
      (option) => Number(option.precio_extra || 0) === 0,
    );

    if (group.selectionType === "multiple") {
      selections[group.id] = includedOptions.map((option) => option.id);
    } else {
      const defaultOption = includedOptions[0] || group.opciones?.[0] || null;
      selections[group.id] = defaultOption?.id || null;
    }
  });
  return selections;
};

const getSelectedOptionItems = (product, selections) => {
  if (!product || !product.optionGroups) return [];
  return product.optionGroups.flatMap((group) => {
    const selected = selections[group.id];
    if (group.selectionType === "multiple") {
      return (Array.isArray(selected) ? selected : [])
        .map((optionId) => group.opciones.find((opt) => opt.id === optionId))
        .filter(Boolean);
    }
    const option = group.opciones.find((opt) => opt.id === selected);
    return option ? [option] : [];
  });
};

const getOptionIdsKey = (selectedOptions) =>
  selectedOptions
    .map((opt) => opt.id)
    .filter(Boolean)
    .sort()
    .join("__") || null;

const getOptionNames = (selectedOptions) =>
  selectedOptions.map((opt) => opt.nombre).filter(Boolean);

const getOptionExtraPrice = (selectedOptions) =>
  selectedOptions.reduce((sum, opt) => sum + (opt.precio_extra || 0), 0);

const createCartItemFromSelection = (
  product,
  selectedOptions,
  note,
  qty = 1,
) => {
  const optionIdsKey = getOptionIdsKey(selectedOptions);
  const optionNames = getOptionNames(selectedOptions);
  const extraPrice = getOptionExtraPrice(selectedOptions);
  const cartId = Date.now();

  return {
    ...product,
    id: product.id,
    productId: product.id,
    cartId,
    qty,
    note: note?.trim() || "",
    optionIdsKey,
    optionNames,
    selectedOptions,
    price: Number(product.price || 0) + extraPrice,
    name: product.name,
    image_url: product.image_url || product.image || product.imageUrl || "",
  };
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
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [removingItems, setRemovingItems] = useState(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [optionModalOpen, setOptionModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [optionSelections, setOptionSelections] = useState({});
  const [optionNote, setOptionNote] = useState("");
  const [optionQuantity, setOptionQuantity] = useState(1);
  const [optionValidationError, setOptionValidationError] = useState("");
  const [instruction, setInstruction] = useState("");
  const [showInfo, setShowInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobilePanel, setMobilePanel] = useState("products");
  const [toastItems, setToastItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: "all", name: "Todo" }]);
  const [categoryMap, setCategoryMap] = useState({});
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [businessId, setBusinessId] = useState(null);
  const toastTimers = useRef({});
  const cartScrollRef = useRef(null);
  const cartScrollRefMobile = useRef(null);
  const tableInputRef = useRef(null);
  const modalOverlayRef = useRef(null);
  const prevActiveElRef = useRef(null);

  useEffect(() => {
    if (!isModalOpen) return;
    prevActiveElRef.current = document.activeElement;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setActiveProduct(null);
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const ta = document.getElementById("instruction-textarea");
    if (ta) ta.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      try {
        prevActiveElRef.current?.focus?.();
      } catch {}
    };
  }, [isModalOpen]);

  const fetchCategoriesForBusiness = async (businessId) => {
    try {
      const { data, error } = await supabase
        .from("categories_shop")
        .select("id,name")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (error) {
        console.error("Error cargando categorías:", error);
        return { categories: [{ id: "all", name: "Todo" }], categoryMap: {} };
      }

      const categoryOptions = [
        { id: "all", name: "Todo" },
        ...(data || []).map((item) => ({ id: item.id, name: item.name })),
      ];
      const categoryMapResult = (data || []).reduce((acc, item) => {
        acc[item.id] = item.name;
        return acc;
      }, {});

      setCategories(categoryOptions);
      setCategoryMap(categoryMapResult);
      return { categories: categoryOptions, categoryMap: categoryMapResult };
    } catch (error) {
      console.error("Error cargando categorías:", error);
      return { categories: [{ id: "all", name: "Todo" }], categoryMap: {} };
    }
  };

  const fetchProductsForBusiness = async (businessId, categoryMap = {}) => {
    setIsLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id,name,description,price,stock,image_url,is_active,category_id",
        )
        .eq("business_id", businessId)
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error cargando productos:", error);
        setProducts([]);
        return;
      }

      let optionGroupsByProduct = {};
      if ((data || []).length > 0) {
        const productIds = data.map((item) => item.id);
        const [groupsRes, itemsRes] = await Promise.all([
          supabase
            .from("product_option_groups")
            .select("*")
            .in("product_id", productIds)
            .order("order_index", { ascending: true }),
          supabase
            .from("products_items")
            .select("*")
            .in("product_id", productIds)
            .order("order_index", { ascending: true }),
        ]);

        if (itemsRes.error) {
          console.error("Error cargando opciones de producto:", itemsRes.error);
        }
        if (groupsRes.error) {
          console.error("Error cargando grupos de opciones:", groupsRes.error);
        }

        const itemsByGroup = {};
        (itemsRes.data || []).forEach((item) => {
          const groupId = item.option_group_id;
          if (!groupId) return;
          itemsByGroup[groupId] = itemsByGroup[groupId] || [];
          itemsByGroup[groupId].push(item);
        });

        const groupsByProduct = {};
        (groupsRes.data || []).forEach((group) => {
          const productId = group.product_id;
          groupsByProduct[productId] = groupsByProduct[productId] || [];
          groupsByProduct[productId].push(
            normalizeOptionGroup(group, itemsByGroup[group.id] || []),
          );
        });

        optionGroupsByProduct = groupsByProduct;
      }

      setProducts(
        (data || []).map((item) => {
          const groups = optionGroupsByProduct[item.id] || [];
          const productDescription = item.description || item.desc || "";
          return {
            id: item.id,
            productId: item.id,
            name: item.name,
            category: item.category_id || "otros",
            categoryName: categoryMap[item.category_id] || "Otros",
            price: Number(item.price || 0),
            description: productDescription,
            desc: productDescription,
            image_url: item.image_url || item.image || item.imageUrl || "",
            optionGroups: groups,
            hasOptionGroups: groups.length > 0,
          };
        }),
      );
    } catch (error) {
      console.error("Error cargando productos:", error);
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error cargando perfil:", error);
        return;
      }

      if (profile?.business_id) {
        setBusinessId(profile.business_id);
        const { categoryMap: fetchedCategoryMap } =
          await fetchCategoriesForBusiness(profile.business_id);
        await fetchProductsForBusiness(profile.business_id, fetchedCategoryMap);
      }
    };

    loadProfile();
  }, [user]);

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

  // Función para autorellenar campos de entrega
  const autoFillDeliveryFields = () => {
    setCustomerName("Consumidor Final");
    setCustomerNumber("2222222222");
  };

  const [splitPayments, setSplitPayments] = useState([
    { method: "", amount: "" },
  ]);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [numSplits, setNumSplits] = useState(2);

  // Función para inicializar divisiones - Mantiene valores existentes
  const initializeSplits = (count) => {
    setSplitPayments((prevPayments) => {
      if (count > prevPayments.length) {
        // Si aumenta el número, agrega nuevos splits vacíos
        const newSplits = [...prevPayments];
        for (let i = prevPayments.length; i < count; i++) {
          newSplits.push({
            method: "",
            amount: "",
          });
        }
        return newSplits;
      } else if (count < prevPayments.length) {
        // Si disminuye el número, remove los últimos splits
        return prevPayments.slice(0, count);
      }
      // Si el número es igual, no hace nada
      return prevPayments;
    });
    setNumSplits(count);
  };

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

    if (product?.hasOptionGroups) {
      setActiveProduct(product);
      setOptionSelections(initializeOptionSelections(product));
      setOptionNote("");
      setOptionQuantity(1);
      setOptionValidationError("");
      setOptionModalOpen(true);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) =>
          item.productId === product.id && !item.optionIdsKey && !item.note,
      );

      if (existingItem) {
        // Efectos visuales de resaltado
        setHighlightItem(existingItem.cartId);
        // Scroll automático al item
        setTimeout(() => {
          const element = document.querySelector(
            `[data-cart-id="${existingItem.cartId}"]`,
          );
          if (element && cartScrollRef.current) {
            cartScrollRef.current.scrollTop = element.offsetTop - 100;
          }
          if (element && cartScrollRefMobile.current) {
            cartScrollRefMobile.current.scrollTop = element.offsetTop - 100;
          }
        }, 0);
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
      // Scroll automático al item nuevo (al final del carrito)
      setTimeout(() => {
        const element = document.querySelector(`[data-cart-id="${cartId}"]`);
        if (element && cartScrollRef.current) {
          cartScrollRef.current.scrollTop = cartScrollRef.current.scrollHeight;
        }
        if (element && cartScrollRefMobile.current) {
          cartScrollRefMobile.current.scrollTop =
            cartScrollRefMobile.current.scrollHeight;
        }
      }, 0);
      setTimeout(() => setHighlightItem(null), 500);

      return [
        ...prevCart,
        {
          ...product,
          productId: product.id,
          cartId,
          qty: 1,
          note: "",
          image_url:
            product.image_url || product.image || product.imageUrl || "",
        },
      ];
    });
  };

  const clearCart = () => {
    if (cart.length > 0) {
      setShowConfirmModal(true);
    }
  };

  const openNoteModal = (e, product, existingNote = "") => {
    e.stopPropagation();
    if (product?.cartId) {
      setActiveProduct(product);
      setInstruction(existingNote);
      setIsModalOpen(true);
      return;
    }
    if (product?.hasOptionGroups) {
      setActiveProduct(product);
      setOptionSelections(initializeOptionSelections(product));
      setOptionNote(existingNote);
      setOptionValidationError("");
      setOptionModalOpen(true);
      return;
    }
    setActiveProduct(product);
    setInstruction(existingNote);
    setIsModalOpen(true);
  };

  const confirmOptionSelection = () => {
    if (!activeProduct) return;
    const selectedOptions = getSelectedOptionItems(
      activeProduct,
      optionSelections,
    );

    const missingRequired = (activeProduct.optionGroups || []).some((group) => {
      if (!group.obligatorio) return false;
      const selected = optionSelections[group.id];
      if (group.selectionType === "multiple") {
        return !Array.isArray(selected) || selected.length === 0;
      }
      return !selected;
    });

    if (missingRequired) {
      setOptionValidationError("Selecciona todas las opciones obligatorias.");
      return;
    }

    const newItem = createCartItemFromSelection(
      activeProduct,
      selectedOptions,
      optionNote,
      optionQuantity,
    );

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) =>
          item.productId === newItem.productId &&
          item.optionIdsKey === newItem.optionIdsKey &&
          item.note === newItem.note,
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.cartId === existingItem.cartId
            ? { ...item, qty: item.qty + optionQuantity }
            : item,
        );
      }

      return [...prevCart, newItem];
    });

    setOptionModalOpen(false);
    setActiveProduct(null);
    setOptionSelections({});
    setOptionNote("");
    setOptionValidationError("");
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

  const handleQtyInputChange = (cartId, value) => {
    const digits = String(value).replace(/\D/g, "");
    const qty = digits ? Math.max(1, Number(digits)) : 1;
    updateQty(cartId, qty);
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
      // If switching to dividir, show modal
      if (newMethod === "dividir") {
        initializeSplits(2);
        setShowSplitModal(true);
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

  const activeProductSelectedOptions = getSelectedOptionItems(
    activeProduct,
    optionSelections,
  );
  const activeProductSelectedPrice =
    Number(activeProduct?.price || 0) +
    getOptionExtraPrice(activeProductSelectedOptions);

  // Componente único de "División de Pago" reutilizable
  const splitPaymentPreview =
    paymentMethod === "dividir" && splitPayments.some((p) => p.amount) ? (
      <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="rounded-2xl border border-primary/30 bg-primary-container/10 p-4 my-3">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant mb-2">
                División de Pago
              </p>
              <div className="space-y-1">
                {splitPayments.map(
                  (pay, index) =>
                    pay.amount && (
                      <div
                        key={index}
                        className="flex justify-between items-center text-[9px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-primary-container text-on-surface text-[7px] font-black flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-on-surface-variant">
                            {pay.method.toUpperCase()}
                          </span>
                        </div>
                        <span className="font-black text-on-surface">
                          ${formatPrice(parseFloat(pay.amount) || 0)}
                        </span>
                      </div>
                    ),
                )}
              </div>
            </div>
            <button
              onClick={() => setShowSplitModal(true)}
              className="text-on-surface-variant hover:text-primary transition-colors flex-shrink-0"
              title="Editar división"
            >
              <span className="material-symbols-outlined text-[14px] leading-none">
                edit
              </span>
            </button>
          </div>
        </div>
      </div>
    ) : null;

  // Sección única de "Métodos de Pago" reutilizable para desktop y mobile
  const paymentMethodsSection = (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">
          Método de Pago
        </label>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {["efectivo", "tarjeta", "transferencia", "dividir"].map((method) => (
          <button
            key={method}
            onClick={() => handlePaymentMethodChange(method)}
            className={`py-2 lg:py-3 rounded-xl  flex flex-col items-center gap-1 transition-all ${
              paymentMethod === method
                ? "bg-primary-container border-primary shadow-lg shadow-primary-container/40 text-on-surface"
                : "bg-background border-outline text-on-surface-variant hover:border-outline"
            }`}
          >
            <span className="material-symbols-outlined text-base lg:text-lg">
              {paymentLabels[method].icon}
            </span>
            <span className="text-[7px] lg:text-[8px] font-black uppercase">
              {paymentLabels[method].label}
            </span>
          </button>
        ))}
      </div>
      {paymentMethod === "efectivo" && (
        <div className="mt-2 lg:mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-3 lg:p-4">
            <div className="flex items-center justify-between gap-2 lg:gap-4">
              {/* Etiqueta e Icono */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xs lg:text-sm">
                    payments
                  </span>
                  <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
                    Efectivo
                  </span>
                </div>
                <p className="text-[8px] lg:text-[9px] text-on-surface-variant font-bold uppercase hidden lg:block">
                  Monto recibido
                </p>
              </div>

              {/* Input de Monto */}
              <div className="relative flex-1 max-w-[120px] lg:max-w-[180px]">
                <span className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 text-primary font-black text-xs lg:text-sm">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    moneyPaid ? Number(moneyPaid).toLocaleString("es-CO") : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setMoneyPaid(val);
                  }}
                  placeholder="0"
                  className="w-full bg-background border-2 border-outline rounded-lg lg:rounded-xl py-2 lg:py-3 pl-6 lg:pl-8 pr-2 lg:pr-4 text-right text-sm lg:text-lg font-black text-on-surface outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant appearance-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 h-screen bg-background font-sans selection:bg-primary-container/30 pb-20 lg:pb-0">
        {/* Stacked product toasts - mobile only */}
        {/* Contenedor de Toasts con Orden Invertido - Mobile */}
        <div className="lg:hidden fixed top-6 left-0 right-0 z-50 flex flex-col-reverse items-center gap-2 pointer-events-none px-6">
          {toastItems.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-3 rounded-3xl border border-success/20 bg-success/90 backdrop-blur-md px-5 py-3 text-on-surface shadow-xl transition-all duration-400 ${
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
              <span className="text-[11px] font-black uppercase tracking-wider">
                {toast.name}
              </span>
              <span className="material-symbols-outlined text-base text-fff">
                check_circle
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
          className={`${mobilePanel !== "products" ? "hidden" : "block"} lg:block lg:col-span-2 overflow-y-auto  custom-sidebar`}
        >
          {/* Buscador Inteligente */}
          <div className="p-4 pb-0 sticky top-0 bg-background/90 backdrop-blur-md z-20">
            <h2 className="text-xl font-black uppercase tracking-tighter mb-2 ml-2 text-on-surface">
              Productos
            </h2>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
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
                className="w-full bg-surface rounded-2xl py-2 pl-12 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all "
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-sm mt-2">
                    close
                  </span>
                </button>
              )}
            </div>
            <div className="flex gap-2 p-2 sticky top-0 bg-background/90 backdrop-blur-md z-10 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide no-scrollbar mt-2">
              {isLoadingProducts
                ? [...Array(8)].map((_, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 h-10 w-24 rounded-xl bg-surface-hover/50 animate-pulse"
                    />
                  ))
                : categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSearchTerm("");
                      }}
                      className={`flex-shrink-0 py-2 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                        selectedCategory === cat.id
                          ? "bg-primary-container text-on-surface shadow-lg shadow-primary-container/20"
                          : "bg-surface text-on-surface-variant hover:bg-surface-hover hover:text-on-surface"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col p-4">
            {isLoadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                {[...Array(8)].map((_, idx) => (
                  <div
                    key={idx}
                    className="group relative bg-surface rounded-[2.5rem] p-3 flex flex-col animate-pulse"
                  >
                    <div className="bg-surface-hover/50 rounded-[1.8rem] h-32 mb-4 border border-outline/[0.03]" />
                    <div className="px-1 flex-1">
                      <div className="h-4 bg-white/10 rounded-full w-3/4 mb-3" />
                      <div className="h-5 bg-white/10 rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">
                  search_off
                </span>
                <div className="text-center">
                  <p className="text-on-surface-variant font-bold text-sm uppercase tracking-wide">
                    No se encontraron productos
                  </p>
                  <p className="text-on-surface-variant/60 text-xs mt-1">
                    Intenta con otra búsqueda o categoría
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="group relative bg-surface  rounded-[25px] hover:bg-surface-hover/50 hover:border-primary-container/40 transition-all duration-500 cursor-pointer flex flex-col active:scale-[0.97]"
                  >
                    {/* Botón Info - Elevado con Glassmorphism */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowInfo(
                          showInfo === product.id ? null : product.id,
                        );
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 bg-primary-container/50 text-primary border-primary/30 hover:bg-primary-container hover:text-on-surface z-10"
                    >
                      <span className="material-symbols-outlined text-sm">
                        info
                      </span>
                    </button>

                    {/* Contenedor del icono image */}
                    <div className="bg-surface-hover/50 rounded-t-[1.8rem] h-32  flex items-center justify-center border border-outline/[0.03] overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant group-hover:text-primary group-hover:scale-110 transition-all duration-500">
                          image
                        </span>
                      )}
                    </div>

                    {/* Información de Producto */}
                    <div className="px-1">
                      <p className="font-bold text-on-surface text-sl px-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </p>

                      <div className="flex items-center justify-between  pr-2 pl-2 pb-2">
                        <p className="text-primary font-black text-ml md:text-lg tracking-tight">
                          $ {formatPrice(product.price)}
                        </p>
                        <button
                          onClick={(e) => openNoteModal(e, product)}
                          className="w-5 h-5 flex items-center justify-center text-on-surface-variant hover:text-primary-container transition-colors "
                        >
                          <span className="material-symbols-outlined text-xl">
                            add_notes
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Info button only (modal rendered globally) */}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Modal centrado para descripción de producto */}
        {showInfo &&
          (() => {
            const prod =
              products.find((p) => p.id === showInfo) ||
              filteredProducts.find((p) => p.id === showInfo) ||
              null;

            if (!prod) return null;

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-black/60"
                  onClick={() => setShowInfo(null)}
                />

                <div
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-10 w-full max-w-3xl bg-surface/95 backdrop-blur-md rounded-2xl p-6 overflow-auto max-h-[80vh]"
                >
                  <button
                    onClick={() => setShowInfo(null)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface bg-background/20 hover:bg-background/40 rounded-full transition-all"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>

                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                    Descripción
                  </p>
                  <p className="text-sm text-on-surface leading-relaxed italic">
                    {prod.desc}
                  </p>
                </div>
              </div>
            );
          })()}

        {/* Barra de Método de Entrega Vertical */}
        <div
          className={`${mobilePanel !== "datos" ? "hidden" : "block"} lg:block bg-background border-l border-outline p-4 w-full h-full overflow-y-auto custom-sidebar`}
        >
          <h2 className="text-xl font-black uppercase tracking-tighter mb-4 ml-1 text-on-surface">
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
      flex flex-col items-center justify-center gap-1  w-full overflow-hidden min-h-[50px] ${
        deliveryMethod === key
          ? "bg-primary-container text-on-surface border-primary shadow-lg shadow-primary-container/20"
          : "bg-surface/100 border-outline text-on-surface-variant hover:border-outline hover:text-on-surface"
      }`}
              >
                {/* Brillo táctico */}
                {deliveryMethod === key && (
                  <div className="absolute inset-0  to-transparent pointer-events-none" />
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
              <button
                onClick={autoFillDeliveryFields}
                className="w-full py-2 px-3 rounded-lg border-2 border-dashed border-primary/50 hover:border-primary text-primary font-bold text-xs uppercase tracking-wider transition-all hover:bg-primary/10 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">
                  auto_fix_high
                </span>
                Autorellenar
              </button>
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
              <button
                onClick={autoFillDeliveryFields}
                className="w-full py-2 px-3 rounded-lg border-2 border-dashed border-primary/50 hover:border-primary text-primary font-bold text-xs uppercase tracking-wider transition-all hover:bg-primary/10 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">
                  auto_fix_high
                </span>
                Autorellenar
              </button>
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
                  inputRef={tableInputRef}
                />
                <div className="grid grid-cols-5 gap-1 mt-2">
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => setSelectedTable(num.toString())}
                      className={`p-2 rounded-lg font-bold text-xs  transition-all ${
                        selectedTable === num.toString()
                          ? "bg-primary-container text-on-surface border-primary"
                          : "bg-surface border-outline text-on-surface-variant hover:border-outline"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => tableInputRef.current?.focus()}
                    className=" rounded-lg font-bold text-xs transition-all bg-primary-container/20  text-primary hover:bg-primary-container hover:text-on-surface hover:border-primary"
                    title="Agregar mesa con número mayor a 9"
                  >
                    <span className="material-symbols-outlined text-base">
                      add
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {deliveryMethod === "delivery" && (
            <div className="mt-3 space-y-2">
              <button
                onClick={autoFillDeliveryFields}
                className="w-full py-2 px-3 rounded-lg border-2 border-dashed border-primary/50 hover:border-primary text-primary font-bold text-xs uppercase tracking-wider transition-all hover:bg-primary/10 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">
                  auto_fix_high
                </span>
                Autorellenar
              </button>
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

              {/* Mapa Ilustrativo */}
              <div className="w-full h-48 rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-800 border border-outline flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect fill=%22%23262626%22 width=%22100%22 height=%22100%22/%3E%3Cpath d=%22M0 0h100M0 50h100M0 100h100M0 0v100M50 0v100M100 0v100%22 stroke=%22%23404040%22 stroke-width=%220.5%22/%3E%3C/svg%3E')] opacity-10"></div>
                <div className="flex flex-col items-center gap-2 z-10">
                  <span className="material-symbols-outlined text-4xl text-neutral-400">
                    location_on
                  </span>
                  <p className="text-xs text-neutral-400 font-medium">
                    Mapa (próximamente)
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    Google Maps o Leaflet
                  </p>
                </div>
              </div>

              {/* Tarjeta de Información de Envío */}
              <div className="w-full bg-primary-container/10 border border-primary-container/30 rounded-lg p-3 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-on-surface-variant">
                    COSTO FINAL
                  </span>
                  <span className="text-sm font-black text-primary">
                    $5.000
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-on-surface-variant">
                    COSTO BASE
                  </span>
                  <span className="text-[10px] font-black text-on-surface">
                    $4.850
                  </span>
                </div>
                <div className="h-px bg-primary-container/20"></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase">
                      Distancia
                    </p>
                    <p className="text-xs font-black text-on-surface">
                      1.850 m
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-right font-bold text-on-surface-variant uppercase">
                      Kilómetros
                    </p>
                    <p className="text-xs text-right font-black text-on-surface">
                      1.85 km
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {deliveryMethod === "point" && (
            <div className="mt-3 space-y-2">
              <button
                onClick={autoFillDeliveryFields}
                className="w-full py-2 px-3 rounded-lg border-2 border-dashed border-primary/50 hover:border-primary text-primary font-bold text-xs uppercase tracking-wider transition-all hover:bg-primary/10 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">
                  auto_fix_high
                </span>
                Autorellenar
              </button>
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
        <div className="bg-background border-l border-outline hidden lg:flex flex-col h-screen overflow-hidden">
          {/* Header: Título y Acción de Limpiar */}
          <div className="p-4 pb-2 flex justify-between items-center flex-shrink-0">
            <h2 className="text-xl font-black uppercase tracking-tighter text-on-surface">
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
          <div
            ref={cartScrollRef}
            className="flex-1 min-h-0 overflow-y-auto px-4 custom-sidebar py-4"
          >
            {cart.map((item) => (
              <div
                key={item.cartId}
                data-cart-id={item.cartId}
                className={`relative border transition-all duration-300 rounded-2xl p-2 mb-2 ${
                  removingItems.has(item.cartId)
                    ? "opacity-0 scale-95 -translate-x-4"
                    : highlightItem === item.cartId
                      ? "bg-violet-600 border-violet-400 shadow-[0_8px_20px_rgba(139,92,246,0.15)] scale-[1.02] z-20"
                      : "bg-neutral-900/40 border-white/5 z-10 hover:border-white/10"
                }`}
              >
                <div className="flex gap-3 items-center min-w-0">
                  {/* Miniatura / Imagen real del producto */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
                      highlightItem === item.cartId
                        ? "bg-white/20 border-white/20"
                        : "bg-neutral-800 border-white/5"
                    }`}
                  >
                    {item.image_url || item.image || item.imageUrl ? (
                      <img
                        src={item.image_url || item.image || item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-lg opacity-50">
                        image
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-[13px] uppercase tracking-tight text-white leading-tight truncate">
                        {item.name}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="opacity-40 hover:opacity-100 hover:text-red-500 transition-all flex-shrink-0 mt-0.5"
                        aria-label="Eliminar producto"
                      >
                        <span className="material-symbols-outlined text-sm">
                          close
                        </span>
                      </button>
                    </div>

                    {item.selectedOptions &&
                      item.selectedOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.selectedOptions.map((opt, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-bold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full"
                            >
                              {opt.nombre}
                              {opt.precio_extra > 0
                                ? ` (+$${formatPrice(opt.precio_extra)})`
                                : ""}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-3">
                  <div
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 flex-shrink-0 ${
                      highlightItem === item.cartId
                        ? "bg-background/20"
                        : "bg-neutral-800/80"
                    }`}
                  >
                    <button
                      onClick={() => updateQty(item.cartId, item.qty - 1)}
                      className="opacity-60 hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded-full hover:text-primary-container"
                      aria-label="Disminuir cantidad"
                    >
                      <span className="material-symbols-outlined text-xs">
                        remove
                      </span>
                    </button>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={item.qty}
                      onChange={(e) =>
                        handleQtyInputChange(item.cartId, e.target.value)
                      }
                      className="w-8 bg-transparent text-center text-[16px] font-black text-on-surface outline-none appearance-none"
                      aria-label="Cantidad del producto"
                    />
                    <button
                      onClick={() => updateQty(item.cartId, item.qty + 1)}
                      className="opacity-60 hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded-full hover:text-primary-container"
                      aria-label="Aumentar cantidad"
                    >
                      <span className="material-symbols-outlined text-xs">
                        add
                      </span>
                    </button>
                  </div>
                  <p className="font-black text-[16px] text-white">
                    $ {formatPrice(item.price * item.qty)}
                  </p>
                </div>

                {/* Nota del Ítem */}
                <button
                  onClick={(e) => openNoteModal(e, item, item.note)}
                  className={`w-full mt-3 text-left p-1.5 rounded-lg border border-dashed transition-all ${
                    item.note
                      ? "bg-violet-500/10 border-violet-500/30"
                      : "border-white/5 hover:bg-white/5"
                  }`}
                >
                  <p
                    className={`text-[9px] font-medium truncate ${item.note ? "text-violet-300 italic" : "text-neutral-500"}`}
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
          <div className="p-4 bg-surface border-t border-outline mt-auto flex-shrink-0 shadow-[0_-15px_30px_rgba(0,0,0,0.5)]">
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
                <span className="text-2xl font-black text-on-surface tracking-tighter">
                  $ {formatPrice(total)}
                </span>
              </div>
              {/* Lectura de número */}
              {total > 0 && (
                <p className="text-[7px] text-on-surface text-right mt-1 uppercase  tracking-wider">
                  {numeroALetras(total)}
                </p>
              )}
            </div>

            {/* Métodos de Pago */}
            {paymentMethodsSection}

            {splitPaymentPreview}

            {/* Botón de Acción Principal */}
            <button className="w-full bg-primary-container hover:bg-success active:scale-[0.98] text-on-surface font-black py-4 rounded-2xl transition-all uppercase text-[11px] tracking-[0.2em] ">
              Confirmar
            </button>
          </div>
        </div>

        {/* Carrito Lateral - Contenedor Principal (MOBILE) */}
        <div
          className={`${mobilePanel !== "resumen" ? "hidden" : "block"} lg:hidden bg-background border-l border-outline flex flex-col h-screen overflow-hidden`}
        >
          {/* Header: Título y Acción de Limpiar */}
          <div className="p-4 pb-2 flex justify-between items-center flex-shrink-0">
            <h2 className="text-xl font-black uppercase tracking-tighter text-on-surface">
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
          <div
            ref={cartScrollRefMobile}
            className="flex-1 min-h-0 overflow-y-auto px-4 custom-sidebar py-4 space-y-2"
          >
            {cart.map((item) => {
              const isHighlighted = highlightItem === item.cartId;
              const isRemoving = removingItems.has(item.cartId);

              return (
                <div
                  key={item.cartId}
                  data-cart-id={item.cartId}
                  className={`relative border transition-all duration-300 rounded-2xl p-2 ${
                    isRemoving
                      ? "opacity-0 scale-95 -translate-x-4"
                      : isHighlighted
                        ? "bg-violet-600 border-violet-400 shadow-[0_8px_20px_rgba(139,92,246,0.15)] scale-[1.02] z-20"
                        : "bg-neutral-900/40 border-white/5 z-10 hover:border-white/10"
                  }`}
                >
                  <div className="flex gap-3 items-center min-w-0">
                    {/* Miniatura / Imagen real del producto */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
                        isHighlighted
                          ? "bg-white/20 border-white/20"
                          : "bg-neutral-800 border-white/5"
                      }`}
                    >
                      {item.image_url || item.image || item.imageUrl ? (
                        <img
                          src={item.image_url || item.image || item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-lg opacity-50">
                          image
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-[13px] uppercase tracking-tight text-white leading-tight truncate">
                          {item.name}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.cartId)}
                          className="opacity-40 hover:opacity-100 hover:text-red-500 transition-all flex-shrink-0 mt-0.5"
                          aria-label="Eliminar producto"
                        >
                          <span className="material-symbols-outlined text-sm">
                            close
                          </span>
                        </button>
                      </div>

                      {item.selectedOptions &&
                        item.selectedOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.selectedOptions.map((opt, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-bold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full"
                              >
                                {opt.nombre}
                                {opt.precio_extra > 0
                                  ? ` (+$${formatPrice(opt.precio_extra)})`
                                  : ""}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-3">
                    <div
                      className={`flex items-center gap-1 rounded-lg px-2 py-1 flex-shrink-0 ${
                        isHighlighted ? "bg-background/20" : "bg-neutral-800/80"
                      }`}
                    >
                      <button
                        onClick={() => updateQty(item.cartId, item.qty - 1)}
                        className="opacity-60 hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded-full hover:text-primary-container"
                        aria-label="Disminuir cantidad"
                      >
                        <span className="material-symbols-outlined text-xs">
                          remove
                        </span>
                      </button>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={item.qty}
                        onChange={(e) =>
                          handleQtyInputChange(item.cartId, e.target.value)
                        }
                        className="w-5 bg-transparent text-center text-[16px] font-black text-on-surface outline-none appearance-none"
                        aria-label="Cantidad del producto"
                      />
                      <button
                        onClick={() => updateQty(item.cartId, item.qty + 1)}
                        className="opacity-60 hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded-full hover:text-primary-container"
                        aria-label="Aumentar cantidad"
                      >
                        <span className="material-symbols-outlined text-xs">
                          add
                        </span>
                      </button>
                    </div>

                    <p className="font-black text-[16px] text-white">
                      $ {formatPrice(item.price * item.qty)}
                    </p>
                  </div>

                  {/* Nota del Ítem */}
                  <button
                    onClick={(e) => openNoteModal(e, item, item.note)}
                    className={`w-full mt-3 text-left p-1.5 rounded-lg border border-dashed transition-all ${
                      item.note
                        ? "bg-violet-500/10 border-violet-500/30"
                        : "border-white/5 hover:bg-white/5"
                    }`}
                  >
                    <p
                      className={`text-[9px] font-medium truncate ${
                        item.note
                          ? "text-violet-300 italic"
                          : "text-neutral-500"
                      }`}
                    >
                      {item.note
                        ? `"${item.note}"`
                        : "+ Agregar instrucción especial"}
                    </p>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer: Totales y Pago */}
          <div className="p-4 bg-surface border-t border-outline mt-auto flex-shrink-0 mb-20 shadow-[0_-15px_30px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[50%] custom-sidebar">
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
                <span className="text-2xl font-black text-on-surface tracking-tighter">
                  $ {formatPrice(total)}
                </span>
              </div>
              {/* Lectura de número */}
              {total > 0 && (
                <p className="text-[10px]  text-on-surface text-right mt-1 uppercase tracking-wider">
                  {numeroALetras(total)}
                </p>
              )}
            </div>

            {/* Métodos de Pago */}
            {paymentMethodsSection}

            {/* Preview de División de Pagos */}
            {splitPaymentPreview}

            {/* Botón de Acción Principal */}
            <button className="w-full bg-primary-container hover:bg-success active:scale-[0.98] text-on-surface font-black py-3 rounded-2xl transition-all uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-primary-container/20">
              Finalizar
            </button>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-20 right-0 z-40 bg-background/80 backdrop-blur-md border-l border-outline px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
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
                      ? "bg-primary-container text-on-surface shadow-lg shadow-primary-container/20"
                      : "bg-on-surface/5 text-on-surface-variant hover:bg-on-surface/10"
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

                  <span className="text-[9px] font-black uppercase tracking-widest text-on-surface">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative isolate bg-surface  rounded-[25px] w-full max-w-md p-6 md:p-7 shadow-2xl shadow-background/60 animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
              {/* Header compacto */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-primary font-label-caps text-lg font-black uppercase tracking-[0.15em] truncate">
                    {activeProduct?.name || "Producto"}
                  </p>
                  <h3 className="text-on-surface font-h2 font-black text-xs uppercase italic tracking-tight">
                    Instrucciones
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setActiveProduct(null);
                  }}
                  className="text-on-surface-variant hover:text-on-surface"
                  aria-label="Cerrar instrucciones"
                >
                  <span className="material-symbols-outlined text-xl">
                    close
                  </span>
                </button>
              </div>

              {/* Textarea */}
              <div className="relative w-full mb-6">
                <textarea
                  autoFocus
                  id="instruction-textarea"
                  className="w-full bg-background border border-outline rounded-lg p-4 text-on-surface text-base placeholder:text-on-surface-variant/40 outline-none min-h-[140px] resize-none transition-all duration-300 focus:border-primary focus:ring-1 focus:ring-primary/20"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="Añade una instrucción especial (opcional)"
                />
              </div>

              {/* Footer: acción principal sólo */}
              <div className="mt-auto pt-3 border-t border-white/6">
                <button
                  onClick={confirmWithNote}
                  className="w-full rounded-[1.5rem] bg-primary-container px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-on-primary transition-colors duration-200 hover:bg-success"
                >
                  {activeProduct?.cartId ? "Guardar" : "Añadir"}
                </button>
              </div>
            </div>
          </div>
        )}
        {optionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-0 lg:p-6">
            <div className="relative flex h-full w-full max-w-full flex-col overflow-hidden rounded-none bg-surface text-on-surface shadow-[0_30px_80px_rgba(0,0,0,0.55)] lg:h-auto lg:max-h-[90vh] lg:max-w-2xl lg:rounded-[2rem]">
              <div className="flex items-start justify-between gap-4 px-4 py-4 lg:px-6 lg:py-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 overflow-hidden">
                    {activeProduct?.image_url ? (
                      <img
                        src={activeProduct.image_url}
                        alt={activeProduct.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                        image
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold tracking-tight text-on-surface truncate">
                      {activeProduct?.name || "Seleccionar opciones"}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOptionModalOpen(false);
                    setActiveProduct(null);
                    setOptionSelections({});
                    setOptionNote("");
                    setOptionValidationError("");
                  }}
                  className="text-on-surface-variant hover:text-on-surface"
                  aria-label="Cerrar opciones"
                >
                  <span className="material-symbols-outlined text-xl">
                    close
                  </span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-6 lg:py-5">
                {(activeProduct?.description ||
                  activeProduct?.desc ||
                  activeProduct?.descripcion) && (
                  <div className="mb-4 text-sm leading-6 text-on-surface-variant">
                    {activeProduct.description ||
                      activeProduct.desc ||
                      activeProduct.descripcion}
                  </div>
                )}
                {(activeProduct?.optionGroups || []).map((group) => {
                  const selected = optionSelections[group.id];
                  return (
                    <div
                      key={group.id}
                      className="border-b border-white/10 pb-5 pt-5 last:border-b-0 last:pb-0"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-on-surface">
                            {group.nombre}
                          </p>
                          {group.obligatorio ? (
                            <span className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-red-300">
                              Obligatorio
                            </span>
                          ) : null}
                          <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
                            {group.selectionType === "multiple"
                              ? "Elige varias"
                              : "Elige una"}
                          </span>
                        </div>
                        {group.descripcion ? (
                          <p className="text-xs leading-5 text-on-surface-variant">
                            {group.descripcion}
                          </p>
                        ) : null}
                      </div>
                      <div className="mt-4 grid gap-2">
                        {group.opciones.map((option) => {
                          const isSelected =
                            group.selectionType === "multiple"
                              ? Array.isArray(selected) &&
                                selected.includes(option.id)
                              : selected === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => {
                                setOptionSelections((prev) => {
                                  const next = { ...prev };
                                  if (group.selectionType === "multiple") {
                                    const current = Array.isArray(
                                      prev[group.id],
                                    )
                                      ? prev[group.id]
                                      : [];
                                    if (current.includes(option.id)) {
                                      next[group.id] = current.filter(
                                        (id) => id !== option.id,
                                      );
                                    } else {
                                      next[group.id] = [...current, option.id];
                                    }
                                  } else {
                                    next[group.id] = option.id;
                                  }
                                  return next;
                                });
                              }}
                              className={`w-full rounded-[1.5rem] px-4 py-4 text-left transition ${
                                isSelected
                                  ? "text-on-surface bg-primary-container/50"
                                  : "bg-white/5 text-on-surface-variant hover:bg-white/10"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[12px] transition-colors ${
                                      isSelected
                                        ? "border-primary-container bg-primary-container text-white"
                                        : "border-white/20 bg-white/5 text-transparent"
                                    }`}
                                  >
                                    {isSelected ? (
                                      <span className="material-symbols-outlined leading-none text-white">
                                        check
                                      </span>
                                    ) : null}
                                  </span>
                                  <p className="text-sm font-medium line-clamp-1">
                                    {option.nombre}
                                  </p>
                                </div>
                                {option.precio_extra ? (
                                  <p className="text-sm text-on-surface-variant">
                                    +$ {formatPrice(option.precio_extra)}
                                  </p>
                                ) : (
                                  <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
                                    Incluido
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div className="mt-5">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant mb-2">
                    Nota de producto
                  </label>
                  <textarea
                    value={optionNote}
                    onChange={(e) => setOptionNote(e.target.value)}
                    className="w-full min-h-[110px] rounded-[1.5rem] border border-white/10 bg-background/90 p-4 text-base text-on-surface outline-none resize-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    placeholder="Añade una instrucción especial (opcional)"
                  />
                </div>
                {optionValidationError ? (
                  <p className="mt-3 text-sm font-semibold text-error">
                    {optionValidationError}
                  </p>
                ) : null}
              </div>

              <div className="border-t border-white/10 bg-surface px-4 py-4 lg:px-6 lg:py-5">
                <div className="flex flex-row flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center justify-between gap-1 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-on-surface">
                    <button
                      type="button"
                      onClick={() =>
                        setOptionQuantity((prev) => Math.max(1, prev - 1))
                      }
                      className=" rounded-md text-on-surface-variant hover:text-on-surface transition-colors text-2xl font-bold"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={optionQuantity}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        setOptionQuantity(
                          digits ? Math.max(1, Number(digits)) : 1,
                        );
                      }}
                      className="w-12 bg-transparent text-center text-[16px] font-semibold text-on-surface outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setOptionQuantity((prev) => prev + 1)}
                      className="rounded-md text-on-surface-variant hover:text-on-surface transition-colors text-2xl font-bold"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={confirmOptionSelection}
                    className="flex-1 rounded-[1.5rem] bg-primary-container px-4 py-3 text-sm font-semibold uppercase  text-on-primary transition-colors duration-200 hover:bg-success"
                  >
                    Agregar • ${" "}
                    {formatPrice(activeProductSelectedPrice * optionQuantity)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación para limpiar carrito */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-background bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface border border-outline rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-on-surface text-lg font-bold mb-4">
              ¿Estas seguro?
            </h3>
            <p className="text-on-surface-variant mb-6">
              ¿Estás seguro de que quieres eliminar todos los productos?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCart([]);
                  setShowConfirmModal(false);
                }}
                className="flex-1 bg-error hover:bg-error/80 text-on-surface font-bold py-2 rounded-lg transition-colors"
              >
                Sí, limpiar
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-surface-hover hover:bg-surface text-on-surface font-bold py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de División de Pagos */}
      <SplitPaymentModal
        isOpen={showSplitModal}
        onClose={() => setShowSplitModal(false)}
        total={total}
        numSplits={numSplits}
        setNumSplits={setNumSplits}
        splitPayments={splitPayments}
        updateSplitPayment={updateSplitPayment}
        initializeSplits={initializeSplits}
        removePaymentRow={removePaymentRow}
      />
    </>
  );
};

export default POS;
