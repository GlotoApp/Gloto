import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  AlertTriangle,
  GripVertical,
  Layers,
  Check,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Info,
} from "lucide-react";

const CategoriasAdmin = ({
  categories,
  products = [],
  onUpdateCategories,
  onDeleteCategoryCascade,
}) => {
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    setCategoriesList(
      categories.map((cat, index) => ({
        id: index + 1,
        name: cat,
        color:
          index % 8 === 0
            ? "violet"
            : index % 8 === 1
              ? "blue"
              : index % 8 === 2
                ? "emerald"
                : "amber",
        available: true,
      })),
    );
  }, [categories]);

  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Estados de control de Drag & Drop (Escritorio)
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // 📱 Estados de control Touch (Móviles)
  const [touchStartIndex, setTouchStartIndex] = useState(null);
  const [touchCurrentIndex, setTouchCurrentIndex] = useState(null);
  const containerRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    color: "violet",
    available: true,
  });

  const colors = [
    "violet",
    "blue",
    "cyan",
    "emerald",
    "amber",
    "orange",
    "rose",
    "pink",
    "lime",
    "yellow",
    "red",
    "purple",
    "fuchsia",
    "indigo",
    "teal",
    "slate",
  ];

  const colorClasses = {
    violet:
      "bg-violet-500 text-violet-400 border-violet-400/50 shadow-[0_0_14px_rgba(139,92,246,0.6)] bg-opacity-100",
    blue: "bg-blue-500 text-blue-400 border-blue-400/50 shadow-[0_0_14px_rgba(59,130,246,0.6)] bg-opacity-100",
    cyan: "bg-cyan-400 text-cyan-400 border-cyan-300/50 shadow-[0_0_14px_rgba(34,211,238,0.6)] bg-opacity-100",
    emerald:
      "bg-emerald-500 text-emerald-400 border-emerald-400/50 shadow-[0_0_14px_rgba(16,185,129,0.6)] bg-opacity-100",
    amber:
      "bg-amber-500 text-amber-400 border-amber-400/50 shadow-[0_0_14px_rgba(245,158,11,0.6)] bg-opacity-100",
    orange:
      "bg-orange-500 text-orange-400 border-orange-400/50 shadow-[0_0_14px_rgba(249,115,22,0.6)] bg-opacity-100",
    rose: "bg-rose-500 text-rose-400 border-rose-400/50 shadow-[0_0_14px_rgba(244,63,94,0.6)] bg-opacity-100",
    pink: "bg-pink-500 text-pink-400 border-pink-400/50 shadow-[0_0_14px_rgba(236,72,153,0.6)] bg-opacity-100",
    lime: "bg-lime-400 text-lime-400 border-lime-300/50 shadow-[0_0_14px_rgba(163,230,53,0.6)] bg-opacity-100",
    yellow:
      "bg-yellow-400 text-yellow-300 border-yellow-300/50 shadow-[0_0_14px_rgba(250,204,21,0.7)] bg-opacity-100",
    red: "bg-red-500 text-red-400 border-red-400/50 shadow-[0_0_14px_rgba(239,68,68,0.6)] bg-opacity-100",
    purple:
      "bg-purple-600 text-purple-400 border-purple-400/50 shadow-[0_0_14px_rgba(147,51,234,0.6)] bg-opacity-100",
    fuchsia:
      "bg-fuchsia-500 text-fuchsia-400 border-fuchsia-400/50 shadow-[0_0_14px_rgba(217,70,239,0.6)] bg-opacity-100",
    indigo:
      "bg-indigo-500 text-indigo-400 border-indigo-400/50 shadow-[0_0_14px_rgba(99,102,241,0.6)] bg-opacity-100",
    teal: "bg-teal-400 text-teal-300 border-teal-300/50 shadow-[0_0_14px_rgba(45,212,191,0.6)] bg-opacity-100",
    slate:
      "bg-slate-400 text-slate-300 border-slate-300/50 shadow-[0_0_14px_rgba(148,163,184,0.5)] bg-opacity-100",
  };

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  const handleNewCategory = () => {
    setEditingIndex(null);
    setFormData({ name: "", color: "violet", available: true });
    setIsModalOpen(true);
  };

  const handleEditCategory = (index) => {
    setEditingIndex(index);
    setFormData(categoriesList[index]);
    setIsModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (!formData.name.trim()) {
      alert("Completa el nombre de la categoría");
      return;
    }

    let updated = [...categoriesList];
    if (editingIndex !== null) {
      updated[editingIndex] = { ...updated[editingIndex], ...formData };
    } else {
      updated.push({
        id: Math.max(...categoriesList.map((c) => c.id), 0) + 1,
        name: formData.name,
        color: formData.color,
        available: formData.available,
      });
    }

    setCategoriesList(updated);
    setIsModalOpen(false);
    onUpdateCategories(updated.map((c) => c.name));
  };

  const handleDeleteCategoryFinal = (index) => {
    const categoryToDelete = categoriesList[index];
    const updated = categoriesList.filter((_, i) => i !== index);

    setCategoriesList(updated);
    setDeleteConfirm(null);
    onUpdateCategories(updated.map((c) => c.name));

    if (onDeleteCategoryCascade) {
      onDeleteCategoryCascade(categoryToDelete.name);
    }
  };

  const handleToggleAvailable = (index) => {
    const updated = [...categoriesList];
    updated[index].available = !updated[index].available;
    setCategoriesList(updated);
  };

  // Función unificada para reordenar la lista (más inteligente)
  const reorderList = (fromIndex, toIndex) => {
    if (fromIndex === null || toIndex === null || fromIndex === toIndex) return;

    const updatedList = [...categoriesList];
    const [draggedItem] = updatedList.splice(fromIndex, 1);

    // Ajustar índice si movemos hacia adelante (los índices se desplazan)
    let finalIndex = toIndex;
    if (fromIndex < toIndex) {
      finalIndex = toIndex - 1;
    }

    // Asegurar que no estamos fuera de límites
    finalIndex = Math.min(finalIndex, updatedList.length);

    updatedList.splice(finalIndex, 0, draggedItem);

    setCategoriesList(updatedList);
    onUpdateCategories(updatedList.map((c) => c.name));
  };

  // Sin lógica compleja de reorden visual - todo simple y directo
  const getVisualOrder = () => {
    const isDragging = draggedIndex !== null || touchStartIndex !== null;

    if (!isDragging) {
      return categoriesList.map((cat, idx) => ({
        type: "cat",
        idx,
        data: cat,
      }));
    }

    const dragIdx = draggedIndex ?? touchStartIndex;
    const dropIdx = draggedIndex !== null ? dragOverIndex : touchCurrentIndex;

    const result = [];

    for (let i = 0; i < categoriesList.length; i++) {
      // Insertar espacio ANTES de esta posición si es donde va a caer
      if (dropIdx === i && i !== dragIdx) {
        result.push({ type: "spacer", idx: i });
      }

      // Agregar la categoría siempre (incluso la que se arrastra)
      result.push({
        type: "cat",
        idx: i,
        data: categoriesList[i],
      });
    }

    // Espacio al final si va al final
    if (dropIdx === categoriesList.length) {
      result.push({ type: "spacer", idx: categoriesList.length });
    }

    return result;
  };

  // =========================================================================
  // 🧠 DETECCIÓN INTELIGENTE DE ÍNDICE DE DROP
  // =========================================================================
  const calculateDropIndex = (rect, clientY) => {
    // Dividir en 3 zonas: arriba (30%), medio (40%), abajo (30%)
    const thirdHeight = rect.height / 3;
    const distFromTop = clientY - rect.top;

    if (distFromTop < thirdHeight) {
      // Zona superior - insertar ANTES
      return { index: null }; // No cambiar si está en zona media
    } else if (distFromTop < thirdHeight * 2) {
      // Zona media - mantener posición actual (zona ambigua)
      return { index: null };
    } else {
      // Zona inferior - insertar DESPUÉS
      return { index: 1 };
    }
  };

  // =========================================================================
  // 📱 MANEJADORES DE EVENTOS TOUCH (MÓVILES)
  // =========================================================================
  const handleTouchStart = (index) => {
    setTouchStartIndex(index);
    setTouchCurrentIndex(index);
  };

  const handleTouchMove = (e) => {
    if (touchStartIndex === null) return;

    const touch = e.touches[0];
    const targetElement = document.elementFromPoint(
      touch.clientX,
      touch.clientY,
    );

    if (!targetElement) return;

    const closestCard = targetElement.closest("[data-category-index]");
    if (closestCard) {
      const overIdx = parseInt(
        closestCard.getAttribute("data-category-index"),
        10,
      );
      if (overIdx === touchStartIndex) return; // No cambiar si es el mismo elemento

      const rect = closestCard.getBoundingClientRect();
      const { index: offset } = calculateDropIndex(rect, touch.clientY);

      // Si estamos en zona ambigua, no actualizar
      if (offset === null) {
        return;
      }

      const targetIdx = overIdx + offset;
      if (touchCurrentIndex !== targetIdx) {
        setTouchCurrentIndex(targetIdx);
      }
    } else {
      // Zona inteligente al final
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        if (
          touch.clientY > rect.bottom - 120 &&
          touchCurrentIndex !== categoriesList.length
        ) {
          setTouchCurrentIndex(categoriesList.length);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (
      touchStartIndex !== null &&
      touchCurrentIndex !== null &&
      touchStartIndex !== touchCurrentIndex
    ) {
      // Si tocamos después del último elemento, colocar al final
      const finalIndex =
        touchCurrentIndex > categoriesList.length - 1
          ? categoriesList.length
          : touchCurrentIndex;

      reorderList(touchStartIndex, finalIndex);
    }
    // Resetear estados touch
    setTouchStartIndex(null);
    setTouchCurrentIndex(null);
  };

  return (
    <div className="min-h-screen bg-background text-neutral-200 p-4 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tighter">Categorías</h1>

          <header className="px-2 pt-2 pb-5 border-b border-white/5 flex justify-between">
            <div className="space-y-2 flex items-center">
              <div className="flex items-center gap-4 flex-wrap select-none">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-400">
                    {categoriesList.length} Total
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                    <span className="text-emerald-400 font-black">
                      {categoriesList.filter((c) => c.available).length}
                    </span>{" "}
                    Activas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                    <span className="text-rose-400 font-black">
                      {categoriesList.filter((c) => !c.available).length}
                    </span>{" "}
                    Desactivadas
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleNewCategory}
              className="px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center gap-2 bg-white/[0.03] border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.15] self-start md:self-auto"
            >
              <Plus size={12} className="text-violet-400" /> Nueva Categoría
            </button>
          </header>
        </div>

        {/* LISTADO DE CATEGORÍAS */}
        <div ref={containerRef} className="grid grid-cols-1 gap-3 select-none">
          {getVisualOrder().map((item) => {
            // ===== RENDERIZAR ESPACIO/SEPARADOR =====
            if (item.type === "spacer") {
              return (
                <div
                  key={`spacer-${item.idx}`}
                  className="h-20 rounded-2xl border-2 border-dashed border-violet-500/40 bg-gradient-to-r from-violet-500/5 via-transparent to-violet-500/5 flex items-center justify-center"
                ></div>
              );
            }

            // ===== RENDERIZAR CATEGORÍA =====
            const category = item.data;
            const index = item.idx;

            const associatedProducts = products.filter(
              (p) => p.category?.toLowerCase() === category.name?.toLowerCase(),
            );
            const isExpanded = expandedCategories.has(category.id);
            const isCurrentlyDragged =
              draggedIndex === index || touchStartIndex === index;

            return (
              <div
                key={category.id}
                data-category-index={index} // Atributo clave para ubicar el índice mediante touch
                draggable
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedIndex === null || draggedIndex === index) return;

                  const rect = e.currentTarget.getBoundingClientRect();
                  const { index: offset } = calculateDropIndex(rect, e.clientY);

                  // Si estamos en zona ambigua, no actualizar
                  if (offset === null) return;

                  // Calcular índice de drop inteligente
                  const targetIdx = index + offset;
                  if (dragOverIndex !== targetIdx) {
                    setDragOverIndex(targetIdx);
                  }
                }}
                onDragLeave={() => {
                  setDragOverIndex(null);
                }}
                onDrop={() => {
                  if (draggedIndex !== null && dragOverIndex !== null) {
                    reorderList(draggedIndex, dragOverIndex);
                  }
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                className={`flex flex-col rounded-2xl border overflow-hidden transition-all duration-150 ${
                  isCurrentlyDragged
                    ? "opacity-35 border-dashed border-violet-500/60 bg-black/50 scale-95 shadow-lg shadow-violet-500/5"
                    : category.available
                      ? "bg-neutral-900/40 border-white/5"
                      : "bg-red-500/5 border-red-500/20"
                }`}
              >
                <div className="flex flex-col w-full">
                  {/* FILA PRINCIPAL */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* 📱 El botón de GRIP ahora maneja los gestos táctiles en móviles de forma segura */}
                      <div
                        onTouchStart={() => handleTouchStart(index)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className="cursor-grab active:cursor-grabbing text-neutral-500 hover:text-violet-400 p-1.5 transition-all flex-shrink-0 touch-none duration-200"
                      >
                        <GripVertical size={24} />
                      </div>

                      <span className="font-mono text-[10px] text-neutral-400 font-bold bg-black/30 px-2 py-0.5 rounded border border-white/5">
                        #{index + 1}
                      </span>

                      <div
                        className={`w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0 ${
                          colorClasses[category.color].split(" ")[0]
                        } ${colorClasses[category.color].split(" ").slice(3).join(" ")}`}
                      />

                      <div className="min-w-0">
                        <h3 className="font-black text-sm uppercase tracking-wide text-neutral-100 truncate">
                          {category.name}
                        </h3>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 block mt-0.5">
                          {associatedProducts.length}{" "}
                          {associatedProducts.length === 1
                            ? "Producto"
                            : "Productos"}
                        </span>
                      </div>
                    </div>

                    <div className="flex w-full sm:w-auto justify-center sm:justify-end items-center gap-2.5 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 flex-shrink-0">
                      <button
                        onClick={() => toggleExpand(category.id)}
                        className="px-3 py-1.5 rounded-lg border border-white/5 bg-neutral-950/40 text-[9px] font-black uppercase tracking-wider text-neutral-400 hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <span>{isExpanded ? "Ocultar" : "Ver Productos"}</span>
                        {isExpanded ? (
                          <ChevronUp size={12} />
                        ) : (
                          <ChevronDown size={12} />
                        )}
                      </button>

                      <button
                        onClick={() => handleEditCategory(index)}
                        className="p-2 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 hover:text-violet-400 active:scale-95 transition-all border border-white/5"
                        title="Editar Configuración"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => handleToggleAvailable(index)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                          category.available ? "bg-emerald-500" : "bg-red-500"
                        }`}
                        title={category.available ? "Activa" : "Desactivada"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            category.available
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* SUBPANEL DESPLEGABLE DE PRODUCTOS */}
                  {isExpanded && (
                    <div className="px-4 pb-4 bg-black/30 border-t border-white/5 space-y-2 animate-fadeIn">
                      {associatedProducts.length === 0 ? (
                        <p className="text-[10px] text-neutral-600 uppercase font-bold tracking-wider py-2 italic text-center">
                          No hay productos en esta categoría.
                        </p>
                      ) : (
                        <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 mt-2">
                          {associatedProducts.map((prod) => (
                            <div
                              key={prod.id}
                              className="flex justify-between items-center py-2 px-3 bg-neutral-900/50 rounded-xl border border-white/[0.03]"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    prod.available
                                      ? "bg-emerald-400 shadow-[0_0_8px_#10b981]"
                                      : "bg-neutral-600"
                                  }`}
                                />
                                <span className="text-[10px] font-black text-neutral-300 uppercase tracking-wide truncate">
                                  {prod.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {!prod.available && (
                                  <span className="text-[8px] font-black bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded uppercase">
                                    Agotado
                                  </span>
                                )}
                                <span className="text-[10px] font-mono font-black text-white bg-black/40 px-2.5 py-0.5 rounded border border-white/5">
                                  ${prod.price?.toLocaleString("es-CO")}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* MODAL AJUSTES GIGANTE */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-2xl overflow-y-auto">
            <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 border border-violet-500/20 w-full max-w-5xl rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-violet-500/10 max-h-[95vh]">
              {/* Header Modal */}
              <div className="relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-600/10 to-transparent"></div>
                <div className="relative px-6 py-6 flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1 rounded-xl flex-shrink-0">
                      <Layers className="w-6 h-6 text-violet-400" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-tight">
                      {editingIndex !== null
                        ? "Editar Configuración"
                        : "Crear Nueva"}{" "}
                      Categoría
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all text-neutral-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>
              </div>

              {/* Contenido Modular */}
              <div
                className="flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8 overflow-y-auto"
                style={{ maxHeight: "calc(95vh - 160px)" }}
              >
                {/* Panel Izquierdo PREVISUALIZACIÓN */}
                <div className="w-full md:w-2/5 flex flex-col gap-6 flex-shrink-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-violet-400" />
                      <label className="text-[9px] sm:text-[10px] font-black uppercase text-violet-400 tracking-widest">
                        Previsualización Led
                      </label>
                    </div>
                    <div className="relative rounded-2xl border border-white/5 bg-gradient-to-br from-neutral-900 to-neutral-850 aspect-video md:aspect-square flex flex-col items-center justify-center p-4 text-center shadow-2xl">
                      <div
                        className={`w-16 h-16 rounded-full border-2 border-white/30 mb-4 transition-all duration-300 ${
                          colorClasses[formData.color].split(" ")[0]
                        } ${colorClasses[formData.color].split(" ").slice(3).join(" ")}`}
                      />
                      <span className="text-xs font-black uppercase tracking-widest text-white truncate max-w-full px-2">
                        {formData.name || "Nombre de categoría"}
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-500 mt-1">
                        Color Técnico: {formData.color}
                      </span>
                    </div>
                  </div>

                  {/* Switch */}
                  <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                          Disponibilidad
                        </span>
                        <span
                          className={`text-xs font-black uppercase mt-1 ${
                            formData.available
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {formData.available
                            ? "Activa / Visible"
                            : "Oculta / Desactivada"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            available: !formData.available,
                          })
                        }
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all cursor-pointer shadow-lg ${
                          formData.available
                            ? "bg-emerald-500 shadow-emerald-500/20"
                            : "bg-red-500 shadow-red-500/20"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all shadow-md ${
                            formData.available
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Panel Derecho REJILLA DE COLORES SELECCIONABLES */}
                <div className="flex-1 flex flex-col gap-5 min-w-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-violet-400" />
                      <label className="text-[9px] sm:text-[10px] font-black uppercase text-violet-400 tracking-widest">
                        Nombre de categoría
                      </label>
                    </div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-gradient-to-r from-neutral-700/30 to-neutral-800/30 border border-neutral-600/50 focus:border-violet-500/50 rounded-xl py-3.5 px-4 text-xs font-bold uppercase tracking-widest text-white focus:outline-none transition-all placeholder:text-neutral-700"
                      placeholder="EJ: BARRA CAFE / FRITURAS"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-violet-400" />
                      <label className="text-[9px] sm:text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                        Paleta de Color Técnico asignada
                      </label>
                    </div>
                    <div className="grid grid-cols-8 gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={`h-9 rounded-lg border transition-all flex items-center justify-center ${
                            formData.color === color
                              ? "border-white scale-[1.03]"
                              : "border-transparent opacity-40 hover:opacity-100"
                          } ${colorClasses[color].split(" ")[0]} ${
                            colorClasses[color].split(" ")[1]
                          } ${colorClasses[color].split(" ").slice(3).join(" ")}`}
                        >
                          {formData.color === color && (
                            <Check
                              size={16}
                              className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="border-t border-violet-500/10 bg-gradient-to-t from-neutral-900/80 to-transparent px-6 py-4 flex gap-3 justify-end flex-wrap flex-shrink-0">
                {editingIndex !== null && (
                  <button
                    onClick={() => {
                      setDeleteConfirm(editingIndex);
                      setIsModalOpen(false);
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/50 text-red-400 hover:border-red-500 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all flex items-center gap-1.5 mr-auto shadow-lg shadow-red-500/10"
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                )}

                <button
                  onClick={handleSaveCategory}
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.15em] flex items-center gap-2 hover:from-violet-600 transition-all shadow-xl shadow-violet-500/20 active:scale-95"
                >
                  <Save size={14} /> Guardar Cambios
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-neutral-700/50 border border-neutral-600/50 text-neutral-300 rounded-xl font-black uppercase text-[10px] tracking-wider hover:bg-neutral-700 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ADVERTENCIA ELIMINAR EN CASCADA */}
        {deleteConfirm !== null &&
          (() => {
            const catObj = categoriesList[deleteConfirm];
            const associatedProds = products.filter(
              (p) => p.category?.toLowerCase() === catObj?.name?.toLowerCase(),
            );

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                <div className="bg-neutral-900 border border-red-500/30 w-full max-w-md rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                    <AlertTriangle className="text-red-500" size={24} />
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-white">
                        Eliminación en Cascada
                      </h3>
                      <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest">
                        Acción de alto riesgo
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 mb-4 uppercase tracking-wide leading-relaxed">
                    ¿Estás seguro de borrar la categoría{" "}
                    <span className="text-red-400 font-black">
                      "{catObj?.name}"
                    </span>
                    ? Esta acción destruirá de manera irreversible los
                    siguientes productos ({associatedProds.length}):
                  </p>

                  <div className="bg-black/40 border border-red-500/10 rounded-xl p-3 mb-5 max-h-32 overflow-y-auto space-y-1">
                    {associatedProds.length === 0 ? (
                      <div className="text-[9px] text-neutral-500 uppercase font-bold py-1 italic">
                        Ningún producto se verá afectado.
                      </div>
                    ) : (
                      associatedProds.map((p) => (
                        <div
                          key={p.id}
                          className="text-[9px] uppercase font-bold bg-red-500/5 text-neutral-400 py-1.5 px-2 rounded-lg border border-red-500/10 flex justify-between"
                        >
                          <span className="truncate max-w-[200px]">
                            {p.name}
                          </span>
                          <span className="font-mono text-red-400/80">
                            ${p.price}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDeleteCategoryFinal(deleteConfirm)}
                      className="flex-1 bg-red-500 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                    >
                      Eliminar Todo
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 bg-neutral-800 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/10 hover:border-white/20 transition-all text-neutral-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
};

export default CategoriasAdmin;
