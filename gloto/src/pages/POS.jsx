import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../shared/lib/supabase";
import {
  Menu,
  X,
  Plus,
  Minus,
  ShoppingCart,
  User,
  CreditCard,
  Receipt,
  ArrowLeft,
} from "lucide-react";

// --- CONFIGURACIÓN DE TIPOS DE PEDIDO ---
const ORDER_TYPES = {
  dine_in: { label: "Comer aquí", icon: "🍽️", color: "bg-blue-500" },
  takeout: { label: "Para llevar", icon: "🥡", color: "bg-green-500" },
  delivery: { label: "Domicilio", icon: "🚚", color: "bg-purple-500" },
};

// --- COMPONENTE PRINCIPAL ---
export default function POS() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState("Cargando...");
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("dine_in");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [showCart, setShowCart] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);

  useEffect(() => {
    if (!businessId) return;

    const fetchData = async () => {
      // Obtener información del negocio
      const { data: business } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", businessId)
        .single();

      if (business) setBusinessName(business.name);

      // Obtener productos del menú por businessId
      const { data: products } = await supabase
        .from("products")
        .select("*")
        .eq("business_id", businessId)
        .eq("is_available", true)
        .order("name");

      if (products) {
        const normalizedProducts = products.map((product) => ({
          ...product,
          price: Number(product.price) || 0,
          categoryLabel:
            product.categories?.name || product.category || "Sin categoría",
        }));

        setMenuItems(normalizedProducts);

        // Extraer categorías únicas
        const uniqueCategories = [
          ...new Set(
            normalizedProducts.map((p) => p.categoryLabel).filter(Boolean),
          ),
        ];
        setCategories(uniqueCategories);
      }

      setLoading(false);
    };

    fetchData();
  }, [businessId]);

  // Filtrar productos por categoría y búsqueda
  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return menuItems
      .filter((item) =>
        selectedCategory === "all"
          ? true
          : item.categoryLabel === selectedCategory,
      )
      .filter((item) =>
        normalizedQuery === ""
          ? true
          : item.name.toLowerCase().includes(normalizedQuery) ||
            item.description?.toLowerCase().includes(normalizedQuery),
      );
  }, [menuItems, selectedCategory, searchQuery]);

  // Agregar producto al carrito
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        return [
          ...prevCart,
          {
            ...product,
            quantity: 1,
            specialInstructions: "",
            selectedOptions: [],
          },
        ];
      }
    });
  };

  // Remover producto del carrito
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Actualizar cantidad
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  // Calcular totales
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Procesar pedido
  const processOrder = async () => {
    if (cart.length === 0) return;

    setProcessingOrder(true);

    try {
      // Crear el pedido
      const orderData = {
        business_id: businessId,
        customer_name: customerInfo.name || "Cliente",
        customer_phone: customerInfo.phone,
        customer_address:
          orderType === "delivery" ? customerInfo.address : null,
        delivery_type:
          orderType === "dine_in"
            ? "En Punto"
            : orderType === "takeout"
              ? "Recoger"
              : "Domicilio",
        status: "pending",
        total_amount: cartTotal,
      };

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // Crear los items del pedido
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        notes: item.specialInstructions,
        options: JSON.stringify(item.selectedOptions),
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Limpiar carrito y formulario
      setCart([]);
      setCustomerInfo({ name: "", phone: "", address: "" });
      setShowCart(false);

      // Mostrar confirmación
      alert(`¡Pedido #${order.id.slice(0, 8)} creado exitosamente!`);
    } catch (error) {
      console.error("Error procesando pedido:", error);
      alert("Error al procesar el pedido. Intente nuevamente.");
    } finally {
      setProcessingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-500">Cargando POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background overflow-hidden">
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-50 border-r border-slate-200 p-5 flex flex-col justify-between">
        <div>
          <div className="mb-8 px-3 py-3 rounded-2xl bg-white shadow-sm border border-slate-200">
            <h1 className="text-xl font-black tracking-tighter text-primary">Gloto Central</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mt-1">Point of Sale</p>
          </div>
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-violet-50 text-violet-700 font-semibold text-sm shadow-sm border border-violet-100">
              <span className="text-lg">💳</span>
              POS System
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 text-sm hover:bg-slate-100 transition-all">
              <span className="text-lg">🏠</span>
              Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 text-sm hover:bg-slate-100 transition-all">
              <span className="text-lg">👩‍🍳</span>
              Kitchen
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 text-sm hover:bg-slate-100 transition-all">
              <span className="text-lg">🚚</span>
              Drivers
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 text-sm hover:bg-slate-100 transition-all">
              <span className="text-lg">🛡️</span>
              Admin
            </button>
          </nav>
        </div>
        <div className="pt-4 border-t border-slate-200">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 text-sm hover:bg-slate-100 transition-all">
            <span className="text-lg">❓</span>
            Support
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 text-sm hover:bg-slate-100 transition-all mt-2">
            <span className="text-lg">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-64 flex h-screen overflow-hidden">
        <section className="w-[70%] flex flex-col p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black tracking-tighter text-on-background">Marketplace POS</h2>
              <p className="text-sm text-slate-500 mt-1">Toma pedidos rápidamente desde el restaurante</p>
            </div>
            <div className="relative w-full max-w-lg">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos" 
                className="w-full pl-12 pr-12 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium text-on-background focus:border-primary focus:ring-0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 border border-slate-200 px-2 py-0.5 rounded">/</span>
            </div>
          </div>

          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                selectedCategory === "all"
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="group flex flex-col items-start p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:bg-primary-fixed transition-all duration-150 ease-spring"
              >
                <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4 text-4xl">
                  <span>🍽️</span>
                </div>
                <h3 className="text-lg font-bold text-on-background mb-2">{product.name}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{product.description}</p>
                <div className="mt-auto w-full flex items-center justify-between">
                  <span className="text-primary font-extrabold text-xl">${product.price.toLocaleString("es-CO")}</span>
                  <span className="px-3 py-2 bg-white text-slate-700 rounded-2xl shadow-sm">Agregar</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-12 gap-4 h-44">
            <div className="col-span-8 rounded-3xl p-6 bg-tertiary-fixed text-on-tertiary flex flex-col justify-between overflow-hidden">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Oferta Especial</h3>
                <p className="mt-2 text-sm text-on-tertiary-fixed-variant">Compra 2, lleva 1 gratis en bebidas de temporada.</p>
              </div>
              <div className="text-6xl opacity-10">✨</div>
            </div>
            <div className="col-span-4 rounded-3xl p-6 bg-secondary-fixed text-on-secondary-fixed flex flex-col items-center justify-center text-center">
              <div className="text-4xl mb-2">🎁</div>
              <p className="font-bold">Puntos de Lealtad</p>
              <p className="text-xs mt-1 text-on-secondary-fixed-variant">Doble en productos seleccionados</p>
            </div>
          </div>
        </section>

        <section className="w-[30%] bg-slate-50 border-l border-slate-200 p-6 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black tracking-tight">Pedido Actual</h3>
              <p className="text-sm text-slate-500">Orden #{cartItemCount ? `00${cartItemCount}` : "000"}</p>
            </div>
            <span className="px-2 py-1 rounded-full bg-primary-fixed text-primary font-bold text-[10px] uppercase tracking-[0.2em]">Activo</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 rounded-3xl bg-white border border-slate-200">
                <p className="text-slate-500">Agrega productos para comenzar el pedido</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
                  <div className="w-12 h-12 rounded-3xl bg-slate-100 flex items-center justify-center text-xl">🍽️</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-on-background">{item.name}</p>
                    <p className="text-xs text-slate-500">${item.price.toLocaleString("es-CO")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-black">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
            <div className="flex justify-between text-sm font-medium text-slate-500">
              <span>Subtotal</span>
              <span>${cartTotal.toLocaleString("es-CO")}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-slate-500">
              <span>Tax (8%)</span>
              <span>${(cartTotal * 0.08).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-on-background pt-2">
              <span>Total</span>
              <span className="text-primary">${(cartTotal * 1.08).toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-all">
                <span>💵</span>
                Efectivo
              </button>
              <button className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-all">
                <span>💳</span>
                Tarjeta
              </button>
            </div>
            <button
              onClick={processOrder}
              disabled={processingOrder || cart.length === 0}
              className="w-full py-4 rounded-3xl text-white font-black text-lg bg-gradient-to-br from-primary-container to-primary hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cobrar
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

// --- COMPONENTE DEL CARRITO ---
function CartSidebar({
  cart,
  cartTotal,
  onUpdateQuantity,
  onRemoveItem,
  orderType,
  customerInfo,
  onCustomerInfoChange,
  onProcessOrder,
  processingOrder,
  onClose,
}) {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Pedido Actual</h2>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Items del carrito */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No hay items en el pedido</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 p-3 bg-slate-50 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="font-medium text-slate-900">{item.name}</h4>
                <p className="text-sm text-slate-600">
                  ${item.price.toLocaleString("es-CO")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="p-1 hover:bg-slate-200 rounded"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="p-1 hover:bg-slate-200 rounded"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded ml-2"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Información del cliente */}
      {cart.length > 0 && (
        <div className="p-4 border-t border-slate-200 space-y-3">
          <h3 className="font-medium text-slate-900 flex items-center gap-2">
            <User size={16} />
            Información del Cliente
          </h3>

          <input
            type="text"
            placeholder="Nombre del cliente"
            value={customerInfo.name}
            onChange={(e) =>
              onCustomerInfoChange({ ...customerInfo, name: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          <input
            type="tel"
            placeholder="Teléfono"
            value={customerInfo.phone}
            onChange={(e) =>
              onCustomerInfoChange({ ...customerInfo, phone: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {orderType === "delivery" && (
            <textarea
              placeholder="Dirección de entrega"
              value={customerInfo.address}
              onChange={(e) =>
                onCustomerInfoChange({
                  ...customerInfo,
                  address: e.target.value,
                })
              }
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          )}
        </div>
      )}

      {/* Total y procesar */}
      {cart.length > 0 && (
        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total:</span>
            <span>${cartTotal.toLocaleString("es-CO")}</span>
          </div>

          <button
            onClick={onProcessOrder}
            disabled={processingOrder}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processingOrder ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Procesando...
              </>
            ) : (
              <>
                <Receipt size={16} />
                Procesar Pedido
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
