-- ==============================================================================
-- 003_about_page_schema.sql
-- Table for dynamic site settings including About Us page content
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 1. Public can read site settings
CREATE POLICY "Public can view site settings"
    ON public.site_settings
    FOR SELECT
    USING (true);

-- 2. Authenticated Admins can insert/update site settings
CREATE POLICY "Admins can insert site settings"
    ON public.site_settings
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

CREATE POLICY "Admins can update site settings"
    ON public.site_settings
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

