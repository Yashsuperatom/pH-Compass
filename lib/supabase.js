import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ofqnitvfhygkzncisqoz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mcW5pdHZmaHlna3puY2lzcW96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzAwNDUsImV4cCI6MjA2NzY0NjA0NX0.LRn4zAJnCj0BWboNFgcvW_MTfbMI_gg2HYVnJU_EDDU"

export const supabase = createClient(supabaseUrl,supabaseKey)