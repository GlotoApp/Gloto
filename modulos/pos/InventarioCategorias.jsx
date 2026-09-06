import React, { useEffect, useState } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { supabase } from "../../src/lib/supabaseClient";
import { useAuth } from "../../src/components/AuthContext";

const upper = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

export default function InventarioCategorias() {
  const { user } = useAuth();
  const [businessId, setBusinessId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCategories = async (id) => {
    const { data, error } = await supabase
      .from("inventory_categories")
      .select("id,name")
      .eq("business_id", id)
      .order("name");
    if (error) {
      console.error("Error cargando categorías de inventario:", error);
      return;
    }
    setCategories(data || []);
  };

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("id", user.id)
        .maybeSingle();
      if (error || !data?.business_id) return;
      setBusinessId(data.business_id);
      await loadCategories(data.business_id);
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const saveCategory = async (event) => {
    event.preventDefault();
    const categoryName = upper(name);
    if (!businessId || !categoryName) return;

    const response = editing
      ? await supabase
          .from("inventory_categories")
          .update({ name: categoryName })
          .eq("id", editing.id)
          .eq("business_id", businessId)
      : await supabase
          .from("inventory_categories")
          .insert({ business_id: businessId, name: categoryName });

    if (response.error) {
      alert(
        response.error.code === "23505"
          ? "La categoría ya existe."
          : "No se pudo guardar la categoría.",
      );
      return;
    }
    setName("");
    setEditing(null);
    await loadCategories(businessId);
  };

  const deleteCategory = async (category) => {
    const confirmed = window.confirm(
      `¿Eliminar la categoría ${category.name}? También se eliminarán los insumos que contiene.`,
    );
    if (!confirmed || !businessId) return;

    const { data: items, error: itemsError } = await supabase
      .from("inventory_items")
      .select("id")
      .eq("business_id", businessId)
      .eq("category", category.name);
    if (itemsError) {
      alert("No se pudieron consultar los insumos de la categoría.");
      return;
    }

    const itemIds = (items || []).map((item) => item.id);
    if (itemIds.length) {
      const { error: deleteItemsError } = await supabase
        .from("inventory_items")
        .delete()
        .in("id", itemIds)
        .eq("business_id", businessId);
      if (deleteItemsError) {
        alert("No se puede eliminar: hay recetas que usan estos insumos.");
        return;
      }
    }

    const { error } = await supabase
      .from("inventory_categories")
      .delete()
      .eq("id", category.id)
      .eq("business_id", businessId);
    if (error) {
      alert("No se pudo eliminar la categoría.");
      return;
    }
    await loadCategories(businessId);
  };

  return (
    <div className="min-h-screen bg-background p-4 font-sans text-white">
      <div className="mx-auto max-w-7xl space-y-6 pb-20">
        <header>
          <h1 className="text-2xl font-black tracking-tighter">
            Categorías de Inventario
          </h1>
          <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-neutral-500">
            Organiza tus insumos por negocio
          </p>
        </header>
        <form
          onSubmit={saveCategory}
          className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-neutral-900/40 p-4 sm:flex-row"
        >
          <input
            value={name}
            onChange={(event) => setName(upper(event.target.value))}
            placeholder="NOMBRE DE LA CATEGORÍA"
            className="flex-1 rounded-xl border border-white/5 bg-neutral-950 px-4 py-3 text-xs font-bold text-white outline-none focus:border-violet-500/50"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-[10px] font-black uppercase text-white hover:bg-violet-500"
          >
            <Plus size={14} /> {editing ? "Actualizar" : "Nueva categoría"}
          </button>
        </form>
        {loading ? (
          <p className="py-12 text-center text-sm text-neutral-500">
            Cargando categorías...
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-neutral-900/40 p-4"
              >
                <span className="text-sm font-black text-white">
                  {category.name}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(category);
                      setName(category.name);
                    }}
                    className="rounded-lg p-2 text-neutral-500 hover:bg-violet-500/10 hover:text-violet-300"
                    aria-label={`Editar ${category.name}`}
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCategory(category)}
                    className="rounded-lg p-2 text-neutral-500 hover:bg-red-500/10 hover:text-red-300"
                    aria-label={`Eliminar ${category.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
