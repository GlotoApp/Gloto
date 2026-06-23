import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Image as ImageIcon,
  EyeOff,
  Eye,
  Filter,
  CheckCircle2,
  X,
  Save,
  LayoutGrid,
  List,
  Camera,
  Tag,
  AlertTriangle,
} from "lucide-react";
import Categorias from "./Categorias";
import defaultImg from "../../public/default.png";

const handleImageError = (e) => {
  e.target.onerror = null; // Previene bucles infinitos si la imagen por defecto también falla
  e.target.src = defaultImg;
};

const Productos = ({ section = "productos" }) => {
  // ========== ESTADO COMPARTIDO ==========
  const [categories, setCategories] = useState([
    "Frituras",
    "Barra Café",
    "Panadería",
  ]);

  const handleUpdateCategories = (newCategories) => {
    setCategories(newCategories);
  };

  // ======= NUEVA FUNCIÓN AGREGADA PARA LA ELIMINACIÓN EN CASCADA =======
  const handleDeleteCategoryCascade = (categoryName) => {
    // Filtramos el estado global de productos eliminando aquellos vinculados a la categoría
    setProducts((prevProducts) =>
      prevProducts.filter(
        (product) =>
          product.category.toLowerCase() !== categoryName.toLowerCase(),
      ),
    );
  };

  // ========== ESTADO PARA PRODUCTOS ==========arepasim
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: "",
    category: "Frituras",
    price: "",
    description: "",
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400",
  });

  // Estado inicial del catálogo
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Buñuelo Tradicional",
      category: "Frituras",
      price: 2500,
      description: "Queso costeño premium, masa secreta.",
      available: true,
      image:
        "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400",
    },
    {
      id: 2,
      name: "Tinto Campesino",
      category: "Barra Café",
      price: 3500,
      description: "Café de origen con panela.",
      available: true,
      image: "https://images.unsplash.com/photo-1544787210-282aa74804bc?w=400",
    },
    {
      id: 3,
      name: "Pandebono Premium",
      category: "Panadería",
      price: 1800,
      description: "Receta tradicional con queso fresco.",
      available: true,
      image:
        "https://images.unsplash.com/photo-1585080195519-c21064e811e6?w=400",
    },
    {
      id: 4,
      name: "Arepas Rellenas",
      category: "Frituras",
      price: 4200,
      description: "Rellenas de queso y jamón jamón de la casa.",
      available: false,
      image:
        "https://images.unsplash.com/photo-1618588507038-56dac2c37c84?w=400",
    },
    {
      id: 5,
      name: "Café Espresso",
      category: "Barra Café",
      price: 2800,
      description: "Espresso italiano preparado fresco.",
      available: true,
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b3f7?w=400",
    },
  ]);

  // ========== FUNCIONES PARA PRODUCTOS ==========

  // Filtrar y buscar
  const filteredProducts = useMemo(() => {
    let result = products;

    // Búsqueda
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toString().includes(searchQuery),
      );
    }

    // Filtro por categoría
    if (filterCategory !== "todos") {
      result = result.filter((p) => p.category === filterCategory);
    }

    // Filtro por disponibilidad
    if (filterStatus === "activos") {
      result = result.filter((p) => p.available);
    } else if (filterStatus === "agotados") {
      result = result.filter((p) => !p.available);
    }

    // Ordenar
    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

    return result;
  }, [products, searchQuery, filterCategory, filterStatus, sortBy]);

  // Abrir modal para crear nuevo
  const handleNewProduct = () => {
    setEditingId(null);
    setFormData({
      name: "",
      category: "Frituras",
      price: "",
      description: "",
      image:
        "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400",
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEditProduct = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      image: product.image,
    });
    setIsModalOpen(true);
  };

  // Guardar producto
  const handleSaveProduct = () => {
    if (!formData.name || !formData.price) {
      alert("Completa nombre y precio");
      return;
    }

    if (editingId) {
      setProducts(
        products.map((p) => (p.id === editingId ? { ...p, ...formData } : p)),
      );
    } else {
      const newProduct = {
        id: Math.max(...products.map((p) => p.id), 0) + 1,
        ...formData,
        price: parseInt(formData.price),
        available: true,
      };
      setProducts([...products, newProduct]);
    }

    setIsModalOpen(false);
  };

  // Eliminar producto
  const handleDeleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  // Eliminar imagen
  const handleDeleteImage = (e) => {
    e.stopPropagation();
    setFormData({ ...formData, image: "" });
  };

  // Toggle disponibilidad
  const handleToggleAvailable = (id) => {
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, available: !p.available } : p,
      ),
    );
  };

  // Seleccionar/deseleccionar producto
  const handleSelectProduct = (id) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  // Cambiar estado en lote
  const handleBulkToggleStatus = (newStatus) => {
    setProducts(
      products.map((p) =>
        selectedProducts.has(p.id) ? { ...p, available: newStatus } : p,
      ),
    );
    setSelectedProducts(new Set());
  };

  // Eliminar productos en lote
  const handleBulkDelete = () => {
    setProducts(products.filter((p) => !selectedProducts.has(p.id)));
    setSelectedProducts(new Set());
    setBulkDeleteConfirm(false);
  };

  const categoriesList = ["todos", ...new Set(products.map((p) => p.category))];

  // ========== RENDERIZADO CONDICIONAL ==========

  if (section === "categorias") {
    return (
      <Categorias
        categories={categories}
        products={products} // Envía el array de productos original
        onUpdateCategories={handleUpdateCategories}
        onDeleteCategoryCascade={handleDeleteCategoryCascade} // <--- NUEVO CALLBACK VINCULADO
      />
    );
  }

  // SECCIÓN DE PRODUCTOS
  return (
    <div className="min-h-screen bg-background  text-neutral-200 p-4 md:p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* HEADER DINÁMICO */}
        {/* Título Principal: Con un tracking más elegante y mejor peso */}
        <h1 className="text-2xl font-black tracking-tighter">Productos</h1>
        <header className="px-2 pt-2 pb-5 border-b border-white/5 flex-shrink-0 ">
          {/* Fila Superior: Info y Cierre */}
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-2">
              {/* Indicadores de Estado: Ahora más limpios, sutiles y fáciles de leer */}
              <div className="flex items-center gap-4 flex-wrap select-none">
                <div className="flex items-center gap-2 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-400/90">
                    {products.length} Total
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                    <span className="text-emerald-400 font-black">
                      {products.filter((p) => p.available).length}
                    </span>{" "}
                    Activos
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500/80" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                    <span className="text-rose-400 font-black">
                      {products.filter((p) => !p.available).length}
                    </span>{" "}
                    Agotados
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fila Inferior: Botonera Estilizada */}
          <div className="flex items-center justify-between gap-2 mt-5 flex-wrap w-full">
            {/* Vista Normal: Botones de Nuevo Item y Seleccionar */}
            {!isSelectionMode && (
              <>
                <button
                  onClick={handleNewProduct}
                  className="px-3.5 py-2 rounded-xl border text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center gap-2 bg-white/[0.03] border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.15]"
                >
                  <Plus size={11} className="text-violet-400" /> Nuevo Item
                </button>

                <button
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    setSelectedProducts(new Set());
                  }}
                  className="px-3.5 py-2 rounded-xl border text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center gap-2"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderColor: "rgba(255,255,255,0.05)",
                    color: "#9ca3af",
                  }}
                >
                  <CheckCircle2 size={11} />
                  Seleccionar
                </button>
              </>
            )}

            {/* Vista Selección: Acciones a la izquierda, Contador y Terminado a la derecha */}
            {isSelectionMode && (
              <>
                {/* Acciones Masivas a la izquierda */}
                {selectedProducts.size > 0 && (
                  <>
                    {/* Activar Masivo */}
                    <button
                      onClick={() => handleBulkToggleStatus(true)}
                      className="px-3.5 py-2 rounded-xl border text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center gap-2"
                      style={{
                        background: "rgba(34,197,94,0.1)",
                        borderColor: "rgba(34,197,94,0.3)",
                        color: "#4ade80",
                      }}
                    >
                      Activar
                    </button>

                    {/* Agotar Masivo */}
                    <button
                      onClick={() => handleBulkToggleStatus(false)}
                      className="px-3.5 py-2 rounded-xl border text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center gap-2"
                      style={{
                        background: "rgba(244,63,94,0.1)",
                        borderColor: "rgba(244,63,94,0.3)",
                        color: "#fb7185",
                      }}
                    >
                      Agotar
                    </button>

                    {/* Eliminar Masivo */}
                    <button
                      onClick={() => setBulkDeleteConfirm(true)}
                      className="px-3.5 py-2 rounded-xl border text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center gap-2"
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        borderColor: "rgba(239,68,68,0.4)",
                        color: "#f87171",
                      }}
                    >
                      <Trash2 size={11} />
                      Eliminar
                    </button>

                    {/* Limpiar Selección */}
                    <button
                      onClick={() => setSelectedProducts(new Set())}
                      className="px-3 py-2 bg-neutral-900 border border-white/5 text-neutral-400 rounded-xl hover:bg-neutral-800 hover:text-neutral-200 active:scale-95 transition-all text-[9px] font-black uppercase tracking-wider"
                    >
                      Limpiar
                    </button>
                  </>
                )}

                {/* Separador para empujar a la derecha */}
                <div className="ml-auto" />

                {/* Contador y Terminado a la derecha */}
                <span className="text-[10px] font-mono text-violet-300/70 bg-violet-500/[0.06] border border-violet-500/20 px-2.5 py-1 rounded-lg select-none tracking-wide">
                  {selectedProducts.size}{" "}
                  {selectedProducts.size === 1 ? "Ítem" : "Ítems"}
                </span>

                <button
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    setSelectedProducts(new Set());
                  }}
                  className="px-3.5 py-2 rounded-xl border text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center gap-2"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(139,92,246,0.15), rgba(139,92,246,0.05))",
                    borderColor: "rgba(139,92,246,0.4)",
                    color: "#c084fc",
                  }}
                >
                  <CheckCircle2 size={11} />
                  Terminado
                </button>
              </>
            )}
          </div>
        </header>

        {/* BÚSQUEDA TÉCNICA */}
        <div className="bg-neutral-900/40 border border-white/5 p-4 rounded-2xl mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-violet-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="FILTRAR POR ID, NOMBRE O CATEGORÍA..."
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-violet-500 transition-all placeholder:text-neutral-800"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-6 py-3 bg-neutral-800 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:border-white/20 transition-all"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[8px] font-black text-neutral-500 uppercase tracking-wider block mb-2">
                Categoría
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[10px] font-bold uppercase tracking-widest focus:border-violet-500 outline-none"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "todos" ? "Todas" : cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[8px] font-black text-neutral-500 uppercase tracking-wider block mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[10px] font-bold uppercase tracking-widest focus:border-violet-500 outline-none"
              >
                <option value="todos">Todos</option>
                <option value="activos">Activos</option>
                <option value="agotados">Agotados</option>
              </select>
            </div>
            <div>
              <label className="text-[8px] font-black text-neutral-500 uppercase tracking-wider block mb-2">
                Ordenar
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-[10px] font-bold uppercase tracking-widest focus:border-violet-500 outline-none"
              >
                <option value="name">Por Nombre</option>
                <option value="price-asc">Precio: Menor</option>
                <option value="price-desc">Precio: Mayor</option>
              </select>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <Search size={48} className="mx-auto text-neutral-600 mb-2" />
              <p className="text-sm font-bold uppercase text-neutral-500 tracking-widest">
                No hay productos
              </p>
            </div>
          ) : (
            filteredProducts.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (isSelectionMode) {
                    handleSelectProduct(item.id);
                  } else {
                    handleEditProduct(item);
                  }
                }}
                className={`rounded-2xl overflow-hidden border transition-all duration-300 group cursor-pointer hover:shadow-xl hover:shadow-violet-500/10 flex flex-col justify-between h-full ${
                  item.available
                    ? "bg-neutral-900/40 border-white/5 hover:border-violet-500/30 hover:bg-neutral-900/60"
                    : "bg-red-500/5 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10"
                }`}
              >
                {/* SECCIÓN SUPERIOR: Imagen fija */}
                <div className="relative w-full h-32 sm:h-40 overflow-hidden bg-neutral-800 flex-shrink-0">
                  <img
                    src={item.image || defaultImg} // Si no hay string de imagen, usa el default de inmediato
                    alt={item.name}
                    onError={handleImageError} // Si hay un string pero el enlace está roto, activa el fallback
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  />
                  {/* Badge Estado Superior Izquierda */}
                  <div className="absolute top-2 left-2">
                    {/* Badge Estado */}
                    <div
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        item.available
                          ? "bg-emerald-500 text-fff border-emerald-500/30"
                          : "bg-red-500 text-red-fff border-red-500/30"
                      }`}
                    >
                      {item.available ? "Activo" : "Agotado"}
                    </div>
                  </div>

                  {/* Checkbox o Botón Eliminar Superior Derecha */}
                  <div className="absolute top-2 right-2">
                    {isSelectionMode ? (
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(item.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectProduct(item.id);
                        }}
                        className="w-6 h-6 rounded cursor-pointer accent-violet-500"
                      />
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(item.id);
                        }}
                        className="p-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* SECCIÓN INTERMEDIA: Datos del Producto */}
                <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-1">
                  {/* Bloque de Textos */}
                  <div>
                    {/* Categoría */}
                    <span className="text-[9px] sm:text-[10px] font-bold text-violet-400 uppercase tracking-widest block h-3.5 overflow-hidden">
                      {item.category}
                    </span>

                    {/* Título */}
                    <h3 className="font-black text-xs sm:text-sm text-neutral-100 uppercase tracking-wide line-clamp-1 mt-0.5">
                      {item.name}
                    </h3>
                  </div>

                  {/* Bloque de Precio */}
                  <div className="pt-1">
                    <span className="block text-[8px] sm:text-[9px] font-bold text-neutral-500 uppercase tracking-wider leading-none">
                      Precio
                    </span>
                    <p className="font-black text-base sm:text-lg text-white tracking-tight tabular-nums mt-0.5 leading-tight">
                      {item.price.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                </div>

                {/* SECCIÓN INFERIOR: Botón de Editar y Switch */}
                <div className="pb-2">
                  <div className="pt-2.5 border-t border-white/5 flex justify-between items-center px-3">
                    {/* Botón de Editar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProduct(item);
                      }}
                      className="p-2 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 hover:text-violet-400 active:scale-95 transition-all"
                      title="Editar"
                    >
                      <Edit3 size={16} />
                    </button>

                    {/* Switch de Estado */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAvailable(item.id);
                      }}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        item.available ? "bg-emerald-500" : "bg-red-500"
                      }`}
                      title={item.available ? "Activo" : "Agotado"}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          item.available ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* MODAL DE EDICIÓN / NUEVO PRODUCTO */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-2xl overflow-y-auto">
            <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 border border-violet-500/20 w-full max-w-7xl rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-violet-500/10 max-h-[95vh]">
              {/* Header Premium - Responsive */}
              <div className="relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-600/10 to-transparent"></div>
                <div className="relative px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 flex justify-between items-start gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
                    <div className="p-1 sm:p-1  rounded-xl sm:rounded-2xl flex-shrink-0">
                      {editingId ? (
                        <Edit3
                          size={20}
                          className="sm:w-6 sm:h-6 text-violet-400"
                        />
                      ) : (
                        <Plus
                          size={20}
                          className="sm:w-6 sm:h-6 text-violet-400"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-4xl md:text-4xl font-black uppercase tracking-tight text-white mb-1 sm:mb-2 leading-tight">
                        {editingId ? "Editar" : "Crear"} Producto
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 sm:p-3 hover:bg-white/10 rounded-lg sm:rounded-2xl transition-all text-neutral-400 hover:text-white flex-shrink-0"
                  >
                    <X size={24} className="sm:w-7 sm:h-7" />
                  </button>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>
              </div>

              {/* Contenido Principal - Responsive */}
              <div
                className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8 overflow-y-auto"
                style={{ maxHeight: "calc(95vh - 160px)" }}
              >
                {/* Panel Izquierdo: Imagen y Estado */}
                <div className="w-full md:w-2/6 flex flex-col gap-4 sm:gap-6 flex-shrink-0">
                  {/* Imagen - Premium */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-violet-400"></div>
                      <label className="text-[9px] sm:text-[10px] font-black uppercase text-violet-400 tracking-widest">
                        Imagen
                      </label>
                    </div>
                    <div className="relative group cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-neutral-700 to-neutral-800 border border-violet-500/20 hover:border-violet-500/50 transition-all aspect-square flex items-center justify-center flex-col gap-3 sm:gap-4 text-neutral-500 hover:text-white shadow-xl sm:shadow-2xl shadow-violet-500/5 hover:shadow-violet-500/20">
                      {formData.image ? (
                        <>
                          <img
                            src={formData.image || defaultImg}
                            onError={handleImageError}
                            className="absolute inset-0 w-full h-full object-cover transition-all"
                            alt="Producto"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 transition-all" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <label className="p-2 sm:p-3 bg-violet-500/30 hover:bg-violet-500/50 border border-violet-400/30 rounded-lg sm:rounded-2xl inline-flex items-center justify-center cursor-pointer transition-all">
                              <Camera
                                size={20}
                                strokeWidth={1}
                                className="sm:w-6 sm:h-6 text-violet-300"
                              />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    const reader = new FileReader();
                                    reader.onload = (evt) => {
                                      setFormData({
                                        ...formData,
                                        image: evt.target?.result,
                                      });
                                    };
                                    reader.readAsDataURL(e.target.files[0]);
                                  }
                                }}
                              />
                            </label>
                            <button
                              onClick={handleDeleteImage}
                              className="p-2 sm:p-3 bg-red-500/30 hover:bg-red-500/50 border border-red-400/30 rounded-lg sm:rounded-2xl inline-flex items-center justify-center cursor-pointer transition-all"
                              title="Eliminar imagen"
                            >
                              <Trash2
                                size={20}
                                className="sm:w-6 sm:h-6 text-red-300"
                              />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="relative z-10 text-center">
                            <div className="p-2 sm:p-3 bg-violet-500/20 border border-violet-400/30 rounded-lg sm:rounded-2xl inline-block mb-2 sm:mb-3">
                              <Camera
                                size={24}
                                strokeWidth={1}
                                className="sm:w-8 sm:h-8 text-violet-400"
                              />
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] block text-white mb-2">
                              Subir Imagen
                            </span>
                            <span className="text-[7px] sm:text-[8px] text-neutral-400 block mb-2 font-bold">
                              PNG • JPG • GIF • WebP
                            </span>
                            <span className="text-[7px] sm:text-[8px] text-neutral-500 block font-semibold">
                              Click para seleccionar
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                const reader = new FileReader();
                                reader.onload = (evt) => {
                                  setFormData({
                                    ...formData,
                                    image: evt.target?.result,
                                  });
                                };
                                reader.readAsDataURL(e.target.files[0]);
                              }
                            }}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Estado - Switch Premium */}
                  {editingId && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-violet-400"></div>
                        <label className="text-[9px] sm:text-[10px] font-black uppercase text-violet-400 tracking-widest">
                          Estado
                        </label>
                      </div>
                      <div className="">
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
                          {/* Columna Izquierda: ID */}
                          <div className="flex flex-col justify-center items-center">
                            <span className="text-[7px] sm:text-[7px] font-bold text-neutral-500 uppercase tracking-widest ">
                              ID
                            </span>
                            <span className="text-base sm:text-lg font-black text-violet-300">
                              {editingId}
                            </span>
                          </div>

                          {/* Columna Derecha: Disponibilidad */}
                          <div className="flex flex-col justify-center items-center">
                            <span className="text-[7px] sm:text-[7px] font-bold text-neutral-500 uppercase tracking-widest ">
                              Estado
                            </span>
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-[14px] sm:text-xs font-black ${
                                  products.find((p) => p.id === editingId)
                                    ?.available
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {products.find((p) => p.id === editingId)
                                  ?.available
                                  ? "Activo"
                                  : "Agotado"}
                              </span>
                              <button
                                onClick={() => handleToggleAvailable(editingId)}
                                className={`relative inline-flex h-6 sm:h-7 w-10 sm:w-12 items-center rounded-full transition-all cursor-pointer shadow-lg ${
                                  products.find((p) => p.id === editingId)
                                    ?.available
                                    ? "bg-emerald-500 shadow-emerald-500/50"
                                    : "bg-red-500 shadow-red-500/50"
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 sm:h-5 w-4 sm:w-5 transform rounded-full bg-white transition-all shadow-md ${
                                    products.find((p) => p.id === editingId)
                                      ?.available
                                      ? "translate-x-5 sm:translate-x-5.5"
                                      : "translate-x-0.5 sm:translate-x-1"
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Panel Derecho: Formulario */}
                <div className="flex-1 flex flex-col gap-4 sm:gap-6 min-w-0">
                  {/* Nombre - Premium */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-violet-400"></div>
                      <label className="text-[9px] sm:text-[10px] font-black uppercase text-violet-400 tracking-widest">
                        Nombre
                      </label>
                    </div>
                    <div className="relative group">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full bg-gradient-to-r from-neutral-700/30 to-neutral-800/30 border border-neutral-600/50 group-focus-within:border-violet-500/50 rounded-lg sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-5 text-xs sm:text-sm font-bold uppercase tracking-widest focus:outline-none transition-all placeholder:text-neutral-600"
                        placeholder="EJ: BUÑUELO QUESO"
                      />
                    </div>
                  </div>

                  {/* Precio y Categoría */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-violet-400"></div>
                        <label className="text-[9px] sm:text-[10px] font-black uppercase text-violet-400 tracking-widest truncate">
                          Precio (COP)
                        </label>
                      </div>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-sm">
                          $
                        </span>
                        <input
                          type="text"
                          value={
                            formData.price
                              ? parseInt(formData.price).toLocaleString("es-CO")
                              : ""
                          }
                          onChange={(e) => {
                            const valor = e.target.value.replace(/\D/g, "");
                            setFormData({ ...formData, price: valor });
                          }}
                          className="w-full bg-gradient-to-r from-neutral-700/30 to-neutral-800/30 border border-neutral-600/50 group-focus-within:border-violet-500/50 rounded-lg sm:rounded-2xl py-3 sm:py-4 pl-9 sm:pl-11 pr-4 sm:pr-5 text-xs sm:text-sm font-bold uppercase tracking-widest focus:outline-none transition-all placeholder:text-neutral-600"
                          placeholder="3000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-violet-400"></div>
                        <label className="text-[9px] sm:text-[10px] font-black uppercase text-violet-400 tracking-widest truncate">
                          Categoría
                        </label>
                      </div>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full bg-gradient-to-r from-neutral-700/30 to-neutral-800/30 border border-neutral-600/50 focus:border-violet-500/50 rounded-lg sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-5 text-xs sm:text-sm font-bold uppercase tracking-widest focus:outline-none transition-all"
                      >
                        {Array.from(
                          new Set(products.map((p) => p.category)),
                        ).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="Nueva Categoría">+ Crear Nueva</option>
                      </select>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="space-y-2 flex-1 flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-violet-400"></div>
                      <label className="text-[9px] sm:text-[10px] font-black uppercase text-violet-400 tracking-widest">
                        Descripción
                      </label>
                    </div>
                    <div className="relative group flex-1 flex flex-col min-w-0">
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="flex-1 min-h-24 sm:min-h-32 bg-gradient-to-r from-neutral-700/30 to-neutral-800/30 border border-neutral-600/50 group-focus-within:border-violet-500/50 rounded-lg sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-5 text-xs sm:text-sm font-bold uppercase tracking-widest focus:outline-none transition-all placeholder:text-neutral-600 resize-vertical"
                        placeholder="DESCRIBE EL SABOR..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Premium - Responsive */}
              <div className="border-t border-violet-500/10 bg-gradient-to-t from-neutral-900/80 to-transparent px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 flex gap-2 sm:gap-3 justify-end flex-wrap flex-shrink-0">
                {editingId && (
                  <button
                    onClick={() => {
                      setDeleteConfirm(editingId);
                      setIsModalOpen(false);
                    }}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/50 text-red-400 hover:border-red-500 rounded-lg sm:rounded-xl font-black uppercase text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] hover:bg-gradient-to-r hover:from-red-500/30 hover:to-red-600/30 transition-all flex items-center gap-1.5 sm:gap-2 mr-auto shadow-lg shadow-red-500/10"
                  >
                    <Trash2 size={16} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Eliminar</span>
                    <span className="sm:hidden">Borrar</span>
                  </button>
                )}

                <button
                  onClick={handleSaveProduct}
                  className="px-4 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg sm:rounded-xl font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-1.5 sm:gap-2 hover:from-violet-600 hover:to-purple-700 transition-all shadow-xl shadow-violet-500/30 active:scale-95"
                >
                  <Save size={16} className="sm:w-4 sm:h-4" />
                  <span>Guardar</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 sm:px-8 py-2.5 sm:py-3 bg-neutral-700/50 border border-neutral-600/50 text-neutral-300 rounded-lg sm:rounded-xl font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] hover:bg-neutral-700 hover:border-neutral-500 transition-all"
                >
                  <span className="hidden sm:inline">Cancelar</span>
                  <span className="sm:hidden">Cerrar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CONFIRMACIÓN ELIMINAR */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <div className="bg-neutral-900 border border-red-500/30 w-full max-w-md rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="text-red-500" size={28} />
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  Eliminar Producto
                </h3>
              </div>

              <p className="text-sm text-neutral-400 mb-8">
                ¿Estás seguro de que deseas eliminar este producto? Esta acción
                no se puede deshacer.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteProduct(deleteConfirm)}
                  className="flex-1 bg-red-500 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 transition-all"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-neutral-800 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] border border-white/10 hover:border-white/20 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CONFIRMACIÓN ELIMINAR MASIVO */}
        {bulkDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <div className="bg-neutral-900 border border-red-500/30 w-full max-w-md rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="text-red-500" size={28} />
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  Eliminar Productos
                </h3>
              </div>

              <p className="text-sm text-neutral-400 mb-8">
                ¿Estás seguro de que deseas eliminar {selectedProducts.size}{" "}
                producto{selectedProducts.size !== 1 ? "s" : ""}? Esta acción no
                se puede deshacer.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 bg-red-500 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 transition-all"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setBulkDeleteConfirm(false)}
                  className="flex-1 bg-neutral-800 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] border border-white/10 hover:border-white/20 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Productos;
