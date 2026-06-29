CREATE TABLE IF NOT EXISTS resume_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  thumbnail_url text,
  category text DEFAULT 'classic',
  styles jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resumes ADD COLUMN IF NOT EXISTS thumbnail_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

INSERT INTO resume_templates (id, name, description, category) VALUES
  ('modern-beige', 'Modern Beige', 'Elegancia con tonos beige y foto de perfil', 'professional'),
  ('classic-ats', 'Classic ATS', 'Optimizado para sistemas de selección ATS', 'classic'),
  ('elegant-dark', 'Elegant Dark', 'Estilo oscuro profesional con acentos dorados', 'creative')
ON CONFLICT (id) DO NOTHING;
