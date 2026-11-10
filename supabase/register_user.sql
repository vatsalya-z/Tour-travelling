-- ==============================================================================
-- Simple SQL Query to Register User (Role automatically DEFAULT 'user' lega)
-- ==============================================================================

-- 1. Password encryption ke liye extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Agar profiles table pehle se bani hui hai, to constraint update karein aur default 'user' set karein:
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'user', 'customer'));
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user';

-- ==============================================================================
-- OPTION A: Naya Standard User Register Query (Role DEFAULT 'user' automatically lega)
-- ==============================================================================
WITH new_user AS (
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    role,
    aud
  )
  VALUES (
    gen_random_uuid(),
    'user@example.com',                  -- 1. Login Email
    crypt('User@12345', gen_salt('bf')), -- 2. Login Password
    now(),
    '{"role": "user"}'::jsonb,
    'authenticated',
    'authenticated'
  )
  RETURNING id, email
)
INSERT INTO public.profiles (id, email, full_name, mobile_number)
SELECT 
  id, 
  email, 
  'Customer Name',                       -- 3. Full Name
  '+91 9876543210'                      -- 4. Mobile Number
  -- Note: role yahan specify nahi kiya hai, table ka DEFAULT 'user' automatically assign ho jayega
FROM new_user;

-- ==============================================================================
-- OPTION B: Naya Admin User Register Query (Backend se explicit role 'admin' ke sath)
-- ==============================================================================
WITH new_admin AS (
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    role,
    aud
  )
  VALUES (
    gen_random_uuid(),
    'admin@example.com',                  -- 1. Admin Login Email
    crypt('Admin@12345', gen_salt('bf')), -- 2. Admin Login Password
    now(),
    '{"role": "admin"}'::jsonb,
    'authenticated',
    'authenticated'
  )
  RETURNING id, email
)
INSERT INTO public.profiles (id, email, full_name, mobile_number, role)
SELECT 
  id, 
  email, 
  'Super Admin',                         -- 3. Admin Full Name
  '+91 9999999999',                     -- 4. Admin Mobile Number
  'admin'                                -- 5. Admin Role explicitly specified
FROM new_admin;

-- ==============================================================================
-- Check / Verify karne ke liye:
-- ==============================================================================
SELECT id, full_name, email, mobile_number, role, created_at 
FROM public.profiles 
ORDER BY created_at DESC;
