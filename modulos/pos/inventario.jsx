import { useState, useMemo, memo, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Info,
  Filter,
  Clipboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── DATOS INICIALES ────────────────────────────────────────────────────────
const INITIAL_INVENTORY = [
  {
    id: 1,
    name: "Harina de Maíz",
    category: "Insumos",
    stock: 45,
    unit: "kg",
    minStock: 10,
    price: 5500,
  },
  {
    id: 2,
    name: "Queso Costeño",
    category: "Lácteos",
    stock: 8,
    unit: "kg",
    minStock: 15,
    price: 18000,
  },
  {
    id: 3,
    name: "Aceite Vegetal",
    category: "Insumos",
    stock: 20,
    unit: "L",
    minStock: 5,
    price: 4200,
  },
  {
    id: 4,
    name: "Café en Grano",
    category: "Barra",
    stock: 12,
    unit: "kg",
    minStock: 5,
    price: 35000,
  },
  {
    id: 5,
    name: "Leche Entera",
    category: "Lácteos",
    stock: 30,
    unit: "L",
    minStock: 10,
    price: 2800,
  },
  {
    id: 6,
    name: "Azúcar Blanca",
    category: "Insumos",
    stock: 25,
    unit: "kg",
    minStock: 8,
    price: 3200,
  },
  {
    id: 7,
    name: "Huevos",
    category: "Insumos",
    stock: 120,
    unit: "unidad",
    minStock: 30,
    price: 600,
  },
  {
    id: 8,
    name: "Sal",
    category: "Insumos",
    stock: 10,
    unit: "kg",
    minStock: 2,
    price: 1200,
  },
  {
    id: 9,
    name: "Mantequilla",
    category: "Lácteos",
    stock: 5,
    unit: "kg",
    minStock: 3,
    price: 22000,
  },
  {
    id: 10,
    name: "Chocolate Negro",
    category: "Barra",
    stock: 6,
    unit: "kg",
    minStock: 2,
    price: 28000,
  },
];

const INITIAL_RECIPES = [
  {
    id: 1,
    name: "Buñuelo Tradicional",
    category: "Fritos",
    servings: 20,
    description: "Buñuelo esponjoso con queso costeño",
    ingredients: [
      { inventoryId: 1, quantity: 0.5, unit: "kg" },
      { inventoryId: 2, quantity: 0.3, unit: "kg" },
      { inventoryId: 3, quantity: 0.2, unit: "L" },
      { inventoryId: 7, quantity: 2, unit: "unidad" },
    ],
  },
  {
    id: 2,
    name: "Café Latte",
    category: "Barra",
    servings: 1,
    description: "Espresso con leche vaporizada",
    ingredients: [
      { inventoryId: 4, quantity: 0.018, unit: "kg" },
      { inventoryId: 5, quantity: 0.2, unit: "L" },
    ],
  },
  {
    id: 3,
    name: "Torta de Chocolate",
    category: "Repostería",
    servings: 12,
    description: "Pastel húmedo de chocolate negro",
    ingredients: [
      { inventoryId: 10, quantity: 0.3, unit: "kg" },
      { inventoryId: 6, quantity: 0.25, unit: "kg" },
      { inventoryId: 9, quantity: 0.15, unit: "kg" },
      { inventoryId: 7, quantity: 3, unit: "unidad" },
      { inventoryId: 1, quantity: 0.2, unit: "kg" },
    ],
  },
];

const DEFAULT_CATEGORIES = [
  "Insumos",
  "Lácteos",
  "Barra",
  "Fritura",
  "Bebidas",
  "Repostería",
];
const DEFAULT_RECIPE_CATS = ["Fritos", "Barra", "Repostería", "Bebidas"];
const DEFAULT_UNITS = ["kg", "g", "L", "mL", "unidad"];

// ─── HELPERS ────────────────────────────────────────────────────────────────
function calcRecipeCost(recipe, inventory) {
  return recipe.ingredients.reduce((sum, ing) => {
    const item = inventory.find((i) => i.id === ing.inventoryId);
    if (!item) return sum;
    return sum + item.price * ing.quantity;
  }, 0);
}

function calcMaxServings(recipe, inventory) {
  if (!recipe.ingredients.length) return 0;
  const ratios = recipe.ingredients.map((ing) => {
    const item = inventory.find((i) => i.id === ing.inventoryId);
    if (!item || ing.quantity === 0) return 0;
    return Math.floor((item.stock / ing.quantity) * recipe.servings);
  });
  return Math.min(...ratios);
}

// ─── STOCK STATUS ───────────────────────────────────────────────────────────
function getStockStatus(stock, minStock) {
  if (stock < 0)
    return {
      status: "crítico",
      color: "text-red-600",
      bgColor: "bg-red-500/20",
    };
  if (stock <= minStock)
    return {
      status: "bajo",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    };
  return {
    status: "óptimo",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
  };
}

// ─── TERMINAL SELECT ────────────────────────────────────────────────────────
const TerminalSelect = ({
  label,
  value,
  options,
  onChange,
  onClear,
  icon: Icon,
  allValue = "Todos",
}) => (
  <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
    <label className="text-[8px] font-black text-neutral-600 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500/50 group-hover:text-violet-500 transition-colors">
        <Icon size={12} />
      </div>
      <select
        value={value}
        onChange={(e) => {
          const val = e.target.value || allValue;
          onChange(val);
        }}
        className="w-full bg-neutral-900 border border-white/5 rounded-3xl py-2.5 pl-9 pr-10 text-[10px] font-mono text-neutral-300 appearance-none focus:border-violet-500/40 outline-none transition-all cursor-pointer uppercase"
      >
        <option value={allValue}>{allValue.toUpperCase()}</option>
        {options.map((opt) => (
          <option key={opt.id || opt} value={opt.id || opt}>
            {(opt.label || opt).toUpperCase()}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {value && value !== allValue && (
          <button
            onClick={onClear}
            className="text-neutral-600 hover:text-red-400 transition-colors"
          >
            <X size={12} />
          </button>
        )}
        <ChevronDown
          size={12}
          className="text-neutral-600 pointer-events-none"
        />
      </div>
    </div>
  </div>
);

// ─── BADGE ───────────────────────────────────────────────────────────────────
const Badge = ({ children, color = "neutral" }) => {
  const colors = {
    neutral: "bg-neutral-800 text-neutral-400",
    violet: "bg-violet-500/20 text-violet-300",
    orange: "bg-orange-500/20 text-orange-400",
    green: "bg-green-500/20  text-green-400",
    blue: "bg-blue-500/20   text-blue-400",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${colors[color]}`}
    >
      {children}
    </span>
  );
};

// ─── MODAL BASE ──────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, wide = false }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div
      className={`bg-neutral-900/40 border border-white/10 rounded-2xl p-6 w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-black uppercase tracking-tighter">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

// ─── FIELD ───────────────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div>
    <label className="text-[10px] font-black uppercase text-neutral-500 block mb-2 tracking-[0.2em]">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full bg-neutral-800 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-violet-500 transition-colors";
const selectCls = inputCls;

const InventoryCard = memo(({ item, onEdit, onDelete, onUpdateStock }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stockInput, setStockInput] = useState(item.stock.toString());
  const { status, color, bgColor } = getStockStatus(item.stock, item.minStock);

  useEffect(() => {
    setStockInput(item.stock.toString());
  }, [item.stock]);

  const currentNumValue = stockInput === "" ? 0 : parseInt(stockInput, 10);
  const hasChanges = currentNumValue !== item.stock;

  const handleStockChange = (value) => {
    setStockInput(value);
  };

  const handleSave = () => {
    if (!hasChanges) return;
    const finalStock = stockInput === "" ? 0 : parseInt(stockInput, 10);
    const delta = finalStock - item.stock;
    if (delta !== 0) {
      onUpdateStock(item.id, delta);
    }
  };

  return (
    <motion.div
      layout
      className={`border rounded-2xl transition-all duration-300 ${
        isOpen
          ? "bg-neutral-900/80 border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.05)]"
          : "bg-neutral-900/40 border-white/5 hover:border-white/10"
      }`}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-left hover:bg-white/5 rounded-2xl transition-colors cursor-pointer"
      >
        {/* 📱 MOBILE */}
        <div className="flex flex-col gap-1 lg:hidden">
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {item.name}
              </p>
              <p className="text-xs text-neutral-500 font-mono truncate">
                mín: {item.minStock} {item.unit}
              </p>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <p className="text-lg font-bold text-neutral-300">
                ${item.price.toLocaleString("de-DE")}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                className="p-1.5 hover:bg-violet-600/20 rounded-lg text-neutral hover:text-violet-300 transition-colors"
              >
                <Edit2 size={16} />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs text-neutral-400">
            <span className={`font-black ${color}`}>
              {item.stock} {item.unit}
            </span>
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                className="p-1.5 bg-white/5 rounded-full"
              >
                <ChevronDown size={14} />
              </motion.div>
            </div>
          </div>
        </div>

        {/* 💻 DESKTOP */}
        <div className="hidden lg:grid grid-cols-11 items-center gap-4">
          <div className="col-span-3 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {item.name}
            </p>
            <p className="text-xs text-neutral-500 font-mono truncate">
              mín: {item.minStock} {item.unit}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-neutral-500">Categoría</p>
            <p className="text-sm text-neutral-300">{item.category}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-neutral-500">Stock</p>
            <p className={`text-sm font-black ${color}`}>
              {item.stock} {item.unit}
            </p>
          </div>
          <div className="col-span-2 text-right">
            <p className="text-xs text-neutral-500">Precio/U</p>
            <p className="text-sm font-bold text-neutral-300">
              ${item.price.toLocaleString("de-DE")}
            </p>
          </div>
          <div className="col-span-2 flex justify-end items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${bgColor} ${color}`}
            >
              {status.toUpperCase()}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              className="p-2 bg-white/5 rounded-full"
            >
              <ChevronDown size={16} />
            </motion.div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="p-2 hover:bg-violet-600/20 rounded-lg text-neutral hover:text-violet-300 transition-colors"
            >
              <Edit2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* EXPAND */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5 bg-black/20"
          >
            <div className="p-4 sm:p-6 space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DetailBox label="Categoría" value={item.category} />
                <DetailBox label="Unidad" value={item.unit} />
                <DetailBox
                  label="Valor Total"
                  value={`$${(item.stock * item.price).toLocaleString("de-DE")}`}
                  color={
                    item.stock < 0
                      ? "text-red-600"
                      : item.stock <= item.minStock
                        ? "text-orange-400"
                        : "text-white"
                  }
                />
                <DetailBox
                  label="Estado"
                  value={status.toUpperCase()}
                  color={color}
                />
              </div>

              <div className="flex items-center justify-center gap-4 bg-neutral-800/30 rounded-lg p-4">
                <button
                  onClick={() => {
                    const current =
                      stockInput === "" ? 0 : parseInt(stockInput, 10);
                    setStockInput((current - 1).toString());
                  }}
                  className="p-2 hover:bg-neutral-700 rounded-lg text-neutral-500 hover:text-red-400 transition-colors"
                >
                  <ArrowDownRight size={18} />
                </button>
                <div className="text-center">
                  <p className="text-[9px] text-neutral-500 uppercase font-black mb-1 tracking-wider">
                    Modificar
                  </p>
                  <input
                    type="number"
                    value={stockInput}
                    onChange={(e) => handleStockChange(e.target.value)}
                    placeholder="0"
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-neutral-700 border border-white/10 rounded-lg px-3 py-2 text-2xl font-black text-center w-24 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <button
                  onClick={() => {
                    const current =
                      stockInput === "" ? 0 : parseInt(stockInput, 10);
                    setStockInput((current + 1).toString());
                  }}
                  className="p-2 hover:bg-neutral-700 rounded-lg text-neutral-500 hover:text-green-400 transition-colors"
                >
                  <ArrowUpRight size={18} />
                </button>
              </div>

              <div className="flex flex-row items-center gap-2 w-full">
                <button
                  onClick={() => onDelete(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-wider active:scale-[0.98]"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
                <button
                  disabled={!hasChanges}
                  onClick={handleSave}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-[10px] font-black uppercase tracking-wider ${
                    hasChanges
                      ? "border-violet-500/20 bg-violet-500 text-white hover:bg-violet-600 active:scale-[0.98] cursor-pointer"
                      : "border-white/5 bg-neutral-800/50 text-neutral-600 cursor-not-allowed opacity-50"
                  }`}
                >
                  <CheckCircle2 size={14} /> Guardar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const DetailBox = ({ label, value, color = "text-neutral-300" }) => (
  <div className="space-y-1">
    <p className="text-[7px] text-neutral-600 font-black uppercase tracking-[0.2em]">
      {label}
    </p>
    <p className={`text-[10px] font-bold uppercase ${color}`}>{value}</p>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
export default function Inventario() {
  const [tab, setTab] = useState("insumos");

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [recipeCats, setRecipeCats] = useState(DEFAULT_RECIPE_CATS);
  const [unitsList, setUnitsList] = useState(DEFAULT_UNITS);

  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [invSearch, setInvSearch] = useState("");
  const [invCatFilter, setInvCatFilter] = useState("Todos");
  const [invUnitFilter, setInvUnitFilter] = useState("Todos");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [showInvModal, setShowInvModal] = useState(false);
  const [editingInv, setEditingInv] = useState(null);
  const [invForm, setInvForm] = useState({
    name: "",
    category: "Insumos",
    stock: 0,
    unit: "kg",
    minStock: 10,
    price: 0,
  });

  const [recipes, setRecipes] = useState(INITIAL_RECIPES);
  const [recSearch, setRecSearch] = useState("");
  const [recCatFilter, setRecCatFilter] = useState("Todas");
  const [showRecModal, setShowRecModal] = useState(false);
  const [editingRec, setEditingRec] = useState(null);
  const [recForm, setRecForm] = useState({
    name: "",
    category: "Fritos",
    servings: 1,
    description: "",
    ingredients: [],
  });
  const [expandedRec, setExpandedRec] = useState(null);

  const dynamicUnitsFilter = useMemo(() => {
    return [
      "Todos",
      ...new Set([...unitsList, ...inventory.map((i) => i.unit)]),
    ];
  }, [inventory, unitsList]);

  const dynamicCategoriesFilter = useMemo(() => {
    return [
      "Todos",
      ...new Set([...categories, ...inventory.map((i) => i.category)]),
    ];
  }, [inventory, categories]);

  const dynamicRecipeCatsFilter = useMemo(() => {
    return [
      "Todas",
      ...new Set([...recipeCats, ...recipes.map((r) => r.category)]),
    ];
  }, [recipes, recipeCats]);

  const filteredInventory = useMemo(() => {
    let list = [...inventory];
    if (invSearch)
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(invSearch.toLowerCase()) ||
          i.category.toLowerCase().includes(invSearch.toLowerCase()),
      );
    if (invCatFilter !== "Todos")
      list = list.filter((i) => i.category === invCatFilter);
    if (invUnitFilter !== "Todos")
      list = list.filter((i) => i.unit === invUnitFilter);
    list.sort((a, b) => {
      let va = a[sortField],
        vb = b[sortField];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      return sortDir === "asc" ? (va > vb ? 1 : -1) : va < vb ? 1 : -1;
    });
    return list;
  }, [inventory, invSearch, invCatFilter, invUnitFilter, sortField, sortDir]);

  const stats = useMemo(
    () => ({
      totalValue: inventory.reduce((a, i) => a + i.stock * i.price, 0),
      lowStock: inventory.filter((i) => i.stock <= i.minStock).length,
      total: inventory.length,
      recipeCount: recipes.length,
    }),
    [inventory, recipes],
  );

  const filteredRecipes = useMemo(() => {
    let list = [...recipes];
    if (recSearch)
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(recSearch.toLowerCase()) ||
          r.category.toLowerCase().includes(recSearch.toLowerCase()),
      );
    if (recCatFilter !== "Todas")
      list = list.filter((r) => r.category === recCatFilter);
    return list;
  }, [recipes, recSearch, recCatFilter]);

  const handleCategoryChange = (val) => {
    if (val === "NEW_CATEGORY") {
      const newCat = prompt("Ingresa el nombre de la nueva categoría:");
      if (newCat && newCat.trim() !== "") {
        const cleanCat = newCat.trim();
        if (!categories.includes(cleanCat)) {
          setCategories((prev) => [...prev, cleanCat]);
        }
        setInvForm((prev) => ({ ...prev, category: cleanCat }));
      } else {
        setInvForm((prev) => ({
          ...prev,
          category: categories[0] || "Insumos",
        }));
      }
    } else {
      setInvForm((prev) => ({ ...prev, category: val }));
    }
  };

  const handleUnitChange = (val) => {
    if (val === "NEW_UNIT") {
      const newUnit = prompt(
        "Ingresa el nombre de la nueva unidad (ej: caja, paq, oz):",
      );
      if (newUnit && newUnit.trim() !== "") {
        const cleanUnit = newUnit.trim();
        if (!unitsList.includes(cleanUnit)) {
          setUnitsList((prev) => [...prev, cleanUnit]);
        }
        setInvForm((prev) => ({ ...prev, unit: cleanUnit }));
      } else {
        setInvForm((prev) => ({ ...prev, unit: unitsList[0] || "kg" }));
      }
    } else {
      setInvForm((prev) => ({ ...prev, unit: val }));
    }
  };

  const handleRecipeCategoryChange = (val) => {
    if (val === "NEW_RECIPE_CAT") {
      const newCat = prompt(
        "Ingresa el nombre de la nueva categoría para recetas:",
      );
      if (newCat && newCat.trim() !== "") {
        const cleanCat = newCat.trim();
        if (!recipeCats.includes(cleanCat)) {
          setRecipeCats((prev) => [...prev, cleanCat]);
        }
        setRecForm((prev) => ({ ...prev, category: cleanCat }));
      } else {
        setRecForm((prev) => ({
          ...prev,
          category: recipeCats[0] || "Fritos",
        }));
      }
    } else {
      setRecForm((prev) => ({ ...prev, category: val }));
    }
  };

  const openNewInv = () => {
    setEditingInv(null);
    setInvForm({
      name: "",
      category: categories[0] || "Insumos",
      stock: 0,
      unit: unitsList[0] || "kg",
      minStock: 10,
      price: 0,
    });
    setShowInvModal(true);
  };
  const openEditInv = (item) => {
    setEditingInv(item);
    setInvForm({ ...item });
    setShowInvModal(true);
  };
  const saveInv = () => {
    if (!invForm.name.trim()) return;
    if (editingInv)
      setInventory((inv) =>
        inv.map((i) => (i.id === editingInv.id ? { ...i, ...invForm } : i)),
      );
    else setInventory((inv) => [...inv, { id: Date.now(), ...invForm }]);
    setShowInvModal(false);
  };
  const deleteInv = (id) => {
    if (confirm("¿Eliminar este insumo?"))
      setInventory((inv) => inv.filter((i) => i.id !== id));
  };
  const updateStock = (id, delta) =>
    setInventory((inv) =>
      inv.map((i) => (i.id === id ? { ...i, stock: i.stock + delta } : i)),
    );

  const openNewRec = () => {
    setEditingRec(null);
    setRecForm({
      name: "",
      category: recipeCats[0] || "Fritos",
      servings: 1,
      description: "",
      ingredients: [],
    });
    setShowRecModal(true);
  };
  const openEditRec = (r) => {
    setEditingRec(r);
    setRecForm({
      ...r,
      ingredients: [...r.ingredients.map((i) => ({ ...i }))],
    });
    setShowRecModal(true);
  };
  const saveRec = () => {
    if (!recForm.name.trim()) return;
    if (editingRec)
      setRecipes((rs) =>
        rs.map((r) => (r.id === editingRec.id ? { ...r, ...recForm } : r)),
      );
    else setRecipes((rs) => [...rs, { id: Date.now(), ...recForm }]);
    setShowRecModal(false);
  };
  const deleteRec = (id) => {
    if (confirm("¿Eliminar esta receta?"))
      setRecipes((rs) => rs.filter((r) => r.id !== id));
  };

  const addIngredient = () =>
    setRecForm((f) => ({
      ...f,
      ingredients: [
        ...f.ingredients,
        {
          inventoryId: inventory[0]?.id || 0,
          quantity: 0,
          unit: inventory[0]?.unit || "kg",
        },
      ],
    }));
  const updateIngredient = (idx, field, val) =>
    setRecForm((f) => {
      const ings = [...f.ingredients];
      ings[idx] = {
        ...ings[idx],
        [field]:
          field === "quantity"
            ? parseFloat(val) || 0
            : field === "inventoryId"
              ? parseInt(val)
              : val,
      };
      if (field === "inventoryId") {
        const item = inventory.find((i) => i.id === parseInt(val));
        if (item) ings[idx].unit = item.unit;
      }
      return { ...f, ingredients: ings };
    });
  const removeIngredient = (idx) =>
    setRecForm((f) => ({
      ...f,
      ingredients: f.ingredients.filter((_, i) => i !== idx),
    }));

  return (
    <div className="min-h-screen bg-background text-white p-4 font-sans">
      {/* ── SECCIÓN 1: ESTADÍSTICAS ARRIBA DE TODO ── */}
      <header className="max-w-7xl mx-auto mb-6 space-y-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tighter">Inventario</h1>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Valor de Bodega",
              value: `$${stats.totalValue.toLocaleString("de-DE")}`,
              color: "text-white",
            },
            {
              label: "Stock Bajo",
              value: stats.lowStock,
              color: "text-orange-400",
              alert: stats.lowStock > 0,
            },
            {
              label: "Insumos Activos",
              value: stats.total,
              color: "text-violet-400",
            },
            {
              label: "Recetas",
              value: stats.recipeCount,
              color: "text-blue-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`bg-neutral-900/40 border rounded-2xl p-6 transition-all ${s.alert ? "border-orange-500/30" : "border-white/5"}`}
            >
              <p className="text-[10px] font-black uppercase text-neutral-500 tracking-[0.2em] mb-2">
                {s.label}
              </p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* ════════════════════════════════════════════
            TAB: INSUMOS (Estructura Unificada)
        ════════════════════════════════════════════ */}
        {tab === "insumos" && (
          <div className="space-y-6">
            {/* 💻 CONTENEDOR FILA: TABS A LA IZQUIERDA + BUSCADOR A LA DERECHA */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center w-full">
              {/* Pestañas (Tabs) */}
              <div className="flex bg-neutral-900/60 p-1 rounded-3xl border border-white/5 shrink-0 w-full sm:w-fit">
                {[
                  {
                    id: "insumos",
                    icon: <Package size={14} />,
                    label: "Insumos",
                  },
                  {
                    id: "recetas",
                    icon: <BookOpen size={14} />,
                    label: "Recetas",
                  },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all ${
                      tab === t.id
                        ? "bg-violet-500 text-white shadow-lg shadow-violet-500/10"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Barra de Búsqueda Dinámica (Ocupa el resto de la fila en pantallas grandes) */}
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Buscar por nombre, categoría..."
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  className="w-full bg-neutral-900/50 border border-white/5 rounded-3xl py-3 pl-11 pr-10 text-[10px] font-mono outline-none focus:border-violet-500/40 transition-all uppercase placeholder:text-neutral-700"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {invSearch ? (
                      <motion.button
                        key="clear"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.12 }}
                        onClick={() => setInvSearch("")}
                        className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                        title="Borrar búsqueda"
                      >
                        <X size={14} />
                      </motion.button>
                    ) : (
                      <motion.button
                        key="paste"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.12 }}
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText();
                            setInvSearch(text);
                          } catch (err) {
                            console.error("No se pudo leer el portapapeles");
                          }
                        }}
                        className="text-neutral-600 hover:text-violet-400 transition-colors p-1"
                        title="Pegar desde el portapapeles"
                      >
                        <Clipboard size={14} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Selectores de Filtros Inferiores */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 bg-neutral-900/30 p-4 rounded-2xl border border-white/5 items-stretch sm:items-end">
              <div className="flex-1 min-w-[200px]">
                <TerminalSelect
                  label="Categoría"
                  value={invCatFilter}
                  options={dynamicCategoriesFilter.slice(1).map((c) => ({
                    id: c,
                    label: c,
                  }))}
                  onChange={setInvCatFilter}
                  onClear={() => setInvCatFilter("Todos")}
                  icon={Filter}
                />
              </div>

              <div className="flex-1 min-w-[200px]">
                <TerminalSelect
                  label="Unidad"
                  value={invUnitFilter}
                  options={dynamicUnitsFilter
                    .slice(1)
                    .map((u) => ({ id: u, label: u }))}
                  onChange={setInvUnitFilter}
                  onClear={() => setInvUnitFilter("Todos")}
                  icon={Package}
                />
              </div>

              <button
                onClick={openNewInv}
                className="sm:ml-auto w-full sm:w-auto bg-violet-500 hover:bg-violet-600 text-white px-6 py-3 rounded-3xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] h-[36px]"
              >
                <Plus size={14} /> Nuevo Insumo
              </button>
            </div>

            {/* Listado de Insumos */}
            <div className="space-y-4">
              {filteredInventory.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-neutral-500 text-lg font-bold">
                    {invSearch ||
                    invCatFilter !== "Todos" ||
                    invUnitFilter !== "Todos"
                      ? "No hay insumos que coincidan"
                      : "Sin insumos"}
                  </p>
                </div>
              ) : (
                filteredInventory.map((item) => (
                  <InventoryCard
                    key={item.id}
                    item={item}
                    onEdit={openEditInv}
                    onDelete={deleteInv}
                    onUpdateStock={updateStock}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            TAB: RECETAS (Estructura Unificada)
        ════════════════════════════════════════════ */}
        {tab === "recetas" && (
          <div className="space-y-6">
            {/* 💻 CONTENEDOR FILA: TABS A LA IZQUIERDA + BUSCADOR A LA DERECHA */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center w-full">
              {/* Pestañas (Tabs) */}
              <div className="flex bg-neutral-900/60 p-1 rounded-3xl border border-white/5 shrink-0 w-full sm:w-fit">
                {[
                  {
                    id: "insumos",
                    icon: <Package size={14} />,
                    label: "Insumos",
                  },
                  {
                    id: "recetas",
                    icon: <BookOpen size={14} />,
                    label: "Recetas",
                  },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all ${
                      tab === t.id
                        ? "bg-violet-500 text-white shadow-lg shadow-violet-500/10"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Barra de Búsqueda de Recetas */}
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Buscar receta..."
                  value={recSearch}
                  onChange={(e) => setRecSearch(e.target.value)}
                  className="w-full bg-neutral-900/50 border border-white/5 rounded-3xl py-3 pl-11 pr-10 text-[10px] font-mono outline-none focus:border-violet-500/40 transition-all uppercase placeholder:text-neutral-700"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {recSearch ? (
                      <motion.button
                        key="clear"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.12 }}
                        onClick={() => setRecSearch("")}
                        className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                        title="Borrar búsqueda"
                      >
                        <X size={14} />
                      </motion.button>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Filtros Inferiores de Recetas */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 bg-neutral-900/30 p-4 rounded-2xl border border-white/5 items-stretch sm:items-end">
              <TerminalSelect
                label="Categoría"
                value={recCatFilter}
                options={dynamicRecipeCatsFilter
                  .slice(1)
                  .map((c) => ({ id: c, label: c }))}
                onChange={setRecCatFilter}
                onClear={() => setRecCatFilter("Todas")}
                icon={Filter}
                allValue="Todas"
              />
              <button
                onClick={openNewRec}
                className="sm:ml-auto w-full sm:w-auto bg-violet-500 hover:bg-violet-600 text-white px-6 py-3 rounded-3xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] h-[36px]"
              >
                <Plus size={14} /> Nueva Receta
              </button>
            </div>

            {/* Grid de Recetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.length === 0 ? (
                <div className="col-span-3 text-center py-16 text-neutral-600 text-sm">
                  No se encontraron recetas
                </div>
              ) : (
                filteredRecipes.map((recipe) => {
                  const cost = calcRecipeCost(recipe, inventory);
                  const maxServs = calcMaxServings(recipe, inventory);
                  const costPerUnit =
                    recipe.servings > 0 ? cost / recipe.servings : 0;
                  const expanded = expandedRec === recipe.id;
                  const missingIng = recipe.ingredients.some(
                    (ing) => !inventory.find((i) => i.id === ing.inventoryId),
                  );

                  return (
                    <div
                      key={recipe.id}
                      className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-violet-500/20 transition-colors"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge color="violet">{recipe.category}</Badge>
                              {missingIng && (
                                <Badge color="orange">
                                  Ingrediente faltante
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-display font-black text-base leading-tight">
                              {recipe.name}
                            </h3>
                            {recipe.description && (
                              <p className="text-[11px] text-neutral-500 mt-1">
                                {recipe.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => openEditRec(recipe)}
                              className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-600 hover:text-violet-400 transition-colors"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => deleteRec(recipe.id)}
                              className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-600 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="bg-neutral-800/60 rounded-lg p-2.5 text-center">
                            <p className="text-[9px] uppercase font-black text-neutral-600 mb-0.5">
                              Porciones
                            </p>
                            <p className="font-black text-sm">
                              {recipe.servings}
                            </p>
                          </div>
                          <div className="bg-neutral-800/60 rounded-lg p-2.5 text-center">
                            <p className="text-[9px] uppercase font-black text-neutral-600 mb-0.5">
                              Costo/U
                            </p>
                            <p className="font-black text-sm text-green-400">
                              ${Math.round(costPerUnit).toLocaleString("de-DE")}
                            </p>
                          </div>
                          <div
                            className={`rounded-lg p-2.5 text-center ${maxServs === 0 ? "bg-red-500/10 border border-red-500/20" : "bg-neutral-800/60"}`}
                          >
                            <p className="text-[9px] uppercase font-black text-neutral-600 mb-0.5">
                              Posibles
                            </p>
                            <p
                              className={`font-black text-sm ${maxServs === 0 ? "text-red-400" : "text-blue-400"}`}
                            >
                              {maxServs}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            setExpandedRec(expanded ? null : recipe.id)
                          }
                          className="w-full flex items-center justify-between text-[10px] font-black uppercase text-neutral-500 hover:text-neutral-300 transition-colors pt-2 border-t border-white/5"
                        >
                          <span className="flex items-center gap-1.5">
                            <FlaskConical size={12} />
                            {recipe.ingredients.length} ingredientes
                          </span>
                          {expanded ? (
                            <ChevronUp size={13} />
                          ) : (
                            <ChevronDown size={13} />
                          )}
                        </button>

                        {expanded && (
                          <div className="mt-3 space-y-1.5">
                            {recipe.ingredients.map((ing, idx) => {
                              const item = inventory.find(
                                (i) => i.id === ing.inventoryId,
                              );
                              const enough = item && item.stock >= ing.quantity;
                              return (
                                <div
                                  key={idx}
                                  className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg ${!item ? "bg-orange-500/10" : enough ? "bg-neutral-800/50" : "bg-red-500/10"}`}
                                >
                                  <span
                                    className={`font-medium ${!item ? "text-orange-400" : "text-neutral-300"}`}
                                  >
                                    {item ? (
                                      item.name
                                    ) : (
                                      <span className="italic text-orange-400">
                                        ID #{ing.inventoryId} no encontrado
                                      </span>
                                    )}
                                  </span>
                                  <span className="font-black tabular-nums text-neutral-400">
                                    {ing.quantity} {ing.unit}
                                  </span>
                                </div>
                              );
                            })}
                            <div className="flex justify-between text-[10px] uppercase font-black text-neutral-500 pt-1.5 border-t border-white/5">
                              <span>Costo total receta</span>
                              <span className="text-white">
                                ${Math.round(cost).toLocaleString("de-DE")}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

      {/* ════════════════════════════════════════════
          MODAL: INVENTARIO
      ════════════════════════════════════════════ */}
      {showInvModal &&
        (() => {
          let isInvFormChanged = false;
          if (!editingInv) {
            isInvFormChanged = invForm.name.trim() !== "";
          } else {
            isInvFormChanged =
              invForm.name !== editingInv.name ||
              invForm.category !== editingInv.category ||
              invForm.unit !== editingInv.unit ||
              invForm.stock !== editingInv.stock ||
              invForm.minStock !== editingInv.minStock ||
              invForm.price !== editingInv.price;
          }

          return (
            <Modal
              title={editingInv ? "Editar Insumo" : "Nuevo Insumo"}
              onClose={() => setShowInvModal(false)}
            >
              <div className="space-y-4">
                <Field label="Nombre del Insumo">
                  <input
                    type="text"
                    value={invForm.name}
                    placeholder="Ej: Harina de Maíz"
                    onChange={(e) =>
                      setInvForm({ ...invForm, name: e.target.value })
                    }
                    className={inputCls}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Categoría">
                    <select
                      value={invForm.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className={selectCls}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option
                        value="NEW_CATEGORY"
                        className="text-violet-400 font-bold"
                      >
                        + NUEVA CATEGORÍA...
                      </option>
                    </select>
                  </Field>
                  <Field label="Unidad">
                    <select
                      value={invForm.unit}
                      onChange={(e) => handleUnitChange(e.target.value)}
                      className={selectCls}
                    >
                      {unitsList.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                      <option
                        value="NEW_UNIT"
                        className="text-violet-400 font-bold"
                      >
                        + NUEVA UNIDAD...
                      </option>
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Stock Actual">
                    <input
                      type="number"
                      value={invForm.stock}
                      onChange={(e) =>
                        setInvForm({
                          ...invForm,
                          stock: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Stock Mínimo">
                    <input
                      type="number"
                      value={invForm.minStock}
                      onChange={(e) =>
                        setInvForm({
                          ...invForm,
                          minStock: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={inputCls}
                    />
                  </Field>
                </div>
                <Field label="Precio por Unidad ($)">
                  <input
                    type="number"
                    value={invForm.price}
                    onChange={(e) =>
                      setInvForm({
                        ...invForm,
                        price: parseInt(e.target.value) || 0,
                      })
                    }
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowInvModal(false)}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 border border-white/10 px-4 py-3 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  Cancelar
                </button>
                <button
                  disabled={!isInvFormChanged}
                  onClick={saveInv}
                  className={`flex-1 px-4 py-3 rounded-lg font-black uppercase text-[10px] tracking-widest border transition-all ${
                    isInvFormChanged
                      ? "border-violet-500/20 bg-violet-500 text-white hover:bg-violet-600 active:scale-[0.98] cursor-pointer"
                      : "border-white/5 bg-neutral-800/50 text-neutral-600 cursor-not-allowed opacity-50"
                  }`}
                >
                  {editingInv ? "Actualizar" : "Crear"}
                </button>
              </div>
            </Modal>
          );
        })()}

      {/* ════════════════════════════════════════════
          MODAL: RECETA
      ════════════════════════════════════════════ */}
      {showRecModal &&
        (() => {
          let isRecFormChanged = false;
          if (!editingRec) {
            isRecFormChanged = recForm.name.trim() !== "";
          } else {
            const baseChanged =
              recForm.name !== editingRec.name ||
              recForm.category !== editingRec.category ||
              recForm.servings !== editingRec.servings ||
              recForm.description !== editingRec.description;

            const ingredientsChanged =
              recForm.ingredients.length !== editingRec.ingredients.length ||
              recForm.ingredients.some((ing, idx) => {
                const origIng = editingRec.ingredients[idx];
                return (
                  !origIng ||
                  ing.inventoryId !== origIng.inventoryId ||
                  ing.quantity !== origIng.quantity ||
                  ing.unit !== origIng.unit
                );
              });

            isRecFormChanged = baseChanged || ingredientsChanged;
          }

          return (
            <Modal
              title={editingRec ? "Editar Receta" : "Nueva Receta"}
              onClose={() => setShowRecModal(false)}
              wide
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nombre de la Receta">
                    <input
                      type="text"
                      value={recForm.name}
                      placeholder="Ej: Buñuelo Tradicional"
                      onChange={(e) =>
                        setRecForm({ ...recForm, name: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Categoría">
                    <select
                      value={recForm.category}
                      onChange={(e) =>
                        handleRecipeCategoryChange(e.target.value)
                      }
                      className={selectCls}
                    >
                      {recipeCats.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option
                        value="NEW_RECIPE_CAT"
                        className="text-violet-400 font-bold"
                      >
                        + NUEVA CATEGORÍA...
                      </option>
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Porciones que produce">
                    <input
                      type="number"
                      value={recForm.servings}
                      onChange={(e) =>
                        setRecForm({
                          ...recForm,
                          servings: parseInt(e.target.value) || 1,
                        })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Descripción (opcional)">
                    <input
                      type="text"
                      value={recForm.description}
                      placeholder="Breve descripción"
                      onChange={(e) =>
                        setRecForm({ ...recForm, description: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>
                </div>

                {/* INGREDIENTES */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black uppercase text-neutral-500">
                      Ingredientes
                    </label>
                    <button
                      onClick={addIngredient}
                      className="flex items-center gap-1 text-[10px] font-black uppercase text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      <Plus size={12} /> Agregar
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {recForm.ingredients.length === 0 && (
                      <p className="text-neutral-600 text-xs text-center py-4 border border-dashed border-white/10 rounded-xl">
                        Sin ingredientes. Haz clic en Agregar.
                      </p>
                    )}
                    {recForm.ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-neutral-800/50 rounded-xl p-3"
                      >
                        <select
                          value={ing.inventoryId}
                          onChange={(e) =>
                            updateIngredient(idx, "inventoryId", e.target.value)
                          }
                          className="flex-1 bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-violet-500"
                        >
                          {inventory.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.name} ({i.unit})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={ing.quantity}
                          step="0.001"
                          min="0"
                          onChange={(e) =>
                            updateIngredient(idx, "quantity", e.target.value)
                          }
                          className="w-24 bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-violet-500 text-center"
                        />
                        <span className="text-[10px] text-neutral-500 font-black uppercase w-8 shrink-0">
                          {ing.unit}
                        </span>
                        <button
                          onClick={() => removeIngredient(idx)}
                          className="p-1.5 hover:bg-neutral-700 rounded-lg text-neutral-600 hover:text-red-400 transition-colors shrink-0"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Preview costo formateado en COP (puntos para miles) */}
                  {recForm.ingredients.length > 0 && (
                    <div className="mt-3 bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-violet-400">
                        Costo estimado de la receta
                      </span>
                      <span className="font-black text-white">
                        $
                        {Math.round(
                          calcRecipeCost(recForm, inventory),
                        ).toLocaleString("de-DE")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRecModal(false)}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 border border-white/10 px-4 py-3 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  Cancelar
                </button>
                <button
                  disabled={!isRecFormChanged}
                  onClick={saveRec}
                  className={`flex-1 px-4 py-3 rounded-lg font-black uppercase text-[10px] tracking-widest border transition-all ${
                    isRecFormChanged
                      ? "border-violet-500/20 bg-violet-500 text-white hover:bg-violet-600 active:scale-[0.98] cursor-pointer"
                      : "border-white/5 bg-neutral-800/50 text-neutral-600 cursor-not-allowed opacity-50"
                  }`}
                >
                  {editingRec ? "Actualizar" : "Crear Receta"}
                </button>
              </div>
            </Modal>
          );
        })()}
    </div>
  );
}
