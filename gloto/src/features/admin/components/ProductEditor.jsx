import { useState, useEffect } from "react";
import { supabase } from "../../../shared/lib/supabase";
import {
  ArrowLeft,
  Save,
  Camera,
  Loader2,
  Plus,
  Trash2,
  Settings2,
  ListPlus,
  CheckCircle2,
} from "lucide-react";

export default function ProductEditor({ businessId, productId, onBack }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!productId);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Principal",
    is_available: true,
  });

  // Estado para los modificadores (Grupos y Opciones)
  const [modifiers, setModifiers] = useState([]);

  useEffect(() => {
    if (productId) fetchProductData();
  }, [productId]);

  const fetchProductData = async () => {
    try {
      // 1. Cargar datos del producto
      const { data: product, error: pError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (pError) throw pError;
      setFormData(product);
      setImagePreview(product.image_url);

      // 2. Cargar modificadores y sus opciones
      const { data: mods, error: mError } = await supabase
        .from("product_modifiers")
        .select(
          `
          *,
          modifier_options (*)
        `,
        )
        .eq("product_id", productId);

      if (mError) throw mError;
      setModifiers(mods || []);
    } catch (err) {
      console.error("Error:", err.message);
    } finally {
      setFetching(false);
    }
  };

  // --- LÓGICA DE INTERFAZ PARA MODIFICADORES ---
  const addModifierGroup = () => {
    setModifiers([
      ...modifiers,
      {
        id: `temp-${Date.now()}`, // ID temporal para UI
        name: "",
        is_required: false,
        min_selection: 0,
        max_selection: 1,
        modifier_options: [{ name: "", extra_price: 0 }],
      },
    ]);
  };

  const addOption = (modIndex) => {
    const newMods = [...modifiers];
    newMods[modIndex].modifier_options.push({ name: "", extra_price: 0 });
    setModifiers(newMods);
  };

  const removeModifier = (index) => {
    setModifiers(modifiers.filter((_, i) => i !== index));
  };

  // --- GUARDADO FINAL (TRANSACCIONAL) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Subir Imagen si existe
      let finalImageUrl = formData.image_url;
      if (imageFile) {
        const filePath = `${businessId}/${Date.now()}.${imageFile.name.split(".").pop()}`;
        await supabase.storage
          .from("product-images")
          .upload(filePath, imageFile);
        finalImageUrl = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath).data.publicUrl;
      }

      // 2. Upsert Producto
      const productPayload = {
        ...formData,
        price: parseFloat(formData.price),
        business_id: businessId,
        image_url: finalImageUrl,
      };
      const { data: savedProduct, error: pError } = productId
        ? await supabase
            .from("products")
            .update(productPayload)
            .eq("id", productId)
            .select()
            .single()
        : await supabase
            .from("products")
            .insert([productPayload])
            .select()
            .single();

      if (pError) throw pError;

      // 3. Gestionar Modificadores (Limpiar y Re-insertar para simplificar lógica de edición)
      if (productId) {
        // Borramos los anteriores para evitar duplicados en esta versión simple
        await supabase
          .from("product_modifiers")
          .delete()
          .eq("product_id", savedProduct.id);
      }

      for (const mod of modifiers) {
        const { data: newMod, error: modErr } = await supabase
          .from("product_modifiers")
          .insert([
            {
              product_id: savedProduct.id,
              name: mod.name,
              is_required: mod.is_required,
              min_selection: mod.min_selection,
              max_selection: mod.max_selection,
            },
          ])
          .select()
          .single();

        if (modErr) throw modErr;

        const optionsToInsert = mod.modifier_options
          .filter((opt) => opt.name.trim() !== "")
          .map((opt) => ({
            modifier_id: newMod.id,
            name: opt.name,
            extra_price: parseFloat(opt.extra_price || 0),
          }));

        if (optionsToInsert.length > 0) {
          await supabase.from("modifier_options").insert(optionsToInsert);
        }
      }

      onBack(true);
    } catch (err) {
      alert("Error guardando: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-sky-500" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-32">
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-xl border-b border-white/5 p-6 flex justify-between items-center">
        <button
          onClick={() => onBack()}
          className="flex items-center gap-2 text-slate-400 font-black text-[10px] tracking-widest uppercase"
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-sky-500 hover:bg-sky-400 text-white px-10 py-4 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          GUARDAR CAMBIOS
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* COLUMNA IZQUIERDA: PRODUCTO */}
        <div className="lg:col-span-5 space-y-8">
          {/* UI de Imagen (Mantenemos la que ya tienes) */}
          <div className="group relative aspect-square bg-slate-900 rounded-[3rem] overflow-hidden border-2 border-dashed border-white/10 flex items-center justify-center">
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" />
            ) : (
              <Camera size={40} className="text-slate-700" />
            )}
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
          </div>

          <div className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 space-y-6">
            <h3 className="font-black italic text-sky-500 uppercase">
              Detalles del Plato
            </h3>
            <input
              className="w-full bg-slate-800 p-6 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-sky-500"
              placeholder="Nombre del plato"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                className="w-full bg-slate-800 p-6 rounded-2xl font-bold outline-none"
                placeholder="Precio"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
              <input
                className="w-full bg-slate-800 p-6 rounded-2xl font-bold outline-none"
                placeholder="Categoría"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: MODIFICADORES (RELACIONAL) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-4xl font-black italic uppercase italic">
              Acompañantes
            </h2>
            <button
              onClick={addModifierGroup}
              className="bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-sky-500 hover:text-white transition-all"
            >
              + Grupo de Opciones
            </button>
          </div>

          <div className="space-y-6">
            {modifiers.map((mod, mIdx) => (
              <div
                key={mod.id}
                className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden"
              >
                <div className="p-8 bg-white/5 flex flex-col gap-4">
                  <div className="flex justify-between">
                    <input
                      className="bg-transparent text-xl font-black italic text-sky-400 outline-none w-2/3"
                      placeholder="Ej: Elige tu Salsa"
                      value={mod.name}
                      onChange={(e) => {
                        const n = [...modifiers];
                        n[mIdx].name = e.target.value;
                        setModifiers(n);
                      }}
                    />
                    <button
                      onClick={() => removeModifier(mIdx)}
                      className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="flex gap-6 items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-5 h-5 accent-sky-500"
                        checked={mod.is_required}
                        onChange={(e) => {
                          const n = [...modifiers];
                          n[mIdx].is_required = e.target.checked;
                          setModifiers(n);
                        }}
                      />
                      <span className="text-[10px] font-black uppercase text-slate-400">
                        ¿Es Obligatorio?
                      </span>
                    </label>
                  </div>
                </div>

                <div className="p-8 space-y-3">
                  {mod.modifier_options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex gap-4">
                      <input
                        className="flex-[2] bg-slate-800 p-4 rounded-xl font-bold text-sm outline-none"
                        placeholder="Opción (Ej: Salsa BBQ)"
                        value={opt.name}
                        onChange={(e) => {
                          const n = [...modifiers];
                          n[mIdx].modifier_options[oIdx].name = e.target.value;
                          setModifiers(n);
                        }}
                      />
                      <input
                        type="number"
                        className="flex-1 bg-slate-800 p-4 rounded-xl font-bold text-sm outline-none"
                        placeholder="+$ Extra"
                        value={opt.extra_price}
                        onChange={(e) => {
                          const n = [...modifiers];
                          n[mIdx].modifier_options[oIdx].extra_price =
                            e.target.value;
                          setModifiers(n);
                        }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(mIdx)}
                    className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-[10px] font-black text-slate-500 uppercase hover:text-sky-500 hover:border-sky-500/30 transition-all"
                  >
                    + Añadir ítem al grupo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
