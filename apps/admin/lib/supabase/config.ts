export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    anonKey &&
    url.trim() !== "" &&
    anonKey.trim() !== "" &&
    !url.includes("your-supabase-url")
  );
};

export const DEV_ADMIN_CREDENTIALS = {
  email: process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL || "dev@tourtripholidays.com",
  password: process.env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD || "Dev@12345",
};

