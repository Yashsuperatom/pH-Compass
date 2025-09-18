import { createClient } from "@supabase/supabase-js";
import {Supabase_Api_Key,Supabase_Url } from "@env"

const supabaseUrl = Supabase_Url ;
const supabaseKey = Supabase_Api_Key

export const supabase = createClient(supabaseUrl,supabaseKey)