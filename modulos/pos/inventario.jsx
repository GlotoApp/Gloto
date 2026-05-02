import React, { useState } from "react";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from "lucide-react";

const Inventario = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Datos iniciales simulados para el negocio de buñuelos y cafetería
  const [inventory, setInventory] = useState([
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
      price: 42000,
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
  ]);

  const stats = {
    totalValue: inventory.reduce(
      (acc, item) => acc + item.stock * item.price,
      0,
    ),
    lowStock: inventory.filter((item) => item.stock <= item.minStock).length,
    activeItems: inventory.length,
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Package size={32} className="text-violet-500" />
              <span>Inventario Principal</span>
            </h1>
            <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
              Control de existencias e insumos en tiempo real
            </p>
          </div>
          <button className="bg-violet-500 hover:bg-violet-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 transition-all">
            <Plus size={18} />
            Nuevo Producto
          </button>
        </header>

        {/* INDICADORES (STATS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-2xl">
            <p className="text-neutral-500 text-[10px] font-bold uppercase mb-2">
              Valor de Bodega
            </p>
            <h3 className="text-2xl font-black">
              $ {stats.totalValue.toLocaleString("es-CO")}
            </h3>
          </div>
          <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-2xl border-l-orange-500/50 border-l-4">
            <p className="text-neutral-500 text-[10px] font-bold uppercase mb-2">
              Alertas de Stock Bajo
            </p>
            <h3 className="text-2xl font-black text-orange-500">
              {stats.lowStock}{" "}
              <span className="text-sm font-medium text-neutral-500">
                Insumos
              </span>
            </h3>
          </div>
          <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-2xl">
            <p className="text-neutral-500 text-[10px] font-bold uppercase mb-2">
              Items Activos
            </p>
            <h3 className="text-2xl font-black text-violet-400">
              {stats.activeItems}
            </h3>
          </div>
        </div>

        {/* FILTROS Y BUSQUEDA */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600"
              size={18}
            />
            <input
              type="text"
              placeholder="BUSCAR INSUMO O CATEGORÍA..."
              className="w-full bg-neutral-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-violet-500 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-neutral-900 border border-white/10 px-6 py-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all">
            <Filter size={16} />
            Filtrar
          </button>
        </div>

        {/* TABLA DE INVENTARIO */}
        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-neutral-900/60">
                  <th className="p-4 text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                    Insumo
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                    Categoría
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase text-neutral-500 tracking-widest text-center">
                    Stock Actual
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase text-neutral-500 tracking-widest">
                    Estado
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase text-neutral-500 tracking-widest text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {inventory.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-[10px] text-neutral-500">
                        Unidad: {item.unit}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-neutral-800 text-neutral-400 rounded-full text-[9px] font-black uppercase">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`text-sm font-black ${item.stock <= item.minStock ? "text-orange-500" : "text-white"}`}
                      >
                        {item.stock} {item.unit}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.stock <= item.minStock ? (
                        <div className="flex items-center gap-2 text-orange-500">
                          <AlertTriangle size={14} />
                          <span className="text-[9px] font-black uppercase">
                            Reordenar
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-[9px] font-black uppercase">
                            Óptimo
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white">
                        <ArrowUpRight size={18} />
                      </button>
                      <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white">
                        <ArrowDownRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventario;
