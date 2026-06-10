// =====================================================================
//  Datos de conexión a tu proyecto de Supabase.
//  Se leen desde variables de entorno (archivo ".env", que NO se sube
//  a GitHub). Mira ".env.example" para ver qué variables hacen falta.
//
//  La "anon / public key" es segura de usar en el navegador (así lo
//  indica Supabase). NUNCA pongas aquí la "service_role" / "secret key".
// =====================================================================

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "Faltan las variables de entorno VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. " +
      "Copia .env.example a .env y pon ahí los datos de tu proyecto de Supabase."
  );
}
