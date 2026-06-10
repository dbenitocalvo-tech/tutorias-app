import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_KEY } from "./config";

// Cliente único para toda la app.
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
