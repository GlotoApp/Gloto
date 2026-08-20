import React, { useState, useMemo, useEffect } from "react";
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
  Archive,
} from "lucide-react";
import Categorias from "./Categorias";
import defaultImg from "../../public/default.png";
import { supabase } from "../../src/lib/supabaseClient";
import { useAuth } from "../../src/components/AuthContext";

const handleImageError = (e) => {
  e.target.onerror = null; // Previene bucles infinitos si la imagen por defecto también falla
  e.target.src = defaultImg;
};

const Productos = ({ section = "productos" }) => {
  const { user } = useAuth();
  // ========== ESTADO COMPARTIDO ==========
  const [categories, setCategories] = useState([
    "Frituras",
    "Barra Café",
    "Panadería",
  ]);
  const [categoryRecords, setCategoryRecords] = useState([]);
  const [businessId, setBusinessId] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);

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
  const [bulkPermanentDeleteConfirm, setBulkPermanentDeleteConfirm] =
    useState(false);
  const [sortBy, setSortBy] = useState("order");
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    category: "",
    price: "",
    description: "",
    stock: 0,
    image: "",
  });

  // Estado inicial del catálogo
  const [products, setProducts] = useState([]);

  const mapProduct = (product, categoryMap) => ({
    ...product,
    categoryId: product.category_id || "",
    category: categoryMap[product.category_id] || "Sin categoría",
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    orderIndex: Number(product.order_index || 0),
    isActive: product.is_active !== false && product.is_active !== "false",
    isSoldOut: product.is_sold_out === true || product.is_sold_out === "true",
    image: product.image_url || "",
  });

  useEffect(() => {
    const loadProducts = async () => {
      if (!user?.id) {
        setProducts([]);
        setLoadingProducts(false);
        return;
      }

      setLoadingProducts(true);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile?.business_id) {
        setProducts([]);
        setLoadingProducts(false);
        return;
      }
      setBusinessId(profile.business_id);

      const [{ data: categoriesData }, { data: productsData, error }] =
        await Promise.all([
          supabase
            .from("categories_shop")
            .select("id, name")
            .eq("business_id", profile.business_id)
            .order("name"),
          supabase
            .from("products")
            .select("*")
            .eq("business_id", profile.business_id)
            .order("order_index", { ascending: true }),
        ]);

      if (error) {
        console.error("Error cargando productos:", error);
        setProducts([]);
      } else {
        const records = categoriesData || [];
        const categoryMap = Object.fromEntries(
          records.map((category) => [category.id, category.name]),
        );
        setCategoryRecords(records);
        setCategories(records.map((category) => category.name));
        setProducts(
          (productsData || []).map((product) =>
            mapProduct(product, categoryMap),
          ),
        );
      }

      setLoadingProducts(false);
    };

    loadProducts();
  }, [user]);

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
      result = result.filter((p) => p.isActive && !p.isSoldOut);
    } else if (filterStatus === "agotados") {
      result = result.filter((p) => p.isActive && p.isSoldOut);
    } else if (filterStatus === "archivados") {
      result = result.filter((p) => !p.isActive);
    }

    // Ordenar
    result.sort((a, b) => {
      if (sortBy === "order") {
        return (
          a.orderIndex - b.orderIndex ||
          a.category.localeCompare(b.category) ||
          a.name.localeCompare(b.name)
        );
      }
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
      categoryId: categoryRecords[0]?.id || "",
      category: categoryRecords[0]?.name || "",
      price: "",
      description: "",
      stock: 0,
      image: "",
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEditProduct = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      categoryId: product.categoryId,
      category: product.category,
      price: product.price,
      description: product.description,
      stock: product.stock,
      image: product.image,
    });
    setIsModalOpen(true);
  };

  // Guardar producto
  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price) {
      alert("Completa nombre y precio");
      return;
    }

    if (!formData.categoryId) {
      alert("Selecciona una categoría");
      return;
    }

    setSavingProduct(true);
    const payload = {
      name: formData.name.trim(),
      category_id: formData.categoryId,
      price: Number(formData.price),
      description: formData.description || "",
      stock: Number(formData.stock) || 0,
      image_url: formData.image || null,
    };
    let query;
    if (editingId) {
      query = supabase.from("products").update(payload).eq("id", editingId);
    } else {
      const { data: lastProduct, error: indexError } = await supabase
        .from("products")
        .select("order_index")
        .eq("business_id", businessId)
        .eq("category_id", formData.categoryId)
        .not("order_index", "is", null)
        .order("order_index", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (indexError) {
        console.error("Error obteniendo el último order_index:", indexError);
        alert("No se pudo calcular el orden del producto");
        setSavingProduct(false);
        return;
      }

      const nextOrderIndex = Number(lastProduct?.order_index || 0) + 1;
      query = supabase.from("products").insert({
        ...payload,
        business_id: businessId,
        order_index: nextOrderIndex,
        is_active: true,
        is_sold_out: false,
      });
    }
    const { data, error } = await query.select().single();

    if (error) {
      console.error("Error guardando producto:", error);
      alert("No se pudo guardar el producto");
    } else {
      const categoryMap = Object.fromEntries(
        categoryRecords.map((category) => [category.id, category.name]),
      );
      const mappedProduct = mapProduct(data, categoryMap);
      setProducts((current) =>
        editingId
          ? current.map((product) =>
              product.id === editingId ? mappedProduct : product,
            )
          : [...current, mappedProduct],
      );
      setIsModalOpen(false);
    }

    setSavingProduct(false);
  };

  // Archivar producto sin romper el historial de pedidos
  const handleDeleteProduct = async (id) => {
    const { error } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", id);
    if (error) {
      console.error("Error archivando producto:", error);
      alert("No se pudo archivar el producto");
      return;
    }
    setProducts((current) =>
      current.map((product) =>
        product.id === id ? { ...product, isActive: false } : product,
      ),
    );
    setDeleteConfirm(null);
  };

  // Eliminar imagen
  const handleDeleteImage = (e) => {
    e.stopPropagation();
    setFormData({ ...formData, image: "" });
  };

  // Toggle disponibilidad
  const handleToggleSoldOut = async (id) => {
    const product = products.find((item) => item.id === id);
    if (!product) return;
    const nextIsSoldOut = !product.isSoldOut;
    const { error } = await supabase
      .from("products")
      .update({ is_sold_out: nextIsSoldOut })
      .eq("id", id);
    if (error) {
      console.error("Error actualizando disponibilidad:", error);
      return;
    }
    setProducts((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isSoldOut: nextIsSoldOut } : item,
      ),
    );
  };

  const handleToggleArchived = async (id) => {
    const product = products.find((item) => item.id === id);
    if (!product) return;

    const nextIsActive = !product.isActive;
    const { error } = await supabase
      .from("products")
      .update({ is_active: nextIsActive })
      .eq("id", id);
    if (error) {
      console.error("Error archivando producto:", error);
      return;
    }
    setProducts((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isActive: nextIsActive } : item,
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

  const handleToggleSelectAllFiltered = () => {
    const filteredIds = filteredProducts.map((product) => product.id);
    const allFilteredSelected =
      filteredIds.length > 0 &&
      filteredIds.every((id) => selectedProducts.has(id));
    const nextSelected = new Set(selectedProducts);

    filteredIds.forEach((id) => {
      if (allFilteredSelected) {
        nextSelected.delete(id);
      } else {
        nextSelected.add(id);
      }
    });

    setSelectedProducts(nextSelected);
  };

  // Cambiar estado en lote
  const handleBulkToggleStatus = async (newStatus) => {
    const ids = [...selectedProducts];
    const { error } = await supabase
      .from("products")
      .update({ is_sold_out: !newStatus })
      .in("id", ids);
    if (error) {
      console.error("Error actualizando productos:", error);
      return;
    }
    setProducts((current) =>
      current.map((product) =>
        selectedProducts.has(product.id)
          ? { ...product, isSoldOut: !newStatus }
          : product,
      ),
    );
    setSelectedProducts(new Set());
  };

  // Archivar productos en lote sin romper el historial de pedidos
  const handleBulkDelete = async () => {
    const ids = [...selectedProducts];
    const { error } = await supabase
      .from("products")
      .update({ is_active: false })
      .in("id", ids);
    if (error) {
      console.error("Error archivando productos:", error);
      return;
    }
    setProducts((current) =>
      current.map((product) =>
        selectedProducts.has(product.id)
          ? { ...product, isActive: false }
          : product,
      ),
    );
    setSelectedProducts(new Set());
    setBulkDeleteConfirm(false);
  };

  const handleBulkUnarchive = async () => {
    const ids = [...selectedProducts];
    const { error } = await supabase
      .from("products")
      .update({ is_active: true })
      .in("id", ids);
    if (error) {
      console.error("Error desarchivando productos:", error);
      alert("No se pudieron desarchivar los productos");
      return;
    }
    setProducts((current) =>
      current.map((product) =>
        selectedProducts.has(product.id)
          ? { ...product, isActive: true }
          : product,
      ),
    );
    setSelectedProducts(new Set());
  };

  const handleBulkPermanentDelete = async () => {
    const ids = [...selectedProducts];
    const { error } = await supabase.from("products").delete().in("id", ids);
    if (error) {
      console.error("Error eliminando productos permanentemente:", error);
      if (error.code === "23503") {
        alert(
          "Algunos productos tienen pedidos asociados y no pueden eliminarse. Usa Archivar para conservar el historial.",
        );
      } else {
        alert("No se pudieron eliminar los productos");
      }
      return;
    }
    setProducts((current) =>
      current.filter((product) => !selectedProducts.has(product.id)),
    );
    setSelectedProducts(new Set());
    setBulkPermanentDeleteConfirm(false);
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
        <h1 className="text-2xl font-black tracking-tighter mb-3">Productos</h1>
        <header className="px-0 pt-2 pb-5  flex-shrink-0">
          {/* Fila Superior: Info y Cierre */}
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-2">
              {/* Indicadores de Estado: Ahora más limpios, sutiles y fáciles de leer */}
              <div className="flex items-center gap-3 flex-wrap select-none">
                <div className="flex items-center gap-2 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  <span className="ml-1 text-[8px] font-black uppercase tracking-widest text-neutral-600">
                    {products.length} Total
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-1 text-[8px] font-black uppercase tracking-widest text-neutral-600">
                    <span className="text-emerald-400 font-black">
                      {
                        products.filter((p) => p.isActive && !p.isSoldOut)
                          .length
                      }
                    </span>{" "}
                    Activos
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500/80" />
                  <span className="ml-1 text-[8px] font-black uppercase tracking-widest text-neutral-600">
                    <span className="text-rose-400 font-black">
                      {products.filter((p) => p.isActive && p.isSoldOut).length}
                    </span>{" "}
                    Agotados
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500/80" />
                  <span className="ml-1 text-[8px] font-black uppercase tracking-widest text-neutral-600">
                    <span className="text-slate-300 font-black">
                      {products.filter((p) => !p.isActive).length}
                    </span>{" "}
                    Archivados
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fila Inferior: Botonera Estilizada */}
          <div className="flex items-center justify-between gap-2 mt-4 flex-wrap w-full">
            {/* Vista Normal: Botones de Nuevo Item y Seleccionar */}
            {!isSelectionMode && (
              <>
                <button
                  onClick={handleNewProduct}
                  className="px-4 py-2 rounded-lg border text-[9px] font-black uppercase active:scale-95 transition-all flex items-center gap-2 bg-white/[0.03] border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.15]"
                >
                  <Plus size={11} className="text-violet-400" /> Nuevo
                </button>

                <button
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    setSelectedProducts(new Set());
                  }}
                  className="px-4 py-2 rounded-lg border text-[9px] font-black uppercase active:scale-95 transition-all flex items-center gap-2"
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
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={handleToggleSelectAllFiltered}
                    aria-pressed={
                      filteredProducts.length > 0 &&
                      filteredProducts.every((product) =>
                        selectedProducts.has(product.id),
                      )
                    }
                    className="px-3 py-1.5 rounded-lg border border-violet-500/25 bg-violet-500/10 text-violet-300 text-[8px] font-black uppercase tracking-wide active:scale-95 transition-all"
                  >
                    {filteredProducts.length > 0 &&
                    filteredProducts.every((product) =>
                      selectedProducts.has(product.id),
                    )
                      ? "Quitar selección"
                      : "Seleccionar todo"}
                  </button>

                  {/* Acciones Masivas a la izquierda */}
                  {selectedProducts.size > 0 && (
                    <>
                      {/* Activar Masivo */}
                      <button
                        onClick={() => handleBulkToggleStatus(true)}
                        className="px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-wide active:scale-95 transition-all flex items-center gap-1.5"
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
                        className="px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-wide active:scale-95 transition-all flex items-center gap-1.5"
                        style={{
                          background: "rgba(244,63,94,0.1)",
                          borderColor: "rgba(244,63,94,0.3)",
                          color: "#fb7185",
                        }}
                      >
                        Agotar
                      </button>

                      {/* Archivar Masivo */}
                      <button
                        onClick={() => setBulkDeleteConfirm(true)}
                        className="px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-wide active:scale-95 transition-all flex items-center gap-1.5"
                        style={{
                          background: "rgba(139,92,246,0.1)",
                          borderColor: "rgba(139,92,246,0.35)",
                          color: "#c084fc",
                        }}
                      >
                        <Archive size={11} />
                        Archivar
                      </button>

                      {/* Desarchivar Masivo */}
                      <button
                        onClick={handleBulkUnarchive}
                        className="px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-wide active:scale-95 transition-all flex items-center gap-1.5"
                        style={{
                          background: "rgba(16,185,129,0.1)",
                          borderColor: "rgba(16,185,129,0.3)",
                          color: "#6ee7b7",
                        }}
                      >
                        <Archive size={11} />
                        Desarchivar
                      </button>

                      {/* Eliminar permanentemente, última acción destructiva */}
                      <button
                        onClick={() => setBulkPermanentDeleteConfirm(true)}
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
                    </>
                  )}
                </div>

                {selectedProducts.size > 0 && (
                  <button
                    onClick={() => setSelectedProducts(new Set())}
                    className="px-3 py-1.5 bg-neutral-900 border border-white/5 text-neutral-400 rounded-lg hover:bg-neutral-800 hover:text-neutral-200 active:scale-95 transition-all text-[8px] font-black uppercase tracking-wide"
                  >
                    Limpiar
                  </button>
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
        <div className="bg-neutral-900/30 border border-white/5 p-4 rounded-2xl mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-violet-500 transition-colors"
                size={14}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="BUSCAR NOMBRE O CATEGORÍA..."
                className="w-full bg-neutral-900/50 border border-white/5 rounded-xl py-3 pl-10 pr-10 text-[10px] font-mono outline-none focus:border-violet-500/40 transition-all placeholder:text-neutral-700"
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
              <label className="text-[8px] font-black text-neutral-600 uppercase tracking-widest ml-1 block mb-2">
                Categoría
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-neutral-900 border border-white/5 rounded-xl py-2.5 px-3 text-[10px] font-mono text-neutral-300 uppercase focus:border-violet-500/40 outline-none transition-all cursor-pointer"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "todos" ? "Todas" : cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[8px] font-black text-neutral-600 uppercase tracking-widest ml-1 block mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-neutral-900 border border-white/5 rounded-xl py-2.5 px-3 text-[10px] font-mono text-neutral-300 uppercase focus:border-violet-500/40 outline-none transition-all cursor-pointer"
              >
                <option value="todos">Todos</option>
                <option value="activos">Activos</option>
                <option value="agotados">Agotados</option>
                <option value="archivados">Archivados</option>
              </select>
            </div>
            <div>
              <label className="text-[8px] font-black text-neutral-600 uppercase tracking-widest ml-1 block mb-2">
                Ordenar
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-neutral-900 border border-white/5 rounded-xl py-2.5 px-3 text-[10px] font-mono text-neutral-300 uppercase focus:border-violet-500/40 outline-none transition-all cursor-pointer"
              >
                <option value="order">Orden del catálogo</option>
                <option value="name">Por Nombre</option>
                <option value="price-asc">Precio: Menor</option>
                <option value="price-desc">Precio: Mayor</option>
              </select>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {loadingProducts ? (
            <div className="col-span-full py-20 text-center">
              <p className="text-sm font-bold uppercase text-neutral-500 tracking-widest">
                Cargando productos...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
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
                  !item.isActive
                    ? "bg-slate-500/5 border-slate-500/20 hover:border-slate-400/40 hover:bg-slate-500/10"
                    : !item.isSoldOut
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
                        !item.isActive
                          ? "bg-slate-500/80 text-slate-100 border-slate-400/30"
                          : !item.isSoldOut
                            ? "bg-emerald-500 text-fff border-emerald-500/30"
                            : "bg-red-500 text-red-fff border-red-500/30"
                      }`}
                    >
                      {!item.isActive
                        ? "Archivado"
                        : !item.isSoldOut
                          ? "Activo"
                          : "Agotado"}
                    </div>
                  </div>

                  {/* Checkbox o Botón Archivar Superior Derecha */}
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
                        title="Archivar"
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
                  <div className="pt-2.5 border-t border-white/5 flex justify-between items-center gap-1 px-2 md:px-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleArchived(item.id);
                      }}
                      className={`p-1.5 md:p-2 rounded-lg active:scale-95 transition-all ${
                        item.isActive
                          ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                          : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                      title={item.isActive ? "Archivar" : "Desarchivar"}
                    >
                      <Archive size={16} />
                    </button>

                    {/* Switch de Estado */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSoldOut(item.id);
                      }}
                      className={`relative inline-flex h-6 w-10 md:h-7 md:w-12 items-center rounded-full transition-colors ${
                        item.isSoldOut ? "bg-red-500" : "bg-emerald-500"
                      }`}
                      title={item.isSoldOut ? "Agotado" : "Disponible"}
                    >
                      <span
                        className={`inline-block h-4 w-4 md:h-5 md:w-5 transform rounded-full bg-white transition-transform ${
                          !item.isSoldOut
                            ? "translate-x-5 md:translate-x-6"
                            : "translate-x-1"
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
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto">
            <div className="min-h-screen w-full bg-neutral-900 overflow-hidden flex flex-col">
              {/* Header Premium - Responsive */}
              <div className="relative overflow-hidden flex-shrink-0">
                <div className="relative px-4 sm:px-8 md:px-12 py-4 sm:py-6 flex justify-between items-start gap-3 sm:gap-4 border-b border-white/10">
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
                      <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
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
              </div>

              {/* Contenido Principal - Responsive */}
              <div className="flex flex-col md:flex-row gap-6 md:gap-10 p-4 sm:p-8 md:p-12 overflow-y-auto flex-1">
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
                          {/* Disponibilidad */}
                          <div className="flex flex-col justify-center items-center">
                            <span className="text-[7px] sm:text-[7px] font-bold text-neutral-500 uppercase tracking-widest ">
                              Disponibilidad
                            </span>
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-[14px] sm:text-xs font-black ${
                                  !products.find((p) => p.id === editingId)
                                    ?.isSoldOut
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {products.find((p) => p.id === editingId)
                                  ?.isSoldOut
                                  ? "Agotado"
                                  : "Disponible"}
                              </span>
                              <button
                                onClick={() => handleToggleSoldOut(editingId)}
                                className={`relative inline-flex h-6 sm:h-7 w-10 sm:w-12 items-center rounded-full transition-all cursor-pointer shadow-lg ${
                                  !products.find((p) => p.id === editingId)
                                    ?.isSoldOut
                                    ? "bg-emerald-500 shadow-emerald-500/50"
                                    : "bg-red-500 shadow-red-500/50"
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 sm:h-5 w-4 sm:w-5 transform rounded-full bg-white transition-all shadow-md ${
                                    !products.find((p) => p.id === editingId)
                                      ?.isSoldOut
                                      ? "translate-x-5 sm:translate-x-5.5"
                                      : "translate-x-0.5 sm:translate-x-1"
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          {/* Archivado */}
                          <div className="flex flex-col justify-center items-center">
                            <span className="text-[7px] sm:text-[7px] font-bold text-neutral-500 uppercase tracking-widest">
                              Archivado
                            </span>
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-[14px] sm:text-xs font-black ${
                                  products.find((p) => p.id === editingId)
                                    ?.isActive
                                    ? "text-slate-400"
                                    : "text-violet-400"
                                }`}
                              >
                                {products.find((p) => p.id === editingId)
                                  ?.isActive
                                  ? "No"
                                  : "Sí"}
                              </span>
                              <button
                                onClick={() => handleToggleArchived(editingId)}
                                aria-label="Cambiar estado de archivado"
                                className={`relative inline-flex h-6 sm:h-7 w-10 sm:w-12 items-center rounded-full transition-all cursor-pointer shadow-lg ${
                                  products.find((p) => p.id === editingId)
                                    ?.isActive
                                    ? "bg-neutral-700 shadow-neutral-700/40"
                                    : "bg-violet-500 shadow-violet-500/50"
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 sm:h-5 w-4 sm:w-5 transform rounded-full bg-white transition-all shadow-md ${
                                    products.find((p) => p.id === editingId)
                                      ?.isActive
                                      ? "translate-x-0.5 sm:translate-x-1"
                                      : "translate-x-5 sm:translate-x-5.5"
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
                        value={formData.categoryId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categoryId: e.target.value,
                            category:
                              categoryRecords.find(
                                (category) => category.id === e.target.value,
                              )?.name || "",
                          })
                        }
                        className="w-full bg-gradient-to-r from-neutral-700/30 to-neutral-800/30 border border-neutral-600/50 focus:border-violet-500/50 rounded-lg sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-5 text-xs sm:text-sm font-bold uppercase tracking-widest focus:outline-none transition-all"
                      >
                        {categoryRecords.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-violet-400"></div>
                      <label className="text-[9px] sm:text-[10px] font-black uppercase text-violet-400 tracking-widest">
                        Stock
                      </label>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      className="w-full bg-gradient-to-r from-neutral-700/30 to-neutral-800/30 border border-neutral-600/50 rounded-lg sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-5 text-xs sm:text-sm font-bold focus:outline-none focus:border-violet-500/50 transition-all"
                    />
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
                    <span className="hidden sm:inline">Archivar</span>
                    <span className="sm:hidden">Archivar</span>
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

        {/* MODAL CONFIRMACIÓN ARCHIVAR */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <div className="bg-neutral-900 border border-red-500/30 w-full max-w-md rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="text-red-500" size={28} />
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  Archivar Producto
                </h3>
              </div>

              <p className="text-sm text-neutral-400 mb-8">
                ¿Estás seguro de que deseas archivar este producto? Podrás
                recuperarlo desde el filtro de archivados.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteProduct(deleteConfirm)}
                  className="flex-1 bg-red-500 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 transition-all"
                >
                  Archivar
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

        {/* MODAL CONFIRMACIÓN ARCHIVAR MASIVO */}
        {bulkDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <div className="bg-neutral-900 border border-red-500/30 w-full max-w-md rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="text-red-500" size={28} />
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  Archivar Productos
                </h3>
              </div>

              <p className="text-sm text-neutral-400 mb-8">
                ¿Estás seguro de que deseas archivar {selectedProducts.size}{" "}
                producto{selectedProducts.size !== 1 ? "s" : ""}? Podrás
                recuperarlos desde el filtro de archivados.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 bg-red-500 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 transition-all"
                >
                  Archivar
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

        {bulkPermanentDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <div className="bg-neutral-900 border border-red-500/30 w-full max-w-md rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="text-red-500" size={28} />
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  Eliminar Productos
                </h3>
              </div>

              <p className="text-sm text-neutral-400 mb-8">
                Esta acción es permanente para {selectedProducts.size} producto
                {selectedProducts.size !== 1 ? "s" : ""}. Los productos con
                pedidos asociados no podrán eliminarse.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleBulkPermanentDelete}
                  className="flex-1 bg-red-500 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 transition-all"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setBulkPermanentDeleteConfirm(false)}
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
