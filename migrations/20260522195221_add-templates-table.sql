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
  ('moderno', 'Moderno', 'Diseño limpio y contemporáneo con énfasis en la experiencia laboral', 'professional'),
  ('clasico', 'Clásico', 'Formato tradicional ideal para industrias conservadoras', 'classic'),
  ('creativo', 'Creativo', 'Destaca con un diseño visual único y moderno', 'creative'),
  ('minimalista', 'Minimalista', 'Enfoque minimalista que pone el contenido primero', 'professional')
ON CONFLICT (id) DO NOTHING;
