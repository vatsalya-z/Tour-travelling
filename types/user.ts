export type UserRole = "admin" | "user" | "customer";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  mobile_number: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at?: string;
}

