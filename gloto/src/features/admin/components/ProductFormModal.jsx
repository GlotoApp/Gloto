import { useState } from "react";
import { supabase } from "../../../shared/lib/supabase";
import { X, Loader2, Camera, Upload } from "lucide-react";

export default function ProductFormModal({ businessId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Principal",
  });

  // Manejar previsualización de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = "";

      // 1. Si hay imagen, subirla primero al bucket 'products'
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${businessId}/${fileName}`;

        // CAMBIO AQUÍ: Usar el nombre exacto de tu bucket
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // CAMBIO AQUÍ TAMBIÉN: Obtener la URL pública del bucket correcto
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        finalImageUrl = urlData.publicUrl;
      }

      // 2. Guardar el producto con la URL de la imagen
      const { error } = await supabase.from("products").insert([
        {
          ...formData,
          price: parseFloat(formData.price),
          business_id: businessId,
          image_url: finalImageUrl, // Guardamos la URL de la imagen subida
        },
      ]);

      if (error) throw error;

      onSuccess(); // Refresca la lista y cierra
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[3rem] p-10 shadow-2xl relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
        >
          <X size={28} />
        </button>

        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-sky-500 mb-2">
          Nuevo Producto
        </h2>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
          Añade sabor a tu menú
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECCIÓN DE IMAGEN */}
          <div className="flex flex-col items-center justify-center space-y-4 py-4 border-2 border-dashed border-white/10 rounded-[2rem] bg-white/5 hover:bg-white/[0.07] transition-all cursor-pointer relative overflow-hidden group">
            {imagePreview ? (
              <img
                src={imagePreview}
                className="w-full h-40 object-cover rounded-xl"
              />
            ) : (
              <div className="text-center">
                <Camera
                  className="mx-auto text-slate-500 group-hover:text-sky-500 transition-colors"
                  size={40}
                />
                <span className="text-[10px] font-black text-slate-500 uppercase mt-2 block">
                  Subir foto del plato
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
              Nombre del producto
            </label>
            <input
              required
              className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-sky-500 text-white transition-all font-bold"
              placeholder="Ej: Burger Monster"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                Precio ($)
              </label>
              <input
                required
                type="number"
                step="0.01"
                className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-sky-500 text-white transition-all font-bold"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                Categoría
              </label>
              <input
                className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-sky-500 text-white transition-all font-bold"
                placeholder="Ej: Hamburguesas"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
              Descripción
            </label>
            <textarea
              className="w-full bg-slate-800/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-sky-500 text-white transition-all h-24 resize-none font-medium"
              placeholder="Detalles del plato..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-400 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-sky-500/20 uppercase text-xs tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                {" "}
                <Upload size={18} /> GUARDAR EN MENÚ{" "}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
