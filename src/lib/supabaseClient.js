import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Faltan las variables de entorno de Supabase");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Intenta resolver una ruta de imagen desde Supabase Storage a una URL pública.
// Si `path` ya es una URL absoluta la devuelve tal cual. Si no, intenta
// generar una public URL usando varios nombres de bucket comunes.
export async function resolveImageUrl(path) {
  if (!path) return "/default.png";
  // Ya es una URL pública
  if (path.startsWith("http") || path.includes("/storage/v1/object/public/")) {
    return path;
  }

  const bucketsToTry = ["public", "images", "logos", "avatars"];

  for (const bucket of bucketsToTry) {
    try {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      const publicUrl = data?.publicUrl || data?.publicURL || data?.public_url;
      if (publicUrl) return publicUrl;
    } catch (e) {
      // ignorar y seguir probando otros buckets
    }
  }

  // Si no pudo resolverse, devolver imagen por defecto pública
  return "/default.png";
}
