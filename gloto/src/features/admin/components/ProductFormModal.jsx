import { useState, useEffect } from "react";
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

  // Limpiar el objeto URL para evitar fugas de memoria
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // Limite de 2MB
        alert("La imagen es muy pesada. Máximo 2MB.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!businessId) return alert("Error: ID de negocio no encontrado");

    setLoading(true);

    try {
      let finalImageUrl = "";

      // 1. Subir imagen si existe
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${businessId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images") // ASEGÚRATE que este bucket sea PÚBLICO en tu Dashboard de Supabase
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        finalImageUrl = urlData.publicUrl;
      }

      // 2. Insertar producto
      const { error } = await supabase.from("products").insert([
        {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          business_id: businessId,
          image_url: finalImageUrl,
          is_available: true, // Por defecto disponible
        },
      ]);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error("Error completo:", error);
      alert("No se pudo guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[3rem] p-10 shadow-2xl relative overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
        >
          <X size={24} />
        </button>

        <header className="mb-8">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-sky-500">
            Nuevo <span className="text-white">Producto</span>
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            Configuración de Menú
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* DROPZONE DE IMAGEN */}
          <div className="group relative h-48 w-full bg-slate-800/50 border-2 border-dashed border-white/10 rounded-[2rem] overflow-hidden hover:border-sky-500/50 transition-all flex items-center justify-center cursor-pointer">
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="text-white" size={32} />
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Camera
                    className="text-slate-500 group-hover:text-sky-500"
                    size={24}
                  />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Añadir foto del plato
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {/* INPUTS */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                Nombre
              </label>
              <input
                required
                className="w-full bg-slate-800 border border-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-white transition-all font-bold"
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
                  className="w-full bg-slate-800 border border-white/5 p-4 rounded-2xl outline-none focus:border-sky-500 text-white transition-all font-bold"
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
                  className="w-full bg-slate-800 border border-white/5 p-4 rounded-2xl outline-none focus:border-sky-500 text-white transition-all font-bold"
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
                className="w-full bg-slate-800 border border-white/5 p-4 rounded-2xl outline-none focus:border-sky-500 text-white transition-all h-24 resize-none"
                placeholder="Ingredientes y detalles..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-sky-500/20 uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Upload size={18} /> Publicar Producto
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
