import React, { useState } from "react";
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
} from "lucide-react";

const CatalogoAdmin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // 'table' o 'grid'

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
      available: false,
      image: "https://images.unsplash.com/photo-1544787210-282aa74804bc?w=400",
    },
  ]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* HEADER DINÁMICO */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Tag className="text-violet-500" size={32} />
              <span>Catalogo</span>
            </h1>
            <div className="flex items-cdcenter gap-4 text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
              <span>Total: {products.length} Items</span>
              <span className="w-1 h-1 bg-neutral-700 rounded-full" />
              <span className="text-green-500">
                {products.filter((p) => p.available).length} Activos
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="bg-neutral-900 p-1 rounded-xl border border-white/5 flex">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-neutral-800 text-white" : "text-neutral-600"}`}
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-neutral-800 text-white" : "text-neutral-600"}`}
              >
                <LayoutGrid size={20} />
              </button>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-violet-500 hover:text-white transition-all shadow-xl active:scale-95"
            >
              <Plus size={18} />
              Nuevo Item
            </button>
          </div>
        </header>

        {/* BÚSQUEDA TÉCNICA */}
        <div className="bg-neutral-900/40 border border-white/5 p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-violet-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="FILTRAR POR ID, NOMBRE O CATEGORÍA..."
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-violet-500 transition-all placeholder:text-neutral-800"
            />
          </div>
          <button className="bg-neutral-800 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:border-violet-500/50 transition-all">
            Filtros Avanzados
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {viewMode === "table" ? (
          <div className="bg-neutral-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-neutral-900/60 font-black text-[9px] uppercase text-neutral-500 tracking-[0.2em]">
                  <th className="p-6">Preview</th>
                  <th className="p-6">Producto & Detalles</th>
                  <th className="p-6 text-center">Estado</th>
                  <th className="p-6 text-right">Precio</th>
                  <th className="p-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((item) => (
                  <tr
                    key={item.id}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-6">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/5 bg-neutral-800 group-hover:border-violet-500/30 transition-all">
                        <img
                          src={item.image}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-violet-500 uppercase tracking-widest">
                          {item.category}
                        </span>
                        <h3 className="font-black text-lg uppercase leading-none">
                          {item.name}
                        </h3>
                        <p className="text-[10px] text-neutral-500 font-medium italic mt-1">
                          {item.description}
                        </p>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${item.available ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${item.available ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                        />
                        {item.available ? "Publicado" : "Agotado"}
                      </div>
                    </td>
                    <td className="p-6 text-right font-black italic text-lg text-white">
                      ${item.price.toLocaleString()}
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-3 bg-neutral-800 rounded-xl hover:text-violet-400 transition-all border border-white/5">
                          <Edit3 size={16} />
                        </button>
                        <button className="p-3 bg-neutral-800 rounded-xl hover:text-red-400 transition-all border border-white/5">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {/* Renderizado de Grid aquí */}
            <p className="col-span-full py-20 text-neutral-700 font-black uppercase text-xs tracking-widest border-2 border-dashed border-white/5 rounded-3xl">
              Vista de cuadrícula lista para renderizar
            </p>
          </div>
        )}

        {/* MODAL DE EDICIÓN / NUEVO PRODUCTO */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <div className="bg-neutral-900 border border-white/10 w-full max-w-4xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
              {/* Lado Izquierdo: Carga de Imagen */}
              <div className="w-full md:w-2/5 bg-neutral-800 relative group cursor-pointer border-b md:border-b-0 md:border-r border-white/5">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 gap-4 group-hover:text-white transition-colors">
                  <Camera size={48} strokeWidth={1} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                    Subir Fotografía
                  </span>
                </div>
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {/* Lado Derecho: Formulario */}
              <div className="flex-1 p-8 md:p-12">
                <div className="flex justify-between items-start mb-10">
                  <h2 className="text-3xl font-black uppercase tracking-tighter">
                    Editor de Producto
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-neutral-500 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-neutral-500 ml-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-widest focus:border-violet-500 outline-none"
                        placeholder="EJ: BUÑUELO DOBLE QUESO"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-neutral-500 ml-1">
                        Precio (COP)
                      </label>
                      <input
                        type="number"
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-widest focus:border-violet-500 outline-none"
                        placeholder="3000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-neutral-500 ml-1">
                      Categoría
                    </label>
                    <select className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-widest focus:border-violet-500 outline-none appearance-none">
                      <option>Frituras</option>
                      <option>Barra Café</option>
                      <option>Panadería</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-neutral-500 ml-1">
                      Descripción Pública
                    </label>
                    <textarea
                      rows="3"
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-widest focus:border-violet-500 outline-none resize-none"
                      placeholder="DESCRIBE EL SABOR PARA EL CLIENTE..."
                    ></textarea>
                  </div>

                  <button className="w-full bg-violet-500 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-violet-600 transition-all shadow-lg shadow-violet-500/20 active:scale-[0.98]">
                    <Save size={18} />
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogoAdmin;
