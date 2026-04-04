import { useEffect, useState } from "react";
import { supabase } from "../shared/lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  Store,
  ShoppingBag,
  DollarSign,
  Trash2,
  Power,
  Edit3,
  ShieldCheck,
  Search,
  Plus,
  X,
  LogOut,
} from "lucide-react";

export default function SuperAdmin() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeBiz: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para el Modal de Nuevo Negocio
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBiz, setNewBiz] = useState({
    name: "",
    slug: "",
    category: "Restaurante",
    plan: "free",
  });

  useEffect(() => {
    fetchEverything();
  }, []);

  async function fetchEverything() {
    setLoading(true);
    try {
      const { data: biz, error: bizError } = await supabase
        .from("businesses")
        .select("id,name,slug,category,plan,is_active,created_at")
        .order("created_at", { ascending: false });

      if (bizError) {
        console.error("Error cargando negocios:", bizError);
        setBusinesses([]);
        setStats({ totalRevenue: 0, totalOrders: 0, activeBiz: 0 });
        setLoading(false);
        return;
      }

      const { data: orders } = await supabase
        .from("orders")
        .select("total_price");

      const revenue =
        orders?.reduce((acc, curr) => acc + Number(curr.total_price || 0), 0) ||
        0;

      setBusinesses(biz || []);
      setStats({
        totalRevenue: revenue,
        totalOrders: orders?.length || 0,
        activeBiz: biz?.filter((b) => b.is_active).length || 0,
      });
    } catch (err) {
      console.error("Error:", err.message);
      setBusinesses([]);
      setStats({ totalRevenue: 0, totalOrders: 0, activeBiz: 0 });
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/SuperAdminLogin");
  };

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    // Generar slug automático si está vacío
    const slugFinal =
      newBiz.slug ||
      newBiz.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

    const { error } = await supabase.from("businesses").insert([
      {
        name: newBiz.name,
        slug: slugFinal,
        category: newBiz.category,
        plan: newBiz.plan,
        is_active: true,
        is_open: false,
      },
    ]);

    if (error) {
      alert("Error al crear: " + error.message);
    } else {
      setIsModalOpen(false);
      setNewBiz({ name: "", slug: "", category: "Restaurante", plan: "free" });
      fetchEverything();
    }
  };

  const toggleBusinessStatus = async (id, currentStatus) => {
    const { error } = await supabase
      .from("businesses")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    if (!error) fetchEverything();
  };

  const deleteBusiness = async (id) => {
    if (
      window.confirm(
        "¿ELIMINAR PERMANENTEMENTE? Se borrará todo lo relacionado a este negocio.",
      )
    ) {
      const { error } = await supabase.from("businesses").delete().eq("id", id);
      if (!error) fetchEverything();
    }
  };

  const filteredBusinesses = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans relative">
      {/* BOTÓN CERRAR SESIÓN */}
      <button
        onClick={handleLogout}
        className="fixed top-6 right-6 z-50 p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-full transition-all border border-rose-500/20"
      >
        <LogOut size={20} />
      </button>

      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-sky-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-500">
              Nexus Central Control
            </span>
          </div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
            GLOTO <span className="text-slate-700">HQ</span>
          </h1>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="BUSCAR NEGOCIO..."
              className="bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold w-full focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-sky-500 hover:bg-sky-400 text-black px-6 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2 transition-transform active:scale-95"
          >
            <Plus size={18} /> Nuevo Negocio
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            label="Ventas Globales"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={<DollarSign />}
            color="text-amber-400"
          />
          <MetricCard
            label="Órdenes Totales"
            value={stats.totalOrders}
            icon={<ShoppingBag />}
            color="text-sky-400"
          />
          <MetricCard
            label="Negocios Activos"
            value={stats.activeBiz}
            icon={<Store />}
            color="text-emerald-400"
          />
          <MetricCard
            label="Suscripciones"
            value={businesses.length}
            icon={<ShieldCheck />}
            color="text-indigo-400"
          />
        </div>

        {/* LISTA DE NEGOCIOS */}
        <div className="bg-slate-900/30 border border-white/5 rounded-[3rem] overflow-hidden backdrop-blur-md">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-slate-500">
              <tr>
                <th className="p-8">Comercio</th>
                <th className="p-8">Plan</th>
                <th className="p-8">Estado</th>
                <th className="p-8 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBusinesses.map((b) => (
                <tr key={b.id} className="group hover:bg-white/[0.01]">
                  <td className="p-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-sky-500 border border-white/5">
                      {b.name[0]}
                    </div>
                    <div>
                      <p className="font-black uppercase italic text-lg leading-none">
                        {b.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold mt-1">
                        gloto.app/{b.slug}
                      </p>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className="text-xs font-black uppercase px-3 py-1 bg-white/5 rounded-lg">
                      {b.plan}
                    </span>
                  </td>
                  <td className="p-8">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${b.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${b.is_active ? "bg-emerald-500" : "bg-rose-500 animate-pulse"}`}
                      />
                      <span className="text-[10px] font-black uppercase">
                        {b.is_active ? "ACTIVO" : "SUSPENDIDO"}
                      </span>
                    </div>
                  </td>
                  <td className="p-8 text-right space-x-2">
                    <button
                      onClick={() => toggleBusinessStatus(b.id, b.is_active)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                    >
                      <Power size={18} />
                    </button>
                    <button
                      onClick={() => deleteBusiness(b.id)}
                      className="p-3 bg-white/5 hover:bg-rose-500 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL PARA NUEVO NEGOCIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
          <div className="bg-slate-900 w-full max-w-md rounded-[2.5rem] border border-white/10 p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black italic uppercase">
                Nuevo <span className="text-sky-500">Tenant</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">
                  Nombre del Restaurante
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-black border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-sky-500"
                  placeholder="Ej: Pizzería Don Giovanni"
                  onChange={(e) =>
                    setNewBiz({ ...newBiz, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">
                  Slug (URL personalizada)
                </label>
                <input
                  type="text"
                  className="w-full bg-black border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-sky-500 font-mono text-sm"
                  placeholder="don-giovanni"
                  onChange={(e) =>
                    setNewBiz({ ...newBiz, slug: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">
                    Plan
                  </label>
                  <select
                    className="w-full bg-black border-none rounded-2xl p-4 text-white text-xs font-bold"
                    onChange={(e) =>
                      setNewBiz({ ...newBiz, plan: e.target.value })
                    }
                  >
                    <option value="free">FREE</option>
                    <option value="pro">PRO</option>
                    <option value="premium">PREMIUM</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block tracking-widest">
                    Categoría
                  </label>
                  <select
                    className="w-full bg-black border-none rounded-2xl p-4 text-white text-xs font-bold"
                    onChange={(e) =>
                      setNewBiz({ ...newBiz, category: e.target.value })
                    }
                  >
                    <option value="Restaurante">Restaurante</option>
                    <option value="Café">Café</option>
                    <option value="Bar">Bar</option>
                    <option value="Fast Food">Fast Food</option>
                  </select>
                </div>
              </div>

              <button className="w-full bg-sky-500 p-5 rounded-2xl font-black uppercase italic tracking-tighter text-black hover:bg-sky-400 transition-all">
                Crear e Iniciar Negocio
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponente de Card (Igual al anterior)
function MetricCard({ label, value, icon, color }) {
  return (
    <div className="bg-slate-900/20 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
      <div
        className={`absolute -right-4 -bottom-4 opacity-5 scale-150 ${color}`}
      >
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">
        {label}
      </p>
      <p
        className={`text-4xl font-black italic uppercase tracking-tighter ${color}`}
      >
        {value}
      </p>
    </div>
  );
}
