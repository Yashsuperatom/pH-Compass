import { supabase } from "@/lib/supabase";

// ✅ Fetch user data by email
export const getUser = async (email: string) => {
  const { data, error } = await supabase
    .from("User")
    .select("*")
    .eq("email", email)
  if (error) {
    console.log("Fetch User Error:", error);
    return null;
  }
  return data;
};

// ✅ Insert new reading into Data table (with user id)
export const insertData = async (email: string, reading: any) => {
  const userResult = await getUser(email);
  if (!userResult || userResult.length === 0) {
    console.log("User not found for email:", email);
    return null;
  }

  const userId = userResult[0].id;

  const { data, error } = await supabase.from("Data").insert([{
    ...reading,
    user_id: userId,   
  }]);

  if (error) {
    console.log("Insert Error:", error);
    return null;
  }
  return data;
};

// ✅ Fetch all data entries
export const getData = async (id: string) => {
  const { data, error } = await supabase
    .from("Data")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch Error:", error);
    return [];
  }

  return data;
};


// ✅ Insert new user data
export const insertUser = async (userData: any) => {
  const { data, error } = await supabase.from("User").insert([userData]);

  if (error) {
    console.log("User Insert Error:", error);
    return null;
  }
  return data;
};

// ✅ Update existing user data
export const updateUser = async (email: string, userData: any) => {
  const { data, error } = await supabase
    .from("User")
    .update(userData)
    .eq("email", email);

  if (error) {
    console.log("Update Error:", error);
    return null;
  }
  return data;
};
